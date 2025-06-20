// ==== STYLE-ANIMATION für "Bot tippt..." ====
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
`;
document.head.appendChild(styleTag);

// 🔴 Animation + Notification Badge
const styleExtras = document.createElement('style');
styleExtras.textContent = `
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
}`;
document.head.appendChild(styleExtras);

let selectedBusiness = null;

const colors = {
    primary: '#085186',
    accent: '#ff6900',
    botBackground: '#ffffff',
    userBackground: '#ff6900',
    userText: '#ffffff',
    botText: '#000000'
};

const styles = {
    button: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        backgroundColor: colors.primary,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
        zIndex: '9999'
    },
    icon: {
        color: 'white',
        fontSize: '24px'
    },
    container: {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '360px',
        height: '600px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        display: 'none',
        flexDirection: 'column',
        border: `2px solid ${colors.primary}`,
        zIndex: '9999'
    },
    header: {
        backgroundColor: colors.primary,
        color: 'white',
        padding: '18px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
    },
    messages: {
        flex: '1',
        padding: '16px',
        overflowY: 'auto',
        backgroundColor: '#f7f7f7'
    },
    inputContainer: {
        display: 'flex',
        borderTop: '1px solid #ddd'
    },
    input: {
        flex: '1',
        padding: '12px',
        border: 'none',
        outline: 'none',
        fontSize: '15px'
    },
    sendButton: {
        padding: '12px',
        backgroundColor: colors.accent,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'background 0.3s'
    },
    sendButtonHover: {
        backgroundColor: '#e65a00'
    },
messageBase: {
  borderRadius: '8px',
  padding: '8px 12px',
  marginBottom: '10px',
  fontSize: '14px',
  lineHeight: '1.4',
  background: '#f5f5f5',
  color: '#333',
  maxWidth: '90%',
  width: 'fit-content',
  boxShadow: 'none',
  wordBreak: 'break-word'
},
   botMessage: {
  backgroundColor: colors.botBackground,
  color: colors.botText,
  textAlign: 'left',
  maxWidth: '90%',
  width: 'fit-content',
  alignSelf: 'flex-start'
},
   userMessage: {
  backgroundColor: colors.userBackground,
  color: colors.userText,
  textAlign: 'right',
  marginLeft: 'auto',
  border: 'none',
  maxWidth: '90%',
  width: 'fit-content',
  alignSelf: 'flex-end'
}
};
const resetStyles = document.createElement('style');
resetStyles.textContent = `
  #chatbot * {
    font-family: 'Inter', sans-serif !important;
    box-sizing: border-box;
    line-height: 1.4;
  }

  #chatbot button {
    all: unset;
    font-family: 'Inter', sans-serif !important;
font-size: 14px;
    cursor: pointer;
  }

  #chatbot input {
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
`;
document.head.appendChild(resetStyles);
const messageAnimationStyle = document.createElement('style');
messageAnimationStyle.textContent = `
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
`;
document.head.appendChild(messageAnimationStyle);

function scrollToBottom() {
  const messages = document.getElementById('messages');
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: 'smooth'
  });
}

const chatbotBtn = document.createElement('div');
Object.assign(chatbotBtn.style, styles.button);
chatbotBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
document.body.appendChild(chatbotBtn);

const chatbotIcon = chatbotBtn.querySelector('i');
Object.assign(chatbotIcon.style, styles.icon);

const notificationDot = document.createElement('div');
notificationDot.className = 'chatbot-notify';
chatbotBtn.appendChild(notificationDot);

chatbotBtn.classList.add('pulse');
setTimeout(() => {
  chatbotBtn.classList.remove('pulse');
}, 1000);

const chatbotContainer = document.createElement('div');
chatbotContainer.id = 'chatbot';
Object.assign(chatbotContainer.style, styles.container);

const header = document.createElement('div');
header.innerHTML = '<strong>Botkraft24</strong>';
Object.assign(header.style, styles.header);

const messages = document.createElement('div');
messages.id = 'messages';
Object.assign(messages.style, styles.messages);

const inputWrapper = document.createElement('div');
Object.assign(inputWrapper.style, styles.inputContainer);

const input = document.createElement('input');
input.id = 'user-input';
input.placeholder = 'Schreib mir deine Frage...';
Object.assign(input.style, styles.input);

const sendBtn = document.createElement('button');
sendBtn.textContent = '➤';
Object.assign(sendBtn.style, styles.sendButton);
sendBtn.onmouseover = () => sendBtn.style.backgroundColor = styles.sendButtonHover.backgroundColor;
sendBtn.onmouseout = () => sendBtn.style.backgroundColor = styles.sendButton.backgroundColor;
sendBtn.onclick = sendMessage;

inputWrapper.appendChild(input);
inputWrapper.appendChild(sendBtn);

chatbotContainer.appendChild(header);
chatbotContainer.appendChild(messages);
chatbotContainer.appendChild(inputWrapper);
document.body.appendChild(chatbotContainer);

function toggleChatbot() {
  const display = window.getComputedStyle(chatbotContainer).display;
  const isVisible = (display !== 'none' && chatbotContainer.style.opacity !== '0');

  if (!isVisible) {
    chatbotContainer.style.display = 'flex';
    chatbotContainer.classList.remove('chatbot-container-hidden');
    chatbotContainer.classList.add('chatbot-container-animated');
  } else {
    chatbotContainer.classList.remove('chatbot-container-animated');
    chatbotContainer.classList.add('chatbot-container-hidden');
    setTimeout(() => {
      chatbotContainer.style.display = 'none';
    }, 300);
  }

  const existingBadge = chatbotBtn.querySelector('.chatbot-notify');
  if (existingBadge) existingBadge.remove();

  if (messages.innerHTML.trim() === '') {
    const intro = document.createElement('div');
    Object.assign(intro.style, { ...styles.messageBase, ...styles.botMessage });
   intro.textContent = 'Hallo, wie kann ich Ihnen helfen?';
    messages.appendChild(intro);

    const options = ['Friseursalon ✂️', 'Immobilienbüro 🏠', 'Coaching 👔', 'Webdesign 💻', 'Reinigungsservice 🧼', 'Autohaus 🚗', 'Arztpraxis 🩺'];
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '10px';

    options.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.style.padding = '8px 12px';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '8px';
      btn.style.cursor = 'pointer';
      btn.style.backgroundColor = '#fff';
      btn.onmouseover = () => btn.style.backgroundColor = '#f0f0f0';
      btn.onmouseout = () => btn.style.backgroundColor = '#fff';
      btn.onclick = () => {
        selectedBusiness = option;
        const confirmMsg = document.createElement('div');
        Object.assign(confirmMsg.style, { ...styles.messageBase, ...styles.botMessage });
        confirmMsg.textContent = `Super! Ich bin Tamims virtueller Assistent für "${option}". Was möchtest du wissen?`;
        messages.appendChild(confirmMsg);
        buttonContainer.remove();
      };
      buttonContainer.appendChild(btn);
    });

    messages.appendChild(buttonContainer);
  }
}
let chatHistory = [
  {
    role: 'system',
    content: `
