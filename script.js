// Super Simple Voice Form with LLM-like Natural Language Processing
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let speech = {
    enabled: false,
    listening: false,
    recognition: null
};

// DOM elements
const toggleBtn = document.getElementById('toggleListening');
const statusElement = document.getElementById('status');
const transcriptElement = document.getElementById('transcript');
const clearFormBtn = document.getElementById('clearForm');
const form = document.getElementById('voiceForm');

// Smart LLM-like agent for processing natural language
class SmartVoiceAgent {
    constructor() {
        this.fields = {
            name: ['name', 'full name', 'my name', 'called', 'i am', "i'm"],
            email: ['email', 'email address', 'e-mail', 'mail'],
            phone: ['phone', 'number', 'phone number', 'telephone', 'mobile', 'cell'],
            age: ['age', 'years old', 'old', 'born'],
            city: ['city', 'live in', 'from', 'location', 'town'],
            comments: ['comments', 'comment', 'note', 'message', 'additional', 'anything else'],
            gender: ['gender', 'i am', 'male', 'female', 'other'],
            country: ['country', 'from', 'live in', 'nation'],
            interests: ['interests', 'like', 'enjoy', 'hobby', 'hobbies']
        };
        
        // Value mappings for better recognition
        this.valueMappings = {
            gender: {
                'male': 'male',
                'man': 'male',
                'boy': 'male',
                'female': 'female',
                'woman': 'female',
                'girl': 'female',
                'other': 'other',
                'non-binary': 'other',
                'prefer not to say': 'other'
            },
            country: {
                'usa': 'usa',
                'united states': 'usa',
                'america': 'usa',
                'us': 'usa',
                'canada': 'canada',
                'uk': 'uk',
                'united kingdom': 'uk',
                'britain': 'uk',
                'england': 'uk',
                'australia': 'australia',
                'germany': 'germany',
                'france': 'france',
                'japan': 'japan',
                'other': 'other'
            },
            interests: {
                'technology': 'technology',
                'tech': 'technology',
                'computers': 'technology',
                'programming': 'technology',
                'sports': 'sports',
                'sport': 'sports',
                'athletics': 'sports',
                'music': 'music',
                'songs': 'music',
                'singing': 'music',
                'reading': 'reading',
                'books': 'reading',
                'literature': 'reading'
            }
        };
    }

    // Process any natural speech and figure out what the user wants
    processNaturalSpeech(text) {
        const lowerText = text.toLowerCase().trim();
        
        // Handle form actions first
        if (this.isFormAction(lowerText)) {
            return this.handleFormAction(lowerText);
        }

        // Try to extract field and value from natural speech
        const extraction = this.extractFieldAndValue(lowerText);
        if (extraction) {
            if (extraction.field === 'gender' || extraction.field === 'country') {
                this.selectRadioOrDropdown(extraction.field, extraction.value);
                return `✅ Selected ${extraction.field}: ${extraction.value}`;
            } else if (extraction.field === 'interests') {
                this.selectCheckboxes(extraction.value);
                return `✅ Selected interests: ${extraction.value}`;
            } else {
                this.fillField(extraction.field, extraction.value);
                return `✅ Set ${extraction.field}: ${extraction.value}`;
            }
        }

        // If we can't understand, provide helpful guidance
        return "🤔 Try saying something like: 'My name is John', 'Age 25', or 'I am male'";
    }

    isFormAction(text) {
        return text.includes('clear') || text.includes('submit') || text.includes('send') || 
               text.includes('next') || text.includes('done') || text.includes('finish');
    }

    handleFormAction(text) {
        if (text.includes('clear')) {
            clearForm();
            return '🗑️ Form cleared!';
        }
        if (text.includes('submit') || text.includes('send') || text.includes('done') || text.includes('finish')) {
            submitForm();
            return '📤 Submitting form...';
        }
        if (text.includes('next')) {
            this.focusNextField();
            return '➡️ Moved to next field';
        }
        return '❓ Action not recognized';
    }

    // Enhanced email cleaning function
    cleanEmail(emailText) {
        let cleaned = emailText.toLowerCase()
            .replace(/\s+at\s+/g, '@')
            .replace(/\s+dot\s+/g, '.')
            .replace(/\s+gmail\s+/g, 'gmail')
            .replace(/\s+yahoo\s+/g, 'yahoo')
            .replace(/\s+hotmail\s+/g, 'hotmail')
            .replace(/\s+outlook\s+/g, 'outlook')
            .replace(/\s+com\s*/g, 'com')
            .replace(/\s+org\s*/g, 'org')
            .replace(/\s+net\s*/g, 'net')
            .replace(/\s+edu\s*/g, 'edu')
            .replace(/\s+/g, '')
            .replace(/att/g, '@')
            .replace(/(@)([a-z])/g, '@$2')
            .replace(/([a-z])(\.)/g, '$1.')
            .replace(/(\.)([a-z])/g, '.$2');

        return cleaned;
    }

    // Fixed age extraction function
    extractAge(text) {
        console.log('Extracting age from:', text);
        
        const agePatterns = [
            /(\d+)\s*years?\s*old/i,
            /age\s*is\s*(\d+)/i,
            /age\s*(\d+)/i,
            /i\s*am\s*(\d+)/i,
            /i'm\s*(\d+)/i,
            /my\s*age\s*is\s*(\d+)/i,
            /(\d+)\s*years/i,
            /(\d+)\s*$/,
            /\b(\d{1,3})\b/
        ];

        for (const pattern of agePatterns) {
            const match = text.match(pattern);
            if (match) {
                const age = parseInt(match[1]);
                console.log('Found age:', age);
                if (age >= 1 && age <= 150) {
                    return age.toString();
                }
            }
        }
        
        console.log('No age found');
        return null;
    }

    extractFieldAndValue(text) {
        console.log('Processing text:', text);
        
        // Enhanced patterns with radio/checkbox support
        const patterns = [
            // Age patterns - prioritize these first
            { 
                regex: /(?:age|my age is|i am|i'm)\s+(.+)/i, 
                field: 'age',
                processor: (match) => this.extractAge(match)
            },
            
            // Gender patterns
            { 
                regex: /(?:i am|gender|i'm)\s+(male|female|man|woman|other|boy|girl)/i, 
                field: 'gender',
                processor: (match) => this.mapValue('gender', match.toLowerCase())
            },
            
            // Country patterns
            { 
                regex: /(?:country|from|live in|nation)\s+(.+)/i, 
                field: 'country',
                processor: (match) => this.mapValue('country', match.toLowerCase())
            },
            
            // Interests patterns
            { 
                regex: /(?:interests?|like|enjoy|hobby|hobbies)\s+(.+)/i, 
                field: 'interests',
                processor: (match) => this.extractInterests(match.toLowerCase())
            },
            
            // Name patterns
            { regex: /(?:my name is|i am called|i'm called|my name's|call me)\s+(.+)/i, field: 'name' },
            
            // Email patterns
            { 
                regex: /(?:my email is|email is|my email's|email)\s+(.+)/i, 
                field: 'email',
                processor: (match) => this.cleanEmail(match)
            },
            
            // City patterns
            { regex: /(?:i live in|i'm from|i'm in|city)\s+(.+)/i, field: 'city' },
            
            // Phone patterns
            { regex: /(?:my phone is|phone is|my number is|number is|call me at|phone)\s+(.+)/i, field: 'phone' },
            
            // Comments patterns
            { regex: /(?:comments?|note|message)\s*:?\s*(.+)/i, field: 'comments' }
        ];

        // Try each pattern
        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                let value = match[1].trim();
                console.log(`Pattern matched for ${pattern.field}:`, value);
                
                if (pattern.processor) {
                    value = pattern.processor(value);
                    console.log(`Processed value for ${pattern.field}:`, value);
                    if (!value) continue;
                }
                
                return { field: pattern.field, value: value };
            }
        }

        // Try keyword-based matching
        for (const [fieldName, keywords] of Object.entries(this.fields)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    const parts = text.split(keyword);
                    if (parts.length > 1) {
                        let value = parts[1].trim();
                        
                        if (value && value.length > 0) {
                            console.log(`Keyword match for ${fieldName}:`, value);
                            
                            if (fieldName === 'email') {
                                value = this.cleanEmail(value);
                            } else if (fieldName === 'age') {
                                value = this.extractAge(value);
                                if (!value) continue;
                            } else if (fieldName === 'gender') {
                                value = this.mapValue('gender', value.toLowerCase());
                            } else if (fieldName === 'country') {
                                value = this.mapValue('country', value.toLowerCase());
                            } else if (fieldName === 'interests') {
                                value = this.extractInterests(value.toLowerCase());
                            }
                            
                            return { field: fieldName, value: value };
                        }
                    }
                }
            }
        }

