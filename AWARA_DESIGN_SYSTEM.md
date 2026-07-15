# AWARA DESIGN MANIFESTO & RULES
Этот файл содержит строгие правила UI/UX для проекта. Нарушать их ЗАПРЕЩЕНО.

## 1. АБСОЛЮТНЫЕ ЗАПРЕТЫ (Negative Rules)
- НИКАКИХ нативных HTML-бордеров и теней по умолчанию.
- НИКАКИХ цветных эмодзи (🚫🔥🔮) в UI. Только монохромные SVG-иконки.
- НИКАКОГО чистого черного (#000000) или белого (#FFFFFF).
- НИКАКИХ плоских сплошных заливок для карточек и кнопок.

## 2. ПАЛИТРА (Design Tokens)
Используй только эти CSS-переменные/значения:
- `space-base: #0B0C10;` (фон приложения)
- `glass-dark: rgba(15, 15, 20, 0.4);` (основа для панелей)
- `glass-light: rgba(255, 255, 255, 0.03);` (блики)
- `gold-primary: #D4AF37;` (акценты)
- `gold-glow: rgba(212, 175, 55, 0.3);` (свечение)

## 3. ФОРМУЛА СТЕКЛА (True Glassmorphism)
Любая панель или карточка должна строиться строго так:
- `background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);`
- `backdrop-filter: blur(16px) saturate(120%);`
- `border-top: 1px solid rgba(255,255,255,0.08);`
- `border-left: 1px solid rgba(255,255,255,0.04);`
- `box-shadow: 0 24px 48px rgba(0,0,0,0.4);`

## 4. ТИПОГРАФИКА И ИКОНКИ
- Заголовки (Лор/Мифы): `font-family: 'Cinzel', serif; font-weight: 400; letter-spacing: 0.05em;`
- Данные (Цифры/Статы): `font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; letter-spacing: 0.1em; color: #D4AF37;`
- Иконки: Только stroke-линии, никаких fill-заливок, цвет монохромный (золото или платина).
