// ══ КАЛЕНДАРЬ ШАМБАЛЫ ══
function initShambhalaCalendar() {
    updateShambhalaCalendar();
    updateShambhalaFields(); // Обновляем поля в лобби
    setInterval(function() {
        updateShambhalaCalendar();
        updateShambhalaFields();
    }, 1000); // Обновление каждую секунду
}

function updateShambhalaFields() {
    const now = new Date();

    // Время
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Обновляем время на кнопке календаря
    const btnTime = document.getElementById('calendar-btn-time');
    if (btnTime) btnTime.textContent = `${hours}:${minutes}`;

    // Год по восточному календарю
    const animals = [
        {name:'Крысы',icon:'🐀'}, {name:'Быка',icon:'🐂'}, {name:'Тигра',icon:'🐅'},
        {name:'Кролика',icon:'🐇'}, {name:'Дракона',icon:'🐉'}, {name:'Змеи',icon:'🐍'},
        {name:'Лошади',icon:'🐎'}, {name:'Козы',icon:'🐐'}, {name:'Обезьяны',icon:'🐒'},
        {name:'Петуха',icon:'🐓'}, {name:'Собаки',icon:'🐕'}, {name:'Свиньи',icon:'🐖'}
    ];
    const yearIndex = (now.getFullYear() - 4) % 12;
    const animal = animals[yearIndex];
    const yearEl = document.getElementById('dYear');
    if (yearEl) yearEl.textContent = `${animal.icon} ${animal.name}`;

    // 7 Лучей Шамбалы (по дню недели) - короткие названия
    const rays = [
        'Любовь',      // Воскресенье
        'Воля',        // Понедельник
        'Интеллект',   // Вторник
        'Гармония',    // Среда
        'Знание',      // Четверг
        'Преданность', // Пятница
        'Порядок'      // Суббота
    ];
    const dayOfWeek = now.getDay();
    const rayEl = document.getElementById('dRay');
    if (rayEl) rayEl.textContent = rays[dayOfWeek];
}

function updateShambhalaCalendar() {
    const now = new Date();

    // Дата
    const months = ['ЯНВАРЯ','ФЕВРАЛЯ','МАРТА','АПРЕЛЯ','МАЯ','ИЮНЯ','ИЮЛЯ','АВГУСТА','СЕНТЯБРЯ','ОКТЯБРЯ','НОЯБРЯ','ДЕКАБРЯ'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const dateEl = document.getElementById('shambhala-date');
    if (dateEl) dateEl.textContent = dateStr;

    // Время
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('shambhala-time');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}`;

    // Энергия (на основе времени суток)
    const hour = now.getHours();
    let energy = 50;
    if (hour >= 6 && hour < 12) energy = 85 + Math.floor(Math.random() * 10); // Утро
    else if (hour >= 12 && hour < 18) energy = 75 + Math.floor(Math.random() * 15); // День
    else if (hour >= 18 && hour < 22) energy = 65 + Math.floor(Math.random() * 15); // Вечер
    else energy = 45 + Math.floor(Math.random() * 20); // Ночь

    const energyEl = document.getElementById('shambhala-energy');
    if (energyEl) energyEl.textContent = `⚡ ${energy}%`;

    // Год по восточному календарю (2024 - Дракон)
    const animals = [
        {name:'Крысы',icon:'🐀'}, {name:'Быка',icon:'🐂'}, {name:'Тигра',icon:'🐅'},
        {name:'Кролика',icon:'🐇'}, {name:'Дракона',icon:'🐉'}, {name:'Змеи',icon:'🐍'},
        {name:'Лошади',icon:'🐎'}, {name:'Козы',icon:'🐐'}, {name:'Обезьяны',icon:'🐒'},
        {name:'Петуха',icon:'🐓'}, {name:'Собаки',icon:'🐕'}, {name:'Свиньи',icon:'🐖'}
    ];
    const yearIndex = (now.getFullYear() - 4) % 12;
    const animal = animals[yearIndex];
    const yearEl = document.getElementById('shambhala-year');
    if (yearEl) yearEl.textContent = `${animal.icon} ${animal.name}`;

    // 7 Лучей Шамбалы (по дню недели)
    const rays = [
        '✦ Луч Любви и Мудрости',      // Воскресенье
        '✦ Луч Воли и Могущества',     // Понедельник
        '✦ Луч Активного Интеллекта',  // Вторник
        '✦ Луч Гармонии через Конфликт', // Среда
        '✦ Луч Конкретного Знания',    // Четверг
        '✦ Луч Преданности и Идеализма', // Пятница
        '✦ Луч Церемониального Порядка'  // Суббота
    ];
    const dayOfWeek = now.getDay();
    const rayEl = document.getElementById('shambhala-ray');
    if (rayEl) rayEl.textContent = rays[dayOfWeek];
}

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.initShambhalaCalendar = initShambhalaCalendar;
}
