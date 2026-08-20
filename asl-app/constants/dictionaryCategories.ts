import type { VocabSign } from './conversation';

function placeholders(
  entries: Array<{ id: string; gloss: string; label: string; description: string; tip: string }>,
): VocabSign[] {
  return entries.map((entry) => ({
    ...entry,
    mediaStatus: 'ready' as const,
    mediaNote: 'Illustration in MODULE_IMAGES.',
  }));
}

export const EMOTIONS_SIGNS = placeholders([
  {
    id: 'happy',
    gloss: 'HAPPY',
    label: 'Happy',
    description: 'Open hands brush upward on the chest with a smile.',
    tip: 'Keep the motion light and show a clear happy face.',
  },
  {
    id: 'sad',
    gloss: 'SAD',
    label: 'Sad',
    description: 'Fingers of both hands drag down the face like tears.',
    tip: 'Match the hand movement with a sad facial expression.',
  },
  {
    id: 'angry',
    gloss: 'ANGRY',
    label: 'Angry',
    description: 'Bent hands claw upward in front of the face.',
    tip: 'Eyebrows down help the meaning read clearly.',
  },
  {
    id: 'love',
    gloss: 'LOVE',
    label: 'Love',
    description: 'Crossed arms hug the chest, fists near opposite shoulders.',
    tip: 'Hold briefly; it often pairs with a warm expression.',
  },
  {
    id: 'scared',
    gloss: 'SCARED',
    label: 'Scared',
    description: 'Open hands jump inward toward the chest suddenly.',
    tip: 'A sharp start sells the feeling better than a slow move.',
  },
]);

export const ANIMALS_SIGNS = placeholders([
  {
    id: 'cat',
    gloss: 'CAT',
    label: 'Cat',
    description: 'Pinch near the cheek and pull outward like whiskers.',
    tip: 'Repeat once or twice on each side if needed.',
  },
  {
    id: 'dog',
    gloss: 'DOG',
    label: 'Dog',
    description: 'Pat the thigh then snap, like calling a dog.',
    tip: 'A small snap is enough; keep it casual.',
  },
  {
    id: 'bird',
    gloss: 'BIRD',
    label: 'Bird',
    description: 'Index and thumb open and close at the mouth like a beak.',
    tip: 'Keep the motion near the mouth, not too big.',
  },
  {
    id: 'fish',
    gloss: 'FISH',
    label: 'Fish',
    description: 'Flat hand waves forward like a fish swimming.',
    tip: 'The hand faces sideways and travels outward.',
  },
  {
    id: 'horse',
    gloss: 'HORSE',
    label: 'Horse',
    description: 'Thumb on the temple, index and middle bend like an ear.',
    tip: 'A short double bend reads clearly.',
  },
]);

export const FOOD_SIGNS = placeholders([
  {
    id: 'eat',
    gloss: 'EAT',
    label: 'Eat',
    description: 'Fingertips tap the mouth as if putting food in.',
    tip: 'Repeat two or three times for the verb eat.',
  },
  {
    id: 'drink',
    gloss: 'DRINK',
    label: 'Drink',
    description: 'C handshape tilts toward the mouth like a cup.',
    tip: 'A small tip is clearer than a big swing.',
  },
  {
    id: 'water',
    gloss: 'WATER',
    label: 'Water',
    description: 'W handshape taps the chin a couple of times.',
    tip: 'Keep the W clear and the taps light.',
  },
  {
    id: 'apple',
    gloss: 'APPLE',
    label: 'Apple',
    description: 'Knuckle of the index twists on the cheek.',
    tip: 'A small twist is enough.',
  },
  {
    id: 'bread',
    gloss: 'BREAD',
    label: 'Bread',
    description: 'One hand slices across the back of the other like cutting a loaf.',
    tip: 'Think of slicing bread, not chopping hard.',
  },
]);

export const BODY_PARTS_SIGNS = placeholders([
  {
    id: 'head',
    gloss: 'HEAD',
    label: 'Head',
    description: 'Fingertips tap the side of the head.',
    tip: 'Touch lightly near the temple.',
  },
  {
    id: 'eye',
    gloss: 'EYE',
    label: 'Eye',
    description: 'Point to the eye with the index finger.',
    tip: 'Point clearly without touching the eye.',
  },
  {
    id: 'ear',
    gloss: 'EAR',
    label: 'Ear',
    description: 'Point to or lightly hold the ear.',
    tip: 'A short point reads well.',
  },
  {
    id: 'hand',
    gloss: 'HAND',
    label: 'Hand',
    description: 'One flat hand brushes across the back of the other.',
    tip: 'Show the whole hand surface.',
  },
  {
    id: 'arm',
    gloss: 'ARM',
    label: 'Arm',
    description: 'One hand slides along the opposite forearm.',
    tip: 'Start near the elbow and move toward the wrist.',
  },
]);

