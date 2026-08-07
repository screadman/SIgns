import type { ImageSourcePropType } from 'react-native';

export type SignParameterKey =
  | 'handshape'
  | 'location'
  | 'movement'
  | 'orientation'
  | 'nmm';

export type SignParameters = Record<SignParameterKey, string>;

export type AslGlyph = {
  id: string;
  label: string;
  /** Local PNG still. Optional until verified ASL art is ready. */
  image?: ImageSourcePropType;
  /** Optional multi-frame stills for movement (before / after). */
  imageSequence?: ImageSourcePropType[];
  description: string;
  tip: string;
  /** Optional structured ASL parameters for pedagogy UI. */
  parameters?: SignParameters;
  motionStyle?: 'still' | 'sequence';
};

/** Works on native (number) and web (string / object source). */
export function hasMediaAsset(value: unknown): boolean {
  if (typeof value === 'number') {
    return true;
  }

  if (typeof value === 'string') {
    return value.length > 0;
  }

  return typeof value === 'object' && value !== null;
}

export function toImageSource(
  value: ImageSourcePropType | string | undefined,
): ImageSourcePropType | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return { uri: value };
  }

  return value;
}

export type AslLetter = AslGlyph;

const NEUTRAL = {
  location: 'Neutral space in front of the body',
  orientation: 'Palm faces out unless noted',
  nmm: 'Relaxed face; keep eyes on your partner',
} as const;

