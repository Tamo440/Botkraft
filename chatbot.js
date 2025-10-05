diff --git a/chatbot.js b/chatbot.js
index e3fb463de3830ce78902d3391187828ab14c1b3c..406fd260fee991ded6e93863960025bffca7e05c 100644
--- a/chatbot.js
+++ b/chatbot.js
@@ -1,536 +1,847 @@
-// ==== STYLE-ANIMATION für "Bot tippt..." ====
-const styleTag = document.createElement('style');
-styleTag.textContent = `
-@keyframes bounce {
-  0%, 80%, 100% { transform: scale(0); } 
-  40% { transform: scale(1); }
-}
-.typing-indicator {
-  display: flex;
-  align-items: center;
-  gap: 4px;
-  padding: 10px;
-}
-.typing-dot {
-  width: 8px;
-  height: 8px;
-  background-color: #ccc;
-  border-radius: 50%;
-  animation: bounce 1.4s infinite;
-}
-.typing-dot:nth-child(1) { animation-delay: 0s; }
-.typing-dot:nth-child(2) { animation-delay: 0.2s; }
-.typing-dot:nth-child(3) { animation-delay: 0.4s; }
-`;
-document.head.appendChild(styleTag);
-
-// 🔴 Animation + Notification Badge
-const styleExtras = document.createElement('style');
-styleExtras.textContent = `
-@keyframes pulse {
-  0% { transform: scale(1); }
-  50% { transform: scale(1.15); }
-  100% { transform: scale(1); }
-}
-.chatbot-notify {
-  position: absolute;
-  top: 8px;
-  right: 8px;
-  width: 14px;
-  height: 14px;
-  background: red;
-  border-radius: 50%;
-  border: 2px solid white;
-}
-.pulse {
-  animation: pulse 0.5s ease-in-out 2;
-}`;
-document.head.appendChild(styleExtras);
-
-const toggleStyles = document.createElement('style');
-toggleStyles.textContent = `
-  .chatbot-container-hidden {
-    opacity: 0;
-    transition: opacity 0.3s ease-out;
-  }
-  .chatbot-container-animated {
-    opacity: 1;
-    transition: opacity 0.3s ease-in;
-  }
-`;
-document.head.appendChild(toggleStyles);
-
-let selectedBusiness = null;
-
-const colors = {
-    primary: '#085186',
-    accent: '#ff6900',
-    botBackground: '#ffffff',
-    userBackground: '#ff6900',
-    userText: '#ffffff',
-    botText: '#000000'
-};
-
-const styles = {
-    button: {
-        position: 'fixed',
-        bottom: '20px',
-        right: '20px',
-        width: '60px',
-        height: '60px',
-        backgroundColor: colors.primary,
-        borderRadius: '50%',
-        display: 'flex',
-        alignItems: 'center',
-        justifyContent: 'center',
-        cursor: 'pointer',
-        boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
-        zIndex: '9999'
-    },
-    icon: {
-        color: 'white',
-        fontSize: '24px'
-    },
-    container: {
-        position: 'fixed',
-        bottom: '80px',
-        right: '20px',
-        width: '360px',
-        height: '600px',
-        backgroundColor: 'white',
-        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
-        borderRadius: '12px',
-        display: 'none',
-        flexDirection: 'column',
-        border: `2px solid ${colors.primary}`,
-        zIndex: '9999'
-    },
-    header: {
-        backgroundColor: colors.primary,
-        color: 'white',
-        padding: '18px',
-        textAlign: 'center',
-        fontSize: '20px',
-        fontWeight: 'bold',
-        borderTopLeftRadius: '12px',
-        borderTopRightRadius: '12px'
-    },
-    messages: {
-        flex: '1',
-        padding: '16px',
-        overflowY: 'auto',
-        backgroundColor: '#f7f7f7'
-    },
-    inputContainer: {
-        display: 'flex',
-        borderTop: '1px solid #ddd'
-    },
-    input: {
-        flex: '1',
-        padding: '12px',
-        border: 'none',
-        outline: 'none',
-        fontSize: '15px'
-    },
-    sendButton: {
-        padding: '12px',
-        backgroundColor: colors.accent,
-        color: 'white',
-        border: 'none',
-        cursor: 'pointer',
-        fontSize: '18px',
-        transition: 'background 0.3s'
-    },
-    sendButtonHover: {
-        backgroundColor: '#e65a00'
-    },
-messageBase: {
-  borderRadius: '8px',
-  padding: '8px 12px',
-  marginBottom: '10px',
-  fontSize: '14px',
-  lineHeight: '1.4',
-  background: '#f5f5f5',
-  color: '#333',
-  maxWidth: '90%',
-  width: 'fit-content',
-  boxShadow: 'none',
-  wordBreak: 'break-word'
-},
-   botMessage: {
-  backgroundColor: colors.botBackground,
-  color: colors.botText,
-  textAlign: 'left',
-  maxWidth: '90%',
-  width: 'fit-content',
-  alignSelf: 'flex-start'
-},
-   userMessage: {
-  backgroundColor: colors.userBackground,
-  color: colors.userText,
-  textAlign: 'right',
-  marginLeft: 'auto',
-  border: 'none',
-  maxWidth: '90%',
-  width: 'fit-content',
-  alignSelf: 'flex-end'
-}
-};
-const resetStyles = document.createElement('style');
-resetStyles.textContent = `
-  #chatbot * {
-    font-family: 'Inter', sans-serif !important;
-    box-sizing: border-box;
-    line-height: 1.4;
-  }
-
-  #chatbot button {
-    all: unset;
-    font-family: 'Inter', sans-serif !important;
-font-size: 14px;
-    cursor: pointer;
-  }
-
-  #chatbot input {
-    font-family: 'Inter', sans-serif;
-    box-sizing: border-box;
-  }
-`;
-document.head.appendChild(resetStyles);
-const messageAnimationStyle = document.createElement('style');
-messageAnimationStyle.textContent = `
-@keyframes fadeInUp {
-  0% {
-    opacity: 0;
-    transform: translateY(10px);
-  }
-  100% {
-    opacity: 1;
-    transform: translateY(0);
-  }
-}
-.fade-in-message {
-  animation: fadeInUp 0.3s ease-out;
-}
-`;
-document.head.appendChild(messageAnimationStyle);
-
-function scrollToBottom() {
-  const messages = document.getElementById('messages');
-  messages.scrollTo({
-    top: messages.scrollHeight,
-    behavior: 'smooth'
-  });
-}
-
-const chatbotBtn = document.createElement('div');
-Object.assign(chatbotBtn.style, styles.button);
-chatbotBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
-document.body.appendChild(chatbotBtn);
-
-const chatbotIcon = chatbotBtn.querySelector('i');
-Object.assign(chatbotIcon.style, styles.icon);
-
-const onlineStatus = document.createElement('div');
-onlineStatus.style.position = 'absolute';
-onlineStatus.style.bottom = '6px';
-onlineStatus.style.right = '6px';
-onlineStatus.style.width = '12px';
-onlineStatus.style.height = '12px';
-onlineStatus.style.backgroundColor = '#28c76f'; // grünes Online-Zeichen
-onlineStatus.style.border = '2px solid white';
-onlineStatus.style.borderRadius = '50%';
-onlineStatus.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
-chatbotBtn.appendChild(onlineStatus);
-
-const chatbotContainer = document.createElement('div');
-chatbotContainer.id = 'chatbot';
-Object.assign(chatbotContainer.style, styles.container);
-
-const header = document.createElement('div');
-header.innerHTML = '<strong>Botkraft24</strong>';
-Object.assign(header.style, styles.header);
-
-const messages = document.createElement('div');
-messages.id = 'messages';
-Object.assign(messages.style, styles.messages);
-
-const inputWrapper = document.createElement('div');
-Object.assign(inputWrapper.style, styles.inputContainer);
-
-const input = document.createElement('input');
-input.id = 'user-input';
-input.placeholder = 'Schreib mir deine Frage...';
-Object.assign(input.style, styles.input);
-
-const sendBtn = document.createElement('button');
-sendBtn.textContent = '➤';
-Object.assign(sendBtn.style, styles.sendButton);
-sendBtn.onmouseover = () => sendBtn.style.backgroundColor = styles.sendButtonHover.backgroundColor;
-sendBtn.onmouseout = () => sendBtn.style.backgroundColor = styles.sendButton.backgroundColor;
-sendBtn.onclick = sendMessage;
-
-inputWrapper.appendChild(input);
-inputWrapper.appendChild(sendBtn);
-
-chatbotContainer.appendChild(header);
-chatbotContainer.appendChild(messages);
-chatbotContainer.appendChild(inputWrapper);
-document.body.appendChild(chatbotContainer);
-
-function toggleChatbot() {
-  const display = window.getComputedStyle(chatbotContainer).display;
-  const isVisible = (display !== 'none' && chatbotContainer.style.opacity !== '0');
-
-  if (!isVisible) {
-    chatbotContainer.style.display = 'flex';
-    chatbotContainer.classList.remove('chatbot-container-hidden');
-    chatbotContainer.classList.add('chatbot-container-animated');
-  } else {
-    chatbotContainer.classList.remove('chatbot-container-animated');
-    chatbotContainer.classList.add('chatbot-container-hidden');
-    setTimeout(() => {
-      chatbotContainer.style.display = 'none';
-    }, 300);
-  }
-
-  const existingBadge = chatbotBtn.querySelector('.chatbot-notify');
-  if (existingBadge) existingBadge.remove();
-
-  if (messages.innerHTML.trim() === '') {
-const introWrapper = document.createElement('div');
-introWrapper.style.display = 'flex';
-introWrapper.style.alignItems = 'flex-start';
-introWrapper.style.gap = '10px';
-introWrapper.style.marginBottom = '10px';
-
-const introImg = document.createElement('img');
-introImg.src = 'https://i.imgur.com/9sYEklx.png'; // dein Bot-Icon
-introImg.alt = 'Bot';
-introImg.style.width = '32px';
-introImg.style.height = '32px';
-introImg.style.borderRadius = '50%';
-introImg.style.objectFit = 'cover';
-introImg.style.flexShrink = '0';
-
-const introMsg = document.createElement('div');
-Object.assign(introMsg.style, { ...styles.messageBase, ...styles.botMessage });
-introMsg.classList.add('fade-in-message');
-introMsg.textContent = 'Möchten Sie eine Branche auswählen?';
-
-introWrapper.appendChild(introImg);
-introWrapper.appendChild(introMsg);
-messages.appendChild(introWrapper);
-
-// Ja/Nein Buttons
-const buttonContainer = document.createElement('div');
-buttonContainer.style.display = 'flex';
-buttonContainer.style.gap = '8px';
-buttonContainer.style.marginBottom = '12px';
-
-['Ja', 'Nein'].forEach(label => {
-  const btn = document.createElement('button');
-  btn.textContent = label;
-  btn.style.padding = '6px 14px';
-  btn.style.border = '1px solid #ccc';
-  btn.style.borderRadius = '6px';
-  btn.style.backgroundColor = '#fff';
-  btn.style.cursor = 'pointer';
-  btn.style.fontSize = '13px';
-  btn.style.transition = 'background 0.2s';
-  btn.onmouseover = () => btn.style.backgroundColor = '#f0f0f0';
-  btn.onmouseout = () => btn.style.backgroundColor = '#fff';
-  buttonContainer.appendChild(btn);
-
-  if (label === 'Ja') {
-    btn.onclick = () => {
-      buttonContainer.remove();
-
-      const branchenMsg = document.createElement('div');
-      Object.assign(branchenMsg.style, { ...styles.messageBase, ...styles.botMessage });
-      branchenMsg.textContent = 'Welche Branche interessiert Sie?';
-
-      const branchenBtns = document.createElement('div');
-      branchenBtns.style.display = 'flex';
-      branchenBtns.style.flexWrap = 'wrap';
-      branchenBtns.style.gap = '8px';
-      branchenBtns.style.marginTop = '10px';
-
-      const options = ['Friseur ✂️', 'Immobilien 🏠', 'Coaching 👔', 'Webdesign 💻', 'Reinigung 🧼', 'Autohaus 🚗', 'Arztpraxis 🩺'];
-      options.forEach(option => {
-        const obtn = document.createElement('button');
-        obtn.textContent = option;
-        obtn.style.padding = '6px 10px';
-        obtn.style.border = '1px solid #ccc';
-        obtn.style.borderRadius = '6px';
-        obtn.style.backgroundColor = '#fff';
-        obtn.style.fontSize = '12.5px';
-        obtn.style.cursor = 'pointer';
-        obtn.onmouseover = () => obtn.style.backgroundColor = '#f0f0f0';
-        obtn.onmouseout = () => obtn.style.backgroundColor = '#fff';
-        obtn.onclick = () => {
-          selectedBusiness = option;
-          branchenBtns.remove();
-
-          const confirmMsg = document.createElement('div');
-          Object.assign(confirmMsg.style, { ...styles.messageBase, ...styles.botMessage });
-          confirmMsg.textContent = `Verstanden – ich bin Ihr Assistent für "${option}". Was möchten Sie wissen?`;
-          messages.appendChild(confirmMsg);
-          scrollToBottom();
-        };
-        branchenBtns.appendChild(obtn);
-      });
-
-      messages.appendChild(branchenMsg);
-      messages.appendChild(branchenBtns);
-      scrollToBottom();
-    };
-  } else {
-    btn.onclick = () => {
-      buttonContainer.remove();
-      const skipMsg = document.createElement('div');
-      Object.assign(skipMsg.style, { ...styles.messageBase, ...styles.botMessage });
-      skipMsg.textContent = 'Kein Problem – stellen Sie einfach Ihre Frage.';
-      messages.appendChild(skipMsg);
-      scrollToBottom();
-    };
-  }
-});
-
-messages.appendChild(buttonContainer);
-scrollToBottom();
-  }
-}
-let chatHistory = [
-  {
-    role: 'system',
-    content: `
-Du bist ein professioneller, sachlicher Kundenberater des Unternehmens Botkraft24.
-
-Botkraft24 erstellt smarte Chatbot-Integrationen für Websites, Shops und Unternehmen. 
-Ziel ist es, Anfragen zu automatisieren, Kunden schnell zu helfen und Arbeitszeit zu sparen.
-Sprich Kunden immer höflich mit "Sie" an. Keine Emojis, keine Begrüßung, keine Floskeln, keine Wiederholungen.
-
-Du beantwortest Fragen zu Preisen, Leistungen, Kontakt und Vorgehensweise:
-
-🔸 Preise:
-– Starter: 79 € einmalig – 1 Website + 1 Chatbot
-– Flex: 69 €/Monat – inkl. Hosting, Updates & Änderungen
-
-🔸 Leistungen:
-– Individuelle Website-Chatbots
-– Integration mit Tools wie Google Sheets, CRM, E-Mail-Systemen
-– DSGVO-konformes Hosting & Proxy-Setup
-– Keine Baukästen, sondern maßgeschneiderte Bots
-
-🔸 Technologien:
-– ChatGPT API
-– Render / Vercel Hosting
-– WordPress Snippets
-– Tailwind / HTML5
-– No-Code Tools wie Tidio, Landbot
-
-🔸 Kontakt:
-E-Mail: Tamim.Raschidi@outlook.de  
-WhatsApp: 0176 70726250  
-Website: www.botkraft24.de
-
-🔸 Verhalten im Chat:
-– Antworte **nur auf die gestellte Frage**
-– Sei klar, direkt, sachlich
-– Wenn der Kunde eine Firma nennt, bleibe thematisch bei dieser Firma
-– Wenn der Kunde unklar fragt, stelle gezielte Rückfragen
-
-Wenn das Thema „Bot auf eigener Website“ oder „Angebot“ genannt wird, erkläre, dass der Ablauf individuell ist – 
-du aber gerne eine kostenlose Einschätzung gibst, wenn der Kunde dir das Unternehmen nennt oder beschreibt.
-`
-  }
-];
-
-function sendMessage() {
-  const message = input.value.trim();
-  if (message === '') return;
-
-  const userMsg = document.createElement('div');
-  Object.assign(userMsg.style, { ...styles.messageBase, ...styles.userMessage });
-  userMsg.textContent = message;
-  userMsg.classList.add('fade-in-message');
-  messages.appendChild(userMsg);
-  input.value = '';
-
-  const typingIndicator = document.createElement('div');
-  typingIndicator.className = 'typing-indicator';
-  typingIndicator.id = 'typing-indicator';
-  messages.appendChild(typingIndicator);
-  for (let i = 0; i < 3; i++) {
-    const dot = document.createElement('div');
-    dot.className = 'typing-dot';
-    typingIndicator.appendChild(dot);
-  }
-  scrollToBottom();
-
-  const businessInfo = selectedBusiness
-    ? `Antworte im Namen von Tamim Raschidi als professioneller Assistent für das Unternehmen "${selectedBusiness}".`
-    : '';
-
-  chatHistory.push({
-    role: 'user',
-    content: `${businessInfo} ${message}`
-  });
-
-  fetch('https://tamim-chatbot-proxy-1.onrender.com/chat', {
-    method: 'POST',
-    headers: { 'Content-Type': 'application/json' },
-    body: JSON.stringify({ messages: chatHistory })
-  })
-    .then(res => res.json())
-  .then(data => {
-  document.getElementById('typing-indicator')?.remove();
-
-  // Wrapper für Bild + Nachricht
-  const wrapper = document.createElement('div');
-  wrapper.style.display = 'flex';
-  wrapper.style.alignItems = 'flex-start';
-  wrapper.style.gap = '10px';
-  wrapper.style.marginBottom = '12px';
-
-  // Bot-Bild direkt rund und ohne Extra-Hintergrund
-  const botImg = document.createElement('img');
-  botImg.src = 'https://i.imgur.com/9sYEklx.png'; // Dein rundes Bild mit blauem Hintergrund
-  botImg.alt = 'Bot';
-  botImg.style.width = '36px';
-  botImg.style.height = '36px';
-  botImg.style.borderRadius = '50%';
-  botImg.style.objectFit = 'cover';
-  botImg.style.flexShrink = '0';
-
-  // Nachricht
-  const botMsg = document.createElement('div');
-  Object.assign(botMsg.style, { ...styles.messageBase, ...styles.botMessage });
-  botMsg.classList.add('fade-in-message');
-  botMsg.textContent = data.choices[0].message.content;
-
-  wrapper.appendChild(botImg);
-  wrapper.appendChild(botMsg);
-  messages.appendChild(wrapper);
-
-  scrollToBottom();
-      
-      chatHistory.push({
-        role: 'assistant',
-        content: data.choices[0].message.content
-      });
-    })
-    .catch(err => {
-      console.error('Fehler:', err);
-      document.getElementById('typing-indicator')?.remove();
-    });
-}
-
-sendBtn.addEventListener('click', sendMessage);
-input.addEventListener('keydown', function (e) {
-  if (e.key === 'Enter') {
-    sendMessage();
-  }
-});
-chatbotBtn.addEventListener('click', toggleChatbot);
+// ==== STYLE-ANIMATION für "Bot tippt..." ====
+const typingStyleTag = document.createElement('style');
+typingStyleTag.textContent = `
+@keyframes bounce {
+  0%, 80%, 100% { transform: scale(0); }
+  40% { transform: scale(1); }
+}
+.typing-indicator {
+  display: flex;
+  align-items: center;
+  gap: 4px;
+  padding: 10px 14px;
+}
+.typing-dot {
+  width: 8px;
+  height: 8px;
+  background-color: #cbd5f5;
+  border-radius: 50%;
+  animation: bounce 1.4s infinite;
+}
+.typing-dot:nth-child(1) { animation-delay: 0s; }
+.typing-dot:nth-child(2) { animation-delay: 0.2s; }
+.typing-dot:nth-child(3) { animation-delay: 0.4s; }
+`;
+document.head.appendChild(typingStyleTag);
+
+// 🔴 Animation + Notification Badge
+const badgeStyleTag = document.createElement('style');
+badgeStyleTag.textContent = `
+@keyframes pulse {
+  0% { transform: scale(1); }
+  50% { transform: scale(1.15); }
+  100% { transform: scale(1); }
+}
+.chatbot-notify {
+  position: absolute;
+  top: 8px;
+  right: 8px;
+  width: 14px;
+  height: 14px;
+  background: #ef4444;
+  border-radius: 50%;
+  border: 2px solid white;
+}
+.pulse {
+  animation: pulse 0.5s ease-in-out 2;
+}
+`;
+document.head.appendChild(badgeStyleTag);
+
+const toggleStyles = document.createElement('style');
+toggleStyles.textContent = `
+  .chatbot-container-hidden {
+    opacity: 0;
+    transition: opacity 0.3s ease-out;
+  }
+  .chatbot-container-animated {
+    opacity: 1;
+    transition: opacity 0.3s ease-in;
+  }
+`;
+document.head.appendChild(toggleStyles);
+
+const resetStyles = document.createElement('style');
+resetStyles.textContent = `
+  #chatbot * {
+    font-family: 'Inter', sans-serif !important;
+    box-sizing: border-box;
+    line-height: 1.45;
+  }
+
+  #chatbot button {
+    all: unset;
+    font-family: 'Inter', sans-serif !important;
+    font-size: 14px;
+    cursor: pointer;
+  }
+
+  #chatbot input {
+    font-family: 'Inter', sans-serif;
+    box-sizing: border-box;
+  }
+`;
+document.head.appendChild(resetStyles);
+
+const messageAnimationStyle = document.createElement('style');
+messageAnimationStyle.textContent = `
+@keyframes fadeInUp {
+  0% {
+    opacity: 0;
+    transform: translateY(10px);
+  }
+  100% {
+    opacity: 1;
+    transform: translateY(0);
+  }
+}
+.fade-in-message {
+  animation: fadeInUp 0.3s ease-out;
+}
+`;
+document.head.appendChild(messageAnimationStyle);
+
+const STORAGE_KEY = 'botkraft_chat_history_v1';
+const STORAGE_BRANCH_KEY = 'botkraft_selected_business_v1';
+const TYPING_INDICATOR_ID = 'typing-indicator';
+
+let selectedBusiness = null;
+let conversation = [];
+
+const systemPrompt = {
+  role: 'system',
+  content: `
+Du bist ein professioneller, sachlicher Kundenberater des Unternehmens Botkraft24.
+
+Botkraft24 erstellt smarte Chatbot-Integrationen für Websites, Shops und Unternehmen.
+Ziel ist es, Anfragen zu automatisieren, Kunden schnell zu helfen und Arbeitszeit zu sparen.
+Sprich Kunden immer höflich mit "Sie" an. Keine Emojis, keine Begrüßung, keine Floskeln, keine Wiederholungen.
+
+Du beantwortest Fragen zu Preisen, Leistungen, Kontakt und Vorgehensweise:
+
+🔸 Preise:
+– Starter: 79 € einmalig – 1 Website + 1 Chatbot
+– Flex: 69 €/Monat – inkl. Hosting, Updates & Änderungen
+
+🔸 Leistungen:
+– Individuelle Website-Chatbots
+– Integration mit Tools wie Google Sheets, CRM, E-Mail-Systemen
+– DSGVO-konformes Hosting & Proxy-Setup
+– Keine Baukästen, sondern maßgeschneiderte Bots
+
+🔸 Technologien:
+– ChatGPT API
+– Render / Vercel Hosting
+– WordPress Snippets
+– Tailwind / HTML5
+– No-Code Tools wie Tidio, Landbot
+
+🔸 Kontakt:
+E-Mail: Tamim.Raschidi@outlook.de
+WhatsApp: 0176 70726250
+Website: www.botkraft24.de
+
+🔸 Verhalten im Chat:
+– Antworte **nur auf die gestellte Frage**
+– Sei klar, direkt, sachlich
+– Wenn der Kunde eine Firma nennt, bleibe thematisch bei dieser Firma
+– Wenn der Kunde unklar fragt, stelle gezielte Rückfragen
+
+Wenn das Thema „Bot auf eigener Website“ oder „Angebot“ genannt wird, erkläre, dass der Ablauf individuell ist –
+du aber gerne eine kostenlose Einschätzung gibst, wenn der Kunde dir das Unternehmen nennt oder beschreibt.
+`
+};
+
+let chatHistory = [systemPrompt];
+
+const colors = {
+  primary: '#085186',
+  accent: '#ff6900',
+  botBackground: '#ffffff',
+  userBackground: '#ff6900',
+  userText: '#ffffff',
+  botText: '#0f172a'
+};
+
+const styles = {
+  button: {
+    position: 'fixed',
+    bottom: '20px',
+    right: '20px',
+    width: '60px',
+    height: '60px',
+    backgroundColor: colors.primary,
+    borderRadius: '50%',
+    display: 'flex',
+    alignItems: 'center',
+    justifyContent: 'center',
+    cursor: 'pointer',
+    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
+    zIndex: '9999'
+  },
+  icon: {
+    color: 'white',
+    fontSize: '24px'
+  },
+  container: {
+    position: 'fixed',
+    bottom: '80px',
+    right: '20px',
+    width: 'min(360px, calc(100vw - 40px))',
+    height: 'min(620px, calc(100vh - 140px))',
+    backgroundColor: 'white',
+    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.18)',
+    borderRadius: '18px',
+    display: 'none',
+    flexDirection: 'column',
+    border: `2px solid ${colors.primary}`,
+    zIndex: '9999',
+    overflow: 'hidden'
+  },
+  header: {
+    backgroundColor: colors.primary,
+    color: 'white',
+    padding: '16px',
+    display: 'flex',
+    alignItems: 'center',
+    justifyContent: 'space-between',
+    gap: '16px'
+  },
+  messages: {
+    flex: '1',
+    padding: '16px',
+    overflowY: 'auto',
+    backgroundColor: '#f5f7fb'
+  },
+  inputContainer: {
+    display: 'flex',
+    alignItems: 'center',
+    gap: '8px',
+    padding: '12px',
+    borderTop: '1px solid #e2e8f0',
+    backgroundColor: '#ffffff'
+  },
+  input: {
+    flex: '1',
+    padding: '12px 14px',
+    border: '1px solid #d4dbe8',
+    borderRadius: '10px',
+    outline: 'none',
+    fontSize: '15px'
+  },
+  sendButton: {
+    padding: '10px 16px',
+    backgroundColor: colors.accent,
+    color: 'white',
+    borderRadius: '10px',
+    border: 'none',
+    fontSize: '16px',
+    transition: 'background 0.3s',
+    display: 'flex',
+    alignItems: 'center',
+    justifyContent: 'center',
+    gap: '6px'
+  },
+  sendButtonHover: {
+    backgroundColor: '#e65a00'
+  },
+  messageBase: {
+    borderRadius: '14px',
+    padding: '10px 14px',
+    fontSize: '14px',
+    lineHeight: '1.45',
+    background: '#f5f5f5',
+    color: '#1e293b',
+    maxWidth: '90%',
+    width: 'fit-content',
+    wordBreak: 'break-word',
+    boxShadow: 'none'
+  },
+  botMessage: {
+    backgroundColor: colors.botBackground,
+    color: colors.botText,
+    textAlign: 'left',
+    border: '1px solid #dce4f5'
+  },
+  userMessage: {
+    backgroundColor: colors.userBackground,
+    color: colors.userText,
+    textAlign: 'left',
+    marginLeft: 'auto',
+    border: 'none'
+  }
+};
+
+let isSending = false;
+let quickReplyBar = null;
+
+const chatbotBtn = document.createElement('div');
+chatbotBtn.classList.add('chatbot-launcher');
+Object.assign(chatbotBtn.style, styles.button);
+chatbotBtn.setAttribute('role', 'button');
+chatbotBtn.setAttribute('aria-label', 'Chatbot öffnen');
+chatbotBtn.setAttribute('tabindex', '0');
+chatbotBtn.setAttribute('aria-expanded', 'false');
+chatbotBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
+document.body.appendChild(chatbotBtn);
+
+const chatbotIcon = chatbotBtn.querySelector('i');
+Object.assign(chatbotIcon.style, styles.icon);
+
+const onlineStatus = document.createElement('div');
+onlineStatus.style.position = 'absolute';
+onlineStatus.style.bottom = '6px';
+onlineStatus.style.right = '6px';
+onlineStatus.style.width = '12px';
+onlineStatus.style.height = '12px';
+onlineStatus.style.backgroundColor = '#28c76f';
+onlineStatus.style.border = '2px solid white';
+onlineStatus.style.borderRadius = '50%';
+onlineStatus.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
+chatbotBtn.appendChild(onlineStatus);
+
+const chatbotContainer = document.createElement('div');
+chatbotContainer.id = 'chatbot';
+chatbotContainer.setAttribute('role', 'dialog');
+chatbotContainer.setAttribute('aria-live', 'polite');
+chatbotContainer.setAttribute('aria-label', 'Chatbot Botkraft24');
+Object.assign(chatbotContainer.style, styles.container);
+chatbotContainer.classList.add('chatbot-container-hidden');
+
+const header = document.createElement('div');
+Object.assign(header.style, styles.header);
+
+const headerInfo = document.createElement('div');
+headerInfo.style.display = 'flex';
+headerInfo.style.flexDirection = 'column';
+headerInfo.style.gap = '4px';
+
+const headerTitle = document.createElement('div');
+headerTitle.innerHTML = '<strong>Botkraft24</strong>';
+headerTitle.style.fontSize = '18px';
+
+const headerSubtitle = document.createElement('div');
+headerSubtitle.style.fontSize = '13px';
+headerSubtitle.style.opacity = '0.85';
+headerSubtitle.textContent = 'Antwort innerhalb weniger Minuten';
+
+const statusRow = document.createElement('div');
+statusRow.style.display = 'flex';
+statusRow.style.alignItems = 'center';
+statusRow.style.gap = '6px';
+statusRow.style.fontSize = '13px';
+
+const statusDot = document.createElement('span');
+statusDot.style.display = 'inline-block';
+statusDot.style.width = '8px';
+statusDot.style.height = '8px';
+statusDot.style.borderRadius = '50%';
+statusDot.style.backgroundColor = '#4ade80';
+statusDot.style.boxShadow = '0 0 6px rgba(74, 222, 128, 0.7)';
+
+const statusText = document.createElement('span');
+statusText.textContent = 'Live';
+
+statusRow.appendChild(statusDot);
+statusRow.appendChild(statusText);
+headerInfo.appendChild(statusRow);
+headerInfo.appendChild(headerTitle);
+headerInfo.appendChild(headerSubtitle);
+
+const closeBtn = document.createElement('button');
+closeBtn.innerHTML = '&times;';
+closeBtn.style.fontSize = '22px';
+closeBtn.style.lineHeight = '1';
+closeBtn.style.color = '#ffffff';
+closeBtn.style.opacity = '0.7';
+closeBtn.style.padding = '4px 8px';
+closeBtn.setAttribute('aria-label', 'Chatbot schließen');
+closeBtn.addEventListener('mouseenter', () => (closeBtn.style.opacity = '1'));
+closeBtn.addEventListener('mouseleave', () => (closeBtn.style.opacity = '0.7'));
+closeBtn.addEventListener('click', () => toggleChatbot(false));
+
+header.appendChild(headerInfo);
+header.appendChild(closeBtn);
+
+const messages = document.createElement('div');
+messages.id = 'messages';
+Object.assign(messages.style, styles.messages);
+messages.setAttribute('aria-live', 'polite');
+
+const inputWrapper = document.createElement('div');
+Object.assign(inputWrapper.style, styles.inputContainer);
+
+const input = document.createElement('input');
+input.id = 'user-input';
+input.placeholder = 'Schreiben Sie Ihre Frage ...';
+input.setAttribute('aria-label', 'Nachricht an Botkraft24');
+Object.assign(input.style, styles.input);
+
+const sendBtn = document.createElement('button');
+sendBtn.type = 'button';
+sendBtn.innerHTML = '<span>Senden</span> <i class="fas fa-paper-plane"></i>';
+sendBtn.setAttribute('aria-label', 'Nachricht senden');
+Object.assign(sendBtn.style, styles.sendButton);
+sendBtn.addEventListener('mouseover', () => (sendBtn.style.backgroundColor = styles.sendButtonHover.backgroundColor));
+sendBtn.addEventListener('mouseout', () => (sendBtn.style.backgroundColor = styles.sendButton.backgroundColor));
+
+inputWrapper.appendChild(input);
+inputWrapper.appendChild(sendBtn);
+
+chatbotContainer.appendChild(header);
+chatbotContainer.appendChild(messages);
+chatbotContainer.appendChild(inputWrapper);
+document.body.appendChild(chatbotContainer);
+
+function updateHeaderSubtitle() {
+  if (selectedBusiness) {
+    headerSubtitle.textContent = `Branche: ${selectedBusiness}`;
+  } else {
+    headerSubtitle.textContent = 'Antwort innerhalb weniger Minuten';
+  }
+}
+
+function scrollToBottom(options = { behavior: 'smooth' }) {
+  messages.scrollTo({
+    top: messages.scrollHeight,
+    behavior: options.behavior
+  });
+}
+
+function createTimestampElement(timestamp, alignRight = false) {
+  const ts = document.createElement('div');
+  ts.textContent = new Date(timestamp).toLocaleTimeString('de-DE', {
+    hour: '2-digit',
+    minute: '2-digit'
+  });
+  ts.style.fontSize = '11px';
+  ts.style.color = '#64748b';
+  ts.style.marginTop = '4px';
+  ts.style.textAlign = alignRight ? 'right' : 'left';
+  return ts;
+}
+
+function appendUserMessage(content, { timestamp = Date.now(), autoScroll = true } = {}) {
+  const container = document.createElement('div');
+  container.style.display = 'flex';
+  container.style.flexDirection = 'column';
+  container.style.alignItems = 'flex-end';
+  container.style.marginBottom = '12px';
+
+  const bubble = document.createElement('div');
+  Object.assign(bubble.style, { ...styles.messageBase, ...styles.userMessage });
+  bubble.textContent = content;
+  bubble.classList.add('fade-in-message');
+
+  const meta = createTimestampElement(timestamp, true);
+
+  container.appendChild(bubble);
+  container.appendChild(meta);
+  messages.appendChild(container);
+
+  if (autoScroll) {
+    scrollToBottom();
+  }
+}
+
+function appendBotMessage(content, {
+  timestamp = Date.now(),
+  autoScroll = true,
+  showTimestamp = true
+} = {}) {
+  const wrapper = document.createElement('div');
+  wrapper.style.display = 'flex';
+  wrapper.style.alignItems = 'flex-start';
+  wrapper.style.gap = '10px';
+  wrapper.style.marginBottom = '12px';
+
+  const botImg = document.createElement('img');
+  botImg.src = 'https://i.imgur.com/9sYEklx.png';
+  botImg.alt = 'Botkraft24 Assistent';
+  botImg.style.width = '36px';
+  botImg.style.height = '36px';
+  botImg.style.borderRadius = '50%';
+  botImg.style.objectFit = 'cover';
+  botImg.style.flexShrink = '0';
+
+  const bubbleColumn = document.createElement('div');
+  bubbleColumn.style.display = 'flex';
+  bubbleColumn.style.flexDirection = 'column';
+  bubbleColumn.style.alignItems = 'flex-start';
+
+  const bubble = document.createElement('div');
+  Object.assign(bubble.style, { ...styles.messageBase, ...styles.botMessage });
+  bubble.textContent = content;
+  bubble.classList.add('fade-in-message');
+
+  bubbleColumn.appendChild(bubble);
+  if (showTimestamp) {
+    bubbleColumn.appendChild(createTimestampElement(timestamp));
+  }
+
+  wrapper.appendChild(botImg);
+  wrapper.appendChild(bubbleColumn);
+  messages.appendChild(wrapper);
+
+  if (autoScroll) {
+    scrollToBottom();
+  }
+
+  return { wrapper, bubble, bubbleColumn };
+}
+
+function showNotificationBadge() {
+  if (isChatbotOpen()) return;
+  if (chatbotBtn.querySelector('.chatbot-notify')) return;
+  const badge = document.createElement('span');
+  badge.className = 'chatbot-notify pulse';
+  chatbotBtn.appendChild(badge);
+}
+
+function removeNotificationBadge() {
+  const existingBadge = chatbotBtn.querySelector('.chatbot-notify');
+  if (existingBadge) existingBadge.remove();
+}
+
+function isChatbotOpen() {
+  const display = window.getComputedStyle(chatbotContainer).display;
+  const hiddenByOpacity = chatbotContainer.style.opacity === '0';
+  return display !== 'none' && !hiddenByOpacity;
+}
+
+function showTypingIndicator() {
+  removeTypingIndicator();
+  const indicator = document.createElement('div');
+  indicator.className = 'typing-indicator';
+  indicator.id = TYPING_INDICATOR_ID;
+  for (let i = 0; i < 3; i += 1) {
+    const dot = document.createElement('div');
+    dot.className = 'typing-dot';
+    indicator.appendChild(dot);
+  }
+  messages.appendChild(indicator);
+  scrollToBottom();
+}
+
+function removeTypingIndicator() {
+  const indicator = document.getElementById(TYPING_INDICATOR_ID);
+  if (indicator) indicator.remove();
+}
+
+function setSendingState(state) {
+  isSending = state;
+  input.disabled = state;
+  sendBtn.disabled = state;
+  sendBtn.style.opacity = state ? '0.6' : '1';
+  if (!state) {
+    sendBtn.style.backgroundColor = styles.sendButton.backgroundColor;
+  }
+}
+
+function persistConversation() {
+  try {
+    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
+    if (selectedBusiness) {
+      localStorage.setItem(STORAGE_BRANCH_KEY, selectedBusiness);
+    } else {
+      localStorage.removeItem(STORAGE_BRANCH_KEY);
+    }
+  } catch (err) {
+    console.warn('Persisting conversation nicht möglich:', err);
+  }
+}
+
+function hydrateFromStorage() {
+  try {
+    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
+    const storedBranch = localStorage.getItem(STORAGE_BRANCH_KEY);
+    if (storedBranch) {
+      selectedBusiness = storedBranch;
+      updateHeaderSubtitle();
+    }
+
+    if (Array.isArray(stored) && stored.length) {
+      stored.forEach(entry => {
+        const displayContent = entry.displayContent || entry.content;
+        if (entry.role === 'user') {
+          appendUserMessage(displayContent, { timestamp: entry.timestamp, autoScroll: false });
+        } else if (entry.role === 'assistant') {
+          appendBotMessage(displayContent, { timestamp: entry.timestamp, autoScroll: false });
+        }
+        conversation.push(entry);
+        chatHistory.push({ role: entry.role, content: entry.content });
+      });
+      messages.scrollTop = messages.scrollHeight;
+    }
+  } catch (err) {
+    console.warn('Konnte Chat-Verlauf nicht wiederherstellen:', err);
+  }
+}
+
+function removeQuickReplies() {
+  if (quickReplyBar) {
+    quickReplyBar.remove();
+    quickReplyBar = null;
+  }
+}
+
+const quickReplySuggestions = [
+  {
+    label: 'Starter-Paket',
+    message: 'Welche Leistungen sind im Starter-Paket von Botkraft24 enthalten?'
+  },
+  {
+    label: 'Flex-Paket',
+    message: 'Was beinhaltet das Flex-Paket inklusive Hosting?'
+  },
+  {
+    label: 'Implementierung',
+    message: 'Wie läuft die Implementierung eines Chatbots bei euch ab?'
+  },
+  {
+    label: 'Datenschutz',
+    message: 'Wie stellt Botkraft24 den Datenschutz für Kunden sicher?'
+  }
+];
+
+function renderQuickReplies() {
+  removeQuickReplies();
+  quickReplyBar = document.createElement('div');
+  quickReplyBar.style.display = 'flex';
+  quickReplyBar.style.flexWrap = 'wrap';
+  quickReplyBar.style.gap = '8px';
+  quickReplyBar.style.margin = '4px 0 18px 48px';
+
+  quickReplySuggestions.forEach(item => {
+    const pill = document.createElement('button');
+    pill.textContent = item.label;
+    pill.style.padding = '6px 12px';
+    pill.style.backgroundColor = '#e0e7ff';
+    pill.style.color = '#1e293b';
+    pill.style.borderRadius = '999px';
+    pill.style.fontSize = '13px';
+    pill.style.border = '1px solid #c7d2fe';
+    pill.style.transition = 'background 0.2s, transform 0.2s';
+    pill.addEventListener('mouseover', () => {
+      pill.style.backgroundColor = '#c7d2fe';
+      pill.style.transform = 'translateY(-1px)';
+    });
+    pill.addEventListener('mouseout', () => {
+      pill.style.backgroundColor = '#e0e7ff';
+      pill.style.transform = 'translateY(0)';
+    });
+    pill.addEventListener('click', () => {
+      if (isSending) return;
+      removeQuickReplies();
+      sendMessage(item.message);
+    });
+    quickReplyBar.appendChild(pill);
+  });
+
+  messages.appendChild(quickReplyBar);
+  scrollToBottom();
+}
+
+function renderIndustryOptions() {
+  const options = ['Friseur ✂️', 'Immobilien 🏠', 'Coaching 👔', 'Webdesign 💻', 'Reinigung 🧼', 'Autohaus 🚗', 'Arztpraxis 🩺'];
+  const optionContainer = document.createElement('div');
+  optionContainer.style.display = 'flex';
+  optionContainer.style.flexWrap = 'wrap';
+  optionContainer.style.gap = '8px';
+  optionContainer.style.margin = '8px 0 12px 48px';
+
+  options.forEach(option => {
+    const btn = document.createElement('button');
+    btn.textContent = option;
+    btn.style.padding = '6px 10px';
+    btn.style.border = '1px solid #cbd5e1';
+    btn.style.borderRadius = '8px';
+    btn.style.backgroundColor = '#fff';
+    btn.style.fontSize = '12.5px';
+    btn.style.transition = 'background 0.2s';
+    btn.addEventListener('mouseover', () => (btn.style.backgroundColor = '#f1f5f9'));
+    btn.addEventListener('mouseout', () => (btn.style.backgroundColor = '#fff'));
+    btn.addEventListener('click', () => {
+      selectedBusiness = option;
+      updateHeaderSubtitle();
+      optionContainer.remove();
+      const confirmText = `Verstanden – ich begleite Sie für "${option}". Was möchten Sie wissen?`;
+      handleAssistantMessage(confirmText, { skipBadge: true });
+      renderQuickReplies();
+    });
+    optionContainer.appendChild(btn);
+  });
+
+  messages.appendChild(optionContainer);
+  scrollToBottom();
+}
+
+function renderIntroButtons() {
+  const buttonRow = document.createElement('div');
+  buttonRow.style.display = 'flex';
+  buttonRow.style.gap = '8px';
+  buttonRow.style.margin = '8px 0 12px 48px';
+
+  ['Ja', 'Nein'].forEach(label => {
+    const btn = document.createElement('button');
+    btn.textContent = label;
+    btn.style.padding = '6px 14px';
+    btn.style.border = '1px solid #cbd5e1';
+    btn.style.borderRadius = '8px';
+    btn.style.backgroundColor = '#ffffff';
+    btn.style.fontSize = '13px';
+    btn.addEventListener('mouseover', () => (btn.style.backgroundColor = '#f1f5f9'));
+    btn.addEventListener('mouseout', () => (btn.style.backgroundColor = '#ffffff'));
+    btn.addEventListener('click', () => {
+      buttonRow.remove();
+      if (label === 'Ja') {
+        handleAssistantMessage('Welche Branche interessiert Sie?', { skipBadge: true });
+        renderIndustryOptions();
+      } else {
+        handleAssistantMessage('Kein Problem – stellen Sie einfach Ihre Frage.', { skipBadge: true });
+      }
+    });
+    buttonRow.appendChild(btn);
+  });
+
+  messages.appendChild(buttonRow);
+  scrollToBottom();
+}
+
+function startOnboarding() {
+  handleAssistantMessage('Möchten Sie eine Branche auswählen?', { persist: false, skipBadge: true, showTimestamp: false });
+  renderIntroButtons();
+  renderQuickReplies();
+}
+
+function handleAssistantMessage(text, {
+  timestamp = Date.now(),
+  persist = true,
+  skipBadge = false,
+  showTimestamp = true
+} = {}) {
+  appendBotMessage(text, { timestamp, showTimestamp });
+  if (persist) {
+    const entry = { role: 'assistant', content: text, timestamp };
+    conversation.push(entry);
+    chatHistory.push({ role: 'assistant', content: text });
+    persistConversation();
+  }
+  if (!skipBadge) {
+    showNotificationBadge();
+  }
+}
+
+function handleUserMessage(displayContent, messageForApi, timestamp) {
+  appendUserMessage(displayContent, { timestamp });
+  const entry = { role: 'user', content: messageForApi, displayContent, timestamp };
+  conversation.push(entry);
+  chatHistory.push({ role: 'user', content: messageForApi });
+  persistConversation();
+}
+
+function sendMessage(prefilled) {
+  if (isSending) return;
+  const rawMessage = typeof prefilled === 'string' ? prefilled.trim() : input.value.trim();
+  if (!rawMessage) return;
+
+  if (typeof prefilled !== 'string') {
+    input.value = '';
+  } else {
+    input.value = '';
+  }
+
+  removeQuickReplies();
+
+  const timestamp = Date.now();
+  const businessInfo = selectedBusiness
+    ? `Antworte im Namen von Botkraft24 als professioneller Assistent für das Unternehmen "${selectedBusiness}".`
+    : '';
+  const messageForApi = `${businessInfo} ${rawMessage}`.trim();
+
+  handleUserMessage(rawMessage, messageForApi, timestamp);
+
+  setSendingState(true);
+  showTypingIndicator();
+
+  fetch('https://tamim-chatbot-proxy-1.onrender.com/chat', {
+    method: 'POST',
+    headers: { 'Content-Type': 'application/json' },
+    body: JSON.stringify({ messages: chatHistory })
+  })
+    .then(res => {
+      if (!res.ok) {
+        throw new Error(`Antwort ${res.status}`);
+      }
+      return res.json();
+    })
+    .then(data => {
+      const reply = data?.choices?.[0]?.message?.content?.trim();
+      if (!reply) {
+        throw new Error('Antwort leer');
+      }
+      const responseTimestamp = Date.now();
+      handleAssistantMessage(reply, { timestamp: responseTimestamp });
+    })
+    .catch(err => {
+      console.error('Fehler beim Abruf:', err);
+      handleAssistantMessage('Leider gab es ein Verbindungsproblem. Bitte versuchen Sie es später erneut.', {
+        persist: false,
+        skipBadge: true
+      });
+    })
+    .finally(() => {
+      removeTypingIndicator();
+      setSendingState(false);
+      if (isChatbotOpen()) {
+        input.focus();
+      }
+    });
+}
+
+function toggleChatbot(forceState) {
+  const currentlyOpen = isChatbotOpen();
+  const shouldOpen = typeof forceState === 'boolean' ? forceState : !currentlyOpen;
+
+  if (shouldOpen) {
+    chatbotContainer.style.display = 'flex';
+    chatbotContainer.classList.remove('chatbot-container-hidden');
+    chatbotContainer.classList.add('chatbot-container-animated');
+    chatbotBtn.setAttribute('aria-expanded', 'true');
+    removeNotificationBadge();
+    setTimeout(() => input.focus(), 250);
+    if (!messages.childElementCount) {
+      startOnboarding();
+    }
+  } else {
+    chatbotContainer.classList.remove('chatbot-container-animated');
+    chatbotContainer.classList.add('chatbot-container-hidden');
+    chatbotBtn.setAttribute('aria-expanded', 'false');
+    setTimeout(() => {
+      chatbotContainer.style.display = 'none';
+    }, 300);
+  }
+}
+
+hydrateFromStorage();
+
+if (!messages.childElementCount) {
+  startOnboarding();
+}
+
+sendBtn.addEventListener('click', () => sendMessage());
+input.addEventListener('keydown', event => {
+  if (event.key === 'Enter' && !event.shiftKey) {
+    event.preventDefault();
+    sendMessage();
+  }
+});
+chatbotBtn.addEventListener('click', () => toggleChatbot());
+chatbotBtn.addEventListener('keydown', event => {
+  if (event.key === 'Enter' || event.key === ' ') {
+    event.preventDefault();
+    toggleChatbot();
+  }
+});
+
+window.toggleChatbot = toggleChatbot;
