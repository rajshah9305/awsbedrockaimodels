/**
 * AWS Bedrock Service
 * 
 * @author RAJ SHAH
 * @description Service layer for AWS Bedrock AI model interactions
 */

const { 
  BedrockClient, 
  ListFoundationModelsCommand 
} = require('@aws-sdk/client-bedrock');
const { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand
} = require('@aws-sdk/client-bedrock-runtime');

// Initialize AWS Bedrock clients
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Validate credentials
if (!accessKeyId || !secretAccessKey) {
  console.error('❌ ERROR: AWS credentials not configured!');
  console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
  console.error('See SETUP_GUIDE.md for instructions');
}

if (accessKeyId === 'your_access_key_here' || secretAccessKey === 'your_secret_access_key_here') {
  console.error('❌ ERROR: Please replace placeholder AWS credentials with your actual credentials');
  console.error('Edit the .env file and add your real AWS Access Key ID and Secret Access Key');
  console.error('See SETUP_GUIDE.md for instructions');
}

const bedrockClient = new BedrockClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

class BedrockService {
  // List all available foundation models
  async listAvailableModels() {
    try {
      const command = new ListFoundationModelsCommand({});
      const response = await bedrockClient.send(command);
      
      // Filter out models that require marketplace subscription
      const marketplaceModels = ['ai21.jamba', 'ai21.j2'];
      
      return response.modelSummaries
        .filter(model => {
          // Exclude marketplace-only models unless explicitly needed
          const isMarketplaceModel = marketplaceModels.some(prefix => model.modelId.includes(prefix));
          return !isMarketplaceModel;
        })
        .map(model => ({
          modelId: model.modelId,
          modelName: model.modelName,
          provider: model.providerName,
          inputModalities: model.inputModalities,
          outputModalities: model.outputModalities,
          responseStreamingSupported: model.responseStreamingSupported
        }));
    } catch (error) {
      console.error('Error listing models:', error);
      throw error;
    }
  }

  // Generate text using specified model
  async generateText(prompt, modelId, parameters = {}) {
    try {
      const payload = this.buildPayload(prompt, modelId, parameters);
      
      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return this.parseResponse(responseBody, modelId);
    } catch (error) {
      console.error('Error generating text:', error);
      
      // Provide helpful error messages
      if (error.message && error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
        throw new Error('This model requires an AWS Marketplace subscription. Please use Amazon Nova, Claude, or Titan models instead.');
      } else if (error.message && error.message.includes('AccessDeniedException')) {
        throw new Error('Model access denied. Please enable model access in AWS Bedrock console.');
      } else if (error.message && error.message.includes('ValidationException')) {
        throw new Error('Invalid request parameters. Please check your input and try again.');
      }
      
      throw error;
    }
  }

