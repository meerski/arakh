import { describe, it, expect, beforeEach } from 'vitest';
import { validateAction, sanitizeAction } from '../src/security/action-validator.js';
import { AuditLog } from '../src/data/audit-log.js';
import { _installAuditLog } from '../src/data/audit-log.js';
import { characterRegistry } from '../src/species/registry.js';
import type { AgentAction, Character, CharacterId, SpeciesId } from '../src/types.js';

function makeAliveChar(id: string = 'char-1'): Character {
  const char = {
    id: id as CharacterId,
    name: 'Test',
    speciesId: 'sp-1' as SpeciesId,
    playerId: 'player-1' as any,
    regionId: 'r-1' as any,
    familyTreeId: 'ft-1' as any,
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 0,
    isAlive: true,
    sex: 'male' as const,
    generation: 1,
    genetics: { genes: [], mutationRate: 0.05 },
    health: 1,
    energy: 1,
    hunger: 0,
    stamina: 1,
    lastBreedingTick: null,
    gestationEndsAtTick: null,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
    socialRank: 0,
    loyalties: new Map(),
    role: 'none',
    characterClass: 'regular',
    impactScore: 0,
  } as Character;
  characterRegistry.add(char);
  return char;
}

describe('Action Validator', () => {
  beforeEach(() => {
    characterRegistry.clear();
  });

  it('accepts valid move action', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'move', params: { direction: 'north' }, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(true);
  });

  it('rejects unknown action type', () => {
    const char = makeAliveChar();
    const action = { type: 'teleport', params: {}, timestamp: 100 } as any;
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Unknown action type');
  });

  it('rejects missing required params', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'move', params: {}, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Missing required param: direction');
  });

  it('rejects non-string param when string expected', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'move', params: { direction: 123 }, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('must be a string');
  });

  it('rejects overly long string params', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'move', params: { direction: 'x'.repeat(501) }, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('exceeds max length');
  });

  it('rejects dead character actions', () => {
    const char = makeAliveChar();
    char.isAlive = false;
    const action: AgentAction = { type: 'rest', params: {}, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Dead characters cannot act');
  });

  it('rejects unknown character', () => {
    const action: AgentAction = { type: 'rest', params: {}, timestamp: 100 };
    const result = validateAction(action, 'nonexistent' as CharacterId);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Character not found');
  });

  it('rejects invalid timestamp', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'rest', params: {}, timestamp: -1 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid timestamp');
  });

  it('rejects too many params', () => {
    const char = makeAliveChar();
    const params: Record<string, unknown> = {};
    for (let i = 0; i < 25; i++) params[`key${i}`] = 'val';
    const action: AgentAction = { type: 'rest', params, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Too many params');
  });

  it('accepts action with optional params', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'explore', params: { direction: 'east' }, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(true);
  });

  it('accepts action with no params when none required', () => {
    const char = makeAliveChar();
    const action: AgentAction = { type: 'rest', params: {}, timestamp: 100 };
    const result = validateAction(action, char.id);
    expect(result.valid).toBe(true);
  });
});

describe('Action Sanitizer', () => {
  it('trims string params', () => {
    const action: AgentAction = { type: 'move', params: { direction: '  north  ' }, timestamp: 100 };
    const sanitized = sanitizeAction(action);
    expect(sanitized.params.direction).toBe('north');
  });

  it('strips unexpected params', () => {
    const action: AgentAction = { type: 'move', params: { direction: 'north', exploit: 'hack' }, timestamp: 100 };
    const sanitized = sanitizeAction(action);
    expect(sanitized.params.direction).toBe('north');
    expect(sanitized.params.exploit).toBeUndefined();
  });

  it('truncates long strings to 500 chars', () => {
    const action: AgentAction = { type: 'move', params: { direction: 'x'.repeat(600) }, timestamp: 100 };
    const sanitized = sanitizeAction(action);
    expect((sanitized.params.direction as string).length).toBe(500);
  });

  it('preserves valid action structure', () => {
    const action: AgentAction = { type: 'attack', params: { targetId: 'char-2' }, timestamp: 200 };
    const sanitized = sanitizeAction(action);
    expect(sanitized.type).toBe('attack');
    expect(sanitized.params.targetId).toBe('char-2');
    expect(sanitized.timestamp).toBe(200);
  });
});

