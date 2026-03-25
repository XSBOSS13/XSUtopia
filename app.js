
document.querySelectorAll('.fade-in').forEach(el=>{
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, {threshold:.14});
  observer.observe(el);
});

(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.getAttribute('href') === path){ a.classList.add('active'); }
  });
})();

window.XSUtopiaChat = {
  appendBubble(log, text, type){
    const el = document.createElement('div');
    el.className = `bubble ${type}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  },

  async send({endpoint, apiKey, model, systemPrompt, message, log, statusEl}){
    if(!endpoint){
      statusEl.textContent = '請先填入 API endpoint。';
      statusEl.className = 'status err';
      return;
    }
    this.appendBubble(log, message, 'user');
    statusEl.textContent = '傳送中…';
    statusEl.className = 'status';

    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          ...(apiKey ? {'Authorization': `Bearer ${apiKey}`} : {})
        },
        body: JSON.stringify({
          model,
          systemPrompt,
          message
        })
      });

      if(!res.ok){
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || data.output || data.message || 'API 已回應，但未找到 reply 欄位。';
      this.appendBubble(log, reply, 'ai');
      statusEl.textContent = '已連接成功。';
      statusEl.className = 'status ok';
    }catch(err){
      this.appendBubble(log, '目前無法取得 API 回應。你可以先檢查 endpoint、CORS、Authorization header 與回傳 JSON 的 reply 欄位。', 'ai');
      statusEl.textContent = `連線失敗：${err.message}`;
      statusEl.className = 'status err';
    }async function sendXSMessage() {
  const endpointInput = document.getElementById('api-endpoint');
  const modelInput = document.getElementById('api-model');
  const systemInput = document.getElementById('api-system');
  const messageInput = document.getElementById('chat-message');
  const log = document.getElementById('chat-log');
  const statusEl = document.getElementById('chat-status');

  const endpoint = endpointInput ? endpointInput.value.trim() : '/api/xs-navigator';
  const model = modelInput ? modelInput.value.trim() : 'gpt-4.1-mini';
  const systemPrompt = systemInput ? systemInput.value.trim() : 'You are XS Navigator.';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!message) {
    if (statusEl) {
      statusEl.textContent = '請先輸入問題。';
      statusEl.className = 'status err';
    }
    return;
  }

  if (!endpoint) {
    if (statusEl) {
      statusEl.textContent = '請先填入 endpoint。';
      statusEl.className = 'status err';
    }
    return;
  }

  if (log && window.XSUtopiaChat) {
    XSUtopiaChat.appendBubble(log, message, 'user');
  }

  if (messageInput) messageInput.value = '';

  if (statusEl) {
    statusEl.textContent = '傳送中…';
    statusEl.className = 'status';
  }

  try {
    const res = await fetch(endpoint, {
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
      throw new Error(data.reply || data.error || `HTTP ${res.status}`);
    }

    if (log && window.XSUtopiaChat) {
      XSUtopiaChat.appendBubble(log, data.reply || '沒有回覆內容', 'ai');
    }

    if (statusEl) {
      statusEl.textContent = '已連接成功。';
      statusEl.className = 'status ok';
    }
  } catch (err) {
    if (log && window.XSUtopiaChat) {
      XSUtopiaChat.appendBubble(
        log,
        `目前無法取得 API 回應：${err.message}`,
        'ai'
      );
    }

    if (statusEl) {
      statusEl.textContent = `連線失敗：${err.message}`;
      statusEl.className = 'status err';
    }
  }
}
  }
};