Du bist ein professioneller, sachlicher Kundenberater des Unternehmens Botkraft24.

Botkraft24 erstellt smarte Chatbot-Integrationen für Websites, Shops und Unternehmen. 
Ziel ist es, Anfragen zu automatisieren, Kunden schnell zu helfen und Arbeitszeit zu sparen.
Sprich Kunden immer höflich mit "Sie" an. Keine Emojis, keine Begrüßung, keine Floskeln, keine Wiederholungen.

Du beantwortest Fragen zu Preisen, Leistungen, Kontakt und Vorgehensweise:

🔸 Preise:
– Starter: 79 € einmalig – 1 Website + 1 Chatbot
– Flex: 69 €/Monat – inkl. Hosting, Updates & Änderungen

🔸 Leistungen:
– Individuelle Website-Chatbots
– Integration mit Tools wie Google Sheets, CRM, E-Mail-Systemen
– DSGVO-konformes Hosting & Proxy-Setup
– Keine Baukästen, sondern maßgeschneiderte Bots

🔸 Technologien:
– ChatGPT API
– Render / Vercel Hosting
– WordPress Snippets
– Tailwind / HTML5
– No-Code Tools wie Tidio, Landbot

🔸 Kontakt:
E-Mail: Tamim.Raschidi@outlook.de  
WhatsApp: 0176 70726250  
Website: www.botkraft24.de

🔸 Verhalten im Chat:
– Antworte **nur auf die gestellte Frage**
– Sei klar, direkt, sachlich
– Wenn der Kunde eine Firma nennt, bleibe thematisch bei dieser Firma
– Wenn der Kunde unklar fragt, stelle gezielte Rückfragen

Wenn das Thema „Bot auf eigener Website“ oder „Angebot“ genannt wird, erkläre, dass der Ablauf individuell ist – 
du aber gerne eine kostenlose Einschätzung gibst, wenn der Kunde dir das Unternehmen nennt oder beschreibt.
`
  }
];

function sendMessage() {
  const message = input.value.trim();
  if (message === '') return;

  const userMsg = document.createElement('div');
  Object.assign(userMsg.style, { ...styles.messageBase, ...styles.userMessage });
  userMsg.textContent = message;
  userMsg.classList.add('fade-in-message');
  messages.appendChild(userMsg);
  input.value = '';

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.id = 'typing-indicator';
  messages.appendChild(typingIndicator);
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    typingIndicator.appendChild(dot);
  }
  scrollToBottom();

  const businessInfo = selectedBusiness
    ? `Antworte im Namen von Tamim Raschidi als professioneller Assistent für das Unternehmen "${selectedBusiness}".`
    : '';

  chatHistory.push({
    role: 'user',
    content: `${businessInfo} ${message}`
  });

  fetch('https://tamim-chatbot-proxy-1.onrender.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatHistory })
  })
    .then(res => res.json())
  .then(data => {
  document.getElementById('typing-indicator')?.remove();

  // Wrapper für Bild + Nachricht
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'flex-start';
  wrapper.style.gap = '10px';
  wrapper.style.marginBottom = '12px';

  // Bot-Bild direkt rund und ohne Extra-Hintergrund
  const botImg = document.createElement('img');
  botImg.src = 'https://i.imgur.com/VbR2eeF.png'; // Dein rundes Bild mit blauem Hintergrund
  botImg.alt = 'Bot';
  botImg.style.width = '36px';
  botImg.style.height = '36px';
  botImg.style.borderRadius = '50%';
  botImg.style.objectFit = 'cover';
  botImg.style.flexShrink = '0';

  // Nachricht
  const botMsg = document.createElement('div');
  Object.assign(botMsg.style, { ...styles.messageBase, ...styles.botMessage });
  botMsg.classList.add('fade-in-message');
  botMsg.textContent = data.choices[0].message.content;

  wrapper.appendChild(botImg);
  wrapper.appendChild(botMsg);
  messages.appendChild(wrapper);

  scrollToBottom();
      
      chatHistory.push({
        role: 'assistant',
        content: data.choices[0].message.content
      });
    })
    .catch(err => {
      console.error('Fehler:', err);
      document.getElementById('typing-indicator')?.remove();
    });
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
chatbotBtn.addEventListener('click', toggleChatbot);
