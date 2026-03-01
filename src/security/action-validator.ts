// ============================================================
// Action Validator — Schema Validation Per Action Type
// ============================================================
// Validates action payloads before processing. Rejects malformed,
// out-of-bounds, or logically impossible actions.

import type { AgentAction, ActionType, Character, CharacterId } from '../types.js';
import { characterRegistry } from '../species/registry.js';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/** Parameter schemas per action type. Each entry lists required and optional params. */
const ACTION_SCHEMAS: Record<ActionType, {
  required?: string[];
  optional?: string[];
  stringParams?: string[];
  numberParams?: string[];
}> = {
  move:            { required: ['direction'], stringParams: ['direction', 'regionId'] },
  explore:         { optional: ['area', 'direction'], stringParams: ['area', 'direction'] },
  forage:          { optional: ['target'], stringParams: ['target'] },
  hunt:            { optional: ['target', 'targetId'], stringParams: ['target', 'targetId'] },
  rest:            {},
  build:           { optional: ['structure', 'material'], stringParams: ['structure', 'material'] },
  craft:           { optional: ['item', 'materials'], stringParams: ['item'] },
  gather:          { optional: ['resource', 'target'], stringParams: ['resource', 'target'] },
  scavenge:        { optional: ['area'], stringParams: ['area'] },
  communicate:     { optional: ['targetId', 'message'], stringParams: ['targetId', 'message'] },
  trade:           { optional: ['targetId', 'offer', 'request'], stringParams: ['targetId'] },
  ally:            { optional: ['targetId'], stringParams: ['targetId'] },
  attack:          { required: ['targetId'], stringParams: ['targetId'] },
  defend:          { optional: ['from'], stringParams: ['from'] },
  flee:            { optional: ['direction'], stringParams: ['direction'] },
  breed:           { optional: ['targetId'], stringParams: ['targetId'] },
  teach:           { optional: ['targetId', 'topic'], stringParams: ['targetId', 'topic'] },
  learn:           { optional: ['topic', 'from'], stringParams: ['topic', 'from'] },
  experiment:      { optional: ['subject', 'hypothesis'], stringParams: ['subject', 'hypothesis'] },
  observe:         { optional: ['target', 'targetId'], stringParams: ['target', 'targetId'] },
  inspect:         { optional: ['target', 'targetId'], stringParams: ['target', 'targetId'] },
  propose:         { required: ['targetId', 'proposal'], stringParams: ['targetId', 'proposal'] },
  respond:         { required: ['response'], stringParams: ['response'] },
  assign_role:     { required: ['targetId', 'role'], stringParams: ['targetId', 'role'] },
  domesticate:     { required: ['targetId'], stringParams: ['targetId'] },
  spy:             { required: ['targetRegionId'], stringParams: ['targetRegionId'] },
  infiltrate:      { required: ['targetId'], stringParams: ['targetId'] },
  spread_rumors:   { required: ['targetId'], stringParams: ['targetId'] },
  counter_spy:     {},
  share_intel:     { required: ['targetId'], stringParams: ['targetId'] },
  betray:          { required: ['targetId'], stringParams: ['targetId'] },
  colony_forage:   { optional: ['area'], stringParams: ['area'] },
  colony_defend:   { optional: ['from'], stringParams: ['from'] },
  colony_expand:   { optional: ['direction'], stringParams: ['direction'] },
  colony_construct: { optional: ['structure'], stringParams: ['structure'] },
  colony_reproduce: {},
};

/** Validate an action payload before processing. */
export function validateAction(action: AgentAction, characterId: CharacterId): ValidationResult {
  // 1. Validate action type exists
  if (!action.type || !(action.type in ACTION_SCHEMAS)) {
    return { valid: false, reason: `Unknown action type: ${String(action.type)}` };
  }

  // 2. Validate params is an object
  if (!action.params || typeof action.params !== 'object' || Array.isArray(action.params)) {
    return { valid: false, reason: 'Action params must be a plain object' };
  }

  // 3. Validate required params exist
  const schema = ACTION_SCHEMAS[action.type];
  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in action.params) || action.params[key] === undefined || action.params[key] === null) {
        return { valid: false, reason: `Missing required param: ${key}` };
      }
    }
  }

  // 4. Validate string params are actually strings and not too long
  if (schema.stringParams) {
    for (const key of schema.stringParams) {
      const val = action.params[key];
      if (val !== undefined && val !== null) {
        if (typeof val !== 'string') {
          return { valid: false, reason: `Param ${key} must be a string` };
        }
        if ((val as string).length > 500) {
          return { valid: false, reason: `Param ${key} exceeds max length (500)` };
        }
      }
    }
  }

  // 5. Validate the character is alive
  const character = characterRegistry.get(characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  if (!character.isAlive) {
    return { valid: false, reason: 'Dead characters cannot act' };
  }

  // 6. Validate timestamp is reasonable
  if (typeof action.timestamp !== 'number' || action.timestamp < 0) {
    return { valid: false, reason: 'Invalid timestamp' };
  }

  // 7. Reject obviously malicious payload sizes
  const paramCount = Object.keys(action.params).length;
  if (paramCount > 20) {
    return { valid: false, reason: 'Too many params (max 20)' };
  }

  return { valid: true };
}

/** Sanitize action params — strip unexpected fields, trim strings. */
export function sanitizeAction(action: AgentAction): AgentAction {
  const schema = ACTION_SCHEMAS[action.type];
  if (!schema) return action;

  const allowedKeys = new Set([
    ...(schema.required ?? []),
    ...(schema.optional ?? []),
    ...(schema.stringParams ?? []),
    ...(schema.numberParams ?? []),
  ]);

  const cleanParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(action.params)) {
    if (allowedKeys.size === 0 || allowedKeys.has(key)) {
      cleanParams[key] = typeof value === 'string' ? value.trim().slice(0, 500) : value;
    }
  }

  return {
    type: action.type,
    params: cleanParams,
    timestamp: action.timestamp,
  };
}
