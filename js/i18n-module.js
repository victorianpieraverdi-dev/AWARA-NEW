// AWARA i18n — 250+ ключей, русский + английский
export const LANGS = { ru: 'Русский', en: 'English' };

export const DICT = {
  // ══ ОБЩИЕ ══
  'app.name': { ru:'AWARA · Держава РА', en:'AWARA · Dominion of RA' },
  'app.welcome': { ru:'Добро пожаловать в AWARA', en:'Welcome to AWARA' },
  'app.close': { ru:'Закрыть', en:'Close' },
  'app.understand': { ru:'Понятно', en:'Got it' },
  'app.help': { ru:'Подсказки', en:'Hints' },
  'app.loading': { ru:'Загрузка...', en:'Loading...' },
  'app.save': { ru:'Сохранить', en:'Save' },
  'app.saved': { ru:'Сохранено', en:'Saved' },
  'app.error': { ru:'Ошибка', en:'Error' },
  'app.ok': { ru:'OK', en:'OK' },
  'app.cancel': { ru:'Отмена', en:'Cancel' },
  'app.yes': { ru:'Да', en:'Yes' },
  'app.no': { ru:'Нет', en:'No' },
  'app.search': { ru:'Поиск', en:'Search' },
  'app.send': { ru:'Отправить', en:'Send' },
  'app.clear': { ru:'Очистить', en:'Clear' },
  'app.settings': { ru:'Настройки', en:'Settings' },
  'app.profile': { ru:'Профиль', en:'Profile' },
  'app.enter': { ru:'ВОЙТИ', en:'ENTER' },
  'app.exit': { ru:'ВЫЙТИ', en:'EXIT' },

  // ══ НАВИГАЦИЯ ══
  'nav.lobby': { ru:'← ЛОББИ', en:'← LOBBY' },
  'nav.back': { ru:'← НАЗАД', en:'← BACK' },
  'nav.back.lobby': { ru:'← В ЛОББИ', en:'← TO LOBBY' },
  'nav.to.lobby': { ru:'В ЛОББИ', en:'TO LOBBY' },

  // ══ МЕНЮ ЯЙЦО ══
  'menu.game': { ru:'ИГРА', en:'GAME' },
  'menu.game.desc': { ru:'практика и развитие', en:'practice & growth' },
  'menu.chronicle': { ru:'ХРОНИКА', en:'CHRONICLE' },
  'menu.chronicle.desc': { ru:'путь и коллекция', en:'path & collection' },
  'menu.exchange': { ru:'ОБМЕН', en:'EXCHANGE' },
  'menu.exchange.desc': { ru:'энергия и ресурсы', en:'energy & resources' },
  'menu.social': { ru:'ОБЩЕНИЕ', en:'SOCIAL' },
  'menu.social.desc': { ru:'связь и мир', en:'connection & world' },

  // ══ УРОВНИ ══
  'level.initiate': { ru:'ИНИЦИАТ', en:'INITIATE' },
  'level.warrior': { ru:'ВОИН СВЕТА', en:'LIGHT WARRIOR' },
  'level.sage': { ru:'МУДРЕЦ', en:'SAGE' },
  'level.king': { ru:'ЦАРЬ', en:'KING' },
  'level.buddha': { ru:'БУДДА', en:'BUDDHA' },
  'level.logos': { ru:'ПЛАНЕТАРНЫЙ ЛОГОС', en:'PLANETARY LOGOS' },

  // ══ СТАТУС-БАР ══
  'status.light': { ru:'СВЕТ', en:'LIGHT' },
  'status.level': { ru:'УРОВЕНЬ', en:'LEVEL' },
  'status.open': { ru:'открыто', en:'open' },
  'status.light.count': { ru:'{count} света', en:'{count} light' },
  'status.locked': { ru:'закрыто', en:'locked' },
  'status.unlocks.at': { ru:'Откроется на уровне {level} ({light} ✦)', en:'Unlocks at {level} ({light} ✦)' },
  'status.collected': { ru:'Собрано', en:'Collected' },

  // ══ ALPHA GATE ══
  'alpha.title': { ru:'AWARA', en:'AWARA' },
  'alpha.subtitle': { ru:'AWARA · ДЕРЖАВА РА', en:'AWARA · DOMINION OF RA' },
  'alpha.prompt': { ru:'Введи код доступа<br>для входа', en:'Enter access code<br>to enter' },
  'alpha.placeholder': { ru:'КОД ДОСТУПА', en:'ACCESS CODE' },
  'alpha.enter': { ru:'ВОЙТИ ✦', en:'ENTER ✦' },
  'alpha.error': { ru:'НЕВЕРНЫЙ КОД · ПОПРОБУЙ ЕЩЁ РАЗ', en:'WRONG CODE · TRY AGAIN' },

  // ══ КАТЕГОРИИ МЕНЮ ══
  'cat.initiation': { ru:'Инициация', en:'Initiation' },
  'cat.levels': { ru:'Уровни', en:'Levels' },
  'cat.levels.desc': { ru:'путь души: инициация → земля → космос → суперигра', en:'soul path: initiation → earth → cosmos → supergame' },
  'cat.tigel': { ru:'Тигель', en:'Tigel' },
  'cat.matrix': { ru:'Матрицы', en:'Matrices' },
  'cat.earth': { ru:'Земля', en:'Earth' },
  'cat.universe': { ru:'Вселенная (новая)', en:'Universe (new)' },
  'cat.universe-old': { ru:'Вселенная (старая)', en:'Universe (old)' },
  'cat.universe-old.desc': { ru:'зодиак · RA · оригинал', en:'zodiac · RA · original' },
  'cat.creation': { ru:'Мироздание', en:'Creation' },
  'cat.passport': { ru:'Паспорт души', en:'Soul Passport' },
  'cat.cards': { ru:'Колода', en:'Deck' },
  'cat.natal': { ru:'Натальная карта', en:'Natal Chart' },
  'cat.tree': { ru:'Древо пути', en:'Path Tree' },
  'cat.archetype': { ru:'Архетип', en:'Archetype' },
  'cat.svetcoin': { ru:'Светкоин', en:'Svetcoin' },
  'cat.milost': { ru:'Милость', en:'Grace' },
  'cat.daimon': { ru:'Даймон', en:'Daimon' },
  'cat.artifacts': { ru:'Артефакты', en:'Artifacts' },
  'cat.exchange': { ru:'Светообмен', en:'Light Exchange' },
  'cat.oracle': { ru:'Оракул', en:'Oracle' },
  'cat.chat': { ru:'Чат матрицы', en:'Matrix Chat' },
  'cat.society': { ru:'Социум', en:'Society' },
  'cat.festivals': { ru:'Фестивали', en:'Festivals' },
  'cat.initiation.desc': { ru:'пространство души (3 сферы)', en:'soul space (3 spheres)' },
  'cat.tigel.desc': { ru:'вечерний лог дня', en:'daily evening log' },
  'cat.matrix.desc': { ru:'33 восприятия', en:'33 perceptions' },
  'cat.earth.desc': { ru:'Васту-храм', en:'Vastu temple' },
  'cat.universe.desc': { ru:'космос агентов', en:'agent cosmos' },
  'cat.creation.desc': { ru:'игра творения', en:'creation game' },
  'cat.passport.desc': { ru:'твой профиль', en:'your profile' },
  'cat.cards.desc': { ru:'63 карты', en:'63 cards' },
  'cat.natal.desc': { ru:'звёздный код', en:'stellar code' },
  'cat.oracle.desc': { ru:'AI-советник', en:'AI advisor' },
  'cat.daimon.desc': { ru:'хранитель', en:'guardian' },
  'cat.milost.desc': { ru:'7 источников', en:'7 sources' },
  'cat.svetcoin.desc': { ru:'баланс', en:'balance' },
  'cat.artifacts.desc': { ru:'предметы силы', en:'power items' },
  'cat.exchange.desc': { ru:'P2P свет', en:'P2P light' },
  'cat.quests': { ru:'Квесты', en:'Quests' },
  'cat.quests.desc': { ru:'культурные ключи · пыль · кейсы', en:'cultural keys · dust · cases' },
  'cat.meaning': { ru:'Смысл дня', en:'Daily Meaning' },
  'cat.meaning.desc': { ru:'ежедневное послание', en:'daily message' },
  'cat.tree.desc': { ru:'история роста', en:'growth history' },
  'cat.archetype.desc': { ru:'кто ты', en:'who you are' },
  'cat.chat.desc': { ru:'свои по духу', en:'kindred spirits' },
  'cat.society.desc': { ru:'топ державы', en:'top rankings' },
  'cat.festivals.desc': { ru:'62 узла силы', en:'62 power nodes' },

  // ══ ЭЛЕМЕНТЫ ══
  'element.water': { ru:'Вода', en:'Water' },
  'element.wood': { ru:'Дерево', en:'Wood' },
  'element.fire': { ru:'Огонь', en:'Fire' },
  'element.earth': { ru:'Земля', en:'Earth' },
  'element.metal': { ru:'Металл', en:'Metal' },
  'element.ether': { ru:'Эфир', en:'Ether' },

  // ══ ИНИЦИАЦИЯ ══
  'initiation.title': { ru:'ПРОСТРАНСТВО ИНИЦИАЦИИ', en:'INITIATION SPACE' },
  'initiation.intro.sub': { ru:'Нажми на сферу чтобы войти', en:'Tap the sphere to enter' },
  'initiation.hud': { ru:'✦ ДУША · ОСНОВА · СЕРДЦЕ · МЕЧТА ✦', en:'✦ SOUL · FOUNDATION · HEART · DREAM ✦' },
  'initiation.enter.universe': { ru:'✦ ВОЙТИ ВО ВСЕЛЕННУЮ ✦', en:'✦ ENTER THE UNIVERSE ✦' },
  'initiation.sphere.soul': { ru:'ДУША', en:'SOUL' },
  'initiation.sphere.foundation': { ru:'ОСНОВА', en:'FOUNDATION' },
  'initiation.sphere.foundation.sub': { ru:'Корни · Прошлое · Земля', en:'Roots · Past · Earth' },
  'initiation.sphere.heart': { ru:'СЕРДЦЕ', en:'HEART' },
  'initiation.sphere.heart.sub': { ru:'Дела · Настоящее · Поток', en:'Deeds · Present · Flow' },
  'initiation.sphere.dream': { ru:'МЕЧТА', en:'DREAM' },
  'initiation.sphere.dream.sub': { ru:'Цели · Будущее · Творение', en:'Goals · Future · Creation' },
  'initiation.psychic.title': { ru:'ПСИХЕЯ', en:'PSYCHE' },
  'initiation.pathbar': { ru:'ПУТЬ', en:'PATH' },
  'initiation.quest.question': { ru:'Какие три сферы живут в тебе сейчас?', en:'Which three spheres live in you right now?' },
  'initiation.save.progress': { ru:'Прогресс сохранён', en:'Progress saved' },

  // ══ ТИГЕЛЬ ══
  'tigel.title': { ru:'Вечерний Тигель', en:'Evening Tigel' },
  'tigel.page.title': { ru:'🔥 Вечерний Тигель', en:'🔥 Evening Tigel' },
  'tigel.tab.log': { ru:'ЛОГ', en:'LOG' },
  'tigel.tab.balance': { ru:'БАЛАНС', en:'BALANCE' },
  'tigel.tab.alchemy': { ru:'АЛХИМИЯ', en:'ALCHEMY' },
  'tigel.log.placeholder': { ru:'Опиши свой день: практики, работа, отдых, еда, общение...', en:'Describe your day: practices, work, rest, food, social...' },
  'tigel.log.hint': { ru:'Опиши действия дня. Алгоритм автоматически распределит их по 5 стихиям У-Син и рассчитает баланс Ида/Пингала.', en:'Describe your day. The algorithm distributes actions across the 5 Wu-Xing elements and calculates Ida/Pingala balance.' },
  'tigel.synthesize.day': { ru:'СИНТЕЗИРОВАТЬ ДЕНЬ', en:'SYNTHESIZE DAY' },
  'tigel.synthesize': { ru:'СИНТЕЗИРОВАТЬ', en:'SYNTHESIZE' },
  'tigel.calculate.balance': { ru:'РАССЧИТАТЬ БАЛАНС', en:'CALCULATE BALANCE' },
  'tigel.generate.key': { ru:'СГЕНЕРИРОВАТЬ КЛЮЧ', en:'GENERATE KEY' },
  'tigel.save.day': { ru:'СОХРАНИТЬ ДЕНЬ', en:'SAVE DAY' },
  'tigel.copy.prompt': { ru:'СКОПИРОВАТЬ ПРОМПТ', en:'COPY PROMPT' },
  'tigel.additional.actions': { ru:'ДОПОЛНИТЕЛЬНЫЕ ДЕЙСТВИЯ', en:'ADDITIONAL ACTIONS' },
  'tigel.wuxing.dist': { ru:'У-СИН РАСПРЕДЕЛЕНИЕ', en:'WU-XING DISTRIBUTION' },
  'tigel.wuxing.hint': { ru:'Кликай на стихию для тонкой настройки (+5%). Правый клик = -5%.', en:'Click element to fine-tune (+5%). Right click = -5%.' },
  'tigel.toroid.balance': { ru:'ТОРОИДАЛЬНЫЙ БАЛАНС', en:'TOROIDAL BALANCE' },
  'tigel.pingala': { ru:'☀ ПИНГАЛА', en:'☀ PINGALA' },
  'tigel.ida': { ru:'🌙 ИДА', en:'🌙 IDA' },
  'tigel.sushumna': { ru:'СУШУМНА', en:'SUSHUMNA' },
  'tigel.mining.mult': { ru:'МАЙНИНГ МНОЖИТЕЛЬ', en:'MINING MULTIPLIER' },
  'tigel.light.base': { ru:'БАЗОВЫЙ СВЕТ', en:'BASE LIGHT' },
  'tigel.light.total': { ru:'ИТОГОВЫЙ СВЕТ', en:'TOTAL LIGHT' },
  'tigel.summary': { ru:'ИТОГИ ДНЯ', en:'DAY SUMMARY' },
  'tigel.balance': { ru:'БАЛАНС 5 ЭЛЕМЕНТОВ', en:'5 ELEMENTS BALANCE' },
  'tigel.nakshatra': { ru:'ВЛИЯНИЕ НАКШАТРЫ', en:'NAKSHATRA INFLUENCE' },
  'tigel.guardian': { ru:'Хранитель', en:'Guardian' },
  'tigel.element': { ru:'Стихия', en:'Element' },
  'tigel.ruler': { ru:'Управитель', en:'Ruler' },
  'tigel.key.local': { ru:'⚡ КЛЮЧ (ЛОКАЛЬНО)', en:'⚡ KEY (LOCAL)' },
  'tigel.alchemy.lm': { ru:'🔮 АЛХИМИЯ (LM STUDIO)', en:'🔮 ALCHEMY (LM STUDIO)' },
  'tigel.save.key': { ru:'✦ СОХРАНИТЬ КЛЮЧ В ИНВЕНТАРЬ ✦', en:'✦ SAVE KEY TO INVENTORY ✦' },
  'tigel.music.day': { ru:'🎵 МУЗЫКА ДНЯ', en:'🎵 MUSIC OF THE DAY' },
  'tigel.ayurveda': { ru:'🌿 ПИТАНИЕ (АЮРВЕДА)', en:'🌿 NUTRITION (AYURVEDA)' },
  'tigel.buffs': { ru:'БАФФЫ', en:'BUFFS' },
  'tigel.result.synthesis': { ru:'ИТОГ СИНТЕЗА', en:'SYNTHESIS RESULT' },
  'tigel.go.dashboard': { ru:'ПЕРЕЙТИ В ДАШБОРД', en:'GO TO DASHBOARD' },
  'tigel.gather.spheres': { ru:'🌀 СОБРАТЬ ОПЫТ ИЗ СФЕР 🌀', en:'🌀 GATHER EXPERIENCE FROM SPHERES 🌀' },
  'tigel.gather.hint': { ru:'Подтянет записи из трёх сфер: Основа (Ноги), Сердце, Мечта (Голова)', en:'Pulls entries from three spheres: Foundation (Legs), Heart, Dream (Head)' },
  'tigel.key.not.generated': { ru:'⚠ Сначала сгенерируй Ключ', en:'⚠ Generate a Key first' },
  'tigel.log.empty': { ru:'⚠ Введи лог дня перед генерацией Ключа', en:'⚠ Enter your day log before generating a Key' },
  'tigel.spheres.empty': { ru:'🌀 Сферы пока пусты, собирать нечего.', en:'🌀 Spheres are empty, nothing to gather.' },

  // ══ ПАСПОРТ ══
  'passport.title': { ru:'ПАСПОРТ ДУШИ', en:'SOUL PASSPORT' },
  'passport.subtitle': { ru:'КАРТА ТВОЕГО ПУТИ', en:'MAP OF YOUR PATH' },
  'passport.id': { ru:'ИДЕНТИФИКАЦИЯ', en:'IDENTIFICATION' },
  'passport.player.id': { ru:'PLAYER ID', en:'PLAYER ID' },
  'passport.agent': { ru:'АГЕНТ', en:'AGENT' },
  'passport.matrix': { ru:'МАТРИЦА', en:'MATRIX' },
  'passport.energy': { ru:'ЭНЕРГИЯ', en:'ENERGY' },
  'passport.light': { ru:'СВЕТИМОСТЬ', en:'LUMINOSITY' },
  'passport.element': { ru:'ДОМИНАНТНАЯ СТИХИЯ', en:'DOMINANT ELEMENT' },
  'passport.streak': { ru:'СЕРИЯ ДНЕЙ', en:'DAY STREAK' },
  'passport.streak.visits': { ru:'СЕРИЯ ПОСЕЩЕНИЙ', en:'VISIT STREAK' },
  'passport.spirit': { ru:'ДУХ', en:'SPIRIT' },
  'passport.keys': { ru:'КЛЮЧИ', en:'KEYS' },
  'passport.cards': { ru:'КОЛЛЕКЦИЯ КАРТ', en:'CARD COLLECTION' },
  'passport.path': { ru:'ПУТЬ ДУШИ', en:'SOUL PATH' },
  'passport.daimon': { ru:'ДАЙМОН', en:'DAIMON' },
  'passport.daimon.dormant': { ru:'Даймон не пробуждён', en:'Daimon not awakened' },
  'passport.daimon.screen': { ru:'ЭКРАН ДАЙМОНА', en:'DAIMON SCREEN' },
  'passport.milost': { ru:'Милость Дня', en:'Grace of the Day' },
  'passport.awara': { ru:'AWARA', en:'AWARA' },

  // ══ ОРАКУЛ ══
  'oracle.title': { ru:'ОРАКУЛ', en:'ORACLE' },
  'oracle.subtitle': { ru:'мудрость древних традиций', en:'wisdom of ancient traditions' },
  'oracle.save': { ru:'СОХРАНИТЬ', en:'SAVE' },
  'oracle.settings': { ru:'⚙ НАСТРОЙКИ API', en:'⚙ API SETTINGS' },
  'oracle.welcome': { ru:'Задай вопрос Оракулу.', en:'Ask the Oracle a question.' },
  'oracle.welcome.desc': { ru:'Он ответит в контексте твоего пути в AWARA — агент дня, матрица, стихия, натальная карта.', en:'It will answer in the context of your AWARA path — daily agent, matrix, element, natal chart.' },
  'oracle.welcome.hint': { ru:'Введи сообщение внизу и нажми →', en:'Type a message below and press →' },
  'oracle.placeholder': { ru:'Задай вопрос Оракулу...', en:'Ask the Oracle...' },
  'oracle.key.stored': { ru:'Ключ сохранён', en:'Key stored' },
  'oracle.key.get': { ru:'Получить ключ', en:'Get key' },
  'oracle.key.panel': { ru:'OpenRouter API Key', en:'OpenRouter API Key' },
  'oracle.key.saved.local': { ru:'Ключ хранится только в вашем браузере.', en:'Key is stored only in your browser.' },
  'oracle.model': { ru:'Модель', en:'Model' },
  'oracle.typing': { ru:'Оракул размышляет...', en:'Oracle is thinking...' },
  'oracle.error.connection': { ru:'Ошибка соединения с Оракулом.', en:'Connection error with the Oracle.' },
  'oracle.error.no_key': { ru:'API-ключ не задан. Откройте настройки.', en:'API key not set. Open settings.' },
  'oracle.error.invalid_key': { ru:'Неверный API-ключ. Проверьте настройки.', en:'Invalid API key. Check settings.' },
  'oracle.error.rate_limit': { ru:'Слишком частые запросы. Подождите немного.', en:'Too many requests. Please wait.' },
  'oracle.error.empty': { ru:'Оракул промолчал. Попробуйте ещё раз.', en:'The Oracle was silent. Try again.' },
  'oracle.clear.confirm': { ru:'Очистить историю чата?', en:'Clear chat history?' },
  'oracle.clear': { ru:'Очистить', en:'Clear' },
  'oracle.context.day': { ru:'Толкование дня', en:'Day Interpretation' },
  'oracle.context.matrix': { ru:'Наставник матрицы', en:'Matrix Mentor' },
  'oracle.context.mirror': { ru:'Зеркало выбора', en:'Choice Mirror' },
  'oracle.context.archivist': { ru:'Архивариус', en:'Archivist' },

  // ══ КОЛОДА КАРТ ══
  'cards.title': { ru:'Колода Карт', en:'Card Deck' },
  'cards.filter.all': { ru:'ВСЕ', en:'ALL' },
  'cards.filter.vedic': { ru:'ВЕДИЧЕСКИЕ', en:'VEDIC' },
  'cards.filter.slavic': { ru:'СЛАВЯНСКИЕ', en:'SLAVIC' },
  'cards.filter.kabbalistic': { ru:'КАББАЛА', en:'KABBALAH' },
  'cards.filter.collected': { ru:'СОБРАНЫ', en:'COLLECTED' },
  'cards.collected': { ru:'Собрано', en:'Collected' },
  'cards.popup.collected': { ru:'✦ В КОЛЛЕКЦИИ', en:'✦ IN COLLECTION' },
  'cards.popup.not_found': { ru:'НЕ НАЙДЕНА', en:'NOT FOUND' },
  'cards.unlock.all': { ru:'РАЗБЛОКИРОВАТЬ ВСЕ (debug)', en:'UNLOCK ALL (debug)' },

  // ══ МАТРИЦЫ ══
  'matrix.page.title': { ru:'МАТРИЦЫ ВОСПРИЯТИЯ', en:'PERCEPTION MATRICES' },
  'matrix.subtitle': { ru:'33 матрицы', en:'33 matrices' },
  'matrix.active': { ru:'АКТИВНА', en:'ACTIVE' },
  'matrix.agents': { ru:'21 АГЕНТ', en:'21 AGENTS' },
  'matrix.switcher.label': { ru:'АКТИВНОЕ ВОСПРИЯТИЕ', en:'ACTIVE PERCEPTION' },
  'matrix.section.agents': { ru:'21 АГЕНТ', en:'21 AGENTS' },
  'matrix.section.matrices': { ru:'33 МАТРИЦЫ', en:'33 MATRICES' },

  // ══ ДАШБОРД ══
  'dashboard.title': { ru:'ВАШ СВЕТКОИН', en:'YOUR SVETCOIN' },
  'dashboard.accumulated': { ru:'НАКОПЛЕНО', en:'ACCUMULATED' },
  'dashboard.sessions': { ru:'ПРОХОЖДЕНИЙ', en:'SESSIONS' },
  'dashboard.maxlevel': { ru:'МАКС. УРОВЕНЬ СФЕРЫ', en:'MAX SPHERE LEVEL' },
  'dashboard.matrix': { ru:'АКТИВНАЯ МАТРИЦА', en:'ACTIVE MATRIX' },
  'dashboard.synth': { ru:'СИНТЕЗИРОВАНО', en:'SYNTHESIZED' },
  'dashboard.element': { ru:'СТИХИЯ ДНЯ', en:'ELEMENT OF THE DAY' },
  'dashboard.sphere': { ru:'СФЕРА', en:'SPHERE' },
  'dashboard.practice': { ru:'ПРАКТИКА НА ЗАВТРА', en:'PRACTICE FOR TOMORROW' },

  // ══ ВСЕЛЕННАЯ ══
  'universe.title': { ru:'Вселенная', en:'Universe' },
  'universe.subtitle': { ru:'космос игрока', en:'player cosmos' },
  'universe.agents': { ru:'агентов', en:'agents' },
  'universe.progression': { ru:'ПРОГРЕССИЯ ВСЕЛЕННОЙ', en:'UNIVERSE PROGRESSION' },
  'universe.click.hint': { ru:'кликни по агенту — увидишь его карточку · нажми ◀ чтобы вернуться в лобби', en:'click an agent to see their card · press ◀ to return to lobby' },

  // ══ ЗЕМЛЯ ══
  'earth.title': { ru:'Земля игрока', en:'Player Earth' },

  // ══ НАТАЛЬНАЯ КАРТА ══
  'natal.title': { ru:'НАТАЛЬНАЯ КАРТА', en:'NATAL CHART' },
  'natal.form.date': { ru:'Дата рождения', en:'Birth date' },
  'natal.form.time': { ru:'Время рождения', en:'Birth time' },
  'natal.form.city': { ru:'Город', en:'City' },
  'natal.form.calculate': { ru:'Рассчитать', en:'Calculate' },
  'natal.results.title': { ru:'РЕЗУЛЬТАТЫ', en:'RESULTS' },

  // ══ ДАЙМОН ══
  'daimon.title': { ru:'ДАЙМОН-ХРАНИТЕЛЬ', en:'DAIMON GUARDIAN' },
  'daimon.not_summoned': { ru:'не призван', en:'not summoned' },
  'daimon.stage': { ru:'Стадия', en:'Stage' },
  'daimon.element': { ru:'Стихия', en:'Element' },
  'daimon.form': { ru:'Форма', en:'Form' },

  // ══ МИЛОСТЬ ══
  'milost.title': { ru:'Источники Милости', en:'Sources of Grace' },
  'milost.veil': { ru:'Завеса', en:'Veil' },

  // ══ СВЕТКОИН ══
  'svetcoin.label': { ru:'СВЕТКОИН', en:'SVETCOIN' },

  // ══ ЕЖЕДНЕВНИК ══
  'daily.key': { ru:'КЛЮЧ ДНЯ', en:'DAY KEY' },
  'daily.streak': { ru:'СЕРИЯ', en:'STREAK' },
  'daily.agent': { ru:'Агент дня', en:'Agent of the day' },
  'daily.nakshatra': { ru:'Накшатра', en:'Nakshatra' },
  'daily.matrix': { ru:'Матрица', en:'Matrix' },
  'daily.element': { ru:'Стихия', en:'Element' },
  'daily.bonus': { ru:'7 дней подряд! Бонус +10% света', en:'7 days straight! +10% light bonus' },
  'daily.missed': { ru:'пропущено: {count}', en:'missed: {count}' },
  'daily.today': { ru:'сегодня', en:'today' },

  // ══ ПОДСКАЗКИ ══
  'hints.title': { ru:'ПОДСКАЗКИ', en:'HINTS' },
  'hints.close': { ru:'ПОНЯТНО', en:'GOT IT' },
  'hint.tigel.1': { ru:'Здесь ты записываешь свой день. Алгоритм распределит действия по 5 стихиям У-Син.', en:'Write about your day here. The algorithm distributes your actions across the 5 Wu-Xing elements.' },
  'hint.tigel.2': { ru:'После записи нажми СИНТЕЗИРОВАТЬ — получишь Ключ Дня и Свет.', en:'After writing, press SYNTHESIZE to receive your Day Key and Light.' },
  'hint.tigel.3': { ru:'Вкладка БАЛАНС покажет твой Ида/Пингала/Сушумна и майнинг-множитель.', en:'The BALANCE tab shows your Ida/Pingala/Sushumna and mining multiplier.' },
  'hint.initiation.1': { ru:'Три сферы — три направления твоей души: Основа (ноги), Сердце, Мечта (голова).', en:'Three spheres — three directions of your soul: Foundation (legs), Heart, Dream (head).' },
  'hint.initiation.2': { ru:'Заполни каждую сферу — что планируешь, что делаешь, что видишь.', en:'Fill each sphere — what you plan, what you do, what you envision.' },
  'hint.initiation.3': { ru:'Сферы растут вместе с тобой. Возвращайся каждый день.', en:'Spheres grow with you. Return every day.' },
  'hint.passport.1': { ru:'Паспорт души — твой цифровой слепок в AWARA.', en:'Soul Passport — your digital imprint in AWARA.' },
  'hint.passport.2': { ru:'Здесь видно: твой свет, уровень, стихию, дух и серию дней.', en:'Here you see: your light, level, element, spirit, and day streak.' },
  'hint.passport.3': { ru:'С ростом света открываются новые секции.', en:'New sections unlock as your light grows.' },
  'hint.cards.1': { ru:'Колода — 63 карты (21 агент × 3 матрицы).', en:'Deck — 63 cards (21 agents × 3 matrices).' },
  'hint.cards.2': { ru:'Карты открываются постепенно. Собирай их через практики.', en:'Cards unlock gradually. Collect them through daily practices.' },
  'hint.cards.3': { ru:'Фильтруй по матрице чтобы видеть карты одной традиции.', en:'Filter by matrix to see cards from one tradition.' },
  'hint.matrix.1': { ru:'33 Матрицы Восприятия — 33 способа видеть мир.', en:'33 Perception Matrices — 33 ways to see the world.' },
  'hint.matrix.2': { ru:'Выбери активную матрицу — она влияет на Ключ Дня и Оракула.', en:'Choose your active matrix — it influences your Day Key and Oracle.' },
  'hint.matrix.3': { ru:'Переключай матрицы чтобы получать разные квесты.', en:'Switch matrices to receive different quests.' },
  'hint.universe.1': { ru:'Вселенная — космос твоих агентов. 21 агент на орбитах вокруг Солнца РА.', en:'Universe — your agent cosmos. 21 agents orbiting around the RA Sun.' },
  'hint.universe.2': { ru:'Кликни по агенту чтобы увидеть его карточку.', en:'Click an agent to view their card.' },
  'hint.universe.3': { ru:'С ростом света открываются новые орбиты.', en:'New orbits unlock as your light grows.' },
  'hint.oracle.1': { ru:'Оракул — твой AI-советник. Задай вопрос и получи ответ в контексте AWARA.', en:'Oracle — your AI advisor. Ask and receive an answer in AWARA context.' },
  'hint.oracle.2': { ru:'Выбери контекст: Толкование дня, Наставник матрицы, Зеркало выбора или Архивариус.', en:'Choose context: Day Interpretation, Matrix Mentor, Choice Mirror, or Archivist.' },
  'hint.oracle.3': { ru:'Для работы нужен OpenRouter API-ключ (хранится в твоём браузере).', en:'Requires an OpenRouter API key (stored in your browser).' },
  'hint.earth.1': { ru:'Земля игрока — твой Васту-храм. 8 направлений + центр.', en:'Player Earth — your Vastu temple. 8 directions + center.' },
  'hint.earth.2': { ru:'Строй постройки, сади деревья, размещай артефакты.', en:'Build structures, plant trees, place artifacts.' },
  'hint.earth.3': { ru:'Земля открывается на уровне ВОИН СВЕТА (3 000 ✦).', en:'Earth unlocks at LIGHT WARRIOR level (3,000 ✦).' },
  'hint.dashboard.1': { ru:'Дашборд — твой баланс Светкоина и прогресс.', en:'Dashboard — your Svetcoin balance and progress.' },
  'hint.dashboard.2': { ru:'Свет копится от практик, ключей, квестов.', en:'Light accumulates from practices, keys, and quests.' },
  'hint.dashboard.3': { ru:'Чем выше уровень — тем больше возможностей.', en:'Higher level — more possibilities.' },
  'hint.natal.1': { ru:'Натальная карта — твой звёздный код.', en:'Natal chart — your stellar code.' },
  'hint.natal.2': { ru:'Введи дату, время и место рождения. Расчёт через Swiss Ephemeris.', en:'Enter birth date, time, and place. Calculation via Swiss Ephemeris.' },
  'hint.natal.3': { ru:'Узнай свою Лагну, планеты, накшатры и архетип.', en:'Discover your Lagna, planets, nakshatras, and archetype.' },
  'hint.daimon.1': { ru:'Даймон — твой внутренний хранитель.', en:'Daimon — your inner guardian.' },
  'hint.daimon.2': { ru:'Его форма и стихия зависят от твоей натальной карты.', en:'Its form and element depend on your natal chart.' },
  'hint.daimon.3': { ru:'Даймон растёт вместе с тобой через 5 стадий эволюции.', en:'Daimon grows with you through 5 evolution stages.' },
  'hint.milost.1': { ru:'Милость — 7 источников благодати по 7 Лучам.', en:'Grace — 7 sources of blessing through 7 Rays.' },
  'hint.milost.2': { ru:'Собирай Милость через практики и служение.', en:'Gather Grace through practices and service.' },
  'hint.milost.3': { ru:'При пробое Завесы открывается послание макрокосма.', en:'When the Veil breaks, a macrocosm message is revealed.' },

  // ══ ЯЙЦО ПОМОЩЬ ══
  'egg.help.title': { ru:'ЗОЛОТОЕ ЯЙЦО', en:'GOLDEN EGG' },
  'egg.help.desc': { ru:'4 категории — 4 направления твоего пути. Открываются с ростом света.', en:'4 categories — 4 directions of your path. Unlock as light grows.' },
  'egg.help.cats': { ru:'ИГРА — практика и развитие\nХРОНИКА — путь и коллекция\nОБМЕН — энергия и ресурсы\nОБЩЕНИЕ — связь и мир', en:'GAME — practice & growth\nCHRONICLE — path & collection\nEXCHANGE — energy & resources\nSOCIAL — connection & world' },
  'egg.help.grow': { ru:'Собирай свет, повышай уровень — и новые пространства откроются.', en:'Gather light, level up — and new spaces will open.' },
  'egg.mantra': { ru:'✦ ПУТЬ К ЗОЛОТОМУ ВЕКУ · САТЬЯ ЮГА ✦', en:'✦ PATH TO THE GOLDEN AGE · SATYA YUGA ✦' },
'egg.mantra2': { ru:'Из пустоты рождается точка · Из точки — вселенная', en:'From the void a point is born · From the point — a universe' },

  // ══ НАТАЛЬНАЯ КАРТА (расширенные) ══
  'natal.birth.data': { ru:'ДАННЫЕ РОЖДЕНИЯ', en:'BIRTH DATA' },
  'natal.birth.date': { ru:'ДАТА РОЖДЕНИЯ', en:'BIRTH DATE' },
  'natal.birth.time': { ru:'ВРЕМЯ РОЖДЕНИЯ', en:'BIRTH TIME' },
  'natal.birth.city': { ru:'ГОРОД РОЖДЕНИЯ', en:'BIRTH CITY' },
  'natal.chart.title': { ru:'КАРТА ТВОЕГО РОЖДЕНИЯ', en:'YOUR BIRTH CHART' },
  'natal.calculate': { ru:'РАСЧЁТ НАТАЛЬНОЙ КАРТЫ', en:'CALCULATE NATAL CHART' },
  'natal.calculating': { ru:'Расчёт планет и домов...', en:'Calculating planets and houses...' },
  'natal.loading.ephemeris': { ru:'Загрузка Swiss Ephemeris (WASM)...', en:'Loading Swiss Ephemeris (WASM)...' },
  'natal.saved': { ru:'ДАННЫЕ СОХРАНЕНЫ', en:'DATA SAVED' },
  'natal.lagna': { ru:'ЛАГНА (АСЦЕНДЕНТ)', en:'LAGNA (ASCENDANT)' },
  'natal.navgrahas': { ru:'НАВГРАХИ (9 ПЛАНЕТ)', en:'NAVGRAHAS (9 PLANETS)' },
  'natal.nakshatra': { ru:'НАКШАТРА', en:'NAKSHATRA' },
  'natal.rashi': { ru:'РАШИ', en:'RASHI' },
  'natal.graha': { ru:'ГРАХА', en:'GRAHA' },
  'natal.degree': { ru:'ГРАДУС', en:'DEGREE' },

  // ══ КАРТЫ (расширенные) ══
  'cards.none.found': { ru:'Нет карт для выбранного фильтра', en:'No cards for selected filter' },
  'cards.open': { ru:'Открыто: ', en:'Open: ' },

  // ══ ПАСПОРТ (расширенные) ══
  'passport.total.collected': { ru:'ВСЕГО СОБРАНО', en:'TOTAL COLLECTED' },
  'passport.guna': { ru:'ГУНА', en:'GUNA' },
  'passport.ray': { ru:'ЛУЧ', en:'RAY' },
  'passport.not.started': { ru:'Путь ещё не начат. Пройди Тигель, чтобы увидеть записи.', en:'Path not yet started. Complete Tigel to see entries.' },
  'passport.open.daimon': { ru:'Открой экран Хранителя, чтобы увидеть форму и путь.', en:'Open the Guardian screen to see form and path.' },
  'passport.svetcoin': { ru:'СВЕТКОИН', en:'SVETCOIN' },

  // ══ ТИГЕЛЬ (расширенные) ══
  'tigel.card.bonuses': { ru:'БОНУСЫ КАРТ', en:'CARD BONUSES' },
  'tigel.vedic.cards': { ru:'ВЕДИЧЕСКИЕ КАРТЫ', en:'VEDIC CARDS' },
  'tigel.key.ai.prompt': { ru:'AI ПРОМПТ', en:'AI PROMPT' },
  'tigel.key.mernost': { ru:'МЕРНОСТЬ', en:'DIMENSION' },
  'tigel.key.rarity': { ru:'РЕДКОСТЬ', en:'RARITY' },
  'tigel.key.expires': { ru:'СРОК', en:'EXPIRES' },
  'tigel.key.svet': { ru:'СВЕТ БАЗОВЫЙ', en:'BASE LIGHT' },
  'tigel.key.svet.total': { ru:'СВЕТ ИТОГО', en:'TOTAL LIGHT' },
  'tigel.balance.great': { ru:'Баланс отличный — продолжай в том же духе!', en:'Balance is great — keep it up!' },
  'tigel.enter.log': { ru:'Введи лог дня для расчёта', en:'Enter day log to calculate' },
  'tigel.alchemy.needs.key': { ru:'Алхимии нужен ваш OpenRouter API key. Получить на ', en:'Alchemy needs your OpenRouter API key. Get at ' },
  'tigel.alchemy.running': { ru:'Алхимия запущена...', en:'Alchemy running...' },
  'tigel.alchemy.error': { ru:'API ключ недействителен', en:'API key invalid' },
  'tigel.veil.remaining': { ru:'До пробоя: {count} очков', en:'Until breach: {count} points' },

  // ══ ОРАКУЛ (расширенные) ══
  'oracle.context.day.desc': { ru:'Оракул раскрывает смысл текущего дня через агента, матрицу и стихию', en:'The Oracle reveals the meaning of the current day through agent, matrix, and element' },
  'oracle.context.matrix.desc': { ru:'Проводник по активной матрице восприятия', en:'Guide through the active perception matrix' },
  'oracle.context.mirror.desc': { ru:'Помогает принять решение, отражая ситуацию через призму AWARA', en:'Helps make decisions, reflecting situations through the AWARA lens' },
  'oracle.context.archivist.desc': { ru:'Хранитель знаний AWARA — агенты, матрицы, стихии, чакры, локи', en:'Keeper of AWARA knowledge — agents, matrices, elements, chakras, lokas' },

  // ══ МАТРИЦЫ (расширенные) ══
  'matrix.agents.section': { ru:'21 АГЕНТ', en:'21 AGENTS' },
  'matrix.matrices.section': { ru:'33 МАТРИЦЫ', en:'33 MATRICES' },
  // 33 названия матриц
  'matrix.name.vedic': { ru:'Ведическая', en:'Vedic' },
  'matrix.name.egyptian': { ru:'Египетская', en:'Egyptian' },
  'matrix.name.kabbalistic': { ru:'Каббалистическая', en:'Kabbalistic' },
  'matrix.name.mayan': { ru:'Майянская', en:'Mayan' },
  'matrix.name.slavic': { ru:'Славянская', en:'Slavic' },
  'matrix.name.norse': { ru:'Нордическая', en:'Norse' },
  'matrix.name.daoist': { ru:'Даосская', en:'Taoist' },
  'matrix.name.gnostic': { ru:'Гностическая', en:'Gnostic' },
  'matrix.name.shinto': { ru:'Синтоистская', en:'Shinto' },
  'matrix.name.celtic': { ru:'Кельтская', en:'Celtic' },
  'matrix.name.tibetan': { ru:'Тибетская', en:'Tibetan' },
  'matrix.name.african': { ru:'Африканская', en:'African' },
  'matrix.name.persian': { ru:'Персидская', en:'Persian' },
  'matrix.name.indian': { ru:'Индийская', en:'Indian' },
  'matrix.name.alchemical': { ru:'Алхимическая', en:'Alchemical' },
  'matrix.name.hermetic': { ru:'Герметическая', en:'Hermetic' },
  'matrix.name.druidic': { ru:'Друидическая', en:'Druidic' },
  'matrix.name.shamanic': { ru:'Шаманская', en:'Shamanic' },
  'matrix.name.julian': { ru:'Юлианская', en:'Julian' },
  'matrix.name.runic': { ru:'Руническая', en:'Runic' },
  'matrix.name.chinese': { ru:'Китайская', en:'Chinese' },
  'matrix.name.greek': { ru:'Греческая', en:'Greek' },
  'matrix.name.japanese': { ru:'Японская', en:'Japanese' },
  'matrix.name.sufi': { ru:'Суфийская', en:'Sufi' },
  'matrix.name.zoroastrian': { ru:'Зороастрийская', en:'Zoroastrian' },
  'matrix.name.aboriginal': { ru:'Аборигенная', en:'Aboriginal' },
  'matrix.name.polynesian': { ru:'Полинезийская', en:'Polynesian' },
  'matrix.name.mesoamerican': { ru:'Мезоамериканская', en:'Mesoamerican' },
  'matrix.name.byzantine': { ru:'Византийская', en:'Byzantine' },
  'matrix.name.ethiopian': { ru:'Эфиопская', en:'Ethiopian' },
  'matrix.name.mongolian': { ru:'Монгольская', en:'Mongolian' },
  'matrix.name.inuit': { ru:'Инуитская', en:'Inuit' },
  'matrix.name.sumerian': { ru:'Шумерская', en:'Sumerian' },

  // ══ АЮРВЕДА ══
  'ayurveda.title': { ru:'🌿 АЮРВЕДИЧЕСКИЙ ПРОТОКОЛ НА СЕГОДНЯ:', en:'🌿 AYURVEDIC PROTOCOL FOR TODAY:' },

  // ══ МУЗЫКА ══
  'music.title': { ru:'🎵 ПРОМПТ ДЛЯ SUNO AI СГЕНЕРИРОВАН:', en:'🎵 SUNO AI PROMPT GENERATED:' },

  // ══ ИНДЕКС / ЛОББИ (дополнительные) ══
  'index.lobby.awara': { ru:'AWARA', en:'AWARA' },
  'index.lobby.subtitle': { ru:'AWARA ALPHA · ЗАКРЫТЫЙ ТЕСТ', en:'AWARA ALPHA · CLOSED TEST' },
  'index.lobby.path': { ru:'ПУТЬ К ЗОЛОТОМУ ВЕКУ', en:'PATH TO THE GOLDEN AGE' },
  'index.lobby.satya': { ru:'САТЬЯ ЮГА', en:'SATYA YUGA' },
  'index.lobby.enter': { ru:'ВОЙТИ ✦', en:'ENTER ✦' },
  'index.game.spaces': { ru:'ИГРОВЫЕ ПРОСТРАНСТВА', en:'GAME SPACES' },
  'index.choose.world': { ru:'ВЫБЕРИ МИР', en:'CHOOSE WORLD' },
  'index.access.code': { ru:'КОД ДОСТУПА', en:'ACCESS CODE' },
  'index.wrong.code': { ru:'НЕВЕРНЫЙ КОД · ПОПРОБУЙ ЕЩЁ РАЗ', en:'WRONG CODE · TRY AGAIN' },
  'index.enter.code': { ru:'Введи код доступа для входа', en:'Enter access code to enter' },
  'index.creator.close': { ru:'✕ ЗАКРЫТЬ', en:'✕ CLOSE' },
  'index.hud.awara': { ru:'AWARA · LOBBY · GOLDEN AGE', en:'AWARA · LOBBY · GOLDEN AGE' },
  'index.hud.path': { ru:'SATYA YUGA · LIGHT PATH · RA', en:'SATYA YUGA · LIGHT PATH · RA' },
  'index.hud.matrix': { ru:'АКТИВНАЯ СИСТЕМА: ', en:'ACTIVE SYSTEM: ' },
  'index.hud.yuga': { ru:'КАЛИ ЮГА', en:'KALI YUGA' },
  'index.hud.dvapara': { ru:'ДВАПАРА ЮГА', en:'DVAPARA YUGA' },
  'index.hud.treta': { ru:'ТРЕТА ЮГА', en:'TRETA YUGA' },
  'index.hud.satya': { ru:'САТЬЯ ЮГА', en:'SATYA YUGA' },
  'index.quest.title': { ru:'ВЫБЕРИ КЛЮЧ · НАЖМИ ДЛЯ ПОДРОБНОГО ОПИСАНИЯ', en:'CHOOSE KEY · CLICK FOR DETAILS' },
  'index.quest.choose': { ru:'ВЫБЕРИ КУЛЬТУРНУЮ ЛИНЗУ ВОСПРИЯТИЯ', en:'CHOOSE CULTURAL PERCEPTION LENS' },
  'index.lang.switch': { ru:'ВЫБЕРИ ЯЗЫК ИНТЕРФЕЙСА', en:'CHOOSE INTERFACE LANGUAGE' },
  'index.daily.key': { ru:'КЛЮЧ ДНЯ', en:'DAY KEY' },
  'index.daily.quest': { ru:'КВЕСТ ДНЯ', en:'DAILY QUEST' },
  'index.daily.artifact': { ru:'АРТЕФАКТ ДНЯ', en:'ARTIFACT OF THE DAY' },
  'index.vedic': { ru:'ВЕДИЧЕСКАЯ', en:'VEDIC' },
  'index.slavic': { ru:'СЛАВЯНСКАЯ', en:'SLAVIC' },
  'index.kabbalah': { ru:'КАББАЛА', en:'KABBALAH' },
  'index.egyptian': { ru:'ЕГИПЕТСКАЯ', en:'EGYPTIAN' },
  'index.mayan': { ru:'МАЙЯНСКАЯ', en:'MAYAN' },
  'index.shambhala': { ru:'ШАМБАЛА', en:'SHAMBALA' },
  'index.all': { ru:'ВСЁ', en:'ALL' },
  'index.future.vector': { ru:'ВЕКТОР НА ЗАВТРА', en:'VECTOR FOR TOMORROW' },
  'index.balance.treasury': { ru:'БАЛАНС В КАЗНЕ', en:'TREASURY BALANCE' },
  'index.vishnu': { ru:'ВИШНУ', en:'VISHNU' },
  'index.brahma': { ru:'БРАХМА', en:'BRAHMA' },
  'index.shiva': { ru:'ШИВА', en:'SHIVA' },
  'index.time': { ru:'ВРЕМЯ', en:'TIME' },
  'index.voice': { ru:'ГОЛОС · ФОТО · ФАЙЛЫ', en:'VOICE · PHOTO · FILES' },
  'index.galactic.tone': { ru:'ГАЛАКТИЧЕСКИЙ ТОНАЛЬ', en:'GALACTIC TONE' },
  'index.activate.hexagram': { ru:'АКТИВИРОВАТЬ ГЕКСАГРАММУ', en:'ACTIVATE HEXAGRAM' },
  'index.activate.kalachakra': { ru:'АКТИВИРОВАТЬ КАЛАЧАКРА', en:'ACTIVATE KALACHAKRA' },
  'index.activate.kruglet': { ru:'АКТИВИРОВАТЬ КРУГОЛЕТ', en:'ACTIVATE KRUGOLET' },
  'index.activate.panchang': { ru:'АКТИВИРОВАТЬ ПАНЧАНГУ', en:'ACTIVATE PANCHANGA' },
  'index.activate.maya': { ru:'АКТИВИРОВАТЬ ЭНЕРГИЮ ДНЯ МАЙЯ', en:'ACTIVATE MAYAN DAY ENERGY' },
  'index.spaces.mind': { ru:'ПРОСТРАНСТВО УМА', en:'MIND SPACE' },
  'index.gs.mind.sub': { ru:'АХАМКАРА · НАМЕРЕНИЯ · СФЕРЫ', en:'AHAMKARA · INTENTIONS · SPHERES' },
  'index.spaces.initiation': { ru:'ДУША · ИНИЦИАЦИЯ v2', en:'SOUL · INITIATION v2' },
  'index.spaces.initiationLegacy': { ru:'ИНИЦИАЦИЯ · ДРЕВНЯЯ (v1)', en:'INITIATION · LEGACY (v1)' },
  'index.spaces.earth': { ru:'ЗЕМЛЯ ИГРОКА', en:'PLAYER EARTH' },
  'index.spaces.universe': { ru:'ВСЕЛЕННАЯ ИГРОКА', en:'PLAYER UNIVERSE' },
  'index.spaces.creation': { ru:'ИГРА МИРОЗДАНИЯ', en:'CREATION GAME' },
  'index.universe.sub': { ru:'ЦЕНТРАЛЬНОЕ СОЛНЦЕ · ТРИМУРТИ · ПЛАНЕТЫ И ОРБИТЫ', en:'CENTRAL SUN · TRIMURTI · PLANETS AND ORBITS' },
  'index.earth.sub': { ru:'ДЕРЖАВА РА · МИР СТРУКТУР И СТИХИЙ', en:'DOMINION OF RA · WORLD OF STRUCTURES AND ELEMENTS' },
  'index.initiation.sub': { ru:'ДУША · КАРТА СОЗНАНИЯ · 13 СФЕР', en:'SOUL · CONSCIOUSNESS MAP · 13 SPHERES' },
  'index.creation.sub': { ru:'ТОНКИЙ ПЛАН · МИР СВЕТКОИНОВ И АРТЕФАКТОВ', en:'SUBTLE PLANE · WORLD OF SVETCOINS AND ARTIFACTS' },
  'index.night.tigel': { ru:'Вечерний Тигель', en:'Evening Tigel' },

  // ══ КОСМОС / ВСЕЛЕННАЯ ══
  'universe.central.sun': { ru:'ЦЕНТРАЛЬНОЕ СОЛНЦЕ', en:'CENTRAL SUN' },
  'universe.agents.count': { ru:'21 АГЕНТ · ОРБИТЫ · СОЛНЦЕ РА', en:'21 AGENTS · ORBITS · RA SUN' },
  'universe.earth.sub': { ru:'ВАСТУ · СТИХИИ · ПОСТРОЙКИ', en:'VASTU · ELEMENTS · BUILDINGS' },
  'universe.creation.sub': { ru:'КАРТОЧНАЯ ИГРА · АРТЕФАКТЫ · НАСТОЛКА', en:'CARD GAME · ARTIFACTS · BOARD' },
  'universe.matrix.sub': { ru:'33 ВОСПРИЯТИЯ · ЛОГ ДНЯ · КЛЮЧИ', en:'33 PERCEPTIONS · DAY LOG · KEYS' },

  // ══ ДАШБОРД ══
  'dashboard.hero.agent': { ru:'АГЕНТ', en:'AGENT' },
  'dashboard.hero.matrix': { ru:'МАТРИЦА', en:'MATRIX' },
  'dashboard.hero.light': { ru:'СВЕТ', en:'LIGHT' },
  'dashboard.ra.rank': { ru:'РАНГ ДЕРЖАВЫ РА', en:'RA DOMINION RANK' },
  'dashboard.evolution': { ru:'ШКАЛА ЭВОЛЮЦИИ', en:'EVOLUTION SCALE' },
  'dashboard.spheres.title': { ru:'СФЕРЫ', en:'SPHERES' },
  'dashboard.tigel.title': { ru:'ТИГЕЛЬ', en:'TIGEL' },
  'dashboard.keys.title': { ru:'КЛЮЧИ', en:'KEYS' },
  'dashboard.cards.title': { ru:'КАРТЫ', en:'CARDS' },
  'dashboard.milost.title': { ru:'МИЛОСТЬ', en:'GRACE' },
  'dashboard.daimon.title': { ru:'ДАЙМОН', en:'DAIMON' },
  'dashboard.artifacts.title': { ru:'АРТЕФАКТЫ', en:'ARTIFACTS' },
  'dashboard.exchange.title': { ru:'ОБМЕН', en:'EXCHANGE' },

  // ══ ДАЙМОН ══
  'daimon.form': { ru:'Форма', en:'Form' },
  'daimon.name': { ru:'Имя', en:'Name' },
  'daimon.archetype': { ru:'Архетип', en:'Archetype' },
  'daimon.level': { ru:'Уровень', en:'Level' },
  'daimon.resonance': { ru:'Резонанс', en:'Resonance' },
  'daimon.not.summoned': { ru:'Даймон не призван', en:'Daimon not summoned' },
  'daimon.summon': { ru:'ПРИЗВАТЬ', en:'SUMMON' },
  'daimon.evolution': { ru:'ЭВОЛЮЦИЯ', en:'EVOLUTION' },
  'daimon.dna': { ru:'ДНК', en:'DNA' },
  'daimon.granthi': { ru:'ГРАНТХИ', en:'GRANTHI' },

  // ══ МИЛОСТЬ ══
  'milost.score': { ru:'Счёт', en:'Score' },
  'milost.multiplier': { ru:'Множитель', en:'Multiplier' },
  'milost.sources': { ru:'Источники', en:'Sources' },
  'milost.veil.breach': { ru:'Пробой Завесы', en:'Veil Breach' },
  'milost.macrocosm': { ru:'Послание Макрокосма', en:'Macrocosm Message' },

  // ══ ЗЕМЛЯ ИГРОКА ══
  'earth.buildings': { ru:'ПОСТРОЙКИ', en:'BUILDINGS' },
  'earth.zones': { ru:'ЗОНЫ', en:'ZONES' },
  'earth.directions': { ru:'НАПРАВЛЕНИЯ', en:'DIRECTIONS' },
  'earth.north': { ru:'Север', en:'North' },
  'earth.south': { ru:'Юг', en:'South' },
  'earth.east': { ru:'Восток', en:'East' },
  'earth.west': { ru:'Запад', en:'West' },
  'earth.center': { ru:'Центр', en:'Center' },

  // ══ INDEX · ИГРОВЫЕ ПРОСТРАНСТВА (модалка) ══
  'index.gs.modal.title': { ru:'🌌 ИГРОВЫЕ ПРОСТРАНСТВА', en:'🌌 GAME SPACES' },
  'index.gs.modal.sub': { ru:'AWARA · ВЫБЕРИ МИР', en:'AWARA · CHOOSE WORLD' },
  'index.gs.matrix.title': { ru:'МАТРИЦЫ · ТИГЕЛЬ', en:'MATRICES · TIGEL' },
  'index.gs.matrix.sub': { ru:'33 ВОСПРИЯТИЯ · ЛОГ ДНЯ · КЛЮЧИ', en:'33 PERCEPTIONS · DAY LOG · KEYS' },
  'index.gs.init.sub': { ru:'ТЁМНАЯ ДУША · 3 СФЕРЫ ВРЕМЕНИ · Q&A', en:'DARK SOUL · 3 SPHERES OF TIME · Q&A' },
  'index.gs.initLegacy.sub': { ru:'ВРЕМЕННЫЙ ВХОД ДЛЯ СРАВНЕНИЯ · УЙДЁТ ПОСЛЕ T-608', en:'TEMPORARY ENTRY FOR COMPARISON · REMOVED AFTER T-608' },
  'index.gs.universe.sub': { ru:'ЦЕНТРАЛЬНОЕ СОЛНЦЕ · 21 АГЕНТ · ОРБИТЫ', en:'CENTRAL SUN · 21 AGENTS · ORBITS' },
  'index.gs.back': { ru:'← НАЗАД В ЛОББИ', en:'← BACK TO LOBBY' },
  'index.init.keys.title': { ru:'КЛЮЧИ ИНИЦИАЦИИ', en:'INITIATION KEYS' },
  'index.init.keys.body': { ru:'Ключи инициации готовятся.<br>Здесь будут ежедневные культурные испытания, символы и бонусы.', en:'Initiation keys are being prepared.<br>Daily cultural challenges, symbols and bonuses will appear here.' },
  'index.init.keys.hint': { ru:'НАЖМИ ЧТОБЫ ЗАКРЫТЬ', en:'TAP TO CLOSE' },
  'index.lobby.alpha': { ru:'AWARA · ALPHA 0.1', en:'AWARA · ALPHA 0.1' },
  'index.lobby.creator.tip': { ru:'Нажми для выхода из режима создателя', en:'Click to exit creator mode' },

  // ══ HUD ══
  'hud.transition': { ru:'ПЕРЕХОД', en:'TRANSITION' },
  'hud.kali.yuga': { ru:'КАЛИ ЮГА', en:'KALI YUGA' },
  'hud.key': { ru:'КЛЮЧ', en:'KEY' },
  'hud.path': { ru:'ПУТЬ', en:'PATH' },

  // ══ INDEX (idx.*) ══
  'idx.ra': { ru:'РА', en:'RA' },
  'idx.initiate': { ru:'ИНИЦИАТ', en:'INITIATE' },
  'idx.level.1': { ru:'УРОВЕНЬ 1', en:'LEVEL 1' },
  'idx.chaos': { ru:'ХАОС', en:'CHAOS' },
  'idx.level.2.5': { ru:'УРОВЕНЬ 2.5', en:'LEVEL 2.5' },
  'idx.sattva.sub': { ru:'Чистота · Гармония · Свет', en:'Purity · Harmony · Light' },
  'idx.rajas.sub': { ru:'Действие · Страсть · Огонь', en:'Action · Passion · Fire' },
  'idx.tamas.sub': { ru:'Инерция · Тьма · Земля', en:'Inertia · Darkness · Earth' },
  'idx.level.3': { ru:'УРОВЕНЬ 3', en:'LEVEL 3' },
  'idx.level.12': { ru:'УРОВЕНЬ 12', en:'LEVEL 12' },
  'idx.choice.point': { ru:'ТОЧКА ВЫБОРА', en:'POINT OF CHOICE' },
  'idx.level.13': { ru:'УРОВЕНЬ 13', en:'LEVEL 13' },
  'idx.energy': { ru:'ЭНЕРГИЯ', en:'ENERGY' },
  'idx.awareness': { ru:'ОСОЗНАННОСТЬ', en:'AWARENESS' },
  'idx.resonance': { ru:'РЕЗОНАНС', en:'RESONANCE' },
  'idx.choices': { ru:'ВЫБОРОВ', en:'CHOICES' },
  'idx.path.trace': { ru:'ПУТЬ', en:'PATH' },
  'idx.portal.open': { ru:'ПОРТАЛ ОТКРЫТ', en:'PORTAL OPEN' },
};

