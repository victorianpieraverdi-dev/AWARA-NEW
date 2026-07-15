// Prompt generator for Daimon image creation
// Produces copy-paste prompts for GPT or Grok image generation

const CHAKRA_NAMES = [
  '', 'Muladhara', 'Svadhisthana', 'Manipura', 'Anahata',
  'Vishuddha', 'Ajna', 'Sahasrara', 'Bindu', 'Atman'
];

const ELEMENT_VISUAL = {
  Fire:  'warm golden and crimson hues, flames flickering around the form',
  Water: 'deep blue and turquoise hues, flowing water energy around the form',
  Air:   'silver and pale blue hues, wisps of wind swirling around the form',
  Earth: 'rich brown and emerald hues, crystalline earth energy at the base',
  Ether: 'violet and ultraviolet hues, cosmic starfield emanating from the form'
};

const TIER_TEMPLATES = {
  Common: {
    prefix: 'A natural',
    style: 'realistic animal portrait, soft lighting, earthy tones',
    aura: 'subtle natural aura'
  },
  Uncommon: {
    prefix: 'An enhanced',
    style: 'semi-realistic spiritual animal, gentle glow, natural sacred geometry',
    aura: 'visible energy field'
  },
  Rare: {
    prefix: 'A refined',
    style: 'mystical creature, luminous sacred geometry patterns, celestial background',
    aura: 'strong luminous aura with geometric patterns'
  },
  Epic: {
    prefix: 'A transcendent',
    style: 'ethereal being of light, complex sacred geometry, cosmic fractal patterns',
    aura: 'radiant multi-layered aura with fractals and mandalas'
  },
  Mythic: {
    prefix: 'A cosmic',
    style: 'cosmic deity form, nebula background, divine light rays, golden sacred geometry',
    aura: 'cosmic energy field spanning galaxies, golden mandala crown'
  },
  Legendary: {
    prefix: 'A divine',
    style: 'pure light being, transcendent form dissolving into golden light, infinite sacred geometry',
    aura: 'infinite golden light emanation, the form IS the cosmos itself'
  }
};

const PLATFORM_SUFFIX = {
  gpt: 'Digital painting, 4K resolution, highly detailed, dramatic lighting, dark background (#02010a). AWARA game aesthetic: gold (#ffd700) on deep black, Vedic mysticism meets cosmic art.',
  grok: 'Style: digital painting, 4K, highly detailed. Dramatic lighting on deep black background (#02010a). Gold (#ffd700) accents. Vedic mysticism meets cosmic art aesthetic. Game character portrait.'
};

/**
 * Generate a prompt for creating a Daimon image.
 * @param {Object} daimon - Player daimon from localStorage (level, tier, formId, activeChakra)
 * @param {Object} form - Daimon form data from daimon_forms.json
 * @param {string} platform - 'gpt' or 'grok'
 * @returns {string} prompt text
 */
export function generateDaimonPrompt(daimon, form, platform) {
  if (!daimon || !form) return '';

  var tier = daimon.tier || 'Common';
  var level = daimon.level || 1;
  var chakra = daimon.activeChakra || 1;
  var template = TIER_TEMPLATES[tier] || TIER_TEMPLATES.Common;

  var species = form.species ? form.species.en : 'creature';
  var kingdom = form.kingdom || 'Beast';
  var element = form.element || 'Fire';
  var archetype = form.archetype || 'Guardian';
  var description = form.description ? form.description.en : '';
  var elementVisual = ELEMENT_VISUAL[element] || ELEMENT_VISUAL.Fire;
  var chakraName = CHAKRA_NAMES[chakra] || 'Muladhara';

  var parts = [];

  // Core description
  parts.push(template.prefix + ' ' + species + ' spirit guardian from the ' + kingdom + ' kingdom.');
  parts.push(archetype + ' archetype, ' + element + ' element.');

  // Form description
  if (description) {
    parts.push(description + '.');
  }

  // Visual style
  parts.push('Visual style: ' + template.style + '.');

  // Element visual
  parts.push('Element manifestation: ' + elementVisual + '.');

  // Aura and energy
  parts.push('Aura: ' + template.aura + '.');

  // Chakra
  parts.push('Active chakra: ' + chakraName + ' (' + chakra + '/9), glowing at the corresponding energy center.');

  // Level context
  parts.push('Level ' + level + ' ' + tier + ' tier creature.');

  // Tier-specific additions
  if (tier === 'Epic' || tier === 'Mythic' || tier === 'Legendary') {
    parts.push('Third eye open, radiating wisdom light.');
  }
  if (tier === 'Mythic' || tier === 'Legendary') {
    parts.push('Surrounded by a mandala of golden sacred geometry, cosmic nebula background with stars.');
  }
  if (tier === 'Legendary') {
    parts.push('The physical form is dissolving into pure golden light. Only the essence remains -- a being of infinite radiance.');
  }

  // Platform suffix
  var suffix = PLATFORM_SUFFIX[platform] || PLATFORM_SUFFIX.gpt;
  parts.push(suffix);

  return parts.join('\n\n');
}
