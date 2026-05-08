# 🤖 AWS Bedrock AI Web Application

A comprehensive, feature-rich web application for interacting with AWS Bedrock AI models. This application provides an intuitive interface for text generation, chat conversations, image generation, and embeddings using various foundation models from AWS Bedrock.

## ✨ Features

### 🎯 Multiple AI Modes
- **Text Generation**: Generate text using various foundation models with customizable parameters
- **Chat Conversation**: Interactive chat interface with conversation history
- **Image Generation**: Create images using Stable Diffusion models
- **Embeddings**: Generate vector embeddings for text

### 🤖 Supported Models
- **Anthropic Claude** (Claude 3, Claude 2, Claude Instant)
- **Amazon Titan** (Text, Embeddings)
- **AI21 Labs** (Jurassic models)
- **Cohere** (Command, Embed)
- **Meta Llama** (Llama 2, Llama 3)
- **Stability AI** (Stable Diffusion)

### ⚙️ Advanced Features
- **Real-time Streaming**: Stream responses as they're generated
- **Customizable Parameters**: Adjust temperature, max tokens, top-p, and more
- **Model Discovery**: Automatically fetch and display available models
- **Statistics Tracking**: Monitor request count, token usage, and response times
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: User-friendly feedback for all operations
- **Beautiful UI**: Modern, gradient-based design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- AWS Account with Bedrock access
- AWS Access Key and Secret Key

### Installation

1. **Clone or navigate to the project directory**
```bash
cd /Users/rajshah/Downloads/Projects/fkgkk
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure AWS credentials**

Edit the `.env` file and add your AWS secret access key:
```env
AWS_ACCESS_KEY_ID=AKIA5SIWODAJFD2TM3WW
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=932591835154
PORT=3000
```

4. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. **Open your browser**
Navigate to: `http://localhost:3000`

## 📁 Project Structure

```
.
├── server.js                 # Express server setup
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (AWS credentials)
├── services/
│   └── bedrockService.js    # AWS Bedrock service integration
├── routes/
│   └── bedrock.js           # API routes for Bedrock operations
└── public/
    ├── index.html           # Main HTML interface
    ├── styles.css           # Styling and animations
    └── app.js               # Frontend JavaScript logic
```

## 🔧 API Endpoints

### GET `/api/bedrock/models`
List all available foundation models

### POST `/api/bedrock/generate`
Generate text with a single response
```json
{
  "prompt": "Your prompt here",
  "modelId": "anthropic.claude-v2",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 2048,
    "topP": 0.9
  }
}
```

### POST `/api/bedrock/generate-stream`
Generate text with streaming response (Server-Sent Events)

### POST `/api/bedrock/chat`
Chat with conversation history
```json
{
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ],
  "modelId": "anthropic.claude-v2",
  "parameters": {...}
}
```

### POST `/api/bedrock/generate-image`
Generate images using Stable Diffusion
```json
{
  "prompt": "A beautiful sunset",
  "modelId": "stability.stable-diffusion-xl-v1",
  "parameters": {
    "width": 512,
    "height": 512,
    "steps": 50,
    "cfgScale": 7
  }
}
```

### POST `/api/bedrock/embeddings`
Generate text embeddings
```json
{
  "text": "Your text here",
  "modelId": "amazon.titan-embed-text-v1"
}
```

## 🎨 Usage Examples

### Text Generation
1. Select "Text Generation" mode
2. Choose your preferred model
3. Adjust parameters (temperature, max tokens, top-p)
4. Enter your prompt
5. Click "Generate" to get results

### Chat Conversation
1. Select "Chat Conversation" mode
2. Choose a chat-capable model (e.g., Claude)
3. Type your message and press "Send"
4. Continue the conversation with context awareness

### Image Generation
1. Select "Image Generation" mode
2. Choose a Stable Diffusion model
3. Adjust image parameters (width, height, steps, CFG scale)
4. Describe the image you want
5. Click "Generate Image"

### Embeddings
1. Select "Embeddings" mode
2. Choose an embedding model (e.g., Titan Embeddings)
3. Enter your text
4. Click "Generate Embeddings"

## 🔐 Security Notes

- **Never commit your `.env` file** to version control
- Store AWS credentials securely
- Use IAM roles with minimal required permissions
- Consider implementing rate limiting for production use
- Add authentication/authorization for public deployments

## 🛠️ Configuration

### AWS Bedrock Model Access
Ensure your AWS account has access to the Bedrock models you want to use:
1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Request access to desired models
4. Wait for approval (usually instant for most models)

### Environment Variables
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCOUNT_ID`: Your AWS account ID
- `PORT`: Server port (default: 3000)

## 📊 Features in Detail

### Streaming Support
Real-time text generation with Server-Sent Events (SSE) for immediate feedback as the model generates responses.

### Multi-Model Support
Automatically adapts request/response formats for different model providers:
- Anthropic Claude format
- Amazon Titan format
- AI21 Labs format
- Cohere format
- Meta Llama format

### Parameter Customization
Fine-tune model behavior with adjustable parameters:
- **Temperature**: Control randomness (0-1)
- **Max Tokens**: Limit response length
- **Top P**: Nucleus sampling parameter
- **CFG Scale**: Image generation guidance (images only)
- **Steps**: Image generation quality (images only)

### Statistics Dashboard
Track your usage with real-time statistics:
- Total requests made
- Tokens consumed
- Average response time

## 🐛 Troubleshooting

### Models not loading
- Verify AWS credentials in `.env`
- Check AWS region is correct
- Ensure Bedrock service is available in your region
- Verify model access has been granted in AWS console

### Generation errors
- Check model ID is correct
- Verify you have access to the selected model
- Ensure parameters are within model limits
- Check AWS CloudWatch logs for detailed errors

### Streaming not working
- Verify browser supports Server-Sent Events
- Check network/firewall settings
- Ensure model supports streaming

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📧 Support

For issues or questions, please check the AWS Bedrock documentation or create an issue in this repository.

## 🎉 Acknowledgments

- Built with AWS Bedrock
- Powered by various foundation models from Anthropic, Amazon, AI21 Labs, Cohere, Meta, and Stability AI
- Modern UI inspired by AWS design principles

---

**Happy AI Building! 🚀**
