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
    tip: 'Poing ferme, pouce colle contre le cote de l index.',
  },
  {
    id: 'b',
    label: 'B',
    image: require('../assets/asl/letters/b.png'),
    tip: 'Doigts tendus vers le haut, pouce plie contre la paume.',
  },
  {
    id: 'c',
    label: 'C',
    image: require('../assets/asl/letters/c.png'),
    tip: 'Main courbe en forme de C.',
  },
  {
    id: 'd',
    label: 'D',
    image: require('../assets/asl/letters/d.png'),
    tip: 'Index vers le haut, autres doigts rejoignent le pouce.',
  },
  {
    id: 'e',
    label: 'E',
    image: require('../assets/asl/letters/e.png'),
    tip: 'Doigts courbes, bouts contre le pouce.',
  },
  {
    id: 'f',
    label: 'F',
    image: require('../assets/asl/letters/f.png'),
    tip: 'Pouce et index se touchent en cercle, autres doigts tendus.',
  },
  {
    id: 'g',
    label: 'G',
    image: require('../assets/asl/letters/g.png'),
    tip: 'Index et pouce horizontaux, comme une pince de cote.',
  },
  {
    id: 'h',
    label: 'H',
    image: require('../assets/asl/letters/h.png'),
    tip: 'Index et majeur tendus ensemble a l horizontale.',
  },
  {
    id: 'i',
    label: 'I',
    image: require('../assets/asl/letters/i.png'),
    tip: 'Auriculaire leve, autres doigts fermes.',
  },
  {
    id: 'j',
    label: 'J',
    image: require('../assets/asl/letters/j.png'),
    tip: 'Comme le I, puis tracer un J dans l air avec l auriculaire.',
  },
  {
    id: 'k',
    label: 'K',
    image: require('../assets/asl/letters/k.png'),
    tip: 'Index et majeur en V, pouce entre les deux.',
  },
  {
    id: 'l',
    label: 'L',
    image: require('../assets/asl/letters/l.png'),
    tip: 'Index vers le haut, pouce sur le cote : forme un L.',
  },
  {
    id: 'm',
    label: 'M',
    image: require('../assets/asl/letters/m.png'),
    tip: 'Pouce sous trois doigts (index, majeur, annulaire).',
  },
  {
    id: 'n',
    label: 'N',
    image: require('../assets/asl/letters/n.png'),
    tip: 'Pouce sous deux doigts (index et majeur).',
  },
  {
    id: 'o',
    label: 'O',
    image: require('../assets/asl/letters/o.png'),
    tip: 'Doigts et pouce formes en O.',
  },
  {
    id: 'p',
    label: 'P',
    image: require('../assets/asl/letters/p.png'),
    tip: 'Comme le K, pointe vers le bas.',
  },
  {
    id: 'q',
    label: 'Q',
    image: require('../assets/asl/letters/q.png'),
    tip: 'Comme le G, pointe vers le bas.',
  },
  {
    id: 'r',
    label: 'R',
    image: require('../assets/asl/letters/r.png'),
    tip: 'Index et majeur croises, autres doigts fermes.',
  },
  {
    id: 's',
    label: 'S',
    image: require('../assets/asl/letters/s.png'),
    tip: 'Poing ferme, pouce devant les doigts.',
  },
  {
    id: 't',
    label: 'T',
    image: require('../assets/asl/letters/t.png'),
    tip: 'Pouce sous l index seulement.',
  },
  {
    id: 'u',
    label: 'U',
    image: require('../assets/asl/letters/u.png'),
    tip: 'Index et majeur tendus colles vers le haut.',
  },
  {
    id: 'v',
    label: 'V',
    image: require('../assets/asl/letters/v.png'),
    tip: 'Index et majeur en V vers le haut.',
  },
  {
    id: 'w',
    label: 'W',
    image: require('../assets/asl/letters/w.png'),
    tip: 'Index, majeur et annulaire tendus et ecartes.',
  },
  {
    id: 'x',
    label: 'X',
    image: require('../assets/asl/letters/x.png'),
    tip: 'Index crochu, autres doigts fermes.',
  },
  {
    id: 'y',
    label: 'Y',
    image: require('../assets/asl/letters/y.png'),
    tip: 'Pouce et auriculaire ecartes, autres doigts fermes.',
  },
  {
    id: 'z',
    label: 'Z',
    image: require('../assets/asl/letters/z.png'),
    tip: 'Index tendu : tracer un Z dans l air.',
  },
];

/** @deprecated Prefer ASL_LETTERS */
export const ASL_LETTERS_A_TO_M = ASL_LETTERS.slice(0, 13);

export const ASL_NUMBERS: AslGlyph[] = [
  {
    id: '0',
    label: '0',
    image: require('../assets/asl/numbers/0.png'),
    tip: 'Doigts et pouce formes en cercle (comme un O).',
  },
  {
    id: '1',
    label: '1',
    image: require('../assets/asl/numbers/1.png'),
    tip: 'Index vers le haut, autres doigts fermes.',
  },
  {
    id: '2',
    label: '2',
    image: require('../assets/asl/numbers/2.png'),
    tip: 'Index et majeur tendus (comme un V).',
  },
  {
    id: '3',
    label: '3',
    image: require('../assets/asl/numbers/3.png'),
    tip: 'Pouce, index et majeur tendus.',
  },
  {
    id: '4',
    label: '4',
    image: require('../assets/asl/numbers/4.png'),
    tip: 'Quatre doigts tendus, pouce contre la paume.',
  },
  {
    id: '5',
    label: '5',
    image: require('../assets/asl/numbers/5.png'),
    tip: 'Cinq doigts ouverts et ecartes.',
  },
  {
    id: '6',
    label: '6',
    image: require('../assets/asl/numbers/6.png'),
    tip: 'Pouce touche l auriculaire, trois doigts tendus.',
  },
  {
    id: '7',
    label: '7',
    image: require('../assets/asl/numbers/7.png'),
    tip: 'Pouce touche l annulaire, trois doigts tendus.',
  },
  {
    id: '8',
    label: '8',
    image: require('../assets/asl/numbers/8.png'),
    tip: 'Pouce touche le majeur, trois doigts tendus.',
  },
  {
    id: '9',
    label: '9',
    image: require('../assets/asl/numbers/9.png'),
    tip: 'Pouce touche l index, trois doigts tendus.',
  },
];

export const ASL_LETTERS_BY_ID = Object.fromEntries(
  ASL_LETTERS.map((letter) => [letter.id, letter]),
) as Record<string, AslGlyph>;

export const ASL_NUMBERS_BY_ID = Object.fromEntries(
  ASL_NUMBERS.map((number) => [number.id, number]),
) as Record<string, AslGlyph>;