// ══ ЯЗЫК ══
let currentLang = localStorage.getItem('awara_lang') || 'en';

export function getLang() { return currentLang; }
export function setLang(lang) {
  if (LANGS[lang]) { currentLang = lang; localStorage.setItem('awara_lang', lang); return true; }
  return false;
}
export function detectLang() {
  const saved = localStorage.getItem('awara_lang');
  if (saved && LANGS[saved]) return saved;
  return (navigator.language || '').split('-')[0] === 'ru' ? 'ru' : 'en';
}
export function initLang() {
  const saved = localStorage.getItem('awara_lang');
  currentLang = (saved && LANGS[saved]) ? saved : detectLang();
  return currentLang;
}

// ══ ПЕРЕВОД ══
export function t(key, params) {
  params = params || {};
  const entry = DICT[key];
  if (!entry) return key;
  let text = entry[currentLang] || entry['ru'] || key;
  for (const [p, v] of Object.entries(params)) text = text.replace('{' + p + '}', v);
  return text;
}

// ══ ПЕРЕВЕСТИ СТРАНИЦУ ══

// Кеш оригинальных текстов (data-i18n-orig)
const _origStore = new WeakMap();

export function translatePage() {
  // 1. data-i18n атрибуты
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    // Сохраняем оригинал при первом вызове
    if (!el.dataset.i18nOrig) el.dataset.i18nOrig = el.textContent;
    const translated = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (!el.dataset.i18nOrig) el.dataset.i18nOrig = el.placeholder;
      el.placeholder = translated;
    } else if (el.dataset.i18nHtml) {
      el.innerHTML = translated;
    } else {
      el.textContent = translated;
    }
  });

  // 2. data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // 3. Авто-перевод ВСЕХ текстовых узлов
  // Сначала сохраняем оригиналы (один раз)
  if (!window._awaraOrigSaved) {
    const saveWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        const p = node.parentElement;
        if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (p.dataset && p.dataset.i18n) return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim().length < 1) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = saveWalker.nextNode())) { n._origText = n.textContent; }
    window._awaraOrigSaved = true;
  }

  // Затем переводим ВСЕ узлы
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      const p = node.parentElement;
      if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
      if (p.dataset && p.dataset.i18n) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node;
  while ((node = walker.nextNode())) {
    if (currentLang === 'ru') {
      if (node._origText) node.textContent = node._origText;
    } else {
      const text = node.textContent.trim();
      if (!text) continue;
      // Ищем перевод
      let found = null;
      for (const [key, val] of Object.entries(DICT)) {
        if (val.ru === text) { found = val.en; break; }
      }
      if (found) {
        node.textContent = found;
      } else {
        // Частичный перевод: заменяем только известные фрагменты
        let result = text;
        for (const [key, val] of Object.entries(DICT)) {
          if (val.ru.length > 3 && result.includes(val.ru)) {
            result = result.replace(val.ru, val.en);
          }
        }
        if (result !== text) node.textContent = result;
      }
    }
  }

  // MutationObserver — переводить динамически добавленный контент
  if (!window._awaraObserver) {
    window._awaraObserver = new MutationObserver(function(mutations) {
      if (currentLang === 'ru') return;
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(el) {
          if (el.nodeType !== 1 || !el.querySelectorAll) return;
          el.querySelectorAll('[data-i18n]').forEach(function(sub) {
            if (!sub.dataset.i18nOrig) sub.dataset.i18nOrig = sub.textContent;
            sub.textContent = t(sub.dataset.i18n);
          });
          const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
            acceptNode: function(n) {
              if (n.parentElement && n.parentElement.dataset && n.parentElement.dataset.i18n) return NodeFilter.FILTER_REJECT;
              return (n.textContent.trim().length >= 2) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          });
          let tn;
          while ((tn = tw.nextNode())) {
            const txt = tn.textContent.trim();
            if (!tn._origText) tn._origText = txt;
            for (const [key, val] of Object.entries(DICT)) {
              if (val.ru === txt) { tn.textContent = val.en; break; }
            }
          }
        });
      });
    });
    window._awaraObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Highlight active language button
export function highlightLangButtons() {
  var lang = getLang();
  document.querySelectorAll('[data-lang]').forEach(function(btn) {
    btn.classList.toggle('on', btn.dataset.lang === lang);
  });
}

// Floating language switcher (EN/RU) -- fixed bottom-right
export function insertLangSwitcher() {
  if (document.querySelector('.lang-float')) return;
  var div = document.createElement('div');
  div.className = 'lang-float';
  div.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;display:flex;gap:4px;font-family:JetBrains Mono,monospace;font-size:11px;';
  var btnStyle = 'padding:4px 8px;border:1px solid rgba(201,168,76,0.4);background:rgba(10,10,20,0.8);color:rgba(201,168,76,0.7);cursor:pointer;border-radius:4px;';
  div.innerHTML = '<button data-lang="en" style="' + btnStyle + '">EN</button><button data-lang="ru" style="' + btnStyle + '">RU</button>';
  document.body.appendChild(div);
  div.querySelectorAll('button').forEach(function(btn) {
    btn.onclick = function() {
      setLang(btn.dataset.lang);
      translatePage();
      highlightLangButtons();
    };
  });
  highlightLangButtons();
}
