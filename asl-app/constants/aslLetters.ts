export type AslLetter = {
  id: string;
  label: string;
  image: number;
  tip: string;
};

export const ASL_LETTERS_A_TO_M: AslLetter[] = [
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
];

export const ASL_LETTERS_BY_ID = Object.fromEntries(
  ASL_LETTERS_A_TO_M.map((letter) => [letter.id, letter]),
) as Record<string, AslLetter>;