export const WORK_SIGNS = placeholders([
  {
    id: 'work',
    gloss: 'WORK',
    label: 'Work',
    description: 'S fists tap together with dominant hand on top.',
    tip: 'Two short taps are clearer than one hard hit.',
  },
  {
    id: 'job',
    gloss: 'JOB',
    label: 'Job',
    description: 'Fingerspell J-O-B, or use WORK in context.',
    tip: 'In many courses WORK covers everyday job talk.',
  },
  {
    id: 'boss',
    gloss: 'BOSS',
    label: 'Boss',
    description: 'Open claw taps the shoulder like an epaulette.',
    tip: 'Keep the tap on the shoulder, not the chest.',
  },
  {
    id: 'office',
    gloss: 'OFFICE',
    label: 'Office',
    description: 'O hands outline a square then settle like a room plan.',
    tip: 'Think of drawing a small floor plan in front of you.',
  },
  {
    id: 'meeting',
    gloss: 'MEETING',
    label: 'Meeting',
    description: 'Fingertips of both hands meet and separate repeatedly.',
    tip: 'A few quick meets show people gathering.',
  },
]);

export const INTERNET_SIGNS = placeholders([
  {
    id: 'internet',
    gloss: 'INTERNET',
    label: 'Internet',
    description: 'Middle fingers of both hands touch then hands open outward.',
    tip: 'Start contacting, then expand like a network.',
  },
  {
    id: 'wifi',
    gloss: 'WIFI',
    label: 'Wi-Fi',
    description: 'Open 5 hands pulse outward near the head like a signal.',
    tip: 'Small pulses read better than huge waves.',
  },
  {
    id: 'video-call',
    gloss: 'VIDEO-CALL',
    label: 'Video call',
    description: 'C hand at the eye then move forward like a camera call.',
    tip: 'Combine camera idea with a forward contact motion.',
  },
  {
    id: 'message',
    gloss: 'MESSAGE',
    label: 'Message',
    description: 'Dominant fingertips brush from the non-dominant palm outward.',
    tip: 'Think of sending a short note away from you.',
  },
  {
    id: 'download',
    gloss: 'DOWNLOAD',
    label: 'Download',
    description: 'Open hand pulls downward into the other palm.',
    tip: 'The motion goes down into the receiving hand.',
  },
  {
    id: 'sent',
    gloss: 'SENT',
    label: 'Sent',
    description: 'Flat hand flicks forward from the other hand like sending mail.',
    tip: 'A quick forward flick finishes the idea.',
  },
]);

export const SCHOOL_SIGNS = placeholders([
  {
    id: 'school',
    gloss: 'SCHOOL',
    label: 'School',
    description: 'Clap the hands twice with palms facing each other.',
    tip: 'Two light claps are the classic school sign.',
  },
  {
    id: 'teacher',
    gloss: 'TEACHER',
    label: 'Teacher',
    description: 'Flat hands open forward from the forehead, then person ending.',
    tip: 'Show the idea of giving knowledge, then person.',
  },
  {
    id: 'student',
    gloss: 'STUDENT',
    label: 'Student',
    description: 'Hand pulls knowledge from the forehead into the other palm, then person.',
    tip: 'Learning into the hand, then person marker.',
  },
  {
    id: 'book',
    gloss: 'BOOK',
    label: 'Book',
    description: 'Palms together then open like a book.',
    tip: 'Open once clearly; do not over-flap.',
  },
  {
    id: 'homework',
    gloss: 'HOMEWORK',
    label: 'Homework',
    description: 'Sign HOME then WORK.',
    tip: 'Treat it as one compound idea.',
  },
]);

export const SPORTS_SIGNS = placeholders([
  {
    id: 'sports',
    gloss: 'SPORTS',
    label: 'Sports',
    description: 'A fists twist against each other like competing.',
    tip: 'A short twist reads as competition.',
  },
  {
    id: 'ball',
    gloss: 'BALL',
    label: 'Ball',
    description: 'Curved hands form a ball shape in front of you.',
    tip: 'Show roundness, not a flat clap.',
  },
  {
    id: 'run',
    gloss: 'RUN',
    label: 'Run',
    description: 'L hands alternate forward in a running motion.',
    tip: 'Keep the motion quick and forward.',
  },
  {
    id: 'swim',
    gloss: 'SWIM',
    label: 'Swim',
    description: 'Hands scoop forward like swimming strokes.',
    tip: 'Two strokes are enough.',
  },
  {
    id: 'play',
    gloss: 'PLAY',
    label: 'Play',
    description: 'Y hands shake loosely in front of the body.',
    tip: 'Keep it playful and light.',
  },
]);
