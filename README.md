# 🤖 AWS Bedrock AI Web Application

> **Interact with AWS Bedrock AI models through a beautiful, intuitive web interface**

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

</div>

---

## ✨ Features

| Mode | Description | Models |
|------|-------------|--------|
| 💬 **Text Generation** | Generate text with streaming support | Claude, Nova, Titan, Llama |
| 🗨️ **Chat** | Conversational AI with history | Claude, Nova, Titan |
| 🎨 **Image** | Create images from text | Stable Diffusion XL |
| 📊 **Embeddings** | Vector embeddings for text | Titan Embed, Cohere |

### 🎯 Key Capabilities
✅ Real-time streaming responses  
✅ Customizable parameters (temperature, tokens, top-p)  
✅ Auto-discovery of available models  
✅ Usage statistics tracking  
✅ Mobile-responsive design  
✅ Smart error handling with helpful suggestions

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- AWS Account with Bedrock access
- AWS credentials (Access Key + Secret)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure AWS credentials in .env file
# Edit .env and add your credentials:
#   AWS_ACCESS_KEY_ID=your_key
#   AWS_SECRET_ACCESS_KEY=your_secret
#   AWS_REGION=us-east-1

# 3. Verify setup (checks credentials & shows available models)
npm run test-setup

# 4. Start the server
npm start

# 5. Open browser
# http://localhost:3000
```

<details>
<summary><b>🔐 Getting AWS Credentials</b></summary>

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → Select your user → **Security credentials**
3. Click **Create access key**
4. Copy the Access Key ID and Secret Access Key
5. Add them to your `.env` file

**Required IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "bedrock:ListFoundationModels",
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ],
    "Resource": "*"
  }]
}
```
</details>

<details>
<summary><b>🤖 Enabling Model Access</b></summary>

**IMPORTANT:** You must enable model access in AWS Bedrock Console first!

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click **Model access** in sidebar
3. Click **Manage model access**
4. Select models to enable:
   - ✅ **Amazon Nova** (Recommended - Free tier)
   - ✅ **Anthropic Claude** (Best quality)
   - ✅ **Amazon Titan** (AWS native)
   - ✅ **Meta Llama**
   - ✅ **Stability AI** (for images)
5. Click **Request model access**
6. Wait for approval (usually instant)

</details>

---

## 📁 Project Structure

```
awsbedrockaimodels-main/
├── 🚀 server.js              # Express server
├── 📦 package.json           # Dependencies
├── 🔐 .env                   # AWS credentials (you configure this)
├── 🧪 test-setup.js          # Setup verification script
├── services/
│   └── bedrockService.js     # AWS Bedrock integration
├── routes/
│   └── bedrock.js            # API endpoints
└── public/
    ├── index.html            # UI interface
    ├── styles.css            # Styling
    └── app.js                # Frontend logic
```

---

## 🔧 API Endpoints

<details>
<summary><b>View API Documentation</b></summary>

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bedrock/models` | GET | List available models |
| `/api/bedrock/generate` | POST | Generate text (single response) |
| `/api/bedrock/generate-stream` | POST | Generate text (streaming) |
| `/api/bedrock/chat` | POST | Chat with conversation history |
| `/api/bedrock/generate-image` | POST | Generate images |
| `/api/bedrock/embeddings` | POST | Generate embeddings |
| `/api/health` | GET | Health check |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/bedrock/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "modelId": "amazon.nova-lite-v1:0",
    "parameters": {
      "temperature": 0.7,
      "maxTokens": 2048
    }
  }'
```

</details>

---

## 💡 Recommended Models

| Use Case | Model | Why? |
|----------|-------|------|
| 🚀 **Getting Started** | Amazon Nova 2 Lite | Fast, affordable, no subscription |
| 🎯 **Best Quality** | Claude 3.5 Sonnet | Highest quality responses |
| ⚡ **Speed** | Nova Micro, Claude 3 Haiku | Ultra-fast responses |
| 🖼️ **Images** | Stable Diffusion XL | High-quality image generation |
| 📊 **Embeddings** | Titan Embed v1 | AWS native, reliable |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ **INVALID_PAYMENT_INSTRUMENT** | Model requires subscription. Use Nova, Claude, or Titan instead |
| ❌ **Models not loading** | Run `npm run test-setup` to diagnose. Check credentials in `.env` |
| ❌ **AccessDeniedException** | Enable model access in AWS Bedrock Console |
| ❌ **Credentials error** | Verify `.env` file has correct AWS keys (no spaces/quotes) |
| ❌ **Port in use** | Change `PORT` in `.env` to different number (e.g., 3001) |

**Quick Diagnostics:**
```bash
npm run test-setup  # Checks credentials & shows available models
```

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use IAM roles with minimal permissions
- ✅ Rotate credentials regularly
- ✅ Add authentication for production deployments
- ✅ Implement rate limiting for public APIs

---

## 📜 License

MIT License - Free for personal and commercial use

---

<div align="center">

**Built with ❤️ using AWS Bedrock**

[Report Bug](https://github.com/yourusername/repo/issues) · [Request Feature](https://github.com/yourusername/repo/issues)

</div>
