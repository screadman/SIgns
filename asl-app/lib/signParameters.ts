import type { ImageSourcePropType } from 'react-native';

import type { AslGlyph, SignParameterKey, SignParameters } from '../constants/aslLetters';

export type { SignParameterKey, SignParameters };

export const PARAMETER_LABELS: Record<SignParameterKey, string> = {
  handshape: 'Handshape',
  location: 'Location',
  movement: 'Movement',
  orientation: 'Orientation',
  nmm: 'NMM',
};

/**
 * Prefer structured params on the glyph; otherwise derive readable chips
 * from description + tip for stills-only pedagogy.
 */
export function resolveSignParameters(sign: AslGlyph): SignParameters {
  if (sign.parameters) {
    return sign.parameters;
  }

  const description = sign.description.trim();
  const tip = sign.tip.trim();

  return {
    handshape: pickSentence(description, tip, 'Shape the hand as described.'),
    location: inferLocation(description, tip),
    movement: inferMovement(description, tip),
    orientation: inferOrientation(description, tip),
    nmm: inferNmm(description, tip),
  };
}

export function getSignImageSequence(
  sign: AslGlyph,
): ImageSourcePropType[] {
  if (sign.imageSequence && sign.imageSequence.length > 0) {
    return sign.imageSequence;
  }
  if (sign.image) {
    return [sign.image];
  }
  return [];
}

function pickSentence(...candidates: string[]): string {
  for (const candidate of candidates) {
    if (candidate.length > 0) {
      return candidate;
    }
  }
  return 'Study the illustration carefully.';
}

function inferLocation(description: string, tip: string): string {
  const text = `${description} ${tip}`.toLowerCase();
  if (text.includes('chest') || text.includes('heart')) {
    return 'Near the chest / torso.';
  }
  if (text.includes('chin') || text.includes('mouth') || text.includes('face')) {
    return 'Near the face.';
  }
  if (text.includes('forehead') || text.includes('temple')) {
    return 'Near the forehead.';
  }
  if (text.includes('shoulder')) {
    return 'Near the shoulder.';
  }
  if (text.includes('neutral') || text.includes('space in front')) {
    return 'Neutral space in front of the body.';
  }
  return 'Neutral signing space unless the tip says otherwise.';
}

function inferMovement(description: string, tip: string): string {
  const text = `${description} ${tip}`.toLowerCase();
  if (text.includes('circle') || text.includes('circling')) {
    return 'Circular motion.';
  }
  if (text.includes('arc') || text.includes('wave')) {
    return 'Arcing or waving motion.';
  }
  if (text.includes('tap') || text.includes('twice')) {
    return 'Short tap or repeated contact.';
  }
  if (text.includes('forward') || text.includes('outward')) {
    return 'Move forward / outward.';
  }
  if (text.includes('hold') || text.includes('still') || text.includes('static')) {
    return 'Hold steady (little or no path movement).';
  }
  return 'Follow the path shown in the illustration and tip.';
}

function inferOrientation(description: string, tip: string): string {
  const text = `${description} ${tip}`.toLowerCase();
  if (text.includes('palm')) {
    return 'Watch palm orientation in the tip.';
  }
  if (text.includes('upright') || text.includes('up')) {
    return 'Fingers / palm tend upright unless noted.';
  }
  if (text.includes('sideways') || text.includes('side')) {
    return 'Hand faces sideways.';
  }
  return 'Match palm and finger direction to the still.';
}

function inferNmm(description: string, tip: string): string {
  const text = `${description} ${tip}`.toLowerCase();
  if (text.includes('eyebrow') || text.includes('brows')) {
    return 'Use the eyebrow pattern noted for this sign.';
  }
  if (text.includes('question')) {
    return 'Question face: brows match WH or yes/no pattern.';
  }
  if (text.includes('smile') || text.includes('friendly')) {
    return 'Keep a natural, friendly facial expression.';
  }
  return 'Face and posture matter. Keep expression clear and calm.';
}
