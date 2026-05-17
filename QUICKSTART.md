# ⚡ Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Install
```bash
npm install
```

### Step 2: Configure
Edit `.env` file:
```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
```

### Step 3: Run
```bash
# Verify setup first (recommended)
npm run test-setup

# Start the app
npm start
```

Open: **http://localhost:3000**

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| Models not loading | Run `npm run test-setup` to diagnose |
| INVALID_PAYMENT_INSTRUMENT | Use Nova, Claude, or Titan models |
| AccessDeniedException | Enable models in [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/) |

---

## 💡 Recommended First Model

**Amazon Nova 2 Lite** - Fast, free tier, no subscription needed

---

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.
