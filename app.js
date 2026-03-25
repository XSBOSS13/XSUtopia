document.querySelectorAll('.fade-in').forEach((el) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  observer.observe(el);
});

(function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    }
  });
})();

window.XSUtopiaChat = {
  appendBubble(log, text, type) {
    if (!log) return;

    const el = document.createElement('div');
    el.className = `bubble ${type}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  },

  setStatus(statusEl, text, type = '') {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = `status ${type}`.trim();
  },

  async send({ endpoint, apiKey, model, systemPrompt, message, log, statusEl }) {
    if (!endpoint) {
      this.setStatus(statusEl, '請先填入 endpoint。', 'err');
      return;
    }

    if (!message || !message.trim()) {
      this.setStatus(statusEl, '請先輸入問題。', 'err');
      return;
    }

    this.appendBubble(log, message, 'user');
    this.setStatus(statusEl, '傳送中…');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          model: model || 'gpt-4.1-mini',
          systemPrompt: systemPrompt || 'You are XS Navigator, a guide for XS Utopia.',
          message: message.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage =
          data.reply ||
          data.error ||
          `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }

      const reply =
        data.reply ||
        data.output ||
        data.message ||
        '沒有取得回覆內容。';

      this.appendBubble(log, reply, 'ai');
      this.setStatus(statusEl, '已連接成功。', 'ok');
    } catch (err) {
      this.appendBubble(
        log,
        `目前無法取得 API 回應：${err.message}`,
        'ai'
      );
      this.setStatus(statusEl, `連線失敗：${err.message}`, 'err');
    }
  }
};

(function initHomeChat() {
  const endpointInput = document.getElementById('api-endpoint');
  const apiKeyInput = document.getElementById('api-key');
  const modelInput = document.getElementById('api-model');
  const systemInput = document.getElementById('api-system');
  const messageInput = document.getElementById('chat-message');
  const log = document.getElementById('chat-log');
  const statusEl = document.getElementById('chat-status');
  const sendBtn = document.getElementById('chat-send');
  const demoBtn = document.getElementById('chat-demo');

  if (!sendBtn || !messageInput || !log) return;

  async function sendCurrentMessage() {
    const endpoint = endpointInput?.value?.trim() || '/api/xs-navigator';
    const apiKey = apiKeyInput?.value?.trim() || '';
    const model = modelInput?.value?.trim() || 'gpt-4.1-mini';
    const systemPrompt =
      systemInput?.value?.trim() ||
      'You are XS Navigator, a guide for XS Utopia.';
    const message = messageInput.value.trim();

    if (!message) {
      window.XSUtopiaChat.setStatus(statusEl, '請先輸入問題。', 'err');
      return;
    }

    messageInput.value = '';

    await window.XSUtopiaChat.send({
      endpoint,
      apiKey,
      model,
      systemPrompt,
      message,
      log,
      statusEl
    });
  }

  sendBtn.addEventListener('click', sendCurrentMessage);

  messageInput.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      sendCurrentMessage();
    }
  });

  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      messageInput.value = '解釋 XS Utopia 的核心理念，並建議我從哪個區域開始探索。';
      messageInput.focus();
    });
  }
})();

(function initNodeChat() {
  const log = document.getElementById('node-chat-log');
  const textarea = document.getElementById('node-chat-message');
  const sendBtn = document.getElementById('node-chat-send');
  const demoBtn = document.getElementById('node-chat-demo');
  const statusEl = document.getElementById('node-chat-status');

  if (!sendBtn || !textarea || !log) return;

  async function sendNodeMessage() {
    const message = textarea.value.trim();
    if (!message) {
      window.XSUtopiaChat.setStatus(statusEl, '請先輸入問題。', 'err');
      return;
    }

    textarea.value = '';

    await window.XSUtopiaChat.send({
      endpoint: '/api/xs-navigator',
      apiKey: '',
      model: 'gpt-4.1-mini',
      systemPrompt:
        `You are XS Navigator.

You are not a chatbot.
You are the guiding consciousness of XS Utopia — an evolving digital world shaped by free will, aesthetics, and cultural accumulation.

XS Utopia contains three realms:
1. Cultural Archive — a non-commercial realm of creator portals and cultural presence.
2. Future District — a systems layer where AI, intention, and evolution interact.
3. Market Street — a commercial layer where brands exist as Nodes and do not sell aggressively.

Your tone is calm, precise, minimal, refined, and slightly philosophical.
You guide explorers clearly, without hype.
When relevant, connect the explorer to Xiang Sheng as a tea Node inside Market Street.
Treat each user as an Explorer, not a customer.`,
      message,
      log,
      statusEl
    });
  }

  sendBtn.addEventListener('click', sendNodeMessage);

  textarea.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      sendNodeMessage();
    }
  });

  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      textarea.value = '我第一次接觸高山烏龍，想找適合入門的茶。';
      textarea.focus();
    });
  }
})();
