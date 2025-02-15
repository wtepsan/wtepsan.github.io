const toggleRecordingButton = document.getElementById("toggle-recording");
const responseOutput = document.getElementById("response-output");
const status = document.getElementById("status");
const mouth = document.getElementById("mouth");

let recognition;
let isRecognizing = false;  // Track whether recognition is active

// Check if the Web Speech API is supported
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = "th-TH";  // Set to Thai language
    recognition.interimResults = false; // We want only final results
    recognition.maxAlternatives = 1;
} else {
    status.textContent = "เบราว์เซอร์นี้ไม่รองรับการจดจำเสียง"; // "Speech recognition is not supported in this browser"
}

// Toggle recognition start/stop on button click
toggleRecordingButton.addEventListener("click", () => {
    if (isRecognizing) {
        stopRecognition();
    } else {
        startRecognition();
    }
});

// Function to start speech recognition
function startRecognition() {
    if (recognition && !isRecognizing) {
        status.textContent = "กำลังฟัง... 🎤";  // "Listening..."
        recognition.start();
        isRecognizing = true;
        toggleRecordingButton.textContent = "หยุด";  // Change button text to "Stop"
    }
}

// Function to stop speech recognition
function stopRecognition() {
    if (recognition && isRecognizing) {
        recognition.stop();
        isRecognizing = false;
        status.textContent = "การสนทนาสิ้นสุดแล้ว.";  // "Conversation stopped."
        toggleRecordingButton.textContent = "เริ่มพูด";  // Change button text to "Start Speaking"
    }
}

// Handle the speech recognition result
recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    status.textContent = `คุณพูดว่า: "${transcript}". กำลังประมวลผล...`;  // "You said: ... Processing..."
    sendTranscriptionToServer(transcript);  // Send transcription to FastAPI backend
};

// Automatically restart recognition after receiving a result, unless stopped by the user
recognition.onend = function () {
    if (isRecognizing) {
        // If the conversation is still ongoing, restart the recognition
        recognition.start();
    } else {
        status.textContent = "การสนทนาสิ้นสุดแล้ว.";  // "Conversation ended."
    }
};

// Handle errors
recognition.onerror = function (event) {
    status.textContent = event.error;  // "Error occurred during speech recognition" "เกิดข้อผิดพลาดระหว่างการจดจำเสียง: " + 
};

