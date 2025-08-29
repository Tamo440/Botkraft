// 💬 Erweiterte Version des Botkraft24 Website-Chatbots – auf Basis deines Originalcodes
// Fokus: Lead-Erfassung, Quick-Replies, Darkmode, Responsiveness, bessere UI/UX

// === STYLE ===
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px;
}
.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #ccc;
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}
.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.chatbot-notify {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 14px;
  height: 14px;
  background: red;
  border-radius: 50%;
  border: 2px solid white;
}
.pulse {
  animation: pulse 0.5s ease-in-out 2;
}

.chatbot-container-hidden {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.chatbot-container-animated {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in-message {
  animation: fadeInUp 0.3s ease-out;
}

:root {
  --primary: #085186;
  --accent: #ff6900;
  --background: #ffffff;
  --text: #000000;
  --user-bg: #ff6900;
  --user-text: #ffffff;
}

[data-theme="dark"] {
  --primary: #1e2a38;
  --accent: #ff9800;
  --background: #121212;
  --text: #f1f1f1;
  --user-bg: #ff9800;
  --user-text: #121212;
}
`;
document.head.appendChild(styleTag);

// === RESTLICHER CODE: folgt sofort – zu lang für ein Feld ===
// Sag: "weiter" – und ich füge direkt den nächsten Teil hinzu.
// 💬 Erweiterte Version des Botkraft24 Website-Chatbots – auf Basis deines Originalcodes
// Fokus: Lead-Erfassung, Quick-Replies, Darkmode, Responsiveness, bessere UI/UX

// === BLOCK 1: STYLE eingefügt === (siehe oben)

// === BLOCK 2: UI-Elemente, Button, Container, Darkmode-Toggle ===

// Toggle für Darkmode
const themeToggle = document.createElement('button');
themeToggle.textContent = '🌓';
themeToggle.style.position = 'absolute';
themeToggle.style.top = '12px';
themeToggle.style.left = '12px';
themeToggle.style.fontSize = '18px';
themeToggle.style.background = 'transparent';
themeToggle.style.border = 'none';
themeToggle.style.cursor = 'pointer';
themeToggle.onclick = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
};
document.body.appendChild(themeToggle);

document.documentElement.setAttribute('data-theme', 'light');

// Chatbot-Button (Floating)
const chatbotBtn = document.createElement('div');
chatbotBtn.style.position = 'fixed';
chatbotBtn.style.bottom = '20px';
chatbotBtn.style.right = '20px';
chatbotBtn.style.width = '60px';
chatbotBtn.style.height = '60px';
chatbotBtn.style.backgroundColor = 'var(--primary)';
chatbotBtn.style.borderRadius = '50%';
chatbotBtn.style.display = 'flex';
chatbotBtn.style.alignItems = 'center';
chatbotBtn.style.justifyContent = 'center';
chatbotBtn.style.cursor = 'pointer';
chatbotBtn.style.boxShadow = '2px 2px 8px rgba(0,0,0,0.2)';
chatbotBtn.style.zIndex = '9999';
chatbotBtn.innerHTML = '<i class="fas fa-comment-dots" style="color:white;font-size:24px;"></i>';
document.body.appendChild(chatbotBtn);

// Online-Status-Punkt
const onlineStatus = document.createElement('div');
onlineStatus.style.position = 'absolute';
onlineStatus.style.bottom = '6px';
onlineStatus.style.right = '6px';
onlineStatus.style.width = '12px';
onlineStatus.style.height = '12px';
onlineStatus.style.backgroundColor = '#28c76f';
onlineStatus.style.border = '2px solid white';
onlineStatus.style.borderRadius = '50%';
onlineStatus.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
chatbotBtn.appendChild(onlineStatus);

// Chatbot-Fenster (Container)
const chatbotContainer = document.createElement('div');
chatbotContainer.id = 'chatbot';
chatbotContainer.style.position = 'fixed';
chatbotContainer.style.bottom = '80px';
chatbotContainer.style.right = '20px';
chatbotContainer.style.width = '360px';
chatbotContainer.style.height = '600px';
chatbotContainer.style.backgroundColor = 'var(--background)';
chatbotContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
chatbotContainer.style.borderRadius = '12px';
chatbotContainer.style.display = 'none';
chatbotContainer.style.flexDirection = 'column';
chatbotContainer.style.border = '2px solid var(--primary)';
chatbotContainer.style.zIndex = '9999';
document.body.appendChild(chatbotContainer);

// Header
const header = document.createElement('div');
header.innerHTML = '<strong>Botkraft24</strong>';
header.style.backgroundColor = 'var(--primary)';
header.style.color = 'white';
header.style.padding = '18px';
header.style.textAlign = 'center';
header.style.fontSize = '20px';
header.style.fontWeight = 'bold';
header.style.borderTopLeftRadius = '12px';
header.style.borderTopRightRadius = '12px';
chatbotContainer.appendChild(header);

// Nachrichtenbereich
const messages = document.createElement('div');
messages.id = 'messages';
messages.style.flex = '1';
messages.style.padding = '16px';
messages.style.overflowY = 'auto';
messages.style.backgroundColor = '#f7f7f7';
chatbotContainer.appendChild(messages);

// Eingabefeld
const inputWrapper = document.createElement('div');
inputWrapper.style.display = 'flex';
inputWrapper.style.borderTop = '1px solid #ddd';

const input = document.createElement('input');
input.id = 'user-input';
input.placeholder = 'Schreiben Sie Ihre Frage...';
input.style.flex = '1';
input.style.padding = '12px';
input.style.border = 'none';
input.style.outline = 'none';
input.style.fontSize = '15px';

const sendBtn = document.createElement('button');
sendBtn.textContent = '➤';
sendBtn.style.padding = '12px';
sendBtn.style.backgroundColor = 'var(--accent)';
sendBtn.style.color = 'white';
sendBtn.style.border = 'none';
sendBtn.style.cursor = 'pointer';
sendBtn.style.fontSize = '18px';

inputWrapper.appendChild(input);
inputWrapper.appendChild(sendBtn);
chatbotContainer.appendChild(inputWrapper);

// Toggle öffnen/schließen
chatbotBtn.addEventListener('click', () => {
  const display = window.getComputedStyle(chatbotContainer).display;
  if (display === 'none') {
    chatbotContainer.style.display = 'flex';
  } else {
    chatbotContainer.style.display = 'none';
  }
});
// 💬 Erweiterte Version des Botkraft24 Website-Chatbots – auf Basis deines Originalcodes
// Fokus: Lead-Erfassung, Quick-Replies, Darkmode, Responsiveness, bessere UI/UX

// === BISHER: STYLE + UI (Block 1 & 2)

// === BLOCK 3: Logik – Chat-Verlauf, Nachrichtensystem, Lead-Capture ===

// Scrollfunktion
function scrollToBottom() {
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: 'smooth'
  });
}

// Nachricht anzeigen
function appendMessage(text, sender = 'bot') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('fade-in-message');
  wrapper.style.marginBottom = '10px';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = sender === 'bot' ? 'flex-start' : 'flex-end';

  const msg = document.createElement('div');
  msg.style.padding = '8px 12px';
  msg.style.borderRadius = '8px';
  msg.style.maxWidth = '80%';
  msg.style.wordBreak = 'break-word';
  msg.style.backgroundColor = sender === 'bot' ? 'var(--background)' : 'var(--user-bg)';
  msg.style.color = sender === 'bot' ? 'var(--text)' : 'var(--user-text)';
  msg.textContent = text;

  wrapper.appendChild(msg);
  messages.appendChild(wrapper);
  scrollToBottom();
}

// Lead-Capture Variablen
let lead = {
  name: '',
  email: ''
};
let awaitingName = false;
let awaitingEmail = false;

function askForLead() {
  appendMessage('Darf ich Sie kurz kennenlernen? Wie lautet Ihr Name?', 'bot');
  awaitingName = true;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleUserInput(message) {
  appendMessage(message, 'user');

  if (awaitingName) {
    lead.name = message;
    awaitingName = false;
    awaitingEmail = true;
    appendMessage(`Danke, ${lead.name}. Und Ihre E-Mail-Adresse?`, 'bot');
    return;
  }

  if (awaitingEmail) {
    if (validateEmail(message)) {
      lead.email = message;
      awaitingEmail = false;
      appendMessage('Vielen Dank. Wir melden uns zeitnah bei Ihnen.', 'bot');
      console.log('Lead gespeichert:', lead);
    } else {
      appendMessage('Das scheint keine gültige E-Mail zu sein. Bitte nochmal versuchen.', 'bot');
    }
    return;
  }

  // Lead-Capture auslösen bei Keywords
  const lower = message.toLowerCase();
  if (lower.includes('angebot') || lower.includes('preis') || lower.includes('test') || lower.includes('kontakt')) {
    askForLead();
    return;
  }

  // Dummy-Botantwort
  setTimeout(() => {
    appendMessage('Vielen Dank für Ihre Nachricht. Wir melden uns zeitnah.', 'bot');
  }, 600);
}

sendBtn.addEventListener('click', () => {
  const msg = input.value.trim();
  if (!msg) return;
  handleUserInput(msg);
  input.value = '';
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const msg = input.value.trim();
    if (!msg) return;
    handleUserInput(msg);
    input.value = '';
  }
});
// 💬 Erweiterte Version des Botkraft24 Website-Chatbots – auf Basis deines Originalcodes
// Fokus: Lead-Erfassung, Quick-Replies, Darkmode, Responsiveness, bessere UI/UX

// === BLOCK 4: Erweiterung – Quick Replies & vorbereitbare GPT-Verbindung ===

// QUICK REPLY BUTTONS
function showQuickReplies() {
  const quickReplyContainer = document.createElement('div');
  quickReplyContainer.style.display = 'flex';
  quickReplyContainer.style.flexWrap = 'wrap';
  quickReplyContainer.style.gap = '8px';
  quickReplyContainer.style.marginTop = '10px';

  const replies = [
    'Was kostet der Bot?',
    'Kann ich testen?',
    'Ich brauche ein Angebot',
    'Wie läuft es ab?'
  ];

  replies.forEach(reply => {
    const btn = document.createElement('button');
    btn.textContent = reply;
    btn.style.padding = '6px 12px';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '6px';
    btn.style.backgroundColor = '#fff';
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      input.value = reply;
      sendBtn.click();
      quickReplyContainer.remove();
    };
    quickReplyContainer.appendChild(btn);
  });

  messages.appendChild(quickReplyContainer);
  scrollToBottom();
}

// Aufruf bei Start
window.addEventListener('load', () => {
  setTimeout(() => {
    appendMessage('Willkommen! 👋 Wie kann ich helfen?', 'bot');
    showQuickReplies();
  }, 300);
});


// GPT-API-Vorbereitung (deaktiviert)
// fetch('https://dein-proxy-endpunkt/chat', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ messages: chatHistory })
// })
//   .then(res => res.json())
//   .then(data => {
//     const botReply = data.choices[0].message.content;
//     appendMessage(botReply, 'bot');
//   });


// === ENDE DES CODES ===
// Dieser Code ist bereit für GitHub & Hosting auf Vercel, Render oder WordPress-Einbettung.
// Optional: Lead an Sheets/Mail weiterleiten mit Webhook.