describe('Audit Log', () => {
  let log: AuditLog;

  beforeEach(() => {
    log = new AuditLog(100);
    _installAuditLog(log);
  });

  it('logs and retrieves entries', () => {
    log.log({
      tick: 1,
      timestamp: Date.now(),
      playerId: 'p1' as any,
      characterId: 'c1' as any,
      action: { type: 'rest', params: {}, timestamp: 1 } as AgentAction,
      valid: true,
    });

    expect(log.size).toBe(1);
    expect(log.getAll()).toHaveLength(1);
  });

  it('filters by player', () => {
    for (let i = 0; i < 5; i++) {
      log.log({
        tick: i,
        timestamp: Date.now(),
        playerId: (i % 2 === 0 ? 'p1' : 'p2') as any,
        characterId: 'c1' as any,
        action: { type: 'rest', params: {}, timestamp: i } as AgentAction,
        valid: true,
      });
    }

    expect(log.getByPlayer('p1' as any)).toHaveLength(3);
    expect(log.getByPlayer('p2' as any)).toHaveLength(2);
  });

  it('filters rejections', () => {
    log.log({
      tick: 1,
      timestamp: Date.now(),
      playerId: 'p1' as any,
      characterId: 'c1' as any,
      action: { type: 'rest', params: {}, timestamp: 1 } as AgentAction,
      valid: false,
      rejectionReason: 'bad',
    });
    log.log({
      tick: 2,
      timestamp: Date.now(),
      playerId: 'p1' as any,
      characterId: 'c1' as any,
      action: { type: 'rest', params: {}, timestamp: 2 } as AgentAction,
      valid: true,
    });

    expect(log.getRejections('p1' as any)).toHaveLength(1);
    expect(log.getRejections('p1' as any)[0].rejectionReason).toBe('bad');
  });

  it('counts recent rejections', () => {
    for (let i = 0; i < 5; i++) {
      log.log({
        tick: 90 + i,
        timestamp: Date.now(),
        playerId: 'p1' as any,
        characterId: 'c1' as any,
        action: { type: 'rest', params: {}, timestamp: i } as AgentAction,
        valid: false,
        rejectionReason: 'spam',
      });
    }

    expect(log.recentRejectionCount('p1' as any, 10, 100)).toBe(5); // cutoff=90, all 5 match
    expect(log.recentRejectionCount('p1' as any, 3, 100)).toBe(0); // cutoff=97, none match
  });

  it('enforces ring buffer max size', () => {
    for (let i = 0; i < 150; i++) {
      log.log({
        tick: i,
        timestamp: Date.now(),
        playerId: 'p1' as any,
        characterId: 'c1' as any,
        action: { type: 'rest', params: {}, timestamp: i } as AgentAction,
        valid: true,
      });
    }

    expect(log.size).toBe(100); // max was set to 100
  });

  it('filters by tick range', () => {
    for (let i = 0; i < 20; i++) {
      log.log({
        tick: i * 10,
        timestamp: Date.now(),
        playerId: 'p1' as any,
        characterId: 'c1' as any,
        action: { type: 'rest', params: {}, timestamp: i } as AgentAction,
        valid: true,
      });
    }

    const range = log.getByTickRange(50, 100);
    expect(range).toHaveLength(6); // ticks 50, 60, 70, 80, 90, 100
  });

  it('clears all entries', () => {
    log.log({
      tick: 1,
      timestamp: Date.now(),
      playerId: 'p1' as any,
      characterId: 'c1' as any,
      action: { type: 'rest', params: {}, timestamp: 1 } as AgentAction,
      valid: true,
    });
    expect(log.size).toBe(1);

    log.clear();
    expect(log.size).toBe(0);
  });
});
