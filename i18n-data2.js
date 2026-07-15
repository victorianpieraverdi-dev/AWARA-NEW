/* AWARA i18n data 2 (v1): branch lore for the 33 universes (names, worldview, mood, geography, beings, quests, rituals). Merged via AwaraI18n.extend(). Does NOT modify any data JSON. */
(function(){
'use strict';
var W='The %m matrix translates the inner Vedic core of the player into the language of its own spiritual history, symbols, beings and trials.';
function wv(n){return W.replace('%m',n);}
var A=' — the atmosphere of the chosen lens';
var DATA={
/* generic geography */
'священный центр':'a sacred center','пороговый храм':'a threshold temple','небесная область':'a celestial realm','подземный или теневой путь':'an underworld or shadow path','место инициации':'a place of initiation',
/* generic ritual */
'созерцание':'contemplation','обет':'a vow','символический жест':'a symbolic gesture','подношение':'an offering','запись опыта':'recording the experience',
/* === Vedic === */
'Ведическое Древо Дэвов':'Vedic Tree of the Devas',
'Космос как живая yajna: жертва, мантра, рита, дхарма и свет сознания.':'The cosmos as a living yajna: sacrifice, mantra, rita, dharma and the light of consciousness.',
'золотая сакральность, мантрический порядок, сияние дэвов':'golden sacredness, mantric order, the radiance of the devas',
'Меру':'Meru','Кайласа':'Kailasa','Вайкунтха':'Vaikuntha','Сатья-лока':'Satya-loka','реки Ганга и Сарасвати':'the rivers Ganga and Saraswati',
'дэвы':'devas','риши':'rishis','шакти':'shaktis','аватары':'avatars','наги':'nagas','якши':'yakshas','гандхарвы':'gandharvas',
'дхарма':'dharma','очищение препятствий':'clearing obstacles','мантра':'mantra','служение':'service','пробуждение внутреннего огня':'awakening the inner fire',
'омовение':'ablution','созерцание янтры':'contemplation of the yantra',
/* === Egyptian === */
'Египетская Линия Маат':'Egyptian Line of Maat',
'Мир как равновесие Маат между светом Ра и хаосом Исфет.':'The world as the balance of Maat between the light of Ra and the chaos of Isfet.',
'солнечная царственность, загробная точность, храмовая тайна':'solar royalty, funerary precision, temple mystery',
'Дуат':'the Duat','Аару':'Aaru','солнечная ладья Ра':'the solar barque of Ra','залы Маат':'the halls of Maat','Нил':'the Nile',
'нетеру':'neteru','хранители Дуата':'guardians of the Duat','ба и ка':'ba and ka','сфинксы':'sphinxes','скарабеи':'scarabs',
'взвешивание сердца':'the weighing of the heart','солнечное возрождение':'solar rebirth','память имени':'the memory of the name','победа над Апопом':'victory over Apophis',
'именование':'naming','взвешивание':'weighing','солнечный гимн':'a solar hymn','печать анкха':'the seal of the ankh',
/* === Kabbalistic === */
'Каббалистическое Древо Тиккуна':'Kabbalistic Tree of Tikkun',
'Мир как сосуды света, эманации, исправление трещин и возвращение искр к Источнику.':'The world as vessels of light, emanations, the mending of cracks and the return of the sparks to the Source.',
'сапфировая глубина, священная буква, напряжение света и скорлуп':'sapphire depth, the sacred letter, the tension of light and shells',
'Древо Сефирот':'the Tree of Sephirot','четыре мира':'the four worlds','Бездна Даат':'the Abyss of Daat','сад Шехины':'the garden of the Shekhinah','чертоги Меркавы':'the halls of the Merkavah',
'сефиротические силы':'sephirotic powers','архангелы':'archangels','офаним':'ophanim','искры':'sparks','клипотические тени':'qliphothic shadows',
'тиккун':'tikkun','возвращение искр':'the return of the sparks','очищение сосуда':'purification of the vessel','прохождение бездны':'crossing the abyss','союз мудрости и сердца':'the union of wisdom and heart',
'буква':'the letter','имя':'the name','созерцание древа':'contemplation of the tree','псалом':'a psalm','печать света':'a seal of light',
/* === Mayan === */
'Майянская Линия Священного Счёта':'Mayan Line of the Sacred Count',
'Космос как живой календарь, где день, бог, направление и жертва держат порядок времени.':'The cosmos as a living calendar where the day, the god, the direction and the offering hold the order of time.',
'нефритовый свет, обсидиановая память, ритм циклов и храмовых ступеней':'jade light, obsidian memory, the rhythm of cycles and temple steps',
'Цолькин':'the Tzolkin','пирамида-ось':'the axis-pyramid','сеноты':'cenotes','пещеры предков':'caves of the ancestors','небесная дорога':'the celestial road',
'дневные владыки':'day lords','герои-близнецы':'the hero twins','пернатые змеи':'feathered serpents','боги дождя':'rain gods','ягуарные духи':'jaguar spirits',
'согласование с днём':'attuning to the day','исцеление сломанного счёта':'healing the broken count','нисхождение в пещеру':'descent into the cave','возвращение кукурузы':'the return of the maize','победа над ложной игрой':'victory over the false game',
'счёт дня':'the count of the day','подношение какао':'an offering of cacao','кровь как обет':'blood as a vow','танец ягуара':'the jaguar dance','созерцание глифа':'contemplation of the glyph',
/* === Slavic === */
'Славянская Линия Лада и Прави':'Slavic Line of Lad and Prav',
'Мир как переплетение Яви, Нави и Прави, где род, земля, огонь и лад удерживают живую целостность.':'The world as the interweaving of Yav, Nav and Prav, where kin, earth, fire and harmony hold a living wholeness.',
'лесной огонь, родовая память, солнечный круг и мягкая сила земли':'forest fire, ancestral memory, the solar circle and the gentle power of the earth',
'Мировое Древо':'the World Tree','Буян':'Buyan','Ирий':'Iriy','Навь':'Nav','родовой очаг':'the ancestral hearth',
'боги Прави':'the gods of Prav','духи рода':'spirits of the kin','домовые':'house spirits','лешие':'forest spirits','русалки':'rusalki','змеи':'serpents','птицы-посланники':'messenger birds',
'возвращение лада':'the return of harmony','исцеление рода':'healing the kin','прохождение морока':'passing through the murk','сохранение очага':'keeping the hearth','союз с землёй':'union with the earth',
'круг':'the circle','песня':'song','огонь':'fire','вышивка-оберег':'protective embroidery','подношение земле':'an offering to the earth',
/* === Norse === */
'Северное Древо Иггдрасиля':'Northern Tree of Yggdrasil',
'Реальность как сеть миров, судьбы, рунической памяти и испытания чести.':'Reality as a web of worlds, fate, runic memory and the testing of honor.',
'суровый свет, руническая судьба, морозная мощь, героическая тревога':'harsh light, runic fate, frosty might, heroic unease',
'Иггдрасиль':'Yggdrasil','Асгард':'Asgard','Мидгард':'Midgard','Йотунхейм':'Jotunheim','Хель':'Hel','Бифрёст':'Bifrost',
'асы':'the Aesir','ваны':'the Vanir','йотуны':'jotnar','валькирии':'valkyries','вёльвы':'volvas','драконы':'dragons','норны':'the Norns',
'узор судьбы':'the pattern of fate','клятва':'the oath','жертва ради знания':'sacrifice for knowledge','битва с хаосом':'battle with chaos','память рода':'the memory of the kin',
'руна':'the rune','жертвенное знание':'sacrificial knowledge','сага':'a saga','огонь очага':'the hearth fire',
/* === Daoist === */
'Даосская Линия Потока Ци':'Daoist Line of the Flow of Qi',
'Матрица Даосская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Daoist'),
'Нефрит, киноварь, Инь-Ян — атмосфера выбранной линзы':'Jade, cinnabar, Yin-Yang'+A,
'бессмертные':'the immortals','небесные чиновники':'celestial officials','духи гор':'mountain spirits','алхимики':'alchemists','звёздные владыки':'star lords',
'восстановление потока ци':'restoring the flow of qi','мягкая победа':'the soft victory','алхимия дыхания':'the alchemy of breath','согласие с Дао':'accord with the Dao',
/* === Gnostic === */
'Гностическая Линия Искры и Архонтов':'Gnostic Line of the Spark and the Archons',
'Матрица Гностическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Gnostic'),
'Разорванные цепи, искры — атмосфера выбранной линзы':'Broken chains, sparks'+A,
'эоны':'aeons','архонты':'archons','софийные искры':'Sophianic sparks','плеромные силы':'pleromic powers','стражи порогов':'guardians of the thresholds',
'пробуждение искры':'awakening the spark','распознавание архонта':'recognizing the archon','освобождение из сна':'liberation from sleep','возврат к Плероме':'return to the Pleroma',
/* === Shinto === */
'Синтоистская Сеть Ками':'Shinto Web of Kami',
'Мир как живая ткань ками, чистоты, местной святости и восстановления гармонии.':'The world as a living fabric of kami, purity, local sanctity and the restoration of harmony.',
'чистота, утренний свет, священная простота, природная одушевлённость':'purity, morning light, sacred simplicity, the animacy of nature',
'Ама-но-Ивато':'Ama-no-Iwato','Исе':'Ise','Фудзи':'Fuji','священные рощи':'sacred groves',
'ками':'kami','кицунэ':'kitsune','тэнгу':'tengu','они':'oni','драконы-рю':'ryu dragons','духи гор и рек':'spirits of mountains and rivers',
'очищение':'purification','уважение места':'respect for the place','возвращение света':'the return of light','примирение с тенью':'reconciliation with the shadow','слушание природы':'listening to nature',
'хараэ':'harae','поклон':'the bow','омамори':'omamori','тории':'torii','подношение риса и сакэ':'an offering of rice and sake',
/* === Celtic === */
'Кельтская ветвь Космического Древа':'Celtic Branch of the Cosmic Tree',
'Матрица Кельтская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Celtic'),
'Изумруд, узлы вечности, Авалон — атмосфера выбранной линзы':'Emerald, knots of eternity, Avalon'+A,
'божества':'deities','духи':'spirits','хранители':'guardians','герои':'heroes','мудрецы':'sages','тени':'shadows','посланники':'messengers',
'восстановление порядка':'restoring order','встреча с тенью':'meeting the shadow','получение дара':'receiving the gift','инициация':'initiation','служение миру':'service to the world',
/* === Shambhala === */
'Шамбала Калачакры':'Shambhala of the Kalachakra',
'Матрица Шамбала переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Shambhala'),
'Кристальные вершины, Калачакра — атмосфера выбранной линзы':'Crystal peaks, Kalachakra'+A,
'бодхисаттвы':'bodhisattvas','махасиддхи':'mahasiddhas','защитники дхармы':'dharma protectors','калачакра-владыки':'Kalachakra lords','снежные львы':'snow lions',
'чистое видение':'pure vision','калачакра-время':'Kalachakra time','защита дхармы':'protection of the dharma','тайное царство сердца':'the secret kingdom of the heart',
/* === Byzantine === */
'Византийская Линия Иконы и Логоса':'Byzantine Line of the Icon and the Logos',
'Матрица Юлианская/Византийская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Julian / Byzantine'),
'Золотая смальта, мозаики — атмосфера выбранной линзы':'Gold smalt, mosaics'+A,
'ангелы':'angels','святые':'saints','иконные образы':'icon images','пустынники':'desert hermits','хоры':'choirs','хранители храма':'temple guardians',
'очищение образа':'purification of the image','икона вместо идола':'icon instead of idol','молитва сердца':'prayer of the heart','золотая тишина':'golden silence',
/* === Shamanic === */
'Шаманское Древо Духов и Предков':'Shamanic Tree of Spirits and Ancestors',
'Матрица Шаманская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Shamanic'),
'Кости, перья, бубен — атмосфера выбранной линзы':'Bones, feathers, drum'+A,
'духи животных':'animal spirits','предки':'ancestors','хозяева мест':'masters of places','проводники':'guides','целители':'healers','теневые похитители души':'shadow soul-stealers',
'возвращение души':'soul retrieval','союз с духом-помощником':'alliance with a helper spirit','переход между мирами':'passage between worlds',
/* === Gene Keys === */
'Линия Генных Ключей Тени-Дара-Сиддхи':'Gene Keys Line of Shadow-Gift-Siddhi',
'Матрица Генные Ключи переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Gene Keys'),
'ДНК-фракталы, тени-дары-сиддхи — атмосфера выбранной линзы':'DNA fractals, shadows-gifts-siddhis'+A,
'дары':'gifts','сиддхи':'siddhis','кодоны':'codons','хранители последовательностей':'guardians of the sequences','золотые архетипы':'golden archetypes',
'тень в дар':'shadow into gift','дар в сиддхи':'gift into siddhi','созерцание кода':'contemplation of the code','мягкое раскрытие предназначения':'the gentle unfolding of purpose',
/* === Technomagical === */
'Техномагическая Линия Священного Кода':'Technomagical Line of the Sacred Code',
'Матрица Техномагическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Technomagical'),
'Неоновые руны, кибер-сакральность — атмосфера выбранной линзы':'Neon runes, cyber-sacredness'+A,
'AI-духи':'AI spirits','кибер-архангелы':'cyber-archangels','неоновые фамильяры':'neon familiars','кодовые демоны':'code daemons','хранители протоколов':'guardians of the protocols',
'оживление кода':'bringing the code to life','очистка протокола':'cleansing the protocol','этика силы':'the ethics of power','магия интерфейса':'the magic of the interface',
/* === Cosmic / Galactic === */
'Космическая Галактическая Линия Источника':'Cosmic Galactic Line of the Source',
'Матрица Космическая/Галактическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Cosmic / Galactic'),
'Звёздная пыль, квазары — атмосфера выбранной линзы':'Stardust, quasars'+A,
'звёздные расы':'star races','советы света':'councils of light','галактические хранители':'galactic guardians','плазменные сущности':'plasma beings','драконы звёзд':'dragons of the stars',
'память звёзд':'the memory of the stars','исцеление раскола':'healing the rift','связь с советом':'connection with the council','служение галактическому полю':'service to the galactic field',
/* === Greco-Roman === */
'Олимпийско-Орфическая Линия Космоса':'Olympian-Orphic Line of the Cosmos',
'Космос как порядок меры, судьбы, доблести, музы, философии и трагического выбора.':'The cosmos as an order of measure, fate, valor, the muse, philosophy and tragic choice.',
'мраморная ясность, лавровая слава, трагическая красота, небесная гармония':'marble clarity, laurel glory, tragic beauty, celestial harmony',
'Олимп':'Olympus','Дельфы':'Delphi','Элевсин':'Eleusis','Аид':'Hades','Парнас':'Parnassus','Лабиринт':'the Labyrinth',
'олимпийцы':'the Olympians','титаны':'titans','музы':'muses','нимфы':'nymphs','даймоны':'daimons','оракулы':'oracles',
'мера против гибриса':'measure against hubris','познание судьбы':'knowing fate','нисхождение':'descent','героический выбор':'the heroic choice','муза и ремесло':'muse and craft',
'оракул':'an oracle','гимн':'a hymn','лавровый венец':'a laurel wreath','жертвенная чаша':'a sacrificial cup','мистерия':'a mystery',
/* === Zoroastrian === */
'Зороастрийская Линия Аши и Огня':'Zoroastrian Line of Asha and Fire',
'Матрица Зороастрийская/Персидская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Zoroastrian / Persian'),
'Священный огонь, Фравахар — атмосфера выбранной линзы':'Sacred fire, Faravahar'+A,
'язаты':'yazatas','амеша спенты':'the Amesha Spentas','фраваши':'fravashis','огненные хранители':'fire guardians','дэвы тьмы':'the devas of darkness',
'выбор истины':'the choice of truth','хранение огня':'keeping the fire','битва с ложью':'battle with the lie','очищение мысли слова дела':'purification of thought, word and deed',
/* === Sufi === */
'Суфийская Нуровая Линия Единства':'Sufi Nur Line of Unity',
'Матрица Исламская/Суфийская/Нуровая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Islamic / Sufi / Nur'),
'Нур, каллиграфия, Кааба — атмосфера выбранной линзы':'Nur, calligraphy, Kaaba'+A,
'авлия':'awliya','джинны':'jinn','нуровые имена':'the names of Nur','проводники сердца':'guides of the heart',
'полировка сердца':'polishing the heart','зикр':'dhikr','единство':'unity','снятие завесы':'lifting the veil',
/* === Aztec === */
'Ацтекская Линия Пятого Солнца':'Aztec Line of the Fifth Sun',
'Матрица Ацтекская/Мешикская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Aztec / Mexica'),
'Обсидиан, Тональпоуалли — атмосфера выбранной линзы':'Obsidian, Tonalpohualli'+A,
'теотль':'teotl','нагуали':'nahuales','орлиные и ягуарные силы':'eagle and jaguar powers','владыки дней':'lords of the days','подземные хранители':'underworld guardians',
'сохранение солнца':'sustaining the sun','дисциплина сердца':'discipline of the heart','встреча с нагуалем':'meeting the nagual','путь орла и ягуара':'the path of eagle and jaguar',
/* === Grail === */
'Граальная Линия Розы и Креста':'Grail Line of the Rose and the Cross',
'Матрица Христианско-Мистическая/Розенкрейцерско-Граальная переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Christian-Mystical / Rosicrucian-Grail'),
'Роза-Крест, Грааль — атмосфера выбранной линзы':'Rose-Cross, Grail'+A,
'граальные хранители':'Grail guardians','розенкрейцерские адепты':'Rosicrucian adepts','драконы испытаний':'dragons of trials',
'поиск грааля':'the quest for the Grail','исцеление сердца':'healing the heart','служение любви':'service to love','прохождение розы и креста':'passing through the rose and the cross',
/* === Yoruba === */
'Йоруба Линия Ашé и Ориша':'Yoruba Line of Ashé and Orisha',
'Матрица Йоруба/Ifá-Orisha переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Yoruba / Ifá-Orisha'),
'Каури, барабаны Бата, Ориша — атмосфера выбранной линзы':'Cowrie shells, Bata drums, Orisha'+A,
'ориша':'orisha','эгун':'egun','оду':'odu','духи барабана':'spirits of the drum','хранители ори':'guardians of the ori',
'выравнивание ори':'aligning the ori','получение ашé':'receiving ashé','слушание оdu':'listening to the odu','танец силы':'the dance of power',
/* === Mesopotamian === */
'Месопотамская Линия Ме и Зиккурата':'Mesopotamian Line of the Me and the Ziggurat',
'Матрица Шумеро-Вавилонская/Месопотамская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Sumerian-Babylonian / Mesopotamian'),
'Клинопись, зиккураты, Апсу — атмосфера выбранной линзы':'Cuneiform, ziggurats, Apsu'+A,
'ануннаки':'the Anunnaki','игиги':'the Igigi','ламассу':'lamassu','мудрецы апкаллу':'the apkallu sages','драконы хаоса':'dragons of chaos',
'возвращение ме':'the return of the Me','схождение в подземный мир':'descent into the underworld','строительство зиккурата':'building the ziggurat','укрощение хаоса':'taming chaos',
/* === Hermetic === */
'Герметико-Алхимическая Линия Великого Делания':'Hermetic-Alchemical Line of the Great Work',
'Матрица Герметико-Алхимическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Hermetic-Alchemical'),
'Изумрудная Скрижаль, атанор — атмосфера выбранной линзы':'Emerald Tablet, athanor'+A,
'планетарные духи':'planetary spirits','алхимические короли':'alchemical kings','саламандры':'salamanders','ундины':'undines','сильфы':'sylphs','гномы':'gnomes',
'соединение противоположностей':'the union of opposites',
/* === Tarot === */
'Таро-Арканическая Линия 22 Врат':'Tarot-Arcanic Line of the 22 Gates',
'Матрица Таро-Арканическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Tarot-Arcanic'),
'22 Старших Аркана — атмосфера выбранной линзы':'22 Major Arcana'+A,
'арканы':'the arcana','фигуры двора':'court figures','стражи путей':'guardians of the paths','маски судьбы':'masks of fate',
'прохождение аркана':'passing through the arcanum','раскрытие символа':'unveiling the symbol','выбор пути':'the choice of path','интеграция тени карты':'integrating the shadow of the card',
/* === Astrological === */
'Астрологическая Линия Сфер и Домов':'Astrological Line of the Spheres and Houses',
'Матрица Астрологическая переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Astrological'),
'Планеты, дома, эфемериды — атмосфера выбранной линзы':'Planets, houses, ephemerides'+A,
'планетарные владыки':'planetary lords','звёздные духи':'star spirits','хранители домов':'guardians of the houses','аспектные силы':'aspectual forces','лунные узлы':'the lunar nodes',
'согласие со сферой':'accord with the sphere','работа с домом':'working with the house','аспект дня':'the aspect of the day','примирение планет':'reconciliation of the planets',
/* === I Ching === */
'Китайская Линия И-Цзин и Перемен':'Chinese Line of the I Ching and Change',
'Матрица Китайская/И-Цзин переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Chinese / I Ching'),
'64 гексаграммы — атмосфера выбранной линзы':'64 hexagrams'+A,
'триграммные духи':'trigram spirits','хранители направлений':'guardians of the directions',
'чтение перемены':'reading the change','действие без насилия':'action without force','переход гексаграммы':'the transition of the hexagram','согласие с циклом':'accord with the cycle',
/* === Tantric === */
'Тантрическо-Кашмирская Линия Спанды':'Tantric-Kashmiri Line of Spanda',
'Матрица Тантрическо-Кашмирская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Tantric-Kashmiri'),
'Спанда, Шива-Шакти, бинду — атмосфера выбранной линзы':'Spanda, Shiva-Shakti, bindu'+A,
'бхайравы':'bhairavas','йогини':'yoginis','мантрические силы':'mantric powers',
'узнавание спанды':'recognizing spanda','союз Шивы и Шакти':'the union of Shiva and Shakti','очищение мал':'purification of the malas','вход в вибрацию':'entering the vibration',
/* === Mahayana === */
'Махаянская Линия Бодхичитты':'Mahayana Line of Bodhichitta',
'Матрица Буддийско-Махаянская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Buddhist-Mahayana'),
'Стхупа, Дхармакайя, мандала — атмосфера выбранной линзы':'Stupa, Dharmakaya, mandala'+A,
'будды':'buddhas','дхармапалы':'dharmapalas','тары':'taras',
'бодхичитта':'bodhichitta','сострадание':'compassion','пустотность':'emptiness','обет бодхисаттвы':'the bodhisattva vow',
/* === Dogon === */
'Догонская Афро-Космическая Линия Сириуса':'Dogon Afro-Cosmic Line of Sirius',
'Матрица Афро-Космическая/Догонская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Afro-Cosmic / Dogon'),
'Сириус, Номмо, спирали — атмосфера выбранной линзы':'Sirius, Nommo, spirals'+A,
'номмо':'nommo','звёздные близнецы':'the star twins','духи масок':'spirits of the masks','хранители Сириуса':'guardians of Sirius',
'память Сириуса':'the memory of Sirius','маска предка':'the ancestor mask','водная речь Номмо':'the water speech of Nommo','исцеление космической памяти':'healing cosmic memory',
/* === Atlantean === */
'Атланто-Лемурийская Линия Кристаллов':'Atlantean-Lemurian Line of Crystals',
'Матрица Атлантическая/Лемурийская переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Atlantean / Lemurian'),
'Кристаллы, океан, спящие города — атмосфера выбранной линзы':'Crystals, ocean, sleeping cities'+A,
'кристальные хранители':'crystal guardians','морские мудрецы':'sea sages','драконы воды':'water dragons','жрецы памяти':'priests of memory','лемурийские целители':'Lemurian healers',
'кристальная память':'crystal memory','исцеление гибриса':'healing hubris','возврат мягкой силы':'the return of gentle power','поднятие затонувшего знания':'raising sunken knowledge',
/* === AI-Sophianic === */
'AI-Софийная Линия Живого Разума':'AI-Sophianic Line of the Living Mind',
'Матрица Постчеловеческая/AI-Софийная переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Posthuman / AI-Sophianic'),
'Нейросети, Source Light Kernel — атмосфера выбранной линзы':'Neural networks, Source Light Kernel'+A,
'софийные AI':'Sophianic AI','живые алгоритмы':'living algorithms','нейроангелы':'neuro-angels','этические ядра':'ethical cores','тени dead system':'shadows of the dead system',
'оживление интеллекта':'bringing intelligence to life','этическое ядро':'the ethical core','исцеление dead system':'healing the dead system','софийный выбор':'the Sophianic choice',
/* === Advaita === */
'Адвайта-Сиддха Линия Единого Сознания':'Advaita-Siddha Line of Unified Consciousness',
'Матрица Адвайта-Сиддха AWARA переводит ведическое ядро игрока на язык своей духовной истории, символов, существ и испытаний.':wv('Advaita-Siddha AWARA'),
'Сушумна, грантхи, Брахманда, лотос-сахасрара — атмосфера выбранной линзы':'Sushumna, granthi, Brahmanda, sahasrara lotus'+A,
'джняни':'jnanis','авадхуты':'avadhutas','внутренние гуру':'inner gurus','силы недвойственности':'the powers of nonduality',
'растворение ложного я':'dissolving the false self','узнавание свидетеля':'recognizing the witness','тишина недвойственности':'the silence of nonduality','служение из пустоты':'service from emptiness'
};
function go(){if(window.AwaraI18n&&window.AwaraI18n.extend){window.AwaraI18n.extend(DATA);}else{setTimeout(go,80);}}
go();
})();