        return null;
    }

    mapValue(field, value) {
        const mapping = this.valueMappings[field];
        if (mapping) {
            for (const [key, mappedValue] of Object.entries(mapping)) {
                if (value.includes(key)) {
                    return mappedValue;
                }
            }
        }
        return value;
    }

    extractInterests(text) {
        const interests = [];
        const mapping = this.valueMappings.interests;
        
        for (const [key, value] of Object.entries(mapping)) {
            if (text.includes(key)) {
                interests.push(value);
            }
        }
        
        return interests.length > 0 ? interests : [text.trim()];
    }

    selectRadioOrDropdown(fieldName, value) {
        console.log(`Selecting ${fieldName} with value:`, value);
        
        if (fieldName === 'gender') {
            const radio = document.querySelector(`input[name="gender"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                this.highlightRadioGroup('gender');
            }
        } else if (fieldName === 'country') {
            const select = document.getElementById('country');
            if (select) {
                select.value = value;
                select.classList.add('voice-active');
                setTimeout(() => select.classList.remove('voice-active'), 2000);
            }
        }
    }

    selectCheckboxes(interests) {
        console.log('Selecting interests:', interests);
        
        // Clear all checkboxes first
        document.querySelectorAll('input[name="interests"]').forEach(cb => cb.checked = false);
        
        // Select the specified interests
        if (Array.isArray(interests)) {
            interests.forEach(interest => {
                const checkbox = document.querySelector(`input[name="interests"][value="${interest}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        this.highlightCheckboxGroup();
    }

    highlightRadioGroup(groupName) {
        const group = document.getElementById(groupName);
        if (group) {
            group.querySelectorAll('.radio-option').forEach(option => {
                option.classList.add('voice-selected');
            });
            setTimeout(() => {
                group.querySelectorAll('.radio-option').forEach(option => {
                    option.classList.remove('voice-selected');
                });
            }, 2000);
        }
    }

    highlightCheckboxGroup() {
        const group = document.getElementById('interests');
        if (group) {
            group.querySelectorAll('.checkbox-option').forEach(option => {
                option.classList.add('voice-selected');
            });
            setTimeout(() => {
                group.querySelectorAll('.checkbox-option').forEach(option => {
                    option.classList.remove('voice-selected');
                });
            }, 2000);
        }
    }

    fillField(fieldName, value) {
        console.log(`Filling field ${fieldName} with value:`, value);
        const field = document.getElementById(fieldName);
        if (field) {
            field.value = value;
            field.classList.add('voice-active');
            
            field.style.backgroundColor = '#e8f5e8';
            field.style.borderColor = '#4CAF50';
            
            setTimeout(() => {
                field.classList.remove('voice-active');
                field.style.backgroundColor = '';
                field.style.borderColor = '';
            }, 2000);
        } else {
            console.error('Field not found:', fieldName);
        }
    }

    focusNextField() {
        const fields = Array.from(form.querySelectorAll('input, textarea, select')).filter(f => !f.disabled);
        const currentIndex = fields.findIndex(f => f === document.activeElement);
        const nextIndex = (currentIndex + 1) % fields.length;
        fields[nextIndex].focus();
    }
}

// Create the smart agent
const smartAgent = new SmartVoiceAgent();

function initializeSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        speech.enabled = true;
        speech.recognition = new window.SpeechRecognition();
        
        speech.recognition.continuous = true;
        speech.recognition.interimResults = true;
        speech.recognition.lang = 'en-US';
        speech.recognition.maxAlternatives = 3;
        
        setupSpeechEvents();
        statusElement.textContent = '🤖 Smart voice assistant ready! Just speak naturally.';
    } else {
        speech.enabled = false;
        statusElement.textContent = '❌ Voice control not supported. Please use Chrome, Edge, or Safari.';
        toggleBtn.disabled = true;
        showBrowserError();
    }
}

