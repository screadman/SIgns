export type CultureCard = {
  id: string;
  title: string;
  body: string;
};

/** Short stills-friendly culture notes shown after Daily. */
export const CULTURE_CARDS: CultureCard[] = [
  {
    id: 'attention',
    title: 'Getting attention',
    body: 'In Deaf spaces, a gentle wave, light shoulder tap, or flicking the light can get attention. Avoid shouting or throwing objects.',
  },
  {
    id: 'eye-contact',
    title: 'Eye contact matters',
    body: 'ASL relies on vision. Breaking eye contact mid-sign can feel like interrupting. Look at the signer, not only the hands.',
  },
  {
    id: 'deaf-deaf',
    title: 'Deaf and deaf',
    body: 'Many people use Deaf (capital D) for cultural identity and community, and deaf for the audiological condition. Follow how someone self-identifies.',
  },
  {
    id: 'not-universal',
    title: 'Not one global sign language',
    body: 'ASL is not universal. Other countries have their own sign languages. Learning ASL does not mean you can sign everywhere.',
  },
  {
    id: 'facial-grammar',
    title: 'Face is grammar',
    body: 'Eyebrows, mouth, and head tilt are part of ASL grammar, not optional emotion. Practice non-manual markers with every new sign.',
  },
  {
    id: 'pace',
    title: 'Slow is respectful',
    body: 'When chatting with a new signer, slower clear signs beat fast fingerspelling. Clarity builds confidence on both sides.',
  },
  {
    id: 'community',
    title: 'Apps are practice, people are fluency',
    body: 'Use SIGNS daily, then seek real conversations: Deaf events, tutors, or friends. Language lives with people.',
  },
];

export function getCultureCardForToday(date = new Date()): CultureCard {
  const day = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  return CULTURE_CARDS[day % CULTURE_CARDS.length];
}
