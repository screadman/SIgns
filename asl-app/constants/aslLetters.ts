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
    image: require('../assets/asl/letters/a.png'),
    description: 'A closed handshape with the thumb resting along the side.',
    tip: 'Closed fist with the thumb resting beside the index finger.',
  },
  {
    id: 'b',
    label: 'B',
    image: require('../assets/asl/letters/b.png'),
    description: 'An open upright handshape with four fingers held together.',
    tip: 'Fingers straight up with the thumb folded across the palm.',
  },
  {
    id: 'c',
    label: 'C',
    image: require('../assets/asl/letters/c.png'),
    description: 'A curved handshape that outlines the letter C.',
    tip: 'Curve the hand into the shape of a C.',
  },
  {
    id: 'd',
    label: 'D',
    image: require('../assets/asl/letters/d.png'),
    description: 'An upright index above a circle made by the other fingers.',
    tip: 'Index finger up while the other fingers meet the thumb.',
  },
  {
    id: 'e',
    label: 'E',
    image: require('../assets/asl/letters/e.png'),
    description: 'A compact handshape with all fingertips curled inward.',
    tip: 'Curl the fingertips down toward the thumb.',
  },
  {
    id: 'f',
    label: 'F',
    image: require('../assets/asl/letters/f.png'),
    description: 'A thumb-index circle with the other three fingers raised.',
    tip: 'Touch the thumb and index finger; keep the others extended.',
  },
  {
    id: 'g',
    label: 'G',
    image: require('../assets/asl/letters/g.png'),
    description: 'A sideways handshape with the index and thumb extended.',
    tip: 'Point the index finger and thumb sideways like a pinch.',
  },
  {
    id: 'h',
    label: 'H',
    image: require('../assets/asl/letters/h.png'),
    description: 'Two fingers held together and extended horizontally.',
    tip: 'Extend the index and middle fingers together sideways.',
  },
  {
    id: 'i',
    label: 'I',
    image: require('../assets/asl/letters/i.png'),
    description: 'A closed handshape with the little finger raised.',
    tip: 'Raise the little finger while keeping the others closed.',
  },
  {
    id: 'j',
    label: 'J',
    image: require('../assets/asl/letters/j.png'),
    description: 'The I handshape combined with a curved J movement.',
    tip: 'Start with I, then trace a J in the air with the little finger.',
  },
  {
    id: 'k',
    label: 'K',
    image: require('../assets/asl/letters/k.png'),
    description: 'Two raised fingers with the thumb positioned between them.',
    tip: 'Form a V with the index and middle fingers, thumb between them.',
  },
  {
    id: 'l',
    label: 'L',
    image: require('../assets/asl/letters/l.png'),
    description: 'The index finger and thumb form a right angle.',
    tip: 'Point the index up and thumb sideways to form an L.',
  },
  {
    id: 'm',
    label: 'M',
    image: require('../assets/asl/letters/m.png'),
    description: 'A closed handshape with the thumb beneath three fingers.',
    tip: 'Tuck the thumb under the index, middle, and ring fingers.',
  },
  {
    id: 'n',
    label: 'N',
    image: require('../assets/asl/letters/n.png'),
    description: 'A closed handshape with the thumb beneath two fingers.',
    tip: 'Tuck the thumb under the index and middle fingers.',
  },
  {
    id: 'o',
    label: 'O',
    image: require('../assets/asl/letters/o.png'),
    description: 'The fingertips and thumb meet to form a rounded O.',
    tip: 'Curve the fingers and thumb together to form an O.',
  },
  {
    id: 'p',
    label: 'P',
    image: require('../assets/asl/letters/p.png'),
    description: 'A downward-facing K handshape.',
    tip: 'Use the K handshape and point it downward.',
  },
  {
    id: 'q',
    label: 'Q',
    image: require('../assets/asl/letters/q.png'),
    description: 'A downward-facing G handshape.',
    tip: 'Use the G handshape and point it downward.',
  },
  {
    id: 'r',
    label: 'R',
    image: require('../assets/asl/letters/r.png'),
    description: 'The index and middle fingers are crossed upright.',
    tip: 'Cross the index and middle fingers; keep the others closed.',
  },
  {
    id: 's',
    label: 'S',
    image: require('../assets/asl/letters/s.png'),
    description: 'A fist with the thumb resting across the front.',
    tip: 'Make a fist with the thumb resting across the fingers.',
  },
  {
    id: 't',
    label: 'T',
    image: require('../assets/asl/letters/t.png'),
    description: 'A fist with the thumb tucked beneath the index finger.',
    tip: 'Tuck the thumb under the index finger only.',
  },
  {
    id: 'u',
    label: 'U',
    image: require('../assets/asl/letters/u.png'),
    description: 'Two upright fingers held closely together.',
    tip: 'Hold the index and middle fingers together pointing up.',
  },
  {
    id: 'v',
    label: 'V',
    image: require('../assets/asl/letters/v.png'),
    description: 'Two upright fingers separated into a V shape.',
    tip: 'Raise the index and middle fingers in a V.',
  },
  {
    id: 'w',
    label: 'W',
    image: require('../assets/asl/letters/w.png'),
    description: 'Three upright fingers spread into a W handshape.',
    tip: 'Extend and spread the index, middle, and ring fingers.',
  },
  {
    id: 'x',
    label: 'X',
    image: require('../assets/asl/letters/x.png'),
    description: 'A closed handshape with the index finger hooked.',
    tip: 'Hook the index finger while keeping the others closed.',
  },
  {
    id: 'y',
    label: 'Y',
    image: require('../assets/asl/letters/y.png'),
    description: 'The thumb and little finger extend from a closed hand.',
    tip: 'Extend the thumb and little finger; keep the others closed.',
  },
  {
    id: 'z',
    label: 'Z',
    image: require('../assets/asl/letters/z.png'),
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
    image: require('../assets/asl/numbers/0.png'),
    description: 'The fingertips and thumb meet in a rounded zero shape.',
    tip: 'Curve the fingers and thumb into a circle, like an O.',
  },
  {
    id: '1',
    label: '1',
    image: require('../assets/asl/numbers/1.png'),
    description: 'One index finger is raised from a closed hand.',
    tip: 'Point the index finger up and keep the others closed.',
  },
  {
    id: '2',
    label: '2',
    image: require('../assets/asl/numbers/2.png'),
    description: 'The index and middle fingers are raised together.',
    tip: 'Extend the index and middle fingers like a V.',
  },
  {
    id: '3',
    label: '3',
    image: require('../assets/asl/numbers/3.png'),
    description: 'The thumb, index, and middle fingers are extended.',
    tip: 'Extend the thumb, index, and middle fingers.',
  },
  {
    id: '4',
    label: '4',
    image: require('../assets/asl/numbers/4.png'),
    description: 'Four fingers are raised while the thumb stays folded.',
    tip: 'Extend four fingers with the thumb against the palm.',
  },
  {
    id: '5',
    label: '5',
    image: require('../assets/asl/numbers/5.png'),
    description: 'All five fingers are open and spread.',
    tip: 'Open and spread all five fingers.',
  },
  {
    id: '6',
    label: '6',
    image: require('../assets/asl/numbers/6.png'),
    description: 'The thumb touches the little finger.',
    tip: 'Touch the thumb to the little finger; extend the other three.',
  },
  {
    id: '7',
    label: '7',
    image: require('../assets/asl/numbers/7.png'),
    description: 'The thumb touches the ring finger.',
    tip: 'Touch the thumb to the ring finger; extend the other three.',
  },
  {
    id: '8',
    label: '8',
    image: require('../assets/asl/numbers/8.png'),
    description: 'The thumb touches the middle finger.',
    tip: 'Touch the thumb to the middle finger; extend the other three.',
  },
  {
    id: '9',
    label: '9',
    image: require('../assets/asl/numbers/9.png'),
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
