/**
 * AWS Bedrock AI Web App - Frontend
 * 
 * @author RAJ SHAH
 * @description Frontend application logic for AWS Bedrock AI interactions
 */

// Global state
const state = {
    models: [],
    currentMode: 'text',
    chatHistory: [],
    stats: {
        requestCount: 0,
        totalTokens: 0,
        responseTimes: []
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadModels();
    
    // Add touch support detection
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Add connection status monitoring
    window.addEventListener('online', () => {
        showToast('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        showToast('No internet connection', 'error');
    });
    
    // Handle viewport resize for responsive adjustments
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            adjustLayoutForScreenSize();
        }, 250);
    });
    
    // Initial layout adjustment
    adjustLayoutForScreenSize();
});

function initializeApp() {
    // Set up slider value displays
    updateSliderValues();
    
    // Load saved preferences from localStorage
    loadUserPreferences();
    
    // Set up auto-save for preferences
    setupAutoSave();
}

function loadUserPreferences() {
    try {
        const savedMode = localStorage.getItem('selectedMode');
        const savedModel = localStorage.getItem('selectedModel');
        const savedTemp = localStorage.getItem('temperature');
        const savedTokens = localStorage.getItem('maxTokens');
        const savedTopP = localStorage.getItem('topP');
        const savedStreaming = localStorage.getItem('streaming');
        
        if (savedMode) {
            document.getElementById('mode-select').value = savedMode;
            handleModeChange({ target: { value: savedMode } });
        }
        if (savedTemp) document.getElementById('temperature').value = savedTemp;
        if (savedTokens) document.getElementById('max-tokens').value = savedTokens;
        if (savedTopP) document.getElementById('top-p').value = savedTopP;
        if (savedStreaming !== null) {
            document.getElementById('streaming').checked = savedStreaming === 'true';
        }
        
        updateSliderValues();
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

function setupAutoSave() {
    // Save mode selection
    document.getElementById('mode-select').addEventListener('change', (e) => {
        localStorage.setItem('selectedMode', e.target.value);
    });
    
    // Save model selection
    document.getElementById('model-select').addEventListener('change', (e) => {
        localStorage.setItem('selectedModel', e.target.value);
    });
    
    // Save parameter changes
    document.getElementById('temperature').addEventListener('change', (e) => {
        localStorage.setItem('temperature', e.target.value);
    });
    
    document.getElementById('max-tokens').addEventListener('change', (e) => {
        localStorage.setItem('maxTokens', e.target.value);
    });
    
    document.getElementById('top-p').addEventListener('change', (e) => {
        localStorage.setItem('topP', e.target.value);
    });
    
    document.getElementById('streaming').addEventListener('change', (e) => {
        localStorage.setItem('streaming', e.target.checked);
    });
}

function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    const chatMessages = document.getElementById('chat-messages');
    const outputBox = document.querySelectorAll('.output-box');
    
    // Adjust chat container height for mobile
    if (width < 768) {
        if (chatMessages) {
            chatMessages.style.maxHeight = '400px';
        }
        outputBox.forEach(box => {
            box.style.maxHeight = '300px';
        });
    } else {
        if (chatMessages) {
            chatMessages.style.maxHeight = '';
        }
        outputBox.forEach(box => {
            box.style.maxHeight = '500px';
        });
    }
}

function setupEventListeners() {
    // Mode selection
    document.getElementById('mode-select').addEventListener('change', handleModeChange);
    
    // Model refresh
    document.getElementById('refresh-models').addEventListener('click', loadModels);
    
    // Sliders
    document.getElementById('temperature').addEventListener('input', updateSliderValues);
    document.getElementById('max-tokens').addEventListener('input', updateSliderValues);
    document.getElementById('top-p').addEventListener('input', updateSliderValues);
    document.getElementById('image-width').addEventListener('input', updateSliderValues);
    document.getElementById('image-height').addEventListener('input', updateSliderValues);
    document.getElementById('image-steps').addEventListener('input', updateSliderValues);
    document.getElementById('cfg-scale').addEventListener('input', updateSliderValues);
    
    // Text generation
    document.getElementById('generate-text').addEventListener('click', handleTextGeneration);
    document.getElementById('clear-text').addEventListener('click', () => {
        document.getElementById('text-prompt').value = '';
        document.getElementById('text-output').textContent = '';
    });
    
    // Chat
    document.getElementById('send-chat').addEventListener('click', handleChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatMessage();
        }
    });
    document.getElementById('clear-chat').addEventListener('click', () => {
        state.chatHistory = [];
        document.getElementById('chat-messages').innerHTML = '';
        document.getElementById('chat-input').value = '';
    });
    
    // Image generation
    document.getElementById('generate-image').addEventListener('click', handleImageGeneration);
    document.getElementById('clear-image').addEventListener('click', () => {
        document.getElementById('image-prompt').value = '';
        document.getElementById('image-output').innerHTML = '';
    });
    
    // Embeddings
    document.getElementById('generate-embeddings').addEventListener('click', handleEmbeddings);
    document.getElementById('clear-embeddings').addEventListener('click', () => {
        document.getElementById('embeddings-input').value = '';
        document.getElementById('embeddings-output').textContent = '';
    });
}

