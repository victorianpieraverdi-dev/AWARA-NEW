/* ===== AWARA · i18n-deep2 — доливка словаря глубокого слоя (Круголет, Исток, намерения, линзы, Хроника) ===== */
(function(){
'use strict';
var D={
 /* --- Круголет: месяцы-Дайлеты --- */
 "Рамхатъ":"Ramhat","Айлѣтъ":"Ailet","Бейлѣтъ":"Beilet","Гэйлѣтъ":"Geilet","Дайлѣтъ":"Dailet","Элѣтъ":"Elet","Вэйлѣтъ":"Veilet","Хейлѣтъ":"Heilet","Тайлѣтъ":"Tailet",
 "Месяц Божественного Начала":"Month of Divine Beginning","Месяц Новых Даров":"Month of New Gifts","Месяц Белого Сияния и Покоя Мира":"Month of White Radiance and World Peace","Месяц Вьюг и Стужи":"Month of Blizzards and Frost","Месяц Пробуждения Природы":"Month of Nature's Awakening","Месяц Посева и Наречения":"Month of Sowing and Naming","Месяц Ветров":"Month of Winds","Месяц Получения Даров Природы":"Month of Receiving Nature's Gifts","Месяц Завершения":"Month of Completion",
 "месяц божественного начала":"month of divine beginning","месяц новых даров":"month of new gifts","месяц белого сияния и покоя мира":"month of white radiance and world peace","месяц вьюг и стужи":"month of blizzards and frost","месяц пробуждения природы":"month of nature's awakening","месяц посева и наречения":"month of sowing and naming","месяц ветров":"month of winds","месяц получения даров природы":"month of receiving nature's gifts","месяц завершения":"month of completion",
 /* --- Чертоги: имена --- */
 "Орёлъ":"Eagle","Орёл":"Eagle","Раса":"Rasa","Вепрь":"Boar","Щука":"Pike","Лебедь":"Swan","Воронъ":"Raven","Медведь":"Bear","Бусел (Аистъ)":"Stork","Бусел":"Stork","Аистъ":"Stork","Волкъ":"Wolf","Лиса":"Fox","Туръ (Корова)":"Aurochs (Cow)","Туръ":"Aurochs","Корова":"Cow","Лось":"Elk","Финистъ":"Finist",
 /* --- Боги-покровители --- */
 "Перунъ":"Perun","Даждьбогъ (Тарх)":"Dazhbog (Tarh)","Даждьбогъ":"Dazhbog","Тарх":"Tarh","Жива":"Zhiva","Рожана":"Rozhana","Макошь":"Makosh","Семарглъ":"Semargl","Коляда":"Kolyada","Сварогъ":"Svarog","Родъ":"Rod","Велесъ":"Veles","Марена":"Marena","Крышень":"Kryshen","Лада":"Lada","Вышень":"Vyshen","Купала":"Kupala",
 /* --- Чертоги: качества --- */
 "воля, высота духа, прорыв сквозь преграды":"will, loftiness of spirit, breakthrough past obstacles",
 "благородство, чистота рода, светлая сила":"nobility, purity of lineage, bright power",
 "свет, чистота, целомудренная мощь, исцеление":"light, purity, chaste might, healing",
 "натиск, бесстрашие, разрушение преград":"onslaught, fearlessness, breaking barriers",
 "плавность, изобилие, поток жизни и достатка":"fluidity, abundance, flow of life and prosperity",
 "судьба, верность, нить рода, женская мудрость":"fate, loyalty, thread of lineage, feminine wisdom",
 "преображение, тайное знание, очищающая страсть":"transformation, secret knowledge, cleansing passion",
 "мудрость старца, прозрение, дар перемен":"elder's wisdom, insight, gift of change",
 "сила, опора, хозяин, защита рода":"strength, support, master, protection of kin",
 "дом, дети, продолжение рода, добрая весть":"home, children, continuation of lineage, good tidings",
 "одиночество вожака, верность стае, воля":"leader's solitude, loyalty to the pack, will",
 "хитрость, чутьё, тайна, поиск своего пути":"cunning, instinct, mystery, search for one's path",
 "упорство, труд, мощь, верность земле":"persistence, labor, might, loyalty to the land",
 "лад, семья, мир, доброта-кормилица":"harmony, family, peace, nurturing kindness",
 "взлёт, идеал, преображение героя":"ascent, ideal, hero's transformation",
 "устремление, свобода, путь, очищение":"aspiration, freedom, path, purification",
 /* --- Круг Жизни: годы --- */
 "Странникъ (Путь)":"Wanderer (Path)","Странникъ":"Wanderer","Жрецъ":"Priest","Жрица":"Priestess","Мiръ (Явь)":"World (Yav)","Мiръ":"World","Явь":"Yav","Свитокъ":"Scroll","Фениксъ":"Phoenix","Лисъ (Навь)":"Fox (Nav)","Лисъ":"Fox","Навь":"Nav","Драконъ":"Dragon","Дельфинъ":"Dolphin","Пёсъ":"Dog","Хоромы (Домъ)":"Halls (Home)","Хоромы":"Halls","Домъ":"Home","Капище (Храмъ)":"Temple (Sanctuary)","Капище":"Temple","Храмъ":"Sanctuary",
 /* --- Годы: описания --- */
 "вечный путник, первопроходец, лёгкий на подъём искатель.":"eternal wayfarer, pioneer, ever-ready seeker.",
 "хранитель знания, наставник, слово-закон, связь с Богами.":"keeper of knowledge, mentor, word-as-law, link to the Gods.",
 "интуиция и тайна, целительство, хранительница духа очага.":"intuition and mystery, healing, guardian of the hearth's spirit.",
 "миротворец и дипломат, равновесие, опора общины.":"peacemaker and diplomat, balance, pillar of the community.",
 "собиратель мудрости, память рода, учёный судьбы.":"gatherer of wisdom, memory of kin, scholar of fate.",
 "возрождение через огонь, преображение, несгибаемость.":"rebirth through fire, transformation, unbending will.",
 "хитрость и чутьё, скрытые тропы, мастер невидимого.":"cunning and instinct, hidden trails, master of the unseen.",
 "сила и власть, страж сокровищ, гордая мощь.":"strength and power, guardian of treasures, proud might.",
 "мудрость-обновление, тайное знание, дар врачевания.":"renewing wisdom, secret knowledge, gift of healing.",
 "высокий взгляд, воля вождя, духовный взлёт.":"lofty vision, leader's will, spiritual ascent.",
 "дружелюбие и спасение, поток радости, проводник меж миров.":"friendliness and rescue, flow of joy, guide between worlds.",
 "устремление и свобода, верность, неутомимый труженик пути.":"aspiration and freedom, loyalty, tireless toiler of the path.",
 "верность, защита, служение, чуткий страж.":"loyalty, protection, service, vigilant guardian.",
 "изобилие и упорство, плодородие, кормилец рода.":"abundance and persistence, fertility, provider of kin.",
 "дом и уют, гостеприимство, хранитель устоев.":"home and comfort, hospitality, keeper of traditions.",
 "святость и служение, завершение круга, мудрость предков.":"holiness and service, completion of the circle, wisdom of ancestors.",
 /* --- Стихии и цвета --- */
 "Звезда":"Star","Древо":"Tree","Свага":"Svaga","Океанъ":"Ocean","Богъ":"God",
 "Чёрный":"Black","Красный":"Red","Алый":"Scarlet","Златый":"Golden","Зелёный":"Green","Небесный":"Sky-blue","Синий":"Blue","Фиолетовый":"Violet","Белый":"White",
 /* --- Круголет: подписи и прозаические связки --- */
 "Аутентичный Даарийский Круголет Числобога":"Authentic Daarian Krugolet of Chislobog","Круголет Числобога (Даарийский)":"Krugolet of Chislobog (Daarian)","Круголет Числобога":"Krugolet of Chislobog","Круголет":"Krugolet","Числобога":"of Chislobog","Даарийский":"Daarian",
 "месяцев-Дайлетов":"months-Dailets","Чертогов Сварожьего Круга":"Halls of Svarog's Circle","Сварожьего Круга":"Svarog's Circle","144-летний Круг Жизни":"144-year Circle of Life","Круг Жизни":"Circle of Life","№ в Круге":"No. in the Circle","в Круге":"in the Circle",
 "Чертог рождения":"Hall of birth","Чертог ":"Hall ","Месяц-Дайлетъ":"Month (Dailet)","День Лѣта":"Day of the Year","(из 365/369)":"(of 365/369)","Лѣто рождения":"Year of birth","от С.М.З.Х.":"from S.M.Z.H.","С.М.З.Х.":"S.M.Z.H.",
 "в стихии":"in the element","Стихия ":"Element ","Стихий":"Elements","стихия":"element","цвет ":"color ","бог ":"god ","покровитель":"patron","Рождён в месяц":"Born in the month of","ныне ":"now ","Лѣто":"Year","Лѣт":"Years",
 /* --- Кнопки систем расчёта --- */
 "Ведическое ядро":"Vedic core","Ведическое":"Vedic","Майя":"Maya","Ба-Цзы":"Ba-Zi",
 /* --- Исток / Путь / Хроника --- */
 "Рождённый под накшатрой":"Born under the nakshatra","ты плавишь дни в свет":"you forge your days into light","идёт рядом":"walks beside you","с Лагной в":"with Lagna in","Уровень Света":"Level of Light","Серия дней":"Day streak","пройдено":"done","резонанс":"resonance","Хроника":"Chronicle","Кузница карт":"Card Forge","Превращения дня":"Transformations of the day",
 /* --- Намерения по умолчанию --- */
 "Утренняя практика":"Morning practice","Глубокая работа":"Deep work","Прогулка и тишина":"Walk and silence",
 /* --- Линзы --- */
 "Шумерская":"Sumerian","Зороастрийская":"Zoroastrian","Африканская":"African","линзы":"lenses","линза":"lens"
};
function go(){if(window.AwaraI18nDeep&&typeof AwaraI18nDeep.extend==='function'){AwaraI18nDeep.extend(D);return true;}return false;}
if(!go()){var t=0,iv=setInterval(function(){t++;if(go()||t>80)clearInterval(iv);},80);}
window.AwaraI18nDeep2={__ready:true,D:D};
})();