export const ASL_LETTERS: AslGlyph[] = [
  {
    id: 'a',
    label: 'A',
    description: 'A closed fist with the thumb resting along the side of the index finger.',
    tip: 'Do not confuse with S: on A the thumb sits beside the fist, not across the fingers.',
    parameters: {
      handshape: 'Closed fist, thumb along the side',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'b',
    label: 'B',
    description: 'An open upright hand with four fingers together and the thumb folded across the palm.',
    tip: 'Keep fingers straight and tight. Thumb stays flat against the palm, not sticking out.',
    parameters: {
      handshape: 'Flat open hand, thumb across palm',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Palm faces out',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'c',
    label: 'C',
    description: 'A curved hand that outlines the letter C from the side.',
    tip: 'Curve fingers and thumb together like holding a cup. Leave a clear C opening.',
    parameters: {
      handshape: 'Curved C opening',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Opening faces to the side',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'd',
    label: 'D',
    description: 'Index finger up while the other fingertips meet the thumb in a small circle.',
    tip: 'Only the index stands tall. The rest form a tight circle with the thumb.',
    parameters: {
      handshape: 'Index up; other tips touch thumb',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'e',
    label: 'E',
    description: 'All fingertips curl inward toward the thumb in a compact shape.',
    tip: 'Fingertips tuck down toward the thumb. Keep it compact, not a loose claw.',
    parameters: {
      handshape: 'Fingertips curled to thumb',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'f',
    label: 'F',
    description: 'Thumb and index form a circle; the other three fingers stand up.',
    tip: 'Touch thumb to index tip. Keep middle, ring, and pinky extended and together.',
    parameters: {
      handshape: 'OK circle + three fingers up',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'g',
    label: 'G',
    description: 'Index and thumb extend sideways in a pinch, hand on its side.',
    tip: 'Point index and thumb sideways like measuring a small gap. Palm faces in.',
    parameters: {
      handshape: 'Sideways pinch (index + thumb)',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Hand on its side, tips pointing out',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'h',
    label: 'H',
    description: 'Index and middle fingers extended together horizontally.',
    tip: 'Two fingers together, pointing sideways. Other fingers closed.',
    parameters: {
      handshape: 'Index + middle together, sideways',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Tips point to the side',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'i',
    label: 'I',
    description: 'Closed hand with only the little finger raised.',
    tip: 'Pinky up, everything else closed. This is also the start shape for J.',
    parameters: {
      handshape: 'Pinky up, fist closed',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'j',
    label: 'J',
    description: 'Start with the I handshape, then trace a J curve with the little finger.',
    tip: 'Hold I, then draw a J in the air with the pinky tip. Movement makes the letter.',
    motionStyle: 'sequence',
    parameters: {
      handshape: 'I handshape (pinky up)',
      location: NEUTRAL.location,
      movement: 'Trace a J curve with the pinky',
      orientation: NEUTRAL.orientation,
      nmm: 'Eyes follow the path lightly',
    },
  },
  {
    id: 'k',
    label: 'K',
    description: 'Index and middle form a V with the thumb tucked between them.',
    tip: 'Make a V, then park the thumb between those two fingers. Palm faces out.',
    parameters: {
      handshape: 'V with thumb between fingers',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Palm out',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'l',
    label: 'L',
    description: 'Index up and thumb out form a clear right angle.',
    tip: 'Index straight up, thumb straight out. Keep the corner sharp like a printed L.',
    parameters: {
      handshape: 'Index up + thumb out (L)',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'm',
    label: 'M',
    description: 'Thumb tucked under three fingers (index, middle, ring).',
    tip: 'Count three fingers over the thumb. N only covers two. That is the difference.',
    parameters: {
      handshape: 'Thumb under three fingers',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'n',
    label: 'N',
    description: 'Thumb tucked under two fingers (index and middle).',
    tip: 'Only two fingers over the thumb. If you see three, it is M.',
    parameters: {
      handshape: 'Thumb under two fingers',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'o',
    label: 'O',
    description: 'All fingertips meet the thumb in a rounded O.',
    tip: 'Round the opening. Do not flatten it into an E.',
    parameters: {
      handshape: 'Rounded O opening',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'p',
    label: 'P',
    description: 'K handshape pointed downward.',
    tip: 'Form K, then tip the hand down so the middle finger points toward the floor.',
    parameters: {
      handshape: 'K shape pointed down',
      location: NEUTRAL.location,
      movement: 'Hold steady (angled down)',
      orientation: 'Middle finger aims down',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'q',
    label: 'Q',
    description: 'G handshape pointed downward.',
    tip: 'Form G, then aim the pinch straight down. P uses K; Q uses G.',
    parameters: {
      handshape: 'G shape pointed down',
      location: NEUTRAL.location,
      movement: 'Hold steady (angled down)',
      orientation: 'Tips aim down',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'r',
    label: 'R',
    description: 'Index and middle fingers crossed upright.',
    tip: 'Cross index over middle (or middle over index) and hold them upright.',
    parameters: {
      handshape: 'Crossed index + middle',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Tips point up',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 's',
    label: 'S',
    description: 'A fist with the thumb resting across the front of the fingers.',
    tip: 'Thumb crosses over the fingers. On A the thumb sits beside the fist instead.',
    parameters: {
      handshape: 'Fist, thumb across front',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 't',
    label: 'T',
    description: 'Fist with the thumb tucked under the index finger only.',
    tip: 'Thumb peeks between index and middle. Not as deep as M or N.',
    parameters: {
      handshape: 'Thumb under index only',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'u',
    label: 'U',
    description: 'Index and middle upright and pressed together.',
    tip: 'Two fingers up and touching. Spread them and it becomes V.',
    parameters: {
      handshape: 'Index + middle together, up',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Palm out, tips up',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'v',
    label: 'V',
    description: 'Index and middle upright and separated into a V.',
    tip: 'Same two fingers as U, but spread. Keep them straight.',
    parameters: {
      handshape: 'Index + middle spread (V)',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Palm out, tips up',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'w',
    label: 'W',
    description: 'Index, middle, and ring fingers spread upright.',
    tip: 'Three fingers up and spread. Thumb and pinky stay down.',
    parameters: {
      handshape: 'Three fingers spread (W)',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: 'Palm out, tips up',
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'x',
    label: 'X',
    description: 'Closed hand with the index finger hooked.',
    tip: 'Hook only the index. Keep the other fingers closed against the palm.',
    parameters: {
      handshape: 'Hooked index, fist closed',
      location: NEUTRAL.location,
      movement: 'Hold steady',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'y',
    label: 'Y',
    description: 'Thumb and little finger extended from a closed hand.',
    tip: 'Thumb and pinky out, middle three closed. Shake this shape for “why” in conversation.',
    parameters: {
      handshape: 'Thumb + pinky out',
      location: NEUTRAL.location,
      movement: 'Hold steady (letter) or slight shake (why)',
      orientation: NEUTRAL.orientation,
      nmm: NEUTRAL.nmm,
    },
  },
  {
    id: 'z',
    label: 'Z',
    description: 'Extended index finger traces a Z path in the air.',
    tip: 'Point with the index and draw Z: across, diagonal, across. Movement is the letter.',
    motionStyle: 'sequence',
    parameters: {
      handshape: 'Index finger extended',
      location: NEUTRAL.location,
      movement: 'Trace a Z path in the air',
      orientation: 'Tip draws the letter',
      nmm: 'Eyes can follow the path',
    },
  },
];

/** @deprecated Prefer ASL_LETTERS */
export const ASL_LETTERS_A_TO_M = ASL_LETTERS.slice(0, 13);

export const ASL_NUMBERS: AslGlyph[] = [
  {
    id: '0',
    label: '0',
    description: 'The fingertips and thumb meet in a rounded zero shape.',
    tip: 'Same rounded opening as O. Keep it circular, not flat.',
  },
  {
    id: '1',
    label: '1',
    description: 'One index finger is raised from a closed hand.',
    tip: 'Point the index finger up and keep the others closed.',
  },
  {
    id: '2',
    label: '2',
    description: 'The index and middle fingers are raised together.',
    tip: 'Extend the index and middle fingers like a V.',
  },
  {
    id: '3',
    label: '3',
    description: 'The thumb, index, and middle fingers are extended.',
    tip: 'Extend the thumb, index, and middle fingers.',
  },
  {
    id: '4',
    label: '4',
    description: 'Four fingers are raised while the thumb stays folded.',
    tip: 'Extend four fingers with the thumb against the palm.',
  },
  {
    id: '5',
    label: '5',
    description: 'All five fingers are open and spread.',
    tip: 'Open and spread all five fingers.',
  },
  {
    id: '6',
    label: '6',
    description: 'The thumb touches the little finger.',
    tip: 'Touch the thumb to the little finger; extend the other three.',
  },
  {
    id: '7',
    label: '7',
    description: 'The thumb touches the ring finger.',
    tip: 'Touch the thumb to the ring finger; extend the other three.',
  },
  {
    id: '8',
    label: '8',
    description: 'The thumb touches the middle finger.',
    tip: 'Touch the thumb to the middle finger; extend the other three.',
  },
  {
    id: '9',
    label: '9',
    description: 'The thumb touches the index finger.',
    tip: 'Touch the thumb to the index finger; extend the other three.',
  },
];

export const ASL_LETTERS_BY_ID = Object.fromEntries(
  ASL_LETTERS.map((letter) => [letter.id, letter]),
) as Record<string, AslGlyph>;

export const ASL_NUMBERS_BY_ID = Object.fromEntries(
  ASL_NUMBERS.map((number) => [number.id, number]),
) as Record<string, AslGlyph>;
