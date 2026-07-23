import type { ImageSourcePropType } from 'react-native';

export type AslGlyph = {
  id: string;
  label: string;
  /** Local PNG still. Optional until verified ASL art is ready. */
  image?: ImageSourcePropType;
  description: string;
  tip: string;
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

export const ASL_LETTERS: AslGlyph[] = [
  {
    id: 'a',
    label: 'A',
    description: 'A closed handshape with the thumb resting along the side.',
    tip: 'Closed fist with the thumb resting beside the index finger.',
  },
  {
    id: 'b',
    label: 'B',
    description: 'An open upright handshape with four fingers held together.',
    tip: 'Fingers straight up with the thumb folded across the palm.',
  },
  {
    id: 'c',
    label: 'C',
    description: 'A curved handshape that outlines the letter C.',
    tip: 'Curve the hand into the shape of a C.',
  },
  {
    id: 'd',
    label: 'D',
    description: 'An upright index above a circle made by the other fingers.',
    tip: 'Index finger up while the other fingers meet the thumb.',
  },
  {
    id: 'e',
    label: 'E',
    description: 'A compact handshape with all fingertips curled inward.',
    tip: 'Curl the fingertips down toward the thumb.',
  },
  {
    id: 'f',
    label: 'F',
    description: 'A thumb-index circle with the other three fingers raised.',
    tip: 'Touch the thumb and index finger; keep the others extended.',
  },
  {
    id: 'g',
    label: 'G',
    description: 'A sideways handshape with the index and thumb extended.',
    tip: 'Point the index finger and thumb sideways like a pinch.',
  },
  {
    id: 'h',
    label: 'H',
    description: 'Two fingers held together and extended horizontally.',
    tip: 'Extend the index and middle fingers together sideways.',
  },
  {
    id: 'i',
    label: 'I',
    description: 'A closed handshape with the little finger raised.',
    tip: 'Raise the little finger while keeping the others closed.',
  },
  {
    id: 'j',
    label: 'J',
    description: 'The I handshape combined with a curved J movement.',
    tip: 'Start with I, then trace a J in the air with the little finger.',
  },
  {
    id: 'k',
    label: 'K',
    description: 'Two raised fingers with the thumb positioned between them.',
    tip: 'Form a V with the index and middle fingers, thumb between them.',
  },
  {
    id: 'l',
    label: 'L',
    description: 'The index finger and thumb form a right angle.',
    tip: 'Point the index up and thumb sideways to form an L.',
  },
  {
    id: 'm',
    label: 'M',
    description: 'A closed handshape with the thumb beneath three fingers.',
    tip: 'Tuck the thumb under the index, middle, and ring fingers.',
  },
  {
    id: 'n',
    label: 'N',
    description: 'A closed handshape with the thumb beneath two fingers.',
    tip: 'Tuck the thumb under the index and middle fingers.',
  },
  {
    id: 'o',
    label: 'O',
    description: 'The fingertips and thumb meet to form a rounded O.',
    tip: 'Curve the fingers and thumb together to form an O.',
  },
  {
    id: 'p',
    label: 'P',
    description: 'A downward-facing K handshape.',
    tip: 'Use the K handshape and point it downward.',
  },
  {
    id: 'q',
    label: 'Q',
    description: 'A downward-facing G handshape.',
    tip: 'Use the G handshape and point it downward.',
  },
  {
    id: 'r',
    label: 'R',
    description: 'The index and middle fingers are crossed upright.',
    tip: 'Cross the index and middle fingers; keep the others closed.',
  },
  {
    id: 's',
    label: 'S',
    description: 'A fist with the thumb resting across the front.',
    tip: 'Make a fist with the thumb resting across the fingers.',
  },
  {
    id: 't',
    label: 'T',
    description: 'A fist with the thumb tucked beneath the index finger.',
    tip: 'Tuck the thumb under the index finger only.',
  },
  {
    id: 'u',
    label: 'U',
    description: 'Two upright fingers held closely together.',
    tip: 'Hold the index and middle fingers together pointing up.',
  },
  {
    id: 'v',
    label: 'V',
    description: 'Two upright fingers separated into a V shape.',
    tip: 'Raise the index and middle fingers in a V.',
  },
  {
    id: 'w',
    label: 'W',
    description: 'Three upright fingers spread into a W handshape.',
    tip: 'Extend and spread the index, middle, and ring fingers.',
  },
  {
    id: 'x',
    label: 'X',
    description: 'A closed handshape with the index finger hooked.',
    tip: 'Hook the index finger while keeping the others closed.',
  },
  {
    id: 'y',
    label: 'Y',
    description: 'The thumb and little finger extend from a closed hand.',
    tip: 'Extend the thumb and little finger; keep the others closed.',
  },
  {
    id: 'z',
    label: 'Z',
    description: 'An extended index finger traces a Z-shaped movement.',
    tip: 'Use the index finger to trace a Z in the air.',
  },
];

/** @deprecated Prefer ASL_LETTERS */
export const ASL_LETTERS_A_TO_M = ASL_LETTERS.slice(0, 13);

export const ASL_NUMBERS: AslGlyph[] = [
  {
    id: '0',
    label: '0',
    description: 'The fingertips and thumb meet in a rounded zero shape.',
    tip: 'Curve the fingers and thumb into a circle, like an O.',
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
