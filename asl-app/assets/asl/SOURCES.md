# Sources media ASL

App media is illustrations / stills only (no video).

## Alphabet A-Z

| Element | Detail |
|---------|--------|
| Stills PNG | Wikimedia Commons (domaine public), `assets/asl/letters/*.png` |

## Numbers 0-9

| Element | Detail |
|---------|--------|
| Origine | Wikimedia Commons |
| Licence | Domaine public |
| Stockage | `assets/asl/numbers/` |

## Dictionary categories

Core packs with real stills: Alphabet, Numbers.
Other packs (Conversation, Questions, Emotions, Animals, Food, Body parts, Work, Internet, School, Sports): gloss + tip text only for now. Lessons show "Illustration coming soon".

Favorites are stored locally (`favorite_lesson_ids` in AsyncStorage).

## Mapping

- Alphabet / Numbers: `asl-app/constants/aslLetters.ts`
- Conversation: `asl-app/constants/conversation.ts`
- Questions: `asl-app/constants/whQuestions.ts`
- Extra categories: `asl-app/constants/dictionaryCategories.ts`
- Modules: `asl-app/constants/learning.ts`
