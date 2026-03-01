import { describe, it, expect, beforeEach } from 'vitest';
import {
  FameTracker,
  fameToCardRarity,
  FAME_THRESHOLDS,
  StandingMap,
  DebtLedger,
} from '../src/game/fame.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character } from '../src/types.js';

describe('Fame & Standing System', () => {
  let speciesId: string;
  let tracker: FameTracker;

  function makeChar(): Character {
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
  }

  beforeEach(() => {
    const existing = speciesRegistry.getByName('FameTester');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'FameTester',
        scientificName: 'Testus fameus',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'FT' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000 },
      });
      speciesId = sp.id;
    }

    tracker = new FameTracker();
  });

  describe('FameTracker', () => {
    it('records achievements and adds fame points', () => {
      const char = makeChar();
      tracker.recordAchievement(char, 'First Discovery', 10, 100);
      // 10 base points + 5 mythic tier bonus (first achiever)
      expect(char.fame).toBe(15);
      expect(char.achievements).toHaveLength(1);
      expect(char.achievements[0].name).toBe('First Discovery');
    });

    it('detects legendary status at threshold', () => {
      const char = makeChar();
      char.fame = FAME_THRESHOLDS.legendary - 1;
      expect(tracker.isLegendary(char)).toBe(false);
      char.fame = FAME_THRESHOLDS.legendary;
      expect(tracker.isLegendary(char)).toBe(true);
    });

    it('finalizes character fame on death', () => {
      const char = makeChar();
      char.fame = 200;
      tracker.recordAchievement(char, 'Great Fighter', 50, 500);
      const entry = tracker.finalizeCharacterFame(char, 'Age of Beasts');
      // 200 base + 50 points + tier bonus (varies by global count)
      expect(entry.fameScore).toBeGreaterThanOrEqual(250);
      expect(entry.era).toBe('Age of Beasts');
      expect(entry.achievements).toContain('Great Fighter');
    });

    it('adds notable characters to hall of fame', () => {
      const char = makeChar();
      char.fame = FAME_THRESHOLDS.notable;
      tracker.finalizeCharacterFame(char, 'Era 1');
      expect(tracker.getTopFamous()).toHaveLength(1);
    });

    it('does not add low-fame characters to hall', () => {
      const char = makeChar();
      char.fame = 10;
      tracker.finalizeCharacterFame(char, 'Era 1');
      expect(tracker.getTopFamous()).toHaveLength(0);
    });

    it('does not duplicate hall of fame entries', () => {
      const char = makeChar();
      char.fame = 200;
      tracker.finalizeCharacterFame(char, 'Era 1');
      tracker.finalizeCharacterFame(char, 'Era 1');
      expect(tracker.getTopFamous()).toHaveLength(1);
    });
  });

  describe('fameToCardRarity', () => {
    it('returns common for low fame', () => {
      expect(fameToCardRarity(0)).toBe('common');
      expect(fameToCardRarity(24)).toBe('common');
    });

    it('returns uncommon for modest fame', () => {
      expect(fameToCardRarity(25)).toBe('uncommon');
    });

    it('returns rare for notable fame', () => {
      expect(fameToCardRarity(50)).toBe('rare');
    });

    it('returns epic for famous characters', () => {
      expect(fameToCardRarity(150)).toBe('epic');
    });

    it('returns legendary for legendary fame', () => {
      expect(fameToCardRarity(500)).toBe('legendary');
    });

    it('returns mythic for mythical fame', () => {
      expect(fameToCardRarity(1500)).toBe('mythic');
    });
  });

  describe('StandingMap', () => {
    let standings: StandingMap;

    beforeEach(() => {
      standings = new StandingMap();
    });

    it('initializes neutral standing between species', () => {
      const s = standings.get('sp1', 'sp2');
      expect(s.standing).toBe(0);
      expect(s.interactions).toBe(0);
    });

    it('records positive interactions', () => {
      standings.recordInteraction('sp1', 'sp2', 0.3);
      standings.recordInteraction('sp1', 'sp2', 0.3);
      const s = standings.get('sp1', 'sp2');
      expect(s.standing).toBeCloseTo(0.6);
      expect(s.interactions).toBe(2);
    });

    it('detects hostile species', () => {
      standings.recordInteraction('sp1', 'sp2', -0.6);
      expect(standings.areHostile('sp1', 'sp2')).toBe(true);
      expect(standings.areHostile('sp2', 'sp1')).toBe(true); // Symmetric
    });

    it('detects allied species', () => {
      standings.recordInteraction('sp1', 'sp2', 0.6);
      expect(standings.areAllied('sp1', 'sp2')).toBe(true);
    });

    it('clamps standing to [-1, 1]', () => {
      for (let i = 0; i < 10; i++) {
        standings.recordInteraction('sp1', 'sp2', 0.5);
      }
      const s = standings.get('sp1', 'sp2');
      expect(s.standing).toBeLessThanOrEqual(1);
    });

    it('ignores same-species interactions', () => {
      standings.recordInteraction('sp1', 'sp1', 0.5);
      const s = standings.get('sp1', 'sp1');
      expect(s.interactions).toBe(0);
    });
  });

  describe('DebtLedger', () => {
    let ledger: DebtLedger;

    beforeEach(() => {
      ledger = new DebtLedger();
    });

    it('tracks debts between characters', () => {
      ledger.addDebt('debtor', 'creditor', 'borrowed food', 0.5, 100);
      const debts = ledger.getDebts('debtor');
      expect(debts).toHaveLength(1);
      expect(debts[0].reason).toBe('borrowed food');
    });

    it('tracks credits owed to character', () => {
      ledger.addDebt('debtor', 'creditor', 'favor', 0.3, 100);
      const credits = ledger.getCredits('creditor');
      expect(credits).toHaveLength(1);
    });

    it('resolves debts', () => {
      const debt = ledger.addDebt('d', 'c', 'test', 0.5, 100);
      ledger.resolve(debt.id);
      expect(ledger.getDebts('d')).toHaveLength(0);
    });

    it('transfers debts with dilution on inheritance', () => {
      ledger.addDebt('parent', 'creditor', 'old debt', 1.0, 100);
      ledger.transferDebts('parent', 'heir');
      const heirDebts = ledger.getDebts('heir');
      expect(heirDebts).toHaveLength(1);
      expect(heirDebts[0].magnitude).toBeCloseTo(0.7); // 70% dilution
    });
  });
});
