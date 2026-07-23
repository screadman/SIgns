/**
 * Conversation vocabulary: everyday greetings and courtesy phrases.
 * Media: prefer short looping video/GIF. Still PNG is a temporary fallback only.
 */

export type MediaStatus =
  | 'ready'
  | 'commons-candidate'
  | 'needs-recording';

export type VocabSign = {
  id: string;
  gloss: string;
  label: string;
  description: string;
  tip: string;
  mediaStatus: MediaStatus;
  /** Wikimedia Commons page or local relative path once downloaded. */
  mediaNote: string;
};

/**
 * Phrases inspired by common ASL conversation collections.
 * All signs are freely browsable (no sequential lock).
 */
export const CONVERSATION_SIGNS: VocabSign[] = [
  {
    id: 'hello',
    gloss: 'HELLO',
    label: 'Hello',
    description:
      'Raise an open hand near the side of the forehead and move it slightly outward, like a small salute.',
    tip: 'Keep the movement short and friendly. Face the person you greet.',
    mediaStatus: 'commons-candidate',
    mediaNote:
      'Commons: File:Hello1.ogv or File:Hello2.ogv (CC BY-SA 3.0, author E5SUON)',
  },
  {
    id: 'good-morning',
    gloss: 'GOOD-MORNING',
    label: 'Good morning',
    description:
      'Sign GOOD (flat hand from chin forward) then MORNING (arm rises like the sun coming up).',
    tip: 'Treat it as one greeting phrase, not two separate words.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Phrase sign. Film as one continuous clip.',
  },
  {
    id: 'meet-you',
    gloss: 'MEET-YOU',
    label: 'Meet you',
    description:
      'Index fingers come together (MEET), directed toward the other person (YOU).',
    tip: 'Useful right after introductions.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'nice-to-meet-you',
    gloss: 'NICE-TO-MEET-YOU',
    label: 'Nice to meet you!',
    description:
      'NICE (two flat hands brush) then MEET (index fingers come together), directed to YOU.',
    tip: 'Learn it as one polite phrase after introductions.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Compound phrase. Record as one short video for the lesson.',
  },
  {
    id: 'im-fine',
    gloss: 'I-FINE',
    label: "I'm fine",
    description:
      'Point to yourself (I), then FINE: open hand with thumb touching the chest and a light upward brush.',
    tip: 'A calm face helps. This often answers HOW-ARE-YOU.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'excuse-me',
    gloss: 'EXCUSE-ME',
    label: 'Excuse me',
    description:
      'Fingertips of one hand brush across the palm of the other, then point toward yourself or the path.',
    tip: 'Use it to pass by politely or to get attention gently.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'thank-you',
    gloss: 'THANK-YOU',
    label: 'Thank you',
    description:
      'Flat hand starts at the chin and moves forward toward the other person.',
    tip: 'Smile slightly. The motion goes out from the chin, not down the chest.',
    mediaStatus: 'commons-candidate',
    mediaNote:
      'Commons still: File:ASL_OpenB@Chin-PalmBack.jpg (CC BY-SA). Prefer a short video recording for motion.',
  },
  {
    id: 'youre-welcome',
    gloss: 'YOU-WELCOME',
    label: "You're welcome!",
    description:
      'Open hand starts near the chin or chest and arcs forward in a welcoming motion toward the other person.',
    tip: 'Keep it warm and brief after someone signs THANK-YOU.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'please',
    gloss: 'PLEASE',
    label: 'Please',
    description:
      'Open hand circles flat on the chest in a small clockwise motion.',
    tip: 'Keep the circle small and smooth on the center of the chest.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'again',
    gloss: 'AGAIN',
    label: 'Again',
    description:
      'Bent fingertips of one hand tap into the open palm of the other.',
    tip: 'Use it to ask someone to repeat a sign or phrase.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'yes',
    gloss: 'YES',
    label: 'Yes',
    description:
      'Make a fist and nod it up and down, like a head nodding yes.',
    tip: 'Two short nods are clearer than one big motion.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'no',
    gloss: 'NO',
    label: 'No',
    description:
      'Index and middle finger tap against the thumb, like a mouth saying no.',
    tip: 'Keep the hand in front of you. Pair with a slight head shake if natural.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
];
