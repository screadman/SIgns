# Sources images ASL

## Format

Images PNG locales pour Alphabet et Numbers.
Videos / GIF prevus pour Conversation et WH Questions.

## Alphabet A-Z

| Element | Detail |
|---------|--------|
| Origine | Wikimedia Commons |
| Fichiers | `Sign_language_A.svg` ... `Sign_language_Z.svg` |
| Auteur d origine | wpclipart.com |
| Licence | Domaine public |
| Catalogue | https://commons.wikimedia.org/wiki/Category:ASL_letters |
| Stockage | `asl-app/assets/asl/letters/` |
| Rendu | PNG ~960 px de large a partir des SVG Wikimedia |

## Chiffres 0-9

| Element | Detail |
|---------|--------|
| Origine | Wikimedia Commons |
| Fichier source | `Asl_alphabet_gallaudet.png` (planche alphabet + chiffres) |
| Auteur | Ds13 (Wikipedia / Commons) |
| Licence | Domaine public |
| Page | https://commons.wikimedia.org/wiki/File:Asl_alphabet_gallaudet.png |
| Stockage | `asl-app/assets/asl/numbers/` |
| Note | Decoupages individuels de la rangee 0-9 de la planche |

## Conversation

Pack dans `asl-app/constants/conversation.ts` (liste libre, pas de verrou).

| ID | Label | Media status |
|----|-------|--------------|
| hello | Hello | commons-candidate (`Hello1.ogv`) |
| good-morning | Good morning | needs-recording |
| meet-you | Meet you | needs-recording |
| nice-to-meet-you | Nice to meet you! | needs-recording |
| im-fine | I'm fine | needs-recording |
| excuse-me | Excuse me | needs-recording |
| thank-you | Thank you | commons-candidate |
| youre-welcome | You're welcome! | needs-recording |
| please | Please | needs-recording |
| again | Again | needs-recording |
| yes | Yes | needs-recording |
| no | No | needs-recording |

## WH Questions

Pack dans `asl-app/constants/whQuestions.ts`.

What?, Where?, When?, Who?, Why?, How?, What's your name?, How are you? (tous needs-recording).

Regles media:
- Preferer video courte ou GIF en boucle
- Wikimedia Commons OK si licence libre + attribution ici
- Lifeprint et sources non libres exclus
- Stockage cible: `asl-app/assets/asl/conversation/` et `asl-app/assets/asl/wh-questions/`

## Mapping

`asl-app/constants/aslLetters.ts` : `ASL_LETTERS`, `ASL_NUMBERS`
`asl-app/constants/conversation.ts` : `CONVERSATION_SIGNS`
`asl-app/constants/whQuestions.ts` : `WH_QUESTION_SIGNS`

## Usage dans SIgns

Domaine public / CC libre : utilisable dans l application educative avec attribution.
