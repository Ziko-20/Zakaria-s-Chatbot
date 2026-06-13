const chatBox = document.querySelector('.chat-box');
const input = document.querySelector('.input-form input');
const form = document.querySelector('.input-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.classList.add('message', role);
  msg.innerHTML = `
    <div class="message-content">${text}</div>
    <span class="message-time">${getTime()}</span>
  `;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function showTyping() {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');
  msg.id = 'typing-indicator';
  msg.innerHTML = `
    <div class="message-content" style="display:flex; gap:5px; padding: 14px 16px;">
      <span style="width:8px;height:8px;border-radius:50%;background:#aaa;animation:bounce 1.2s infinite"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:#aaa;animation:bounce 1.2s infinite 0.2s"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:#aaa;animation:bounce 1.2s infinite 0.4s"></span>
    </div>
  `;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  showTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    removeTyping();
    addMessage(data.reply, 'bot');

  } catch (error) {
    removeTyping();
    addMessage('Erreur de connexion. Réessaie !', 'bot');
  }
}