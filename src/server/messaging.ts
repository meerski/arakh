// ============================================================
// Inter-Agent Messaging
// ============================================================

import type { CharacterId, ChatMessage } from '../types.js';
import { canCommunicate } from '../game/language.js';
import type { Character } from '../types.js';

export interface MessageResult {
  delivered: boolean;
  clarity: number;
  garbledContent?: string;
}

/** Process a chat message between agents, applying language barriers */
export function processMessage(
  message: ChatMessage,
  sender: Character,
  receiver: Character,
): MessageResult {
  const comm = canCommunicate(sender, receiver);

  if (!comm.canTalk) {
    return {
      delivered: false,
      clarity: 0,
    };
  }

  if (comm.clarity < 1.0) {
    // Garble the message based on clarity
    return {
      delivered: true,
      clarity: comm.clarity,
      garbledContent: garbleMessage(message.content, comm.clarity),
    };
  }

  return { delivered: true, clarity: 1.0 };
}

function garbleMessage(content: string, clarity: number): string {
  const words = content.split(' ');
  return words
    .map(word => {
      if (Math.random() < clarity) return word;
      // Replace with garbled version
      return '*'.repeat(word.length);
    })
    .join(' ');
}