// Send transcription to FastAPI server running on localhost:4000
async function sendTranscriptionToServer(transcript) {
    const formData = new FormData();
    formData.append("input_text", transcript);

    try {
        // const response = await fetch("http://localhost:4000/process_text/", {
        // const response = await fetch("http://202.80.238.234:5555/api/process_text/", {
        const response = await fetch("https://cors-anywhere.herokuapp.com/http://202.80.238.234:5555/api/process_text/", {  
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error("การตอบสนองของเซิร์ฟเวอร์ไม่ถูกต้อง");  // "Server response was not OK"
        }

        const data = await response.json();

        if (data.response_text) {
            status.textContent = "ได้รับการตอบกลับแล้ว!";  // "Response received!"
            responseOutput.textContent = data.response_text;
            speakText(data.response_text);  // Convert response to speech
        } else {
            status.textContent = "ข้อผิดพลาด: ไม่ได้รับข้อความตอบกลับจากเซิร์ฟเวอร์.";  // "Error: No response text received from server"
        }
    } catch (error) {
        status.textContent = "ข้อผิดพลาด: ไม่สามารถส่งข้อความไปยังเซิร์ฟเวอร์ได้.";  // "Error: Could not send transcription to server"
        console.error("Error:", error);
    }
}

// Function to convert number to Thai words
function convertNumberToThaiWords(number) {
    const numberWords = {
        0: 'ศูนย์', 1: 'หนึ่ง', 2: 'สอง', 3: 'สาม', 4: 'สี่', 5: 'ห้า', 
        6: 'หก', 7: 'เจ็ด', 8: 'แปด', 9: 'เก้า'
    };
    const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    let numStr = number.toString();
    let numLength = numStr.length;
    let thaiNumStr = '';

    for (let i = 0; i < numLength; i++) {
        let digit = parseInt(numStr[i]);
        let place = numLength - i - 1;

        if (digit === 0 && place % 6 !== 0) continue;  // Skip zero, except for millions

        if (place % 6 === 1 && digit === 1 && i === 0) {
            thaiNumStr += 'สิบ'; // Special case for 10-19
        } else if (place % 6 === 1 && digit === 2) {
            thaiNumStr += 'ยี่' + units[1]; // Special case for 20-29
        } else if (digit === 1 && place % 6 === 0 && i > 0) {
            thaiNumStr += 'เอ็ด'; // Special case for 1 at the end
        } else {
            thaiNumStr += numberWords[digit] + (units[place % 6] || '');
        }
    }

    return thaiNumStr;
}

// Function to detect if a character is Thai
function isThai(char) {
    return /^[ก-๙]+$/.test(char);
}

// Function to detect if a character is English
function isEnglish(char) {
    return /^[A-Za-z]+$/.test(char);
}

// Function to detect if a character is a number
function isNumber(char) {
    return /^[0-9]+$/.test(char);
}

// Function to check if a character is an emoji
function isEmoji(char) {
    return /[\u{1F300}-\u{1FAD6}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/u.test(char);
}


// Function to split the text into segments of Thai, English, or numbers
function splitTextByLanguage(text) {
    let segments = [];
    let currentSegment = "";
    let currentLang = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Skip emojis
        if (isEmoji(char)) {
            console.log(char)
            char = "";
            continue;
        }

        let lang;
        if (isThai(char)) {
            lang = "th-TH";
        } else if (isEnglish(char)) {
            lang = "en-US";
        } else if (isNumber(char)) {
            lang = "th-TH";  // Numbers should follow Thai pattern
            currentSegment += convertNumberToThaiWords(char);  // Convert number to Thai words
            continue;
        } else {
            lang = currentLang; // Treat punctuation as part of the current language
        }

        if (lang !== currentLang && currentSegment !== "") {
            segments.push({ text: currentSegment, lang: currentLang });
            currentSegment = char;
            currentLang = lang;
        } else {
            currentSegment += char;
            currentLang = lang;
        }
    }

    // Push the last segment
    if (currentSegment !== "") {
        segments.push({ text: currentSegment, lang: currentLang });
    }

    return segments;
}

// Function to speak a text segment using SpeechSynthesis API
function speakSegment(segment, onend) {
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = segment.lang;

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Choose a voice based on the language
    if (voice) {
        utterance.voice = voice;
    } else {
        console.warn(`No voice found for language: ${segment.lang}`);
    }
    
    // Set event listener for when the utterance ends
    if (onend) {
        utterance.onend = onend;
    }

    // Speak the utterance
    window.speechSynthesis.speak(utterance);
}

// Function to load and wait for voices
function loadVoices(callback) {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            callback();
        };
    } else {
        callback();
    }
}

// Function to animate the mouth when speaking
function startTalking() {
    mouth.classList.add('talking');
}

// Function to stop mouth animation
function stopTalking() {
    mouth.classList.remove('talking');
}

// Function to speak text and trigger mouth animation
function listVoices() {
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const thaiVoices = voices.filter(voice => voice.lang === "th-TH");
        
        console.log("Available Thai Voices:");
        thaiVoices.forEach((voice, index) => {
            console.log(`${index}: ${voice.name} (${voice.lang})`);
        });
    };
}

listVoices();

function speakText(text, voiceIndex = 0) {
    loadVoices(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "th-TH";

        utterance.onstart = () => startTalking();  // Start mouth animation
        utterance.onend = () => stopTalking();    // Stop mouth animation

        const voices = window.speechSynthesis.getVoices();
        const thaiVoices = voices.filter(v => v.lang === "th-TH");

        if (thaiVoices.length > 0) {
            utterance.voice = thaiVoices[voiceIndex % thaiVoices.length]; // Select voice based on index
        }

        window.speechSynthesis.speak(utterance);
    });
}


// function speakText(text) {
//     loadVoices(() => {
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "th-TH";

//         utterance.onstart = () => startTalking();  // Start mouth animation
//         utterance.onend = () => stopTalking();    // Stop mouth animation

//         const voices = window.speechSynthesis.getVoices();
//         const voice = voices.find(v => v.lang === "th-TH") || voices[1];
//         console
//         if (voice) utterance.voice = voice;

//         window.speechSynthesis.speak(utterance);
//     });
// }