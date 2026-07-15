/* AWARA - Interpreter / plain human language for all live AI answers. v1
   window.awaraHumanVoice() -> meta-directive appended to the system prompt so
   living responses (Tigel, Daimon) speak warm, plain human language and keep
   jargon (dosha, kapha, matrices...) only where it truly belongs.
   window.awaraLang() -> current UI language ('ru'|'en'). Pure additive. */
(function(){
'use strict';
if(window.awaraHumanVoice) return;
function lang(){ try{ if(window.AwaraI18n && AwaraI18n.lang) return AwaraI18n.lang; return (localStorage.getItem('awara_lang')||'ru'); }catch(e){ return 'ru'; } }
var V="=== INTERPRETER - PLAIN HUMAN LANGUAGE ===\nSpeak to a real, living person about their real day - warm, simple and clear, like a wise close friend. Whatever language you answer in, keep the wording human and down-to-earth.\nDo NOT pile on esoteric jargon. Specialized terms (dosha, kapha, vata, pitta, guna, nakshatra, matrix numbers and names, planetary degrees, signs and houses) must NOT appear casually or everywhere. Use such a term ONLY when it genuinely adds meaning right here - and when you do, immediately explain it in plain words in parentheses, e.g. 'vata (your lightness and restlessness)'.\nBy default, translate every esoteric idea into ordinary human language of feelings, experience and action. No jargon for the sake of jargon. The goal is to make things clearer and warmer for the person, never more complicated or confusing.";
window.awaraLang=lang;
window.awaraHumanVoice=function(){ return V; };
})();
