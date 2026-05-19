# 🤖 AWS Bedrock AI Web Application

> **Interact with AWS Bedrock AI models through a beautiful, intuitive web interface**

---

## ✨ Features

- 💬 **Text Generation**: Generate text with real-time streaming support.
- 🗨️ **Chat Mode**: Conversational AI with history management.
- 🎨 **Image Generation**: Create images from text using Stable Diffusion.
- 📊 **Embeddings**: Generate vector embeddings for text.
- 🔄 **Model Discovery**: Automatic listing of available foundation models.
- 📱 **Responsive UI**: Optimized for desktop and mobile.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### 3. Verify Setup
Run the diagnostic script to check credentials and connectivity:
```bash
npm run test-setup
```

### 4. Start the Application
```bash
npm start
```
The app will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
├── public/           # Frontend assets (HTML, CSS, JS)
├── routes/           # API routes
├── services/         # AWS Bedrock integration logic
├── server.js         # Express server entry point
└── test-setup.js     # Diagnostic script
```

---

## 🔐 Security & Best Practices

- **Credentials**: Never commit your `.env` file to version control.
- **IAM Permissions**: Ensure your AWS user has `bedrock:InvokeModel` and `bedrock:ListFoundationModels` permissions.
- **Model Access**: You must enable access to specific models in the AWS Bedrock Console.

---

## 📜 License

MIT License. Developed by [RAJ SHAH](https://github.com/rajshah9305).