function updateSliderValues() {
    document.getElementById('temp-value').textContent = document.getElementById('temperature').value;
    document.getElementById('tokens-value').textContent = document.getElementById('max-tokens').value;
    document.getElementById('top-p-value').textContent = document.getElementById('top-p').value;
    document.getElementById('width-value').textContent = document.getElementById('image-width').value;
    document.getElementById('height-value').textContent = document.getElementById('image-height').value;
    document.getElementById('steps-value').textContent = document.getElementById('image-steps').value;
    document.getElementById('cfg-value').textContent = document.getElementById('cfg-scale').value;
}

function handleModeChange(e) {
    const mode = e.target.value;
    state.currentMode = mode;
    
    // Hide all mode contents
    document.querySelectorAll('.mode-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected mode
    document.getElementById(`${mode}-mode`).classList.add('active');
}

async function loadModels() {
    showLoading(true);
    try {
        const response = await safeFetch('/api/bedrock/models');
        const data = await response.json();
        
        if (data.success) {
            state.models = data.models;
            populateModelSelect(data.models);
            showToast('Models loaded successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading models:', error);
        const errorMsg = error.message || 'Unknown error';
        showToast('Failed to load models: ' + errorMsg, 'error');
        
        // Provide offline fallback message
        if (!navigator.onLine) {
            showToast('Please check your internet connection', 'error');
        }
    } finally {
        showLoading(false);
    }
}

function populateModelSelect(models) {
    const select = document.getElementById('model-select');
    select.innerHTML = '';
    
    if (!models || models.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No models available';
        select.appendChild(option);
        return;
    }
    
    // Group models by provider
    const grouped = models.reduce((acc, model) => {
        if (!acc[model.provider]) {
            acc[model.provider] = [];
        }
        acc[model.provider].push(model);
        return acc;
    }, {});
    
    // Add options grouped by provider
    Object.keys(grouped).sort().forEach(provider => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = provider;
        
        grouped[provider].forEach(model => {
            const option = document.createElement('option');
            option.value = model.modelId;
            option.textContent = model.modelName || model.modelId;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
    
    // Restore saved model selection if available
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
        const modelExists = models.some(m => m.modelId === savedModel);
        if (modelExists) {
            select.value = savedModel;
        }
    }
}

async function handleTextGeneration() {
    const prompt = document.getElementById('text-prompt').value.trim();
    const modelId = document.getElementById('model-select').value;
    const streaming = document.getElementById('streaming').checked;
    
    if (!prompt) {
        showToast('Please enter a prompt', 'error');
        return;
    }
    
    if (!modelId) {
        showToast('Please select a model', 'error');
        return;
    }
    
    const parameters = getParameters();
    const outputEl = document.getElementById('text-output');
    outputEl.textContent = '';
    
    // Disable button during generation
    const generateBtn = document.getElementById('generate-text');
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    
    const startTime = Date.now();
    
    try {
        if (streaming) {
            await handleStreamingGeneration(prompt, modelId, parameters, outputEl);
        } else {
            await handleNormalGeneration(prompt, modelId, parameters, outputEl);
        }
        
        updateStats(Date.now() - startTime);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate';
    }
}

async function handleNormalGeneration(prompt, modelId, parameters, outputEl) {
    showLoading(true);
    try {
        const response = await safeFetch('/api/bedrock/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, modelId, parameters })
        });
        
        const data = await response.json();
        
        if (data.success) {
            outputEl.textContent = data.response.text;
            outputEl.style.color = '#232F3E';
            showToast('Text generated successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error generating text:', error);
        const errorMsg = error.message || 'Unknown error';
        
        // Provide helpful error messages
        let displayMsg = errorMsg;
        let suggestion = '';
        
        if (errorMsg.includes('INVALID_PAYMENT_INSTRUMENT') || errorMsg.includes('Marketplace subscription')) {
            suggestion = '\n\n💡 Recommended Models:\n• Amazon Nova (Nova 2 Lite, Nova Pro, Nova Micro)\n• Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Haiku)\n• Amazon Titan (Titan Text Express, Titan Text Lite)';
        } else if (errorMsg.includes('AccessDeniedException') || errorMsg.includes('access denied')) {
            suggestion = '\n\n💡 Solution: Enable model access in AWS Bedrock Console:\n1. Go to AWS Bedrock Console\n2. Click "Model access"\n3. Request access to the model\n4. Wait for approval (usually instant)';
        } else if (errorMsg.includes('credentials')) {
            suggestion = '\n\n💡 Solution: Check your AWS credentials in the .env file';
        }
        
        showToast('Failed to generate text: ' + errorMsg, 'error');
        outputEl.textContent = '❌ Error: ' + displayMsg + suggestion;
        outputEl.style.color = '#D13212';
    } finally {
        showLoading(false);
    }
}

async function handleStreamingGeneration(prompt, modelId, parameters, outputEl) {
    showLoading(true);
    try {
        const response = await fetch('/api/bedrock/generate-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, modelId, parameters })
        });
        
        showLoading(false);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        showToast('Streaming completed', 'success');
                        return;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            outputEl.textContent += parsed.text;
                            outputEl.scrollTop = outputEl.scrollHeight;
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error streaming text:', error);
        showToast('Failed to stream text: ' + error.message, 'error');
        outputEl.textContent = 'Error: ' + error.message;
        showLoading(false);
    }
}

async function handleChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    const modelId = document.getElementById('model-select').value;
    
    if (!modelId) {
        showToast('Please select a model', 'error');
        return;
    }
    
    const parameters = getParameters();
    
    // Add user message to history and display
    state.chatHistory.push({ role: 'user', content: message });
    displayChatMessage('user', message);
    input.value = '';
    
    // Disable send button during processing
    const sendBtn = document.getElementById('send-chat');
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳ Sending...';
    
    showLoading(true);
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/bedrock/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: state.chatHistory, 
                modelId, 
                parameters 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const assistantMessage = data.response.text;
            state.chatHistory.push({ role: 'assistant', content: assistantMessage });
            displayChatMessage('assistant', assistantMessage);
            updateStats(Date.now() - startTime);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error in chat:', error);
        const errorMsg = error.message || 'Unknown error';
        
        // Provide helpful error message
        let suggestion = '';
        if (errorMsg.includes('INVALID_PAYMENT_INSTRUMENT') || errorMsg.includes('Marketplace subscription')) {
            suggestion = ' Try using Amazon Nova, Claude, or Titan models instead.';
        }
        
        showToast('Failed to send message: ' + errorMsg, 'error');
        displayChatMessage('assistant', '❌ Error: ' + errorMsg + suggestion);
        
        // Remove the failed user message from history
        state.chatHistory.pop();
    } finally {
        showLoading(false);
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
}

function displayChatMessage(role, content) {
    const messagesEl = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    messageEl.setAttribute('role', 'article');
    messageEl.setAttribute('aria-label', `${role} message`);
    
    const roleEl = document.createElement('div');
    roleEl.className = 'role';
    roleEl.textContent = role === 'user' ? '👤 You' : '🤖 Assistant';
    
    const contentEl = document.createElement('div');
    contentEl.className = 'content';
    contentEl.textContent = content;
    
    messageEl.appendChild(roleEl);
    messageEl.appendChild(contentEl);
    messagesEl.appendChild(messageEl);
    
    // Smooth scroll to bottom
    messagesEl.scrollTo({
        top: messagesEl.scrollHeight,
        behavior: 'smooth'
    });
}

async function handleImageGeneration() {
    const prompt = document.getElementById('image-prompt').value.trim();
    const modelId = document.getElementById('model-select').value;
    
    if (!prompt) {
        showToast('Please enter an image prompt', 'error');
        return;
    }
    
    if (!modelId) {
        showToast('Please select a model', 'error');
        return;
    }
    
    const parameters = {
        width: parseInt(document.getElementById('image-width').value),
        height: parseInt(document.getElementById('image-height').value),
        steps: parseInt(document.getElementById('image-steps').value),
        cfgScale: parseInt(document.getElementById('cfg-scale').value)
    };
    
    // Disable button during generation
    const generateBtn = document.getElementById('generate-image');
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    
    showLoading(true);
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/bedrock/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, modelId, parameters })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayImages(data.response.images);
            updateStats(Date.now() - startTime);
            showToast('Image generated successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error generating image:', error);
        showToast('Failed to generate image: ' + error.message, 'error');
    } finally {
        showLoading(false);
        generateBtn.disabled = false;
        generateBtn.textContent = '🎨 Generate Image';
    }
}