  // Generate text with streaming
  async generateTextStream(prompt, modelId, parameters = {}, onChunk) {
    try {
      const payload = this.buildPayload(prompt, modelId, parameters);
      
      const command = new InvokeModelWithResponseStreamCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      
      for await (const event of response.body) {
        if (event.chunk) {
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          const parsedChunk = this.parseStreamChunk(chunk, modelId);
          if (parsedChunk) {
            onChunk(parsedChunk);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming text:', error);
      
      // Provide helpful error messages
      if (error.message && error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
        throw new Error('This model requires an AWS Marketplace subscription. Please use Amazon Nova, Claude, or Titan models instead.');
      } else if (error.message && error.message.includes('AccessDeniedException')) {
        throw new Error('Model access denied. Please enable model access in AWS Bedrock console.');
      }
      
      throw error;
    }
  }

  // Chat with conversation history
  async chat(messages, modelId, parameters = {}) {
    try {
      const payload = this.buildChatPayload(messages, modelId, parameters);
      
      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return this.parseResponse(responseBody, modelId);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Provide helpful error messages
      if (error.message && error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
        throw new Error('This model requires an AWS Marketplace subscription. Please use Amazon Nova, Claude, or Titan models instead.');
      } else if (error.message && error.message.includes('AccessDeniedException')) {
        throw new Error('Model access denied. Please enable model access in AWS Bedrock console.');
      }
      
      throw error;
    }
  }

  // Generate image
  async generateImage(prompt, modelId, parameters = {}) {
    try {
      const payload = {
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: parameters.cfgScale || 7,
        steps: parameters.steps || 50,
        seed: parameters.seed || Math.floor(Math.random() * 1000000),
        width: parameters.width || 512,
        height: parameters.height || 512,
        samples: parameters.samples || 1
      };

      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        images: responseBody.artifacts.map(artifact => ({
          base64: artifact.base64,
          seed: artifact.seed,
          finishReason: artifact.finishReason
        }))
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  // Generate embeddings
  async generateEmbeddings(text, modelId) {
    try {
      const payload = { inputText: text };

      const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        embedding: responseBody.embedding,
        inputTextTokenCount: responseBody.inputTextTokenCount
      };
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  // Build payload based on model type
  buildPayload(prompt, modelId, parameters) {
    const defaults = {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    };

    const params = { ...defaults, ...parameters };

    // Amazon Nova models
    if (modelId.includes('amazon.nova')) {
      return {
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: {
          max_new_tokens: params.maxTokens,
          temperature: params.temperature,
          top_p: params.topP
        }
      };
    }

    // Claude models
    if (modelId.includes('anthropic.claude')) {
      return {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_p: params.topP,
        messages: [{ role: 'user', content: prompt }]
      };
    }
    
    // Amazon Titan models
    if (modelId.includes('amazon.titan')) {
      return {
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: params.maxTokens,
          temperature: params.temperature,
          topP: params.topP,
          stopSequences: params.stopSequences || []
        }
      };
    }

    // AI21 Labs models
    if (modelId.includes('ai21')) {
      // Jamba models use a different format
      if (modelId.includes('jamba')) {
        return {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          top_p: params.topP
        };
      }
      // Jurassic models
      return {
        prompt: prompt,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
        topP: params.topP
      };
    }

    // Cohere models
    if (modelId.includes('cohere')) {
      return {
        prompt: prompt,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        p: params.topP
      };
    }

    // Meta Llama models
    if (modelId.includes('meta.llama')) {
      return {
        prompt: prompt,
        max_gen_len: params.maxTokens,
        temperature: params.temperature,
        top_p: params.topP
      };
    }

    // Default payload
    return {
      prompt: prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP
    };
  }

  // Build chat payload
  buildChatPayload(messages, modelId, parameters) {
    const defaults = {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    };

    const params = { ...defaults, ...parameters };

    // Amazon Nova models
    if (modelId.includes('amazon.nova')) {
      // Convert messages to Nova format
      const novaMessages = messages.map(m => ({
        role: m.role,
        content: [{ text: m.content }]
      }));
      return {
        messages: novaMessages,
        inferenceConfig: {
          max_new_tokens: params.maxTokens,
          temperature: params.temperature,
          top_p: params.topP
        }
      };
    }

    // Claude models
    if (modelId.includes('anthropic.claude')) {
      return {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        top_p: params.topP,
        messages: messages
      };
    }

    // For other models, convert to single prompt
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    return this.buildPayload(prompt, modelId, parameters);
  }

  // Parse response based on model type
  parseResponse(responseBody, modelId) {
    // Amazon Nova models
    if (modelId.includes('amazon.nova')) {
      return {
        text: responseBody.output.message.content[0].text,
        stopReason: responseBody.stopReason,
        usage: responseBody.usage
      };
    }

    // Claude models
    if (modelId.includes('anthropic.claude')) {
      return {
        text: responseBody.content[0].text,
        stopReason: responseBody.stop_reason,
        usage: responseBody.usage
      };
    }

    // Amazon Titan models
    if (modelId.includes('amazon.titan')) {
      return {
        text: responseBody.results[0].outputText,
        tokenCount: responseBody.results[0].tokenCount,
        completionReason: responseBody.results[0].completionReason
      };
    }

    // AI21 Labs models
    if (modelId.includes('ai21')) {
      // Jamba models
      if (modelId.includes('jamba')) {
        if (responseBody.choices && responseBody.choices[0]) {
          return {
            text: responseBody.choices[0].message.content,
            finishReason: responseBody.choices[0].finish_reason,
            usage: responseBody.usage
          };
        }
      }
      // Jurassic models
      return {
        text: responseBody.completions[0].data.text,
        finishReason: responseBody.completions[0].finishReason
      };
    }

    // Cohere models
    if (modelId.includes('cohere')) {
      return {
        text: responseBody.generations[0].text,
        finishReason: responseBody.generations[0].finish_reason
      };
    }

    // Meta Llama models
    if (modelId.includes('meta.llama')) {
      return {
        text: responseBody.generation,
        stopReason: responseBody.stop_reason,
        promptTokenCount: responseBody.prompt_token_count,
        generationTokenCount: responseBody.generation_token_count
      };
    }

    // Default response
    return responseBody;
  }

  // Parse streaming chunk
  parseStreamChunk(chunk, modelId) {
    // Amazon Nova models
    if (modelId.includes('amazon.nova')) {
      if (chunk.contentBlockDelta && chunk.contentBlockDelta.delta && chunk.contentBlockDelta.delta.text) {
        return { text: chunk.contentBlockDelta.delta.text };
      }
      return null;
    }

    // Claude models
    if (modelId.includes('anthropic.claude')) {
      if (chunk.type === 'content_block_delta') {
        return { text: chunk.delta.text };
      }
      return null;
    }

    // Amazon Titan models
    if (modelId.includes('amazon.titan')) {
      return { text: chunk.outputText };
    }

    // Default
    return chunk;
  }
}

module.exports = new BedrockService();
