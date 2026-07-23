import type { VocabSign } from './conversation';

/**
 * WH Questions: question words used to ask for information in ASL.
 * Freely browsable; practice stays optional.
 */
export const WH_QUESTION_SIGNS: VocabSign[] = [
  {
    id: 'what',
    gloss: 'WHAT',
    label: 'What?',
    description:
      'Both hands open with palms up; move them slightly side to side while frowning for the question.',
    tip: 'Eyebrows down for WH questions. Eye contact matters.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'where',
    gloss: 'WHERE',
    label: 'Where?',
    description:
      'Index finger points up and wiggles side to side while asking where.',
    tip: 'Keep the finger in front of you, not too high.',
    mediaStatus: 'ready',
    mediaNote: 'PopSign ASL v1.0 (where), CC BY 4.0',
  },
  {
    id: 'when',
    gloss: 'WHEN',
    label: 'When?',
    description:
      'Index finger of the dominant hand circles around the upright index of the other hand, then may land on the tip.',
    tip: 'Use the WH facial expression (eyebrows down).',
    mediaStatus: 'needs-recording',
    mediaNote: 'PopSign v2 preview exists but full download is not published yet.',
  },
  {
    id: 'who',
    gloss: 'WHO',
    label: 'Who?',
    description:
      'Thumb on the chin, index finger wiggles, or a small circular motion near the mouth while asking who.',
    tip: 'Pair with a questioning face so it reads clearly.',
    mediaStatus: 'ready',
    mediaNote: 'PopSign ASL v1.0 (who), CC BY 4.0',
  },
  {
    id: 'why',
    gloss: 'WHY',
    label: 'Why?',
    description:
      'Fingertips touch the forehead then the hand opens as it moves slightly forward and down.',
    tip: 'Often used with a puzzled or questioning expression.',
    mediaStatus: 'ready',
    mediaNote: 'PopSign ASL v1.0 (why), CC BY 4.0',
  },
  {
    id: 'how',
    gloss: 'HOW',
    label: 'How?',
    description:
      'Two fists meet with thumbs up, then roll open as you ask how.',
    tip: 'Raise or lower brows depending on whether it is a real WH question.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Needs original video/GIF under a clear free license.',
  },
  {
    id: 'whats-your-name',
    gloss: 'WHAT-YOUR-NAME',
    label: "What's your name?",
    description:
      'Sign WHAT, then YOUR, then NAME (H hands tap together twice), directed at the other person.',
    tip: 'Common first conversation question. Film as one phrase.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Phrase sign. Best filmed as one continuous clip.',
  },
  {
    id: 'how-are-you',
    gloss: 'HOW-ARE-YOU',
    label: 'How are you?',
    description:
      'Two fists meet thumbs-up then roll open while asking how the person is.',
    tip: 'Raise your eyebrows for the question face. Eye contact matters.',
    mediaStatus: 'needs-recording',
    mediaNote: 'Phrase sign. Best filmed as one continuous clip.',
  },
];