function displayImages(images) {
    const outputEl = document.getElementById('image-output');
    outputEl.innerHTML = '';
    
    images.forEach((image, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'image-item';
        
        const imgEl = document.createElement('img');
        imgEl.src = `data:image/png;base64,${image.base64}`;
        imgEl.alt = `Generated image ${index + 1}`;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'image-info';
        infoEl.textContent = `Seed: ${image.seed}`;
        
        itemEl.appendChild(imgEl);
        itemEl.appendChild(infoEl);
        outputEl.appendChild(itemEl);
    });
}

async function handleEmbeddings() {
    const text = document.getElementById('embeddings-input').value.trim();
    const modelId = document.getElementById('model-select').value;
    
    if (!text) {
        showToast('Please enter text for embeddings', 'error');
        return;
    }
    
    if (!modelId) {
        showToast('Please select a model', 'error');
        return;
    }
    
    // Disable button during generation
    const generateBtn = document.getElementById('generate-embeddings');
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    
    showLoading(true);
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/bedrock/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, modelId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const outputEl = document.getElementById('embeddings-output');
            outputEl.textContent = JSON.stringify(data.response, null, 2);
            updateStats(Date.now() - startTime);
            showToast('Embeddings generated successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error generating embeddings:', error);
        showToast('Failed to generate embeddings: ' + error.message, 'error');
    } finally {
        showLoading(false);
        generateBtn.disabled = false;
        generateBtn.textContent = '🔢 Generate Embeddings';
    }
}

function getParameters() {
    return {
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('max-tokens').value),
        topP: parseFloat(document.getElementById('top-p').value)
    };
}

function updateStats(responseTime) {
    state.stats.requestCount++;
    state.stats.responseTimes.push(responseTime);
    
    const avgResponseTime = state.stats.responseTimes.reduce((a, b) => a + b, 0) / state.stats.responseTimes.length;
    
    document.getElementById('request-count').textContent = state.stats.requestCount;
    document.getElementById('avg-response').textContent = Math.round(avgResponseTime) + 'ms';
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Truncate long messages on mobile
    const isMobile = window.innerWidth < 768;
    const maxLength = isMobile ? 100 : 200;
    const displayMessage = message.length > maxLength 
        ? message.substring(0, maxLength) + '...' 
        : message;
    
    toast.textContent = displayMessage;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Utility function to handle fetch errors
async function safeFetch(url, options = {}) {
    try {
        // Check if online
        if (!navigator.onLine) {
            throw new Error('No internet connection. Please check your network.');
        }
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
        
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. The operation took too long to complete.');
        }
        throw error;
    }
}
