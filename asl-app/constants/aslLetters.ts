export type AslGlyph = {
  id: string;
  label: string;
  image: number;
  tip: string;
};

export type AslLetter = AslGlyph;

export const ASL_LETTERS: AslGlyph[] = [
  {
    id: 'a',
    label: 'A',
    image: require('../assets/asl/letters/a.png'),
    tip: 'Closed fist with the thumb resting beside the index finger.',
  },
  {
    id: 'b',
    label: 'B',
    image: require('../assets/asl/letters/b.png'),
    tip: 'Fingers straight up with the thumb folded across the palm.',
  },
  {
    id: 'c',
    label: 'C',
    image: require('../assets/asl/letters/c.png'),
    tip: 'Curve the hand into the shape of a C.',
  },
  {
    id: 'd',
    label: 'D',
    image: require('../assets/asl/letters/d.png'),
    tip: 'Index finger up while the other fingers meet the thumb.',
  },
  {
    id: 'e',
    label: 'E',
    image: require('../assets/asl/letters/e.png'),
    tip: 'Curl the fingertips down toward the thumb.',
  },
  {
    id: 'f',
    label: 'F',
    image: require('../assets/asl/letters/f.png'),
    tip: 'Touch the thumb and index finger; keep the others extended.',
  },
  {
    id: 'g',
    label: 'G',
    image: require('../assets/asl/letters/g.png'),
    tip: 'Point the index finger and thumb sideways like a pinch.',
  },
  {
    id: 'h',
    label: 'H',
    image: require('../assets/asl/letters/h.png'),
    tip: 'Extend the index and middle fingers together sideways.',
  },
  {
    id: 'i',
    label: 'I',
    image: require('../assets/asl/letters/i.png'),
    tip: 'Raise the little finger while keeping the others closed.',
  },
  {
    id: 'j',
    label: 'J',
    image: require('../assets/asl/letters/j.png'),
    tip: 'Start with I, then trace a J in the air with the little finger.',
  },
  {
    id: 'k',
    label: 'K',
    image: require('../assets/asl/letters/k.png'),
    tip: 'Form a V with the index and middle fingers, thumb between them.',
  },
  {
    id: 'l',
    label: 'L',
    image: require('../assets/asl/letters/l.png'),
    tip: 'Point the index up and thumb sideways to form an L.',
  },
  {
    id: 'm',
    label: 'M',
    image: require('../assets/asl/letters/m.png'),
    tip: 'Tuck the thumb under the index, middle, and ring fingers.',
  },
  {
    id: 'n',
    label: 'N',
    image: require('../assets/asl/letters/n.png'),
    tip: 'Tuck the thumb under the index and middle fingers.',
  },
  {
    id: 'o',
    label: 'O',
    image: require('../assets/asl/letters/o.png'),
    tip: 'Curve the fingers and thumb together to form an O.',
  },
  {
    id: 'p',
    label: 'P',
    image: require('../assets/asl/letters/p.png'),
    tip: 'Use the K handshape and point it downward.',
  },
  {
    id: 'q',
    label: 'Q',
    image: require('../assets/asl/letters/q.png'),
    tip: 'Use the G handshape and point it downward.',
  },
  {
    id: 'r',
    label: 'R',
    image: require('../assets/asl/letters/r.png'),
    tip: 'Cross the index and middle fingers; keep the others closed.',
  },
  {
    id: 's',
    label: 'S',
    image: require('../assets/asl/letters/s.png'),
    tip: 'Make a fist with the thumb resting across the fingers.',
  },
  {
    id: 't',
    label: 'T',
    image: require('../assets/asl/letters/t.png'),
    tip: 'Tuck the thumb under the index finger only.',
  },
  {
    id: 'u',
    label: 'U',
    image: require('../assets/asl/letters/u.png'),
    tip: 'Hold the index and middle fingers together pointing up.',
  },
  {
    id: 'v',
    label: 'V',
    image: require('../assets/asl/letters/v.png'),
    tip: 'Raise the index and middle fingers in a V.',
  },
  {
    id: 'w',
    label: 'W',
    image: require('../assets/asl/letters/w.png'),
    tip: 'Extend and spread the index, middle, and ring fingers.',
  },
  {
    id: 'x',
    label: 'X',
    image: require('../assets/asl/letters/x.png'),
    tip: 'Hook the index finger while keeping the others closed.',
  },
  {
    id: 'y',
    label: 'Y',
    image: require('../assets/asl/letters/y.png'),
    tip: 'Extend the thumb and little finger; keep the others closed.',
  },
  {
    id: 'z',
    label: 'Z',
    image: require('../assets/asl/letters/z.png'),
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
    tip: 'Curve the fingers and thumb into a circle, like an O.',
  },
  {
    id: '1',
    label: '1',
    image: require('../assets/asl/numbers/1.png'),
    tip: 'Point the index finger up and keep the others closed.',
  },
  {
    id: '2',
    label: '2',
    image: require('../assets/asl/numbers/2.png'),
    tip: 'Extend the index and middle fingers like a V.',
  },
  {
    id: '3',
    label: '3',
    image: require('../assets/asl/numbers/3.png'),
    tip: 'Extend the thumb, index, and middle fingers.',
  },
  {
    id: '4',
    label: '4',
    image: require('../assets/asl/numbers/4.png'),
    tip: 'Extend four fingers with the thumb against the palm.',
  },
  {
    id: '5',
    label: '5',
    image: require('../assets/asl/numbers/5.png'),
    tip: 'Open and spread all five fingers.',
  },
  {
    id: '6',
    label: '6',
    image: require('../assets/asl/numbers/6.png'),
    tip: 'Touch the thumb to the little finger; extend the other three.',
  },
  {
    id: '7',
    label: '7',
    image: require('../assets/asl/numbers/7.png'),
    tip: 'Touch the thumb to the ring finger; extend the other three.',
  },
  {
    id: '8',
    label: '8',
    image: require('../assets/asl/numbers/8.png'),
    tip: 'Touch the thumb to the middle finger; extend the other three.',
  },
  {
    id: '9',
    label: '9',
    image: require('../assets/asl/numbers/9.png'),
    tip: 'Touch the thumb to the index finger; extend the other three.',
  },
];

export const ASL_LETTERS_BY_ID = Object.fromEntries(
  ASL_LETTERS.map((letter) => [letter.id, letter]),
) as Record<string, AslGlyph>;

export const ASL_NUMBERS_BY_ID = Object.fromEntries(
  ASL_NUMBERS.map((number) => [number.id, number]),
) as Record<string, AslGlyph>;
