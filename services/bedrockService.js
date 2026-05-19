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

/**
 * Model Provider Strategies
 * Maps specific model families to their request/response formats
 */
const PROVIDERS = {
  NOVA: {
    id: 'amazon.nova',
    buildPayload: (prompt, params) => ({
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { max_new_tokens: params.maxTokens, temperature: params.temperature, top_p: params.topP }
    }),
    buildChatPayload: (messages, params) => ({
      messages: messages.map(m => ({ role: m.role, content: [{ text: m.content }] })),
      inferenceConfig: { max_new_tokens: params.maxTokens, temperature: params.temperature, top_p: params.topP }
    }),
    parseResponse: (body) => ({
      text: body.output.message.content[0].text,
      stopReason: body.stopReason,
      usage: body.usage
    }),
    parseStreamChunk: (chunk) => chunk.contentBlockDelta?.delta?.text ? { text: chunk.contentBlockDelta.delta.text } : null
  },
  CLAUDE: {
    id: 'anthropic.claude',
    buildPayload: (prompt, params) => ({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      messages: [{ role: 'user', content: prompt }]
    }),
    buildChatPayload: (messages, params) => ({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      messages
    }),
    parseResponse: (body) => ({
      text: body.content[0].text,
      stopReason: body.stop_reason,
      usage: body.usage
    }),
    parseStreamChunk: (chunk) => chunk.type === 'content_block_delta' ? { text: chunk.delta.text } : null
  },
  TITAN: {
    id: 'amazon.titan',
    buildPayload: (prompt, params) => ({
      inputText: prompt,
      textGenerationConfig: { maxTokenCount: params.maxTokens, temperature: params.temperature, topP: params.topP, stopSequences: params.stopSequences || [] }
    }),
    parseResponse: (body) => ({
      text: body.results[0].outputText,
      tokenCount: body.results[0].tokenCount,
      completionReason: body.results[0].completionReason
    }),
    parseStreamChunk: (chunk) => ({ text: chunk.outputText })
  },
  LLAMA: {
    id: 'meta.llama',
    buildPayload: (prompt, params) => ({
      prompt,
      max_gen_len: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP
    }),
    parseResponse: (body) => ({
      text: body.generation,
      stopReason: body.stop_reason,
      usage: { prompt_tokens: body.prompt_token_count, completion_tokens: body.generation_token_count }
    })
  },
  COHERE: {
    id: 'cohere',
    buildPayload: (prompt, params) => ({
      prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      p: params.topP
    }),
    parseResponse: (body) => ({
      text: body.generations[0].text,
      finishReason: body.generations[0].finish_reason
    })
  },
  JAMBA: {
    id: 'ai21.jamba',
    buildPayload: (prompt, params) => ({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP
    }),
    parseResponse: (body) => ({
      text: body.choices[0].message.content,
      finishReason: body.choices[0].finish_reason,
      usage: body.usage
    })
  },
  AI21_JURASSIC: {
    id: 'ai21',
    buildPayload: (prompt, params) => ({
      prompt,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      topP: params.topP
    }),
    parseResponse: (body) => ({
      text: body.completions[0].data.text,
      finishReason: body.completions[0].finishReason
    })
  }
};

class BedrockService {
  constructor() {
    this.defaultParams = {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    };
  }

  /**
   * Helper to find provider based on modelId
   */
  getProvider(modelId) {
    // Check Jamba first because it contains 'ai21'
    if (modelId.includes(PROVIDERS.JAMBA.id)) return PROVIDERS.JAMBA;

    for (const key in PROVIDERS) {
      if (modelId.includes(PROVIDERS[key].id)) {
        return PROVIDERS[key];
      }
    }
    return null;
  }

  /**
   * Standard error handler
   */
  handleError(error) {
    console.error('Bedrock Service Error:', error);

    const message = error.message || '';
    if (message.includes('INVALID_PAYMENT_INSTRUMENT')) {
      throw new Error('This model requires an AWS Marketplace subscription. Please use Amazon Nova, Claude, or Titan models instead.');
    } else if (message.includes('AccessDeniedException')) {
      throw new Error('Model access denied. Please enable model access in AWS Bedrock console.');
    } else if (message.includes('ValidationException')) {
      throw new Error('Invalid request parameters. Please check your input and try again.');
    }

    throw error;
  }

  async listAvailableModels() {
    try {
      const command = new ListFoundationModelsCommand({});
      const response = await bedrockClient.send(command);
      
      const marketplaceModels = ['ai21.jamba', 'ai21.j2'];
      
      return response.modelSummaries
        .filter(model => !marketplaceModels.some(prefix => model.modelId.includes(prefix)))
        .map(model => ({
          modelId: model.modelId,
          modelName: model.modelName,
          provider: model.providerName,
          inputModalities: model.inputModalities,
          outputModalities: model.outputModalities,
          responseStreamingSupported: model.responseStreamingSupported
        }));
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateText(prompt, modelId, parameters = {}) {
    try {
      const params = { ...this.defaultParams, ...parameters };
      const provider = this.getProvider(modelId);
      
      const payload = provider
        ? provider.buildPayload(prompt, params)
        : { prompt, max_tokens: params.maxTokens, temperature: params.temperature, top_p: params.topP };

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return provider ? provider.parseResponse(responseBody) : responseBody;
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateTextStream(prompt, modelId, parameters = {}, onChunk) {
    try {
      const params = { ...this.defaultParams, ...parameters };
      const provider = this.getProvider(modelId);
      
      const payload = provider
        ? provider.buildPayload(prompt, params)
        : { prompt, max_tokens: params.maxTokens, temperature: params.temperature, top_p: params.topP };

      const command = new InvokeModelWithResponseStreamCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      
      for await (const event of response.body) {
        if (event.chunk) {
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          const parsedChunk = provider?.parseStreamChunk ? provider.parseStreamChunk(chunk) : chunk;
          if (parsedChunk) onChunk(parsedChunk);
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async chat(messages, modelId, parameters = {}) {
    try {
      const params = { ...this.defaultParams, ...parameters };
      const provider = this.getProvider(modelId);
      
      let payload;
      if (provider?.buildChatPayload) {
        payload = provider.buildChatPayload(messages, params);
      } else {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
        payload = provider ? provider.buildPayload(prompt, params) : { prompt, max_tokens: params.maxTokens, temperature: params.temperature, top_p: params.topP };
      }

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockRuntimeClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return provider ? provider.parseResponse(responseBody) : responseBody;
    } catch (error) {
      this.handleError(error);
    }
  }

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
        modelId,
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
      this.handleError(error);
    }
  }

  async generateEmbeddings(text, modelId) {
    try {
      const payload = { inputText: text };
      const command = new InvokeModelCommand({
        modelId,
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
      this.handleError(error);
    }
  }
}

module.exports = new BedrockService();