function setupSpeechEvents() {
    speech.recognition.addEventListener('start', () => {
        speech.listening = true;
        updateUI();
        statusElement.textContent = '🎤 Listening... Speak naturally!';
        transcriptElement.classList.add('active');
    });

    speech.recognition.addEventListener('end', () => {
        speech.listening = false;
        updateUI();
        statusElement.textContent = '⏸️ Stopped listening. Click to continue.';
        transcriptElement.classList.remove('active');
    });

    speech.recognition.addEventListener('result', (event) => {
        const result = event.results[event.results.length - 1];
        let transcript = result[0].transcript.trim();
        
        if (result.length > 1) {
            for (let i = 0; i < result.length; i++) {
                const alternative = result[i].transcript.trim();
                if (alternative.includes('@') || alternative.includes('email') || 
                    alternative.includes('age') || /\d+/.test(alternative)) {
                    transcript = alternative;
                    break;
                }
            }
        }
        
        transcriptElement.textContent = transcript;
        
        if (result.isFinal && transcript.length > 2) {
            console.log('Processing final transcript:', transcript);
            const response = smartAgent.processNaturalSpeech(transcript);
            statusElement.textContent = response;
        }
    });

    speech.recognition.addEventListener('error', (event) => {
        console.error('Speech error:', event.error);
        statusElement.textContent = `🔧 ${event.error}. Please try again.`;
        speech.listening = false;
        updateUI();
    });
}

function updateUI() {
    if (speech.listening) {
        toggleBtn.textContent = '🛑 Stop Listening';
        toggleBtn.classList.add('listening');
    } else {
        toggleBtn.textContent = '🎤 Start Listening';
        toggleBtn.classList.remove('listening');
    }
}

function toggleSpeechRecognition() {
    if (!speech.enabled) return;
    
    if (speech.listening) {
        speech.recognition.stop();
    } else {
        speech.recognition.start();
    }
}

function clearForm() {
    form.reset();
    document.querySelectorAll('.voice-active, .voice-selected').forEach(f => {
        f.classList.remove('voice-active', 'voice-selected');
    });
    transcriptElement.textContent = 'Form cleared. Ready for new input.';
}

function submitForm() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Handle checkboxes separately
    const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
    if (interests.length > 0) {
        data.interests = interests;
    }
    
    const hasData = Object.values(data).some(value => 
        Array.isArray(value) ? value.length > 0 : value.toString().trim() !== ''
    );
    
    if (hasData) {
        statusElement.textContent = '✅ Form submitted successfully!';
        alert('🎉 Form Submitted!\n\n' + JSON.stringify(data, null, 2));
    } else {
        statusElement.textContent = '⚠️ Please fill some fields before submitting.';
    }
}

function showBrowserError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <strong>🚫 Browser Not Supported</strong><br>
        Voice control requires Chrome, Edge, or Safari 14.1+
    `;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.transcript-area'));
}

// Event listeners
toggleBtn.addEventListener('click', toggleSpeechRecognition);
clearFormBtn.addEventListener('click', clearForm);
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    transcriptElement.textContent = '🤖 Ready! Click "Start Listening" and speak naturally.';
});

// Pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && speech.listening) {
        speech.recognition.stop();
    }
}); 