import { describe, it, expect, beforeEach } from 'vitest';
import {
  processExtinctionCascade,
  createEcosystemState,
  addFoodWebRelation,
} from '../src/simulation/ecosystem.js';
import { speciesRegistry } from '../src/species/species.js';
import type { EcosystemState } from '../src/simulation/ecosystem.js';

describe('Predation & Extinction Cascades', () => {
  let ecosystem: EcosystemState;
  let herbivoreId: string;
  let carnivoreId: string;
  let preyId: string;

  function getOrRegister(name: string, overrides: Record<string, unknown> = {}): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Predtest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'PredFam', genus: 'PredGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 50, lifespan: 5000, ...overrides },
    });
    return sp.id;
  }

  beforeEach(() => {
    ecosystem = createEcosystemState();
    herbivoreId = getOrRegister('CascadeHerbivore', { diet: 'herbivore', size: 30 });
    carnivoreId = getOrRegister('CascadeCarnivore', { diet: 'carnivore', size: 60 });
    preyId = getOrRegister('CascadePrey', { diet: 'herbivore', size: 20 });
  });

  describe('processExtinctionCascade', () => {
    it('generates food_loss events for predators of extinct species', () => {
      // Carnivore eats herbivore; herbivore goes extinct
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.15);

      const events = processExtinctionCascade(herbivoreId, ecosystem, 100);

      const foodLoss = events.find(e =>
        e.effects.some(eff => eff.type === 'food_loss' && eff.speciesId === carnivoreId),
      );
      expect(foodLoss).toBeDefined();
      expect(foodLoss!.type).toBe('extinction');
      expect(foodLoss!.level).toBe('species');
    });

    it('generates predator_release events for prey of extinct species', () => {
      // Carnivore eats prey; carnivore goes extinct, prey is released
      addFoodWebRelation(ecosystem, carnivoreId, preyId, 0.1);

      const events = processExtinctionCascade(carnivoreId, ecosystem, 200);

      const release = events.find(e =>
        e.effects.some(eff => eff.type === 'predator_release' && eff.speciesId === preyId),
      );
      expect(release).toBeDefined();
      expect(release!.description).toContain('grow unchecked');
    });

    it('generates vegetation_recovery event when herbivore goes extinct', () => {
      const events = processExtinctionCascade(herbivoreId, ecosystem, 300);

      const recovery = events.find(e =>
        e.effects.some(eff => eff.type === 'vegetation_recovery'),
      );
      expect(recovery).toBeDefined();
      expect(recovery!.description).toContain('vegetation reclaims');
    });
  });
});
