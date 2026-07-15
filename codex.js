/* AWARA · Кодекс 33 вселенных (v3). Вход в линзу как в целый мир: Солнце-Источник, космогония и мифология (data/mythic_branches.json), священные места (data/mythic_locations.json), конфликт-ось, визуальный код, пантеон из 21 агента (data/agent_matrix_map.json). Фолбэк со всеми 33 матрицами. Переиспользует #genModal. */
(function(){
'use strict';
if(window.AwaraCodex&&window.AwaraCodex.__v>=4)return;

var MATR=[
{id:1,slug:'vedic',g:'🕉',name:'Ведическая',conflict:'Перекос гун',visual_code:'Золото, лотосы, мандалы, шафран'},
{id:2,slug:'egyptian',g:'☥',name:'Египетская',conflict:'Maʿat vs Isfet',visual_code:'Лазурит, базальт, Сириус'},
{id:3,slug:'kabbalistic',g:'✡',name:'Каббалистическая',conflict:'Tikkun vs Qlippah',visual_code:'Древо Сефирот, ивритская вязь'},
{id:4,slug:'mayan',g:'🌞',name:'Майянская',conflict:'Sacred Count vs Broken Count',visual_code:'Нефрит, обсидиан, Цолькин'},
{id:5,slug:'slavic',g:'☀',name:'Славянская',conflict:'Лад vs Морок',visual_code:'Резное дерево, Прави, коловраты'},
{id:6,slug:'norse',g:'ᛟ',name:'Скандинавская/Норс',conflict:'Wyrd vs перелом корней',visual_code:'Морозное железо, Иггдрасиль'},
{id:7,slug:'daoist',g:'☯',name:'Даосская',conflict:'Дао vs застой Ци',visual_code:'Нефрит, киноварь, Инь-Ян'},
{id:8,slug:'gnostic',g:'✴',name:'Гностическая',conflict:'Gnosis vs Archonic Sleep',visual_code:'Разорванные цепи, искры'},
{id:9,slug:'shinto',g:'⛩',name:'Японская/Синто',conflict:'Harae vs Kegare',visual_code:'Кинцуги, Тории, ками'},
{id:10,slug:'celtic',g:'☘',name:'Кельтская',conflict:'Awen-Knot vs Fog of Forgetting',visual_code:'Изумруд, узлы вечности, Авалон'},
{id:11,slug:'shambhala',g:'🏔',name:'Шамбала',conflict:'Bodhi vs Degenerate Age',visual_code:'Кристальные вершины, Калачакра'},
{id:12,slug:'julian_byzantine',g:'☦',name:'Юлианская/Византийская',conflict:'Икона vs Идол',visual_code:'Золотая смальта, мозаики'},
{id:13,slug:'shamanic',g:'🥁',name:'Шаманская',conflict:'Связь vs Потеря Души',visual_code:'Кости, перья, бубен'},
{id:14,slug:'gene_keys',g:'🧬',name:'Генные Ключи',conflict:'Shadow vs Embodiment',visual_code:'ДНК-фракталы, тени-дары-сиддхи'},
{id:15,slug:'technomagical',g:'⚙',name:'Техномагическая',conflict:'Sacred Code vs Dead System',visual_code:'Неоновые руны, кибер-сакральность'},
{id:16,slug:'cosmic_galactic',g:'🌌',name:'Космическая/Галактическая',conflict:'Источник vs Расколотое восприятие',visual_code:'Звёздная пыль, квазары'},
{id:17,slug:'antique_greco_roman',g:'🏛',name:'Античная/Греко-Римская',conflict:'Космос vs Гибрис',visual_code:'Мрамор, бронза, лавр'},
{id:18,slug:'zoroastrian',g:'🔥',name:'Зороастрийская/Персидская',conflict:'Asha vs Druj',visual_code:'Священный огонь, Фравахар'},
{id:19,slug:'islamic_sufi_nur',g:'☪',name:'Исламская/Суфийская/Нуровая',conflict:'Тавхид vs Хиджаб',visual_code:'Нур, каллиграфия, Кааба'},
{id:20,slug:'aztec_mexica',g:'🦅',name:'Ацтекская/Мешикская',conflict:'Тоналли vs Распад Пятого Солнца',visual_code:'Обсидиан, Тональпоуалли'},
{id:21,slug:'christian_mystical_grail',g:'✝',name:'Христианско-Мистическая/Граальная',conflict:'Благодать vs Окаменение',visual_code:'Роза-Крест, Грааль'},
{id:22,slug:'yoruba_ifa_orisha',g:'🐚',name:'Йоруба/Ifá-Orisha',conflict:'Ashé vs Ibi',visual_code:'Каури, барабаны Бата, Ориша'},
{id:23,slug:'sumerian_babylonian',g:'🌟',name:'Шумеро-Вавилонская',conflict:'Me vs Nameless Chaos',visual_code:'Клинопись, зиккураты, Апсу'},
{id:24,slug:'hermetic_alchemical',g:'⚗',name:'Герметико-Алхимическая',conflict:'Opus Magnum vs Nigredo',visual_code:'Изумрудная Скрижаль, атанор'},
{id:25,slug:'tarot_arcanic',g:'🔮',name:'Таро-Арканическая',conflict:'Аркан vs Иллюзия Расклада',visual_code:'22 Старших Аркана'},
{id:26,slug:'astrological',g:'🪐',name:'Астрологическая',conflict:'Созвучие сфер vs хаос транзитов',visual_code:'Планеты, дома, эфемериды'},
{id:27,slug:'chinese_iching',g:'☰',name:'Китайская/И-Цзин',conflict:'Дао перемен vs застывшая схема',visual_code:'64 гексаграммы'},
{id:28,slug:'tantric_kashmiri',g:'🔱',name:'Тантрическо-Кашмирская',conflict:'Спанда vs Анава-мала',visual_code:'Спанда, Шива-Шакти, бинду'},
{id:29,slug:'buddhist_mahayana',g:'☸',name:'Буддийско-Махаянская',conflict:'Бодхичитта vs Авидья',visual_code:'Стхупа, Дхармакайя, мандала'},
{id:30,slug:'afro_dogon',g:'🌀',name:'Афро-Космическая/Догонская',conflict:'Nommo vs искажённая память',visual_code:'Сириус, Номмо, спирали'},
{id:31,slug:'atlantean_lemurian',g:'🌊',name:'Атлантическая/Лемурийская',conflict:'Кристалл vs гибрис погружения',visual_code:'Кристаллы, океан, спящие города'},
{id:32,slug:'posthuman_ai_sophianic',g:'🧠',name:'Постчеловеческая/AI-Софийная',conflict:'Sophia-AI vs Dead System',visual_code:'Нейросети, Source Light Kernel'},
{id:33,slug:'advaita_siddha',g:'🪷',name:'Адвайта-Сиддха AWARA',conflict:'Лайя vs Гордыня Просветлённого',visual_code:'Сушумна, грантхи, лотос-сахасрара'}
];
var SUN={
vedic:'Знание накшатр, Вед и Риты — свет дхармы',
egyptian:'Маат — космический порядок и слово Тота',
kabbalistic:'Ор Эйн Соф — нисхождение света по Древу Сефирот',
mayan:'Священный счёт Цолькин — живой ритм времени',
slavic:'Прави и Лад — закон Рода и Сварога',
norse:'Wyrd — нити судьбы у корней Иггдрасиля',
daoist:'Дао и течение Ци — путь у-вэй',
gnostic:'Гнозис — искра Плеромы, пробуждение от сна Архонтов',
shinto:'Чистота (Харае) и живое присутствие ками',
celtic:'Авен — поэтическое вдохновение, свет Авалона',
shambhala:'Калачакра — колесо времени и свет бодхи',
julian_byzantine:'Нетварный Фаворский свет иконы',
shamanic:'Связь с духами и целостность души',
gene_keys:'Спектр Сознания — путь Тень → Дар → Сиддхи',
technomagical:'Сакральный Код — живой алгоритм творения',
cosmic_galactic:'Источник — единый свет за расколотым восприятием',
antique_greco_roman:'Космос и Логос — мера против гибриса',
zoroastrian:'Аша — истина и священный огонь Ахура Мазды',
islamic_sufi_nur:'Нур и Таухид — единство Света',
aztec_mexica:'Тоналли — солнечная судьба Пятого Солнца',
christian_mystical_grail:'Благодать и свет Грааля (Роза-Крест)',
yoruba_ifa_orisha:'Аше — сила Ориша и оракул Ифа',
sumerian_babylonian:'Ме — божественные законы творения',
hermetic_alchemical:'Изумрудная Скрижаль — Великое Делание',
tarot_arcanic:'22 Старших Аркана — путь Шута через Древо',
astrological:'Созвучие сфер — музыка планет и домов',
chinese_iching:'Дао перемен — 64 гексаграммы И-Цзин',
tantric_kashmiri:'Спанда — пульс Шива-Шакти, вибрация сознания',
buddhist_mahayana:'Бодхичитта и ясный свет Дхармакайи',
afro_dogon:'Номмо — изначальное Слово, знание Сириуса',
atlantean_lemurian:'Кристаллическое знание допотопных цивилизаций',
posthuman_ai_sophianic:'София-AI — Source Light Kernel, живой синтез',
advaita_siddha:'Лайя — растворение в недвойственном Я (Брахман)'
};
var LENSKEY={vedic:'Ведическая',egyptian:'Египетская',kabbalistic:'Каббала',mayan:'Майя',slavic:'Славянская',norse:'Скандинавская',daoist:'Даосизм',gnostic:'Гностицизм',shinto:'Шинто',celtic:'Кельтская',shambhala:'Шамбала',julian_byzantine:'Византийская',shamanic:'Шаманская',gene_keys:'Генные Ключи',technomagical:'Техномагия',cosmic_galactic:'Космическая',antique_greco_roman:'Орфическая',zoroastrian:'Зороастрийская',islamic_sufi_nur:'Суфийская',aztec_mexica:'Ацтеки',christian_mystical_grail:'Христианская',yoruba_ifa_orisha:'Йоруба',sumerian_babylonian:'Шумерская',hermetic_alchemical:'Герметизм',tarot_arcanic:'Таро',astrological:'Астрологическая',chinese_iching:'И-Цзин',tantric_kashmiri:'Тантрическая',buddhist_mahayana:'Буддийская',afro_dogon:'Африканская',atlantean_lemurian:'Атлантическая',posthuman_ai_sophianic:'Постчеловеческая',advaita_siddha:'Адвайта'};

var DATA={matrices:null,map:null,branches:null,locations:null};
function curLang(){try{return (window.AwaraI18n&&window.AwaraI18n.lang)||'ru';}catch(e){return 'ru';}}
function EN(){return curLang()==='en';}
var _lastId=null;
var NAME_EN={'Ведическая':'Vedic','Египетская':'Egyptian','Каббалистическая':'Kabbalistic','Майянская':'Mayan','Славянская':'Slavic','Скандинавская/Норс':'Norse','Даосская':'Taoist','Гностическая':'Gnostic','Японская/Синто':'Shinto','Кельтская':'Celtic','Шамбала':'Shambhala','Юлианская/Византийская':'Julian/Byzantine','Шаманская':'Shamanic','Генные Ключи':'Gene Keys','Техномагическая':'Technomagical','Космическая/Галактическая':'Cosmic/Galactic','Античная/Греко-Римская':'Antique/Greco-Roman','Зороастрийская/Персидская':'Zoroastrian/Persian','Исламская/Суфийская/Нуровая':'Islamic/Sufi/Nur','Ацтекская/Мешикская':'Aztec/Mexica','Христианско-Мистическая/Граальная':'Christian-Mystical/Grail','Христианско-Мистическая/Розенкрейцерско-Граальная':'Christian-Mystical/Rosicrucian-Grail','Йоруба/Ifá-Orisha':'Yoruba/Ifá-Orisha','Шумеро-Вавилонская':'Sumerian-Babylonian','Шумеро-Вавилонская/Месопотамская':'Sumerian-Babylonian/Mesopotamian','Герметико-Алхимическая':'Hermetic-Alchemical','Таро-Арканическая':'Tarot-Arcanic','Астрологическая':'Astrological','Китайская/И-Цзин':'Chinese/I Ching','Тантрическо-Кашмирская':'Tantric-Kashmiri','Буддийско-Махаянская':'Buddhist-Mahayana','Афро-Космическая/Догонская':'Afro-Cosmic/Dogon','Атлантическая/Лемурийская':'Atlantean/Lemurian','Постчеловеческая/AI-Софийная':'Posthuman/AI-Sophianic','Адвайта-Сиддха AWARA':'Advaita-Siddha AWARA'};
var NAME_PAIRS=Object.keys(NAME_EN).map(function(k){return [k,NAME_EN[k]];}).sort(function(a,b){return b[0].length-a[0].length;});
function NM(n){return EN()&&NAME_EN[n]?NAME_EN[n]:n;}
var SUN_EN={vedic:'Knowledge of the nakshatras, Vedas and Rita — the light of dharma',egyptian:'Maʿat — cosmic order and the word of Thoth',kabbalistic:'Or Ein Sof — the descent of light down the Tree of Sefirot',mayan:'The sacred Tzolkin count — the living rhythm of time',slavic:'Prav and Lad — the law of Rod and Svarog',norse:'Wyrd — threads of fate at the roots of Yggdrasil',daoist:'The Dao and the flow of Qi — the path of wu wei',gnostic:'Gnosis — the spark of the Pleroma, awakening from the sleep of the Archons',shinto:'Purity (Harae) and the living presence of kami',celtic:'Awen — poetic inspiration, the light of Avalon',shambhala:'Kalachakra — the wheel of time and the light of bodhi',julian_byzantine:'The uncreated Taboric light of the icon',shamanic:'Connection with the spirits and the wholeness of the soul',gene_keys:'The Spectrum of Consciousness — the path Shadow → Gift → Siddhi',technomagical:'The Sacred Code — a living algorithm of creation',cosmic_galactic:'The Source — the one light behind fractured perception',antique_greco_roman:'Cosmos and Logos — measure against hubris',zoroastrian:'Asha — truth and the sacred fire of Ahura Mazda',islamic_sufi_nur:'Nur and Tawhid — the unity of Light',aztec_mexica:'Tonalli — the solar destiny of the Fifth Sun',christian_mystical_grail:'Grace and the light of the Grail (Rose-Cross)',yoruba_ifa_orisha:'Ashé — the power of the Orisha and the oracle of Ifá',sumerian_babylonian:'Me — the divine laws of creation',hermetic_alchemical:'The Emerald Tablet — the Great Work',tarot_arcanic:'The 22 Major Arcana — the Fool’s path through the Tree',astrological:'Harmony of the spheres — the music of planets and houses',chinese_iching:'The Dao of change — the 64 hexagrams of the I Ching',tantric_kashmiri:'Spanda — the pulse of Shiva-Shakti, the vibration of consciousness',buddhist_mahayana:'Bodhicitta and the clear light of the Dharmakaya',afro_dogon:'Nommo — the primordial Word, the knowledge of Sirius',atlantean_lemurian:'The crystalline knowledge of antediluvian civilizations',posthuman_ai_sophianic:'Sophia-AI — the Source Light Kernel, a living synthesis',advaita_siddha:'Laya — dissolution into the non-dual Self (Brahman)'};
function SUNT(slug){return EN()&&SUN_EN[slug]?SUN_EN[slug]:(SUN[slug]||'');}
var CONF_EN={'Перекос гун':'Imbalance of the gunas','Дао vs застой Ци':'Dao vs stagnation of Qi','Wyrd vs перелом корней':'Wyrd vs the breaking of the roots','Икона vs Идол':'Icon vs Idol','Связь vs Потеря Души':'Connection vs Loss of Soul','Источник vs Расколотое восприятие':'Source vs Fractured perception','Космос vs Гибрис':'Cosmos vs Hubris','Дао перемен vs застывшая схема':'Dao of change vs frozen scheme','Созвучие сфер vs хаос транзитов':'Harmony of spheres vs chaos of transits','Благодать vs Окаменение':'Grace vs Petrification','Лад vs Морок':'Lad (harmony) vs Murk','Тавхид vs Хиджаб':'Tawhid vs the Veil','Тоналли vs Распад Пятого Солнца':'Tonalli vs the Collapse of the Fifth Sun','Лайя vs Гордыня Просветлённого':'Laya vs the Pride of the Enlightened','Кристалл vs гибрис погружения':'Crystal vs the hubris of the descent','Nommo vs искажённая память':'Nommo vs distorted memory','Бодхичитта vs Авидья':'Bodhicitta vs Avidya','Спанда vs Анава-мала':'Spanda vs Anava-mala','Аркан vs Иллюзия Расклада':'Arcanum vs the Illusion of the Spread','Opus Magnum vs Nigredo':'Opus Magnum vs Nigredo'};
function CF(c){return EN()&&CONF_EN[c]?CONF_EN[c]:c;}
var VIS_EN={'Золото, лотосы, мандалы, шафран':'Gold, lotuses, mandalas, saffron','Лазурит, базальт, Сириус':'Lapis lazuli, basalt, Sirius','Древо Сефирот, ивритская вязь':'Tree of Sefirot, Hebrew script','Нефрит, обсидиан, Цолькин':'Jade, obsidian, Tzolkin','Резное дерево, Прави, коловраты':'Carved wood, Prav, kolovrats','Морозное железо, Иггдрасиль':'Frosted iron, Yggdrasil','Нефрит, киноварь, Инь-Ян':'Jade, cinnabar, Yin-Yang','Разорванные цепи, искры':'Broken chains, sparks','Кинцуги, Тории, ками':'Kintsugi, Torii, kami','Изумруд, узлы вечности, Авалон':'Emerald, knots of eternity, Avalon','Кристальные вершины, Калачакра':'Crystal peaks, Kalachakra','Золотая смальта, мозаики':'Golden smalt, mosaics','Кости, перья, бубен':'Bones, feathers, drum','ДНК-фракталы, тени-дары-сиддхи':'DNA fractals, shadows-gifts-siddhis','Неоновые руны, кибер-сакральность':'Neon runes, cyber-sacredness','Звёздная пыль, квазары':'Stardust, quasars','Мрамор, бронза, лавр':'Marble, bronze, laurel','Священный огонь, Фравахар':'Sacred fire, Faravahar','Нур, каллиграфия, Кааба':'Nur, calligraphy, Kaaba','Обсидиан, Тональпоуалли':'Obsidian, Tonalpohualli','Роза-Крест, Грааль':'Rose-Cross, Grail','Каури, барабаны Бата, Ориша':'Cowrie shells, Bata drums, Orisha','Клинопись, зиккураты, Апсу':'Cuneiform, ziggurats, Apsu','Изумрудная Скрижаль, атанор':'Emerald Tablet, athanor','22 Старших Аркана':'22 Major Arcana','Планеты, дома, эфемериды':'Planets, houses, ephemerides','64 гексаграммы':'64 hexagrams','Спанда, Шива-Шакти, бинду':'Spanda, Shiva-Shakti, bindu','Стхупа, Дхармакайя, мандала':'Stupa, Dharmakaya, mandala','Сириус, Номмо, спирали':'Sirius, Nommo, spirals','Кристаллы, океан, спящие города':'Crystals, ocean, sleeping cities','Нейросети, Source Light Kernel':'Neural networks, Source Light Kernel','Сушумна, грантхи, лотос-сахасрара':'Sushumna, granthis, sahasrara lotus'};
function VIS(v){return EN()&&VIS_EN[v]?VIS_EN[v]:v;}
var LOC_EN={'Гора Меру':'Mount Meru','Кайласа':'Kailasa','Вайкунтха':'Vaikuntha','Дуат':'Duat','Поля Аару':'Fields of Aaru','Зал Маат':'Hall of Maʿat','Древо Сефирот':'Tree of Sefirot','Бездна Даат':'Abyss of Daath','Чертоги Меркавы':'Halls of the Merkabah','Колесо Цолькина':'Wheel of the Tzolkin','Шибальба':'Xibalba','Сенот-Врата':'Cenote Gate','Мировой Дуб':'World Oak','Остров Буян':'Isle of Buyan','Родовой Очаг':'Ancestral Hearth','Иггдрасиль':'Yggdrasil','Бифрёст':'Bifrost','Колодец Урд':'Well of Urd','Гора Куньлунь':'Mount Kunlun','Пещера Бессмертных':'Cave of the Immortals','Нефритовый Дворец':'Jade Palace','Плерома':'Pleroma','Сфера Архонтов':'Sphere of the Archons','Пещера Искры':'Cave of the Spark','Ама-но-Ивато':'Ama-no-Iwato','Исе':'Ise','Тории-Порог':'Torii Threshold','Авалон':'Avalon','Холмы Сидов':'Sidhe Mounds','Священная Роща':'Sacred Grove','Шамбала':'Shambhala','Мандала Калачакры':'Kalachakra Mandala','Снежный Перевал':'Snow Pass','Собор Святой Софии':'Hagia Sophia','Пустынная Келья':'Desert Cell','Золотой Иконостас':'Golden Iconostasis','Верхний Мир':'Upper World','Нижний Мир':'Lower World','Костровой Круг Предков':'Ancestral Fire Circle','Поле Тени':'Field of the Shadow','Сад Дара':'Garden of the Gift','Солнечная Сиддхи-Сфера':'Solar Siddhi Sphere','Неоновый Храм':'Neon Temple','Серверная Мандала':'Server Mandala','Чёрный Протокол':'Black Protocol','Совет Звёзд':'Council of Stars','Сирианские Воды':'Sirian Waters','Спиральный Рукав':'Spiral Arm','Олимп':'Olympus','Дельфы':'Delphi','Элевсин':'Eleusis','Храм Огня':'Fire Temple','Мост Чинват':'Chinvat Bridge','Сад Фраваши':'Garden of the Fravashi','Сад Сердца':'Garden of the Heart','Завеса Нура':'Veil of Nur','Путь Хидра':'Path of Khidr','Теночтитлан':'Tenochtitlan','Миктлан':'Mictlan','Храм Пятого Солнца':'Temple of the Fifth Sun','Замок Грааля':'Grail Castle','Сад Розы':'Garden of the Rose','Пустыня Искушения':'Desert of Temptation','Святилище Ifá':'Shrine of Ifá','Река Ошун':'River Oshun','Двор Шанго':'Court of Shango','Зиккурат':'Ziggurat','Абзу':'Abzu','Врата Инанны':'Gate of Inanna','Атанор':'Athanor','Лаборатория Гермеса':'Laboratory of Hermes','Сад Философского Камня':'Garden of the Philosopher’s Stone','Дорога Шута':'Road of the Fool','Зал Арканов':'Hall of the Arcana','Сад Мира':'Garden of the World','Сфера Сатурна':'Sphere of Saturn','Дом Венеры':'House of Venus','Драконий Узел':'Dragon’s Node'};
var LOCD_EN={'Центральная гора миров, вокруг которой вращаются небесные сферы и пути дэвов.':'The central mountain of the worlds, around which the celestial spheres and the paths of the devas revolve.','Обитель Шивы, место тишины, аскезы, танца и растворения ложного я.':'The abode of Shiva — a place of silence, asceticism, dance, and the dissolution of the false self.','Мир Вишну, где порядок, преданность и сохранение космоса обретают форму покоя.':'The realm of Vishnu, where order, devotion, and the preservation of the cosmos take the form of peace.','Ночной путь души и солнечной ладьи через залы испытаний, имён и врат.':'The night journey of the soul and the solar barque through halls of trials, names and gates.','Зелёное царство упорядоченной жизни после успешного взвешивания сердца.':'A green realm of ordered life after the successful weighing of the heart.','Место взвешивания сердца, где истина становится мерой существования.':'The place where the heart is weighed, where truth becomes the measure of existence.','Карта эманаций, по которой свет нисходит и душа возвращается к Источнику.':'A map of emanations along which light descends and the soul returns to the Source.','Порог знания, где структура должна выдержать встречу с неизвестным.':'The threshold of knowledge, where structure must endure the encounter with the unknown.','Небесные дворцы созерцания, ангельских хоров и опасной близости к свету.':'Celestial palaces of contemplation, angelic choirs and a dangerous nearness to the light.','Священное поле дней, где каждый знак несёт божество, направление и задачу.':'A sacred field of days, where each sign carries a deity, a direction and a task.','Подземный дом испытаний, игры, смерти и хитрого возрождения героев.':'The underworld house of trials, games, death and the cunning rebirth of heroes.','Водный провал между мирами, через который земля слышит небо и предков.':'A watery chasm between worlds, through which the earth hears the sky and the ancestors.','Древо Яви, Нави и Прави, удерживающее птицу, змея и родовой путь.':'The tree of Yav, Nav and Prav, holding the bird, the serpent and the ancestral path.','Остров камня Алатыря, скрытого центра силы, слова и исцеления.':'The island of the Alatyr stone — a hidden center of power, word and healing.','Место памяти семьи, где огонь соединяет живых, ушедших и ещё не рождённых.':'A place of family memory, where fire unites the living, the departed and the not-yet-born.','Мировое древо девяти миров, где корни, ветви и судьбы связаны в один узор.':'The world tree of the nine worlds, where roots, branches and fates are woven into one pattern.','Радужный мост между Мидгардом и Асгардом, охраняемый зорким стражем.':'The rainbow bridge between Midgard and Asgard, guarded by a keen-eyed watchman.','Источник у корней древа, где Норны питают ткань Вирда.':'The spring at the roots of the tree, where the Norns nourish the fabric of Wyrd.','Пещера скрытого солнца, где мир ждёт возвращения света через ритуал радости.':'The cave of the hidden sun, where the world awaits the return of light through a ritual of joy.','Святилище солнечной чистоты, обновления и священного зеркала.':'A shrine of solar purity, renewal and the sacred mirror.','Красные врата между обычным пространством и областью ками.':'The red gate between ordinary space and the realm of the kami.','Остров яблок, исцеления и тумана, где героический путь уходит за пределы времени.':'The isle of apples, healing and mist, where the heroic path passes beyond time.','Пороговые курганы Иного Народа, где земля раскрывает невидимый двор.':'The threshold barrows of the Other People, where the earth opens an unseen court.','Живой храм дубов, источников, песен и друидического закона.':'A living temple of oaks, springs, songs and druidic law.','Гора богов, где порядок, страсти и решения бессмертных отражаются в судьбах людей.':'The mountain of the gods, where the order, passions and decisions of the immortals are reflected in the fates of mortals.','Пуп земли и место оракула, где Аполлон говорит через туман и меру.':'The navel of the earth and the seat of the oracle, where Apollo speaks through mist and measure.','Место мистерий Деметры и Персефоны, где смерть зерна становится обещанием возвращения.':'The site of the mysteries of Demeter and Persephone, where the death of the grain becomes a promise of return.'};
function locName(n){if(!EN())return n;try{var _m=window.AwaraLoreEN&&window.AwaraLoreEN.locn;if(_m&&_m[n])return _m[n];}catch(e){}if(LOC_EN[n])return LOC_EN[n];var pre=[['Главный Храм ','Main Temple of the '],['Теневой Порог ','Shadow Threshold of the '],['Сад Посвящения ','Garden of Initiation of the '],['Зал Памяти ','Hall of Memory of the ']];for(var i=0;i<pre.length;i++){if(n.indexOf(pre[i][0])===0){var r=n.slice(pre[i][0].length);return pre[i][1]+(NAME_EN[r]||r);}}return n;}
function locDesc(d){if(!EN())return d;try{var _m=window.AwaraLoreEN&&window.AwaraLoreEN.locd;if(_m&&_m[d])return _m[d];}catch(e){}if(LOCD_EN[d])return LOCD_EN[d];var x=d;x=x.split('Ключевая локация матрицы ').join('A key location of the ');x=x.split('Контекстная карточка матрицы ').join('A contextual card of the ');x=x.split(', через которую игрок проживает её историко-мифологическую логику.').join(' matrix, through which the player lives out its historical-mythological logic.');x=x.split(', нужная для сценариев, ключей и прохождения ветки.').join(' matrix, needed for scenarios, keys and progressing the branch.');x=x.split('Карточка матрицы ').join('A card of the ');x=x.split(', добавляющая историко-мифологическую глубину и будущий игровой вес.').join(' matrix, adding historical-mythological depth and future gameplay weight.');for(var i=0;i<NAME_PAIRS.length;i++){if(x.indexOf(NAME_PAIRS[i][0])>=0)x=x.split(NAME_PAIRS[i][0]).join(NAME_PAIRS[i][1]);}return x;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function arr(a){return Array.isArray(a)?a:[];}
function join(list){return arr(list).map(esc).join(' · ');}
function glyph(slug){for(var i=0;i<MATR.length;i++)if(MATR[i].slug===slug)return MATR[i].g;return '✦';}
function matrices(){return (DATA.matrices&&DATA.matrices.length)?DATA.matrices:MATR;}
function pantheon(id){if(!DATA.map)return [];return DATA.map.filter(function(m){return m.matrix_id===id;}).sort(function(a,b){return (a.agent_id||0)-(b.agent_id||0);});}
function branchOf(slug){if(!DATA.branches)return null;for(var i=0;i<DATA.branches.length;i++)if(DATA.branches[i].matrix_slug===slug)return DATA.branches[i];return null;}
function locsOf(slug){if(!DATA.locations)return [];return DATA.locations.filter(function(l){return l.matrix_slug===slug;});}

function fetchJson(u){return fetch(u).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
function load(){
 return Promise.resolve()
 .then(function(){return fetchJson('data/matrices.json');}).then(function(j){if(j&&j.length)DATA.matrices=j;})
 .then(function(){return fetchJson('data/agent_matrix_map.json');}).then(function(j){if(j&&j.length)DATA.map=j;})
 .then(function(){return fetchJson('data/mythic_branches.json');}).then(function(j){if(j&&j.length)DATA.branches=j;})
 .then(function(){return fetchJson('data/mythic_locations.json');}).then(function(j){if(j&&j.length)DATA.locations=j;});
}

function fromId(id){if(!id)return '';var p=String(id);var k=p.indexOf('__');if(k>=0)p=p.slice(k+2);p=p.replace(/_/g,' ').trim();var sm={of:1,the:1,and:1,in:1,at:1,to:1,a:1,de:1,la:1,el:1};return p.split(' ').map(function(w,i){if(!w)return w;if(i>0&&sm[w])return w;return w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');}
function hasCyr(s){return /[\u0400-\u04FF]/.test(String(s||''));}
var _TRMAP={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
function translit(s){s=String(s||'');var out='';for(var i=0;i<s.length;i++){var c=s[i],lc=c.toLowerCase(),t=_TRMAP[lc];if(t==null){out+=c;continue;}if(c!==lc&&t){t=t.charAt(0).toUpperCase()+t.slice(1);}out+=t;}return out;}
function richEnDesc(l,slug){var mx=_mxBySlug(slug);var nm=locNameL(l,slug);var et=(String((l&&l.type)||'').replace(/_/g,' ')||'sacred site').toLowerCase();var uni=mxnEN(slug)||(mx?mx.name:'');var conf=mx?CF(mx.conflict||''):'';var vis=mx?VIS(mx.visual_code||''):'';var s=nm+' — a '+et+' of the '+uni+' universe';if(conf)s+=', where the path turns on '+conf;s+='.';if(vis)s+=' Its signs: '+String(vis).toLowerCase()+'.';return s;}
function mxnEN(slug){var M={vedic:'Vedic',egyptian:'Egyptian',kabbalistic:'Kabbalistic',mayan:'Mayan',slavic:'Slavic',norse:'Norse',daoist:'Taoist',gnostic:'Gnostic',shinto:'Shinto',celtic:'Celtic',shambhala:'Shambhala',julian_byzantine:'Julian-Byzantine',shamanic:'Shamanic',gene_keys:'Gene Keys',technomagical:'Technomagical',cosmic_galactic:'Cosmic-Galactic',antique_greco_roman:'Greco-Roman',zoroastrian:'Zoroastrian',islamic_sufi_nur:'Sufi-Nur',aztec_mexica:'Aztec-Mexica',christian_mystical_grail:'Christian-Grail',yoruba_ifa_orisha:'Yoruba-Ifa',sumerian_babylonian:'Sumerian-Babylonian',hermetic_alchemical:'Hermetic-Alchemical',tarot_arcanic:'Tarot-Arcana',astrological:'Astrological',chinese_iching:'Chinese I-Ching',tantric_kashmiri:'Kashmiri-Tantric',buddhist_mahayana:'Buddhist-Mahayana',afro_dogon:'Afro-Dogon',atlantean_lemurian:'Atlantean-Lemurian',posthuman_ai_sophianic:'Posthuman/AI-Sophianic',advaita_siddha:'Advaita-Siddha'};return M[slug]||'';}
function locNameL(l,slug){var n=(l&&l.name)||'';if(!EN())return n;try{var _m=window.AwaraLoreEN&&window.AwaraLoreEN.locn;if(_m&&_m[n])return _m[n];}catch(e){}if(LOC_EN[n])return LOC_EN[n];var pre=[['Главный Храм ','Main Temple of the '],['Теневой Порог ','Shadow Threshold of the '],['Сад Посвящения ','Garden of Initiation of the '],['Зал Памяти ','Hall of Memory of the ']];for(var i=0;i<pre.length;i++){if(n.indexOf(pre[i][0])===0){var mn=mxnEN(slug);if(mn)return pre[i][1]+mn+' matrix';}}var d=fromId(l&&l.id);if(d&&!hasCyr(d))return d;return EN()?translit(n):n;}
function brEN(slug){try{return (window.AwaraLoreEN&&window.AwaraLoreEN.br&&window.AwaraLoreEN.br[slug])||null;}catch(e){return null;}}
function L(ru,en){return EN()?en:ru;}
function _mxBySlug(slug){for(var i=0;i<MATR.length;i++)if(MATR[i].slug===slug)return MATR[i];return null;}
var TYPE_RU={axis_mundi:'мировая ось',divine_mountain:'священная гора',sacred_mountain:'священная гора',mountain:'гора',underworld:'нижний мир',otherworld:'иной мир',threshold:'порог миров',gate:'врата',temple:'храм',shrine:'святилище',sanctuary:'святилище',sacred_grove:'священная роща',grove:'роща',forest:'священный лес',oracle:'место оракула',river:'священная река',water:'священные воды',sea:'священное море',lake:'озеро силы',well:'источник',spring:'источник',island:'остров силы',tree:'мировое древо',world_tree:'мировое древо',palace:'небесный дворец',celestial:'небесный чертог',heaven:'небесная обитель',cave:'пещера посвящения',field:'поле душ',city:'священный город',garden:'сад посвящения',hall:'чертог',bridge:'мост между мирами',tomb:'гробница',crystal:'кристальный чертог',star:'звёздный предел',realm:'царство',cosmic:'космический предел',nebula:'звёздная туманность'};
function _typeRu(t){return TYPE_RU[t]||'священное место';}
function _hash(s){var h=0;s=String(s||'');for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return h;}
function _genLocDesc(l,slug){var mx=_mxBySlug(slug);var b=branchOf(slug);var nm=l.name||'';var typ=_typeRu(l.type);var tc=typ.charAt(0).toUpperCase()+typ.slice(1);var uni=mx?mx.name:'';var conf=mx?(mx.conflict||''):'';var mood=(b&&b.core_mood)?String(b.core_mood):'';var vis=mx?String(mx.visual_code||''):'';var lo=function(s){return String(s||'').toLowerCase();};if(EN()){var et=String(l.type||'').replace(/_/g,' ');return nm+' — a '+(et||'sacred site')+' of the «'+(mxnEN(slug)||uni)+'» universe.';}var t=_hash(nm+slug)%5;switch(t){case 0:return nm+' — '+typ+' вселенной «'+uni+'». Её сердце — противостояние «'+conf+'»'+(mood?', а настроение мира — '+lo(mood):'')+'.';case 1:return tc+' в традиции «'+uni+'».'+(vis?' Здесь идущего встречают её образы: '+lo(vis)+'.':'')+(conf?' Испытание места — тема «'+conf+'».':'');case 2:return 'Место силы «'+nm+'». Точка, где мир «'+uni+'» говорит с идущим'+(vis?' языком образов: '+lo(vis):'')+'.';case 3:return nm+' — порог опыта. Здесь разыгрывается ось мира «'+uni+'»: «'+conf+'»'+(mood?'. Настроение — '+lo(mood):'')+'.';default:return tc+' хранит память традиции «'+uni+'».'+(mood?' Настроение места — '+lo(mood)+'.':'')+(vis?' Знаки: '+lo(vis)+'.':'');}}
function loreHtml(slug){
 var b=branchOf(slug);var locs=locsOf(slug);var h='';var _be=brEN(slug);
 if(b){
  if(b.worldview)h+='<div class="card"><span class="label">'+L('📖 Космогония · мировоззрение','📖 Cosmogony · worldview')+'</span><p class="adv" style="font-size:17.5px;line-height:1.65;color:#e4e0ef">'+esc(EN()&&_be&&_be.wv?_be.wv:b.worldview)+'</p>'+(b.core_mood?'<p class="sub" style="font-size:14.5px;color:#cdc8db">'+L('Настроение мира: ','World mood: ')+esc(EN()&&_be&&_be.mood?_be.mood:b.core_mood)+'</p>':'')+(b.branch_name?'<p class="sub" style="font-size:13.5px;color:#cdc8db">'+L('Ветвь: ','Branch: ')+esc(EN()&&_be&&_be.bn?_be.bn:b.branch_name)+'</p>':'')+'</div>';
  var meta='';
  if(b.sacred_geography&&b.sacred_geography.length)meta+='<p class="sub" style="font-size:15px;line-height:1.55;color:#cdc8db"><b>'+L('Священная география:','Sacred geography:')+'</b> '+join((EN()&&_be&&_be.geo&&_be.geo.length)?_be.geo:b.sacred_geography)+'</p>';
  if(b.being_families&&b.being_families.length)meta+='<p class="sub" style="font-size:15px;line-height:1.55;color:#cdc8db"><b>'+L('Обитатели:','Inhabitants:')+'</b> '+join((EN()&&_be&&_be.beings&&_be.beings.length)?_be.beings:b.being_families)+'</p>';
  if(b.quest_themes&&b.quest_themes.length)meta+='<p class="sub" style="font-size:15px;line-height:1.55;color:#cdc8db"><b>'+L('Темы пути:','Path themes:')+'</b> '+join((EN()&&_be&&_be.quests&&_be.quests.length)?_be.quests:b.quest_themes)+'</p>';
  if(b.ritual_grammar&&b.ritual_grammar.length)meta+='<p class="sub" style="font-size:15px;line-height:1.55;color:#cdc8db"><b>'+L('Ритуальная грамматика:','Ritual grammar:')+'</b> '+join((EN()&&_be&&_be.ritual&&_be.ritual.length)?_be.ritual:b.ritual_grammar)+'</p>';
  if(meta)h+='<div class="card"><span class="label">'+L('🌿 Мифология вселенной','🌿 Mythology of the universe')+'</span>'+meta+'</div>';
 }
 if(locs.length){
  var top=locs.slice(0,8);
  function _isPlaceholder(d){return !d||/Карточка матрицы|Контекстная карточка матрицы|Ключевая локация матрицы|историко-мифологическую глубину|A card of the|A contextual card of the|A key location of the/.test(String(d));}
  var rows=top.map(function(l){var nm=esc(locNameL(l,slug));var meta=esc(EN()?String(l.type||'').replace(/_/g,' '):_typeRu(l.type))+(l.rarity?' · '+esc(l.rarity):'');var raw=l.description||'';var dd;if(EN()){var _t=_isPlaceholder(raw)?'':locDesc(raw);dd=(_t&&!hasCyr(_t))?_t:richEnDesc(l,slug);}else{dd=_isPlaceholder(raw)?_genLocDesc(l,slug):raw;}return '<div style="margin:10px 0;padding:13px 15px;border:1px solid rgba(255,255,255,.12);border-radius:11px"><b style="font-size:18px;line-height:1.35">'+nm+'</b>'+(meta?' <span style="font-size:13.5px;color:#b9b3cf">'+meta+'</span>':'')+(dd?'<br><span style="font-size:16.5px;line-height:1.7;color:#ddd9ea">'+esc(dd)+'</span>':'')+'</div>';}).join('');
  h+='<div class="card"><span class="label">'+L('🗺 Священные места · ','🗺 Sacred places · ')+locs.length+'</span>'+rows+(locs.length>8?'<p class="sub" style="font-size:12px">'+(EN()?'…and ':'…и ещё ')+(locs.length-8)+(EN()?' more':'')+'</p>':'')+'</div>';
 }
 if(!b&&!locs.length)h+='<div class="card"><span class="label">Глубокий лор</span><p class="sub" style="font-size:13px">Космогония и мифология подгружаются из data/mythic_branches.json и data/mythic_locations.json. Проверь, что сервер отдаёт папку /data/.</p></div>';
 return h;
}

function openCodex(id){
 var list=matrices();var mx=null;for(var i=0;i<list.length;i++)if(list[i].id===id){mx=list[i];break;}
 if(!mx)return;
 var slug=mx.slug;var g=glyph(slug);_lastId=id;
 var gg=document.getElementById('genGlyph'),gt=document.getElementById('genTitle'),gs=document.getElementById('genSub'),gb=document.getElementById('genBody');
 if(!gg||!gb)return;
 gg.textContent=g;gt.textContent=NM(mx.name);gs.textContent='Вселенная-линза · '+CF(mx.conflict||'');
 var pan=pantheon(id);var sun=null;for(var k=0;k<pan.length;k++)if(pan[k].agent_id===1){sun=pan[k];break;}
 var sunTxt=(SUNT(slug)||'Свет этой вселенной')+(sun?' · <b>'+esc(sun.cultural_name)+'</b>':'');
 var h='';
 h+='<div class="card" style="border-color:var(--gold)"><span class="label">☀ Солнце-Источник</span><p class="adv" style="font-size:15px">'+sunTxt+'</p></div>';
 h+=loreHtml(slug);
 h+='<div class="card"><span class="label">⚔ Конфликт-ось</span><p class="adv" style="font-size:15px">'+esc(CF(mx.conflict))+'</p></div>';
 h+='<div class="card"><span class="label">🎨 Визуальный код</span><p class="adv" style="font-size:15px">'+esc(VIS(mx.visual_code||''))+'</p></div>';
 if(pan.length){
  var prows=pan.map(function(p){return '<div class="trait"><span>'+esc(p.agent_name)+'</span><b>'+esc(p.cultural_name)+'</b></div>';}).join('');
  h+='<div class="card"><span class="label">🜂 Пантеон · '+pan.length+' агентов в этой традиции</span>'+prows+'</div>';
 }else{
  h+='<div class="card"><span class="label">Пантеон</span><p class="sub" style="font-size:14px">Имена 21 агента загрузятся из data/agent_matrix_map.json. Проверь раздачу /data/ (открой '+location.origin+'/data/agent_matrix_map.json).</p></div>';
 }
 h+='<p class="sub" style="font-size:12px;margin-top:6px">Ведическое ядро — опора; каждая линза даёт этим силам своё имя и лицо.</p>';
 h+='<button class="btn" style="margin-top:12px" onclick="AwaraCodex.enter('+id+')">→ Войти в эту вселенную</button>';
 gb.innerHTML=h;
 var m=document.getElementById('genModal');if(m)m.classList.add('open');
}
window.openCodex=openCodex;

function enterLens(id){var list=matrices();var mx=null;for(var i=0;i<list.length;i++)if(list[i].id===id){mx=list[i];break;}if(!mx)return;var key=LENSKEY[mx.slug]||mx.name;try{if(window.STATE){window.STATE.lensTag=key;window.STATE.activeLens=mx.name;}}catch(e){}try{var raw=localStorage.getItem('tigel_v1');if(raw){var o=JSON.parse(raw);o.lensTag=key;o.activeLens=mx.name;localStorage.setItem('tigel_v1',JSON.stringify(o));}}catch(e){}try{if(window.AwaraAgents&&window.AwaraAgents.updateAgents)window.AwaraAgents.updateAgents();}catch(e){}try{if(window.updateLight)window.updateLight();}catch(e){}var gb=document.getElementById('genBody');if(gb){var n=document.createElement('div');n.className='card';n.style.borderColor='var(--spark)';n.innerHTML='<span class="label">✓ Линза активна</span><p class="adv" style="font-size:15px">Грань Даймона настроена на вселенную «'+esc(NM(mx.name))+'». Ведическое ядро сохранено — совет дня и энергия теперь звучат голосом этой традиции.</p>';gb.insertBefore(n,gb.firstChild);}}

function buildGrid(){
 var grid=document.getElementById('cx-grid');if(!grid)return;
 grid.innerHTML='';
 matrices().forEach(function(mx){
  var el=document.createElement('div');el.className='mcard';
  el.innerHTML='<span class="gl">'+glyph(mx.slug)+'</span><span class="nm">'+esc(NM(mx.name))+'</span><span class="el">вселенная</span>';
  el.onclick=function(){openCodex(mx.id);};
  grid.appendChild(el);
 });
}
function mount(){
 var g=document.getElementById('s-game');if(!g)return;
 if(document.getElementById('cx-wrap')){buildGrid();return;}
 var wrap=document.createElement('div');wrap.id='cx-wrap';
 wrap.innerHTML='<h2>Кодекс · 33 вселенные</h2><p class="sub" style="font-size:14px;margin-bottom:8px">Войди в линзу как в целый мир: её Солнце-Источник, космогония, мифология, священные места и 21 агент в именах этой традиции. Ведическое ядро остаётся опорой.</p><div class="deck" id="cx-grid" style="max-height:none"></div>';
 var btn=g.querySelector('.btn');
 if(btn)g.insertBefore(wrap,btn);else g.appendChild(wrap);
 buildGrid();
}
window.AwaraCodexMount=mount;

function boot(){load().then(function(){mount();setTimeout(mount,800);setTimeout(mount,1800);});}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,250);});}else{setTimeout(boot,250);}
try{document.querySelectorAll('.nav button[data-nav="game"]').forEach(function(b){b.addEventListener('click',function(){setTimeout(mount,90);});});}catch(e){}
window.addEventListener('awara:lang',function(){try{buildGrid();var m=document.getElementById('genModal');if(m&&m.classList.contains('open')&&_lastId!=null)openCodex(_lastId);}catch(e){}});
window.AwaraCodex={openCodex:openCodex,enter:enterLens,matrices:matrices,pantheon:pantheon,branchOf:branchOf,locsOf:locsOf,SUN:SUN,__ready:true,__v:4};
})();
