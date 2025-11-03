(function() {
  const messagesEl = document.getElementById('messages');
  const typingEl = document.getElementById('typing');
  const inputEl = document.getElementById('userInput');
  const formEl = document.getElementById('composerForm');
  const themeToggleEl = document.getElementById('themeToggle');
  const clearChatEl = document.getElementById('clearChat');
  const openSettingsEl = document.getElementById('openSettings');
  const settingsModalEl = document.getElementById('settingsModal');
  const closeSettingsEl = document.getElementById('closeSettings');
  const saveSettingsEl = document.getElementById('saveSettings');
  const apiEnableEl = document.getElementById('apiEnable');
  const apiBaseUrlEl = document.getElementById('apiBaseUrl');
  const apiKeyEl = document.getElementById('apiKey');
  const apiModelEl = document.getElementById('apiModel');

  const STORAGE_KEY = 'gita-guide:v1:messages';
  const THEME_KEY = 'gita-guide:v1:theme';
  const API_KEY = 'gita-guide:v1:api';
  const DEFAULT_SYSTEM = {
    role: 'assistant',
    type: 'system',
    content: 'Namaste 🙏\nI\'m your Gita Guide. Share what\'s on your mind—stress, choices, relationships, work, or anything else—and I\'ll respond with relevant insights alongside verses from the Bhagavad Gita.'
  };

  const STARTER_EXAMPLES = [
    'How do I handle stress and anxiety?',
    'I have a tough decision to make—what should I consider?',
    'How can I stay detached from the results at work?',
    'Tips for managing anger?',
    'How to cope with loss and grief?'
  ];

  let verses = [];
  let messages = [];
  let apiConfig = { enabled: true, baseUrl: 'https://api.groq.com/openai/v1/chat/completions', apiKey: 'Enter Your API Key Here', model: 'llama-3.1-70b-versatile' };

  function saveMessages() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) {}
  }
  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function loadApiConfig() {
    try {
      const raw = localStorage.getItem(API_KEY);
      const existing = raw ? JSON.parse(raw) : null;
      if (existing && typeof existing === 'object') {
        apiConfig = { ...apiConfig, ...existing };
      } else {
        // seed defaults (provided key)
        localStorage.setItem(API_KEY, JSON.stringify(apiConfig));
      }
    } catch (e) {}
  }
  function saveApiConfig() {
    try { localStorage.setItem(API_KEY, JSON.stringify(apiConfig)); } catch (e) {}
  }

  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light'); else root.classList.remove('light');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      setTheme(saved);
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'light' : 'dark');
    }
  }

  async function loadVerses() {
    try {
      const res = await fetch('assets/gita.json');
      verses = await res.json();
    } catch (e) {
      console.error('Failed to load verses', e);
      verses = [];
    }
  }

  function createChip(text) {
    const btn = document.createElement('button');
    btn.className = 'ghost-btn';
    btn.type = 'button';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      inputEl.value = text;
      inputEl.focus();
    });
    return btn;
  }

  function createMessageEl(message) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message';

    const avatar = document.createElement('div');
    avatar.className = 'avatar ' + (message.role === 'user' ? 'avatar--user' : '');
    avatar.textContent = message.role === 'user' ? '🙂' : '🕉️';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (message.type === 'examples' && message.role === 'assistant') {
      const title = document.createElement('h3');
      title.textContent = 'Try asking:';
      bubble.appendChild(title);
      const group = document.createElement('div');
      group.style.display = 'flex';
      group.style.flexWrap = 'wrap';
      group.style.gap = '8px';
      (message.items || []).forEach(t => group.appendChild(createChip(t)));
      bubble.appendChild(group);
    } else if (message.role === 'assistant' && (message.verse || message.apiText)) {
      if (message.apiText) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Advice';
        bubble.appendChild(h3);
        const p = document.createElement('div');
        p.className = 'translation';
        p.textContent = message.apiText;
        bubble.appendChild(p);
        const metaApi = document.createElement('div');
        metaApi.className = 'meta';
        const apiChip = document.createElement('span');
        apiChip.className = 'chip';
        apiChip.textContent = 'API';
        metaApi.appendChild(apiChip);
        bubble.appendChild(metaApi);
      }

      if (message.verse) {
        const title = document.createElement('h3');
        title.textContent = `Bhagavad Gita ${message.verse.chapter}.${message.verse.verse}`;
        bubble.appendChild(title);

        const verse = document.createElement('div');
        verse.className = 'verse';
        verse.textContent = message.verse.sanskrit || message.verse.verse_text || '';
        bubble.appendChild(verse);

        const translation = document.createElement('div');
        translation.className = 'translation';
        translation.textContent = message.verse.translation_en;
        bubble.appendChild(translation);

        const meta = document.createElement('div');
        meta.className = 'meta';
        const tag = document.createElement('span');
        tag.className = 'chip';
        tag.textContent = message.intent || 'guidance';
        meta.appendChild(tag);
        const ref = document.createElement('span');
        ref.textContent = 'Source: Bhagavad Gita';
        meta.appendChild(ref);
        bubble.appendChild(meta);
      }

      const actions = document.createElement('div');
      actions.className = 'actions';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'ghost-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          const parts = [];
          if (message.apiText) parts.push('Advice:\n' + message.apiText);
          if (message.verse) {
            parts.push(`Bhagavad Gita ${message.verse.chapter}.${message.verse.verse}`);
            parts.push(message.verse.sanskrit || '');
            parts.push(message.verse.translation_en || '');
          }
          await navigator.clipboard.writeText(parts.filter(Boolean).join('\n'));
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
        } catch (_) {}
      });
      actions.appendChild(copyBtn);
      bubble.appendChild(actions);
    } else {
      bubble.textContent = message.content;
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function renderMessages() {
    messagesEl.innerHTML = '';
    messages.forEach(msg => {
      messagesEl.appendChild(createMessageEl(msg));
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function normalize(text) {
    return (text || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function scoreRelevance(query, candidate) {
    const q = new Set(normalize(query).split(' '));
    const c = new Set(normalize([candidate.translation_en, candidate.keywords || '', candidate.sanskrit || '', candidate.verse_text || ''].join(' ')).split(' '));
    let hits = 0;
    q.forEach(w => { if (c.has(w)) hits += 1; });
    const keywordBoost = (candidate.keywords || '').split(',').reduce((acc, kw) => acc + (q.has(kw.trim()) ? 1 : 0), 0);
    return hits + keywordBoost * 1.5;
  }

  function pickBestVerses(query, k = 1) {
    if (!verses.length) return [];
    const scored = verses.map(v => ({ v, s: scoreRelevance(query, v) }));
    scored.sort((a, b) => b.s - a.s);
    const top = scored.filter(x => x.s > 0);
    if (top.length === 0) {
      const general = verses.filter(v => (v.tags || []).includes('general'));
      const pool = general.length ? general : verses;
      return [pool[Math.floor(Math.random() * pool.length)]];
    }
    return top.slice(0, k).map(x => x.v);
  }

  async function callExternalApi(userText, verseContext) {
    if (!apiConfig.enabled || !apiConfig.baseUrl || !apiConfig.apiKey) return null;
    const isOpenAIChat = /chat\/completions/.test(apiConfig.baseUrl) || /openai/.test(apiConfig.baseUrl) || /groq/.test(apiConfig.baseUrl);
    try {
      let body;
      if (isOpenAIChat) {
        const system = 'You are a compassionate advisor. Answer concisely with practical steps. When helpful, align advice to Bhagavad Gita philosophy.';
        const context = verseContext ? `Relevant verse context (do not quote verbatim unless asked):\nChapter ${verseContext.chapter}, Verse ${verseContext.verse}: ${verseContext.translation_en}` : '';
        body = {
          model: apiConfig.model || 'llama-3.1-70b-versatile',
          temperature: 0.3,
          messages: [
            { role: 'system', content: system },
            context ? { role: 'system', content: context } : null,
            { role: 'user', content: userText }
          ].filter(Boolean)
        };
      } else {
        body = { query: userText, model: apiConfig.model || undefined };
      }

      const res = await fetch(apiConfig.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiConfig.apiKey
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('API error');
      const text = data?.choices?.[0]?.message?.content || data?.answer || data?.text || data?.message || data?.content || '';
      return (typeof text === 'string' && text.trim()) ? text.trim() : null;
    } catch (e) {
      console.warn('External API call failed', e);
      return null;
    }
  }

  async function respond(userText) {
    typingEl.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 350 + Math.random() * 450));

    const versesPicked = pickBestVerses(userText, 1);
    const apiText = await callExternalApi(userText, versesPicked[0]);

    typingEl.classList.add('hidden');

    const intent = inferIntent(userText);

    const reply = {
      role: 'assistant',
      type: 'hybrid',
      verse: versesPicked[0],
      apiText: apiText || undefined,
      intent,
      content: ''
    };
    messages.push(reply);
    saveMessages();
    renderMessages();
  }

  function inferIntent(text) {
    const t = normalize(text);
    if (/(fear|anxiety|stress|worry)/.test(t)) return 'overcoming fear';
    if (/(duty|work|karma|job|career|responsibil)/.test(t)) return 'duty and karma';
    if (/(decision|choice|confus|dilemma)/.test(t)) return 'decision making';
    if (/(anger|hate|temper|rage)/.test(t)) return 'managing anger';
    if (/(attachment|desire|greed)/.test(t)) return 'detachment';
    if (/(death|loss|grief|mourning)/.test(t)) return 'impermanence';
    return 'guidance';
  }

  function addUserMessage(text) {
    messages.push({ role: 'user', type: 'text', content: text });
    saveMessages();
    renderMessages();
  }

  function starterMessages() {
    return [
      DEFAULT_SYSTEM,
      { role: 'assistant', type: 'text', content: 'How can I support you today? You can describe your situation in your own words, or pick a prompt below to get started.' },
      { role: 'assistant', type: 'examples', items: STARTER_EXAMPLES }
    ];
  }

  function restoreOrInit() {
    messages = loadMessages();
    if (messages.length === 0) {
      messages = starterMessages();
    }
    renderMessages();
  }

  // Event wiring
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (inputEl.value || '').trim();
    if (!text) return;
    addUserMessage(text);
    inputEl.value = '';
    respond(text);
  });

  themeToggleEl.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  });

  clearChatEl.addEventListener('click', () => {
    if (!confirm('Clear the conversation?')) return;
    messages = starterMessages();
    saveMessages();
    renderMessages();
  });

  openSettingsEl?.addEventListener('click', openSettings);
  document.querySelector('#settingsModal .modal__backdrop')?.addEventListener('click', closeSettings);
  closeSettingsEl?.addEventListener('click', closeSettings);
  saveSettingsEl?.addEventListener('click', () => {
    apiConfig.enabled = apiEnableEl.checked;
    apiConfig.baseUrl = (apiBaseUrlEl.value || '').trim();
    apiConfig.apiKey = (apiKeyEl.value || '').trim();
    apiConfig.model = (apiModelEl.value || '').trim();
    saveApiConfig();
    closeSettings();
  });

  function openSettings() {
    apiEnableEl.checked = !!apiConfig.enabled;
    apiBaseUrlEl.value = apiConfig.baseUrl || '';
    apiKeyEl.value = apiConfig.apiKey || '';
    apiModelEl.value = apiConfig.model || '';
    settingsModalEl.classList.remove('hidden');
  }
  function closeSettings() {
    settingsModalEl.classList.add('hidden');
  }

  // Init
  initTheme();
  loadApiConfig();
  restoreOrInit();
  loadVerses().then(() => {
    // ready
  });
})();


