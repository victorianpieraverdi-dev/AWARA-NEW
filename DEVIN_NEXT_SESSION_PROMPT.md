# DEVIN SESSION PROMPT: Continue Daimon System — Phase 4-5 + PR Merge

## BEFORE YOU START
1. Read `AWARA_RULES.md`
2. Read `HANDOFF.md`
3. Read full spec: download attachment or find in repo root `DEVIN_PROMPT_DAIMON_INTEGRATION.md` (if present), otherwise user will re-attach

## CURRENT STATE

### Branch: `feature/daimon-system-core`
All work is on this branch. PR #153 is open → master.

### What's DONE (DO NOT redo):
- **M-012**: Bilingual i18n (EN/RU) on all 12 pages — MERGED (PR #154)
- **Phase 1 (T-101..T-104)**: Daimon data, natal calculator, dosha calculator, locales
- **Phase 2 (T-201..T-210)**: Daimon creation UI (quick select, natal chart, random gift, gallery, confirmation)
- **Phase 3 (T-301..T-305)**: XP manager, level progression 1-100, level up/evolution, daimon stats component, daily practice tracker
- **T-401**: Dosha quiz UI page (`pages/dosha-quiz.html`) — uses DOSHA_QUIZ from `js/modules/dosha-calculator.js`

### What NEEDS to be done:

#### T-402: Dietary recommendations database (8 min)
- Create `/data/ayurveda/dietary_recommendations.json`
- Structure: 3 doshas (Vata/Pitta/Kapha), each with:
  - favorable foods (grains, proteins, vegetables, fruits, spices, beverages)
  - unfavorable foods
  - eating_habits (bilingual ru/en)
  - recipes (3-5 per dosha, bilingual)
  - seasonal_adjustments (summer/winter/spring/autumn)
- Bilingual content (RU/EN)

#### T-403: Nutrition recommendations UI page (10 min)
- Create `/pages/nutrition.html` + `/js/nutrition.js`
- Display user's dosha (from localStorage `awara_player_dosha`)
- Show favorable/unfavorable foods
- Seasonal recommendations based on current month
- Link back to dosha quiz for retake
- AWARA style (gold on black, Cinzel/Cormorant/JetBrains fonts)
- Bilingual RU/EN

#### T-501: Prompt generation module (10 min)
- Create `/js/modules/prompt-generator.js`
- Function: `generateDaimonPrompt(daimon, platform)` where platform = 'gpt' or 'grok'
- Include: species, kingdom, element, archetype, tier, level, chakra, natal data
- Different templates per tier (Common = simple, Legendary = divine)
- Output: string prompt ready for copy-paste into GPT/Grok

#### T-502: Image generation UI page (10 min)
- Create `/pages/generate-image.html`
- Show generated prompt in readonly textarea
- "Copy to clipboard" button
- Platform selector (GPT / Grok)
- Instructions for use
- Preview area for manually uploaded images
- AWARA style, bilingual

### AFTER completing T-402..T-502:

1. Add i18n keys to `js/i18n.js` if needed (RU + EN sections)
2. Update `HANDOFF.md` (Текущая смена + new log entry)
3. Commit each task separately:
   ```
   feat(daimon): T-402 -- база диетических рекомендаций по дошам
   feat(daimon): T-403 -- страница рекомендаций по питанию
   feat(daimon): T-501 -- модуль генерации промптов для изображений
   feat(daimon): T-502 -- UI генерации изображений Даймона
   ```
4. Push to `feature/daimon-system-core`
5. Update PR #153 description to cover Phase 1-5
6. Ask user to merge PR #153

## GIT SETUP

Remote requires PAT for push (Devin proxy returns 403).
User provides PAT at session start. Use it like:
```bash
git remote set-url origin https://<PAT>@github.com/victorianpieraverdi-dev/awara-game.git
git push origin feature/daimon-system-core
# Restore after push:
git remote set-url origin https://github.com/victorianpieraverdi-dev/awara-game.git
```

## KEY FILES (already exist, DO NOT recreate):
- `js/i18n.js` — main i18n with DICT (ru/en), getLang(), translatePage(), createLangSwitcher()
- `js/modules/dosha-calculator.js` — DOSHA_QUIZ, calculateDoshaFromQuiz(), calculateDoshaFromNatal()
- `js/modules/daimon-manager.js` — loadPlayerDaimon(), getDaimonForm(), createPlayerDaimon()
- `js/modules/xp-manager.js` — addXP(), checkLevelUp(), getXPToNextLevel()
- `js/modules/natal-calculator.js` — calculateNatalChart()
- `data/daimons/daimon_forms.json` — 21 daimon forms
- `data/daimons/level_progression.json` — levels 1-100
- `css/daimon-create.css` — shared styles for new pages
- `pages/daimon-create.html` — creation UI (working)
- `pages/daily-practice.html` — daily tracker (working)
- `pages/dosha-quiz.html` — dosha quiz (working)

## CRITICAL RULES
- NO emojis anywhere
- NO CSS changes to existing M-012 pages
- Pure vanilla JS ES6+ (no frameworks)
- localStorage keys: `awara_*` prefix
- Commit messages in Russian, format: `feat(daimon): T-XXX -- описание`
- Mobile responsive (375/768/1024)
- AWARA visual style: gold (#c9a84c/#ffd700) on black (#02010a)
- Fonts: Cinzel (headings), Cormorant Garamond (body), JetBrains Mono (UI/code)
- All UI text bilingual (RU/EN)
- Comments in English, variable names in English

## TESTING
```bash
cd /path/to/awara-game
python3 -m http.server 8765
# Open http://localhost:8765/pages/nutrition.html
# Open http://localhost:8765/pages/generate-image.html
# Open http://localhost:8765/pages/dosha-quiz.html
# Verify no console errors (F12)
# Test RU/EN switch
```

## SUCCESS CRITERIA
- [ ] T-402..T-502 all implemented and committed
- [ ] All pages render without console errors
- [ ] RU/EN switching works on all new pages
- [ ] Mobile responsive (test 375px)
- [ ] Push to feature/daimon-system-core
- [ ] PR #153 updated with Phase 4-5 description
- [ ] HANDOFF.md updated
