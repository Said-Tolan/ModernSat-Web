/**
 * ModernSat - كيمو المساعد الذكي
 * ملف التحكم بوظائف المساعد الذكي والمحادثة
 * 
 * @version 1.0.0
 * @author Your Name
 * @copyright 2024
 * 
 * ملاحظة: يتطلب اتصال بالإنترنت واتصال بـ Gemini API
 */

// تهيئة المتغيرات العامة
let currentLanguage = localStorage.getItem('language') || 'ar';
let currentTheme = localStorage.getItem('theme') || 'light';
const API_KEY = 'AIzaSyB1PazcmuSvR2e2LBaKh_h34XlNH7oWDOg';

// إرسال رسالة إلى Gemini API
async function sendToGemini(message) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const data = {
            contents: [{
                parts: [{
                    text: `You are Kimo, an AI assistant for ModernSat Electronics store. 
                    Current language: ${currentLanguage}.
                    User message: ${message}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        return currentLanguage === 'ar' 
            ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
            : 'Sorry, there was a connection error. Please try again.';
    }
}

// إضافة رسالة للمحادثة
function addMessage(text, isUser = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // تقسيم النص إلى أسطر وإضافة تنسيق HTML
    const formattedText = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('<br>');
    
    messageDiv.innerHTML = formattedText;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// معالجة إرسال الرسالة
async function handleSendMessage() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');
    const message = userInput.value.trim();
    
    if (message) {
        // تعطيل زر الإرسال وحقل الإدخال
        userInput.disabled = true;
        sendButton.disabled = true;
        
        // إظهار رسالة المستخدم
        addMessage(message, true);
        userInput.value = '';
        
        // إضافة رسالة "جاري الكتابة..."
        const loadingMessage = currentLanguage === 'ar' ? 'جاري الكتابة...' : 'Typing...';
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.textContent = loadingMessage;
        document.getElementById('chatMessages').appendChild(loadingDiv);
        
        try {
            // إرسال الرسالة إلى Gemini
            const response = await sendToGemini(message);
            // إزالة رسالة "جاري الكتابة..."
            loadingDiv.remove();
            // إضافة رد المساعد
            addMessage(response);
        } catch (error) {
            loadingDiv.remove();
            addMessage(currentLanguage === 'ar' 
                ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
                : 'Sorry, an error occurred. Please try again.');
        }
        
        // إعادة تفعيل زر الإرسال وحقل الإدخال
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// تحديث اللغة
function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('.ar, .en').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.' + currentLanguage).forEach(el => {
        el.style.display = 'inline';
    });
    
    const userInput = document.getElementById('userInput');
    userInput.placeholder = currentLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...';
    
    localStorage.setItem('language', currentLanguage);
}

// تحديث المظهر
function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', currentTheme);
}

// تهيئة الوضع المظلم/الفاتح
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// التحقق من الوضع المحفوظ
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// وظيفة تبديل الوضع
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// تحديث أيقونة الوضع
function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// إعداد مستمعي الأحداث
document.getElementById('sendMessage').addEventListener('click', handleSendMessage);
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

document.getElementById('languageToggle').addEventListener('click', () => {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    updateLanguage();
});

// تهيئة الصفحة
window.addEventListener('load', () => {
    updateLanguage();
    updateTheme();
    
    // إضافة رسالة ترحيب
    const welcomeMessage = currentLanguage === 'ar'
        ? 'مرحباً! أنا كيمو، المساعد الذكي لمتجر ModernSat. كيف يمكنني مساعدتك اليوم؟'
        : 'Hello! I am Kimo, the AI assistant for ModernSat store. How can I help you today?';
    addMessage(welcomeMessage);
    
    // تركيز حقل الإدخال
    document.getElementById('userInput').focus();
});
