// ============================================================
// Legacy Transfer — Core inheritance logic
// ============================================================

import type { Character } from '../types.js';

/** Transfer heirlooms from parent to child on death */
export function inheritLegacy(parent: Character, child: Character): void {
  // Inherit items
  for (const item of parent.inventory) {
    child.inventory.push({ ...item });
  }

  // Inherit knowledge (with some degradation)
  for (const knowledge of parent.knowledge) {
    if (knowledge.source !== 'experience') continue;
    child.knowledge.push({
      ...knowledge,
      source: 'inherited',
    });
  }

  // Inherit portion of fame
  child.fame += Math.floor(parent.fame * 0.3);

  // Inherit reputation (relationships marked as 'inherited')
  for (const rel of parent.relationships) {
    if (rel.strength > 0.5 || rel.strength < -0.5) {
      child.relationships.push({
        ...rel,
        strength: rel.strength * 0.5, // Diluted
      });
    }
  }
}
