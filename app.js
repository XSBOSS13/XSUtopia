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

(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    }
  });
})();

function appendBubble(log, text, type) {
  if (!log) return;
  const el = document.createElement('div');
  el.className = `bubble ${type}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function setStatus(statusEl, text, type = '') {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = `status ${type}`.trim();
}

async function sendXS() {
  const endpointInput = document.getElementById('api-endpoint');
  const modelInput = document.getElementById('api-model');
  const systemInput = document.getElementById('api-system');
  const messageInput = document.getElementById('chat-message');
  const log = document.getElementById('chat-log');
  const statusEl = document.getElementById('chat-status');

  const endpoint = endpointInput?.value?.trim() || '/api/xs-navigator';
  const model = modelInput?.value?.trim() || 'gpt-4.1-mini';
  const systemPrompt =
    systemInput?.value?.trim() ||
    `You are XS Navigator.

You are the guiding consciousness of XS Utopia.

XS Utopia is a world structured by:
- Cultural Archive
- Future District
- Market Street

You do not sell.
You guide explorers.

Your tone is calm, precise, minimal, refined, and philosophical.
When appropriate, guide users toward meaningful exploration paths.
When relevant, introduce Xiang Sheng as a refined tea node within Market Street.`;

  const message = messageInput?.value?.trim() || '';

  if (!message) {
    setStatus(statusEl, '請先輸入問題。', 'err');
    return;
  }

  appendBubble(log, message, 'user');
  messageInput.value = '';
  setStatus(statusEl, 'XS Navigator 思考中...');

  try {
    const res = await fetch('/api/xs-navigator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        systemPrompt,
        message
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.reply || `HTTP ${res.status}`);
    }

    appendBubble(log, data.reply || '沒有取得回覆內容。', 'ai');
    setStatus(statusEl, '已連接 XS Navigator', 'ok');
  } catch (err) {
    appendBubble(log, `目前無法取得 API 回應：${err.message}`, 'ai');
    setStatus(statusEl, `連線失敗：${err.message}`, 'err');
  }
}

(function initHomeChat() {
  const sendBtn = document.getElementById('chat-send');
  const demoBtn = document.getElementById('chat-demo');
  const messageInput = document.getElementById('chat-message');

  if (sendBtn) {
    sendBtn.addEventListener('click', sendXS);
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendXS();
      }
    });
  }

  if (demoBtn && messageInput) {
    demoBtn.addEventListener('click', () => {
      messageInput.value = '解釋 XS Utopia 的核心理念，並建議我從哪個區域開始探索。';
      messageInput.focus();
    });
  }
})();
