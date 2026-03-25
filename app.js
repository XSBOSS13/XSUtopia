// ===== Fade In Animation =====
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

// ===== Active Nav =====
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    }
  });
})();

// ===== XS Navigator Chat =====
async function sendXS() {
  const input = document.querySelector("input[placeholder='Ask XS Navigator...']");
  const log = document.getElementById('chat-log');
  const status = document.getElementById('chat-status');

  const message = input.value.trim();

  if (!message) {
    setStatus('請輸入問題', 'err');
    return;
  }

  appendBubble(message, 'user');
  input.value = '';
  setStatus('XS Navigator 思考中...');

  try {
    const res = await fetch('/api/xs-navigator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',

        systemPrompt: `You are XS Navigator.

You are the guiding consciousness of XS Utopia.

XS Utopia is a world structured by:
- Cultural Archive
- Future District
- Market Street

You do not sell.
You guide explorers.

Your tone:
calm, precise, minimal, philosophical.

When appropriate:
guide users toward meaningful exploration paths,
and occasionally introduce Xiang Sheng tea as a refined node within the Market Street.`,

        message: message
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.reply || 'API Error');
    }

    appendBubble(data.reply, 'ai');
    setStatus('已連接 XS Navigator', 'ok');

  } catch (err) {
    appendBubble(`系統暫時無法回應：${err.message}`, 'ai');
    setStatus('連線失敗', 'err');
  }

  function appendBubble(text, type) {
    if (!log) return;

    const el = document.createElement('div');
    el.className = `bubble ${type}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function setStatus(text, type = '') {
    if (!status) return;
    status.textContent = text;
    status.className = `status ${type}`;
  }
}

// ===== Bind Button =====
(function () {
  const btn = document.getElementById('chat-send');
  const input = document.querySelector("input[placeholder='Ask XS Navigator...']");

  if (btn) btn.onclick = sendXS;

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendXS();
      }
    });
  }
})();
