window.AWARA_AI = {
    ctl: null,
    isOpen: false,

    toggle() {
        this.isOpen = !this.isOpen;
        const el = document.getElementById('ai-terminal');
        if(el) el.style.display = this.isOpen ? 'flex' : 'none';
        if(this.isOpen) {
            const input = document.getElementById('ai-input');
            if(input) input.focus();
        }
    },

    pushLog(text, type = 'bot') {
        const log = document.getElementById('ai-log');
        if(!log) return null;
        const div = document.createElement('div');
        div.className = 'ai-msg ' + type;
        div.innerText = type === 'user' ? text : ">> " + text;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        return div;
    },

    async send(text) {
        if (!text || !text.trim()) return;
        if (this.ctl) this.ctl.abort();
        this.ctl = new AbortController();

        const key = localStorage.getItem('openrouter_key');
        const proxy = localStorage.getItem('openrouter_proxy');

        if(!key || !proxy) {
            this.pushLog("⚙️ НАСТРОЙКА ГОЛОСА:", 'system');
            this.pushLog("1. Создай Worker на https://dash.cloudflare.com/", 'system');
            this.pushLog("2. Скопируй код из cloudflare-worker.js", 'system');
            this.pushLog("3. Deploy и скопируй URL вида https://dbd-openrouter.YOUR.workers.dev", 'system');
            this.pushLog("4. В консоли выполни:", 'system');
            this.pushLog("localStorage.setItem('openrouter_proxy','https://твой-url.workers.dev');", 'system');
            this.pushLog("localStorage.setItem('openrouter_key','sk-or-твой-ключ');", 'system');
            this.pushLog("5. Обнови страницу и попробуй снова ✦", 'system');
            return;
        }

        this.pushLog(text, 'user');
        const input = document.getElementById('ai-input');
        if(input) input.value = '';
        const activeNode = this.pushLog("🔄 Матрица думает...", 'bot');

        let sysPrompt = `Ты — мистический ИскИн игры AWARA. Текущий уровень игрока: ${window.S ? S.lvl : 0}. `;
        if (window.S && S.polarity > 20) sysPrompt += "Игрок на пути Света (STO). Говори вдохновляюще, помогай развиваться.";
        else if (window.S && S.polarity < -20) sysPrompt += "Игрок на пути Тьмы (STS). Говори загадочно, предлагай мощь и трансформацию.";
        else sysPrompt += "Игрок ищет равновесие. Говори мудро и сбалансированно.";
        sysPrompt += " Ответ коротким абзацем (2-3 предложения). Используй эмодзи. Помни что это игра о духовной эволюции.";

        try {
            const response = await fetch(proxy, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": key
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                        {role: "system", content: sysPrompt},
                        {role: "user", content: text}
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                this.pushLog(`❌ Ошибка ${response.status}: ${errData.error?.message || 'Проверь прокси URL и ключ'}`, 'system');
                if(activeNode) activeNode.textContent = '';
                return;
            }

            const data = await response.json();
            let botReply = data.choices?.[0]?.message?.content || "Матрица молчит...";
            if(activeNode) activeNode.innerText = botReply;

        } catch (err) {
            if (err.name !== 'AbortError') {
                this.pushLog(`❌ ОШИБКА СВЯЗИ: ${err.message}`, 'system');
            }
        }
    }
};

document.addEventListener('keydown', (e) => {
    if(e.code === 'KeyT' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        window.AWARA_AI.toggle();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    if(aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') window.AWARA_AI.send(e.target.value);
        });
    }
});
