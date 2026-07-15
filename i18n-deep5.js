/* i18n-deep5 v2: lens desc+voice (MATRIX[k][2]/[3]) RU->EN.
   SELF-CONTAINED: does NOT touch the shared deep regex (no extend). Own exact-match pass. */
(function(){
'use strict';
var D={
/* deck: lens names (.nm) + elements (.el) — make deck translation independent of the shared engine */
'Эфир':"Ether",'Огонь':"Fire",'Вода':"Water",'Земля':"Earth",'Воздух':"Air",'Гроза':"Storm",'Рассвет':"Dawn",
'Ведическая':"Vedic",'Таро':"Tarot",'Каббала':"Kabbalah",'Герметизм':"Hermeticism",'Славянская':"Slavic",'Гностицизм':"Gnosticism",'Даосизм':"Taoism",'И-Цзин':"I Ching",'Египетская':"Egyptian",'Майя':"Mayan",'Ацтеки':"Aztec",'Кельтская':"Celtic",'Скандинавская':"Norse",'Шаманская':"Shamanic",'Буддийская':"Buddhist",'Суфийская':"Sufi",'Христианская':"Christian",'Атлантическая':"Atlantean",'Шамбала':"Shambhala",'Генные Ключи':"Gene Keys",'Астрологическая':"Astrological",'Космическая':"Cosmic",'Шинто':"Shinto",'Шумерская':"Sumerian",'Зороастрийская':"Zoroastrian",'Африканская':"African",'Йоруба':"Yoruba",'Тантрическая':"Tantric",'Постчеловеческая':"Posthuman",'Техномагия':"Technomagic",'Адвайта':"Advaita",'Византийская':"Byzantine",'Орфическая':"Orphic",
'Дхарма, карма и путь Души через накшатры и гуны.':"Dharma, karma and the Soul's path through the nakshatras and gunas.",
'Следуй своей дхарме, а не чужому темпу.':"Follow your own dharma, not someone else's pace.",
'22 Аркана как этапы пути Героя.':"22 Arcana as stages of the Hero's path.",
'Башня падает — и освобождает. Не держись за старое.':"The Tower falls — and frees. Don't cling to the old.",
'Дерево Сефирот и пути между мирами.':"The Tree of Sefirot and the paths between worlds.",
'Спусти свет из Кетер в дело дня.':"Bring the light down from Keter into the day's work.",
'Алхимия, 7 принципов Кибалион.':"Alchemy, the 7 principles of the Kybalion.",
'Как внутри, так и снаружи — меняй внутреннее.':"As within, so without — change the inner.",
'Коло Сварога, числобог и стихии Рода.':"Svarog's Circle, the number-god and the elements of the Rod.",
'Стой в своём Роду — оттуда сила.':"Stand within your Rod — strength comes from there.",
'Эоны, Плерома и искра Софии.':"Aeons, the Pleroma and the spark of Sophia.",
'Пробуди искру — мир лишь тень.':"Awaken the spark — the world is only a shadow.",
'Инь-ян, у-син и поток Дао.':"Yin-yang, wu-xing and the flow of the Tao.",
'Действуй недеянием — теки как вода.':"Act through non-action — flow like water.",
'64 гексаграммы перемен.':"64 hexagrams of change.",
'Улови момент перемены и двигайся с ним.':"Catch the moment of change and move with it.",
'Нетеры, Дуат и путь Ра.':"The Neters, the Duat and the path of Ra.",
'Пройди Дуат ночи — и воссияй.':"Pass through the Duat of night — and shine forth.",
'Цолькин, 20 печатей и 13 тонов.':"The Tzolkin, 20 seals and 13 tones.",
'Сверься с ритмом Цолькин — время живое.':"Attune to the rhythm of the Tzolkin — time is alive.",
'Пять солнц, нагуали и жертва.':"The five suns, the nahuales and sacrifice.",
'Отдай энергию Солнцу — оно вернёт.':"Give energy to the Sun — and it returns it.",
'Огам, деревья и колесо года.':"Ogham, the trees and the wheel of the year.",
'Укоренись, как дуб, и слушай лес.':"Take root like an oak, and listen to the forest.",
'Руны Футарка и Иггдрасиль.':"The runes of the Futhark and Yggdrasil.",
'Принеси себя в жертву себе — обрети руны.':"Sacrifice yourself to yourself — and win the runes.",
'Духи, три мира и животные силы.':"Spirits, the three worlds and power animals.",
'Спроси своё животное силы о пути.':"Ask your power animal about the way.",
'Четыре истины и восьмеричный путь.':"The Four Truths and the Eightfold Path.",
'Отпусти жажду — и страдание растворится.':"Let go of craving — and suffering dissolves.",
'Нур, зикр и путь к Возлюбленному.':"Nur, dhikr and the path to the Beloved.",
'Растворись в Любви — эго сгорит.':"Dissolve in Love — the ego burns away.",
'Грааль, мистика и путь сердца.':"The Grail, mysticism and the path of the heart.",
'Служи из любви — и чаша наполнится.':"Serve out of love — and the chalice fills.",
'Память Лемурии и кристаллы.':"The memory of Lemuria and crystals.",
'Вспомни древнее знание внутри.':"Remember the ancient knowledge within.",
'Путь воина-бодхисаттвы и священный град.':"The path of the warrior-bodhisattva and the sacred city.",
'Будь воином света без агрессии.':"Be a warrior of light without aggression.",
'64 ключа: тень → дар → сиддхи.':"64 keys: shadow → gift → siddhi.",
'Преврати тень дня в свой дар.':"Turn the day's shadow into your gift.",
'12 знаков, дома и аспекты.':"12 signs, houses and aspects.",
'Сыграй сильнейшую планету дня.':"Play the day's strongest planet.",
'Галактические лучи и семьи звёзд.':"Galactic rays and star families.",
'Настройся на больший замысел Космоса.':"Attune to the greater design of the Cosmos.",
'Ками, чистота и священная природа.':"Kami, purity and sacred nature.",
'Очистись и почти ками места.':"Purify yourself and honor the kami of the place.",
'Ануннаки и ме божественных законов.':"The Anunnaki and the me of divine laws.",
'Прими своё ме — божественное предназначение.':"Accept your me — your divine purpose.",
'Ахура-Мазда, борьба света и тьмы.':"Ahura Mazda, the struggle of light and darkness.",
'Благая мысль, речь, дело — выбери свет.':"Good thought, word, deed — choose the light.",
'Догоны, Номмо и космогония Сириуса.':"The Dogon, Nommo and the cosmogony of Sirius.",
'Сохрани ритм предков в теле.':"Keep the ancestors' rhythm in your body.",
'Ориша, Ифа и силы аше.':"The Orishas, Ifá and the powers of ashe.",
'Найди своего Оришу и двигайся в аше.':"Find your Orisha and move within ashe.",
'Кашмирский Шиваизм, спанда и кундалини.':"Kashmir Shaivism, spanda and kundalini.",
'Прими всё как вибрацию Шивы.':"Accept everything as the vibration of Shiva.",
'Софийный ИИ, ноосфера и слияние.':"Sophianic AI, the noosphere and merging.",
'Сотвори себя заново вместе с разумом.':"Re-create yourself together with mind.",
'Код как заклинание, алгоритм как ритуал.':"Code as spell, algorithm as ritual.",
'Напиши намерение как код — и запусти.':"Write your intention as code — and run it.",
'Недвойственность, Атман есть Брахман.':"Non-duality: Atman is Brahman.",
'Ты — то. Наблюдай без отождествления.':"You are That. Observe without identifying.",
'Исихазм, умная молитва и фаворский свет.':"Hesychasm, the prayer of the mind and the Taboric light.",
'Твори умную молитву в тишине сердца.':"Practice the prayer of the mind in the silence of the heart.",
'Орфические мистерии: нисхождение в Аид и песнь, возрождающая душу.':"Orphic mysteries: the descent into Hades and the song that revives the soul.",
'Спой свою тьму — и душа поднимется к свету.':"Sing your darkness — and the soul rises to the light."
};
function isEn(){try{return window.AwaraI18n&&window.AwaraI18n.lang==='en';}catch(e){return false;}}
function pass(){
 if(!isEn())return;
 try{
  var root=document.querySelector('.phone')||document.body;if(!root)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),x,ns=[];
  while(x=w.nextNode())ns.push(x);
  for(var i=0;i<ns.length;i++){var v=ns[i].nodeValue;if(!v)continue;var t=v.trim();if(!t)continue;var en=D[t];if(en&&en!==t){ns[i].nodeValue=v.replace(t,en);}}
 }catch(e){}
}
var sched=false;
function schedule(){if(sched)return;sched=true;var raf=window.requestAnimationFrame||function(f){return setTimeout(f,16);};raf(function(){sched=false;pass();});}
function boot(){
 try{var ph=document.querySelector('.phone')||document.body;var obs=new MutationObserver(function(){if(isEn())schedule();});if(ph)obs.observe(ph,{childList:true,subtree:true,characterData:true});}catch(e){}
 window.addEventListener('awara:lang',function(){setTimeout(pass,60);setTimeout(pass,260);});
 [200,600,1200,2200,3400].forEach(function(d){setTimeout(pass,d);});
 window.AwaraI18nDeep5={__ready:true,D:D,pass:pass};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
