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

## Vocab modules (drop-in)

Place one Color PNG per sign as `{signId}.png` in the module folder, then run:

```bash
node scripts/gen-asl-image-maps.js
```

**Licence:** LessonPix images are not scraped into this repo. Standard LessonPix membership is classroom / therapy / family only. For app distribution, request a Limited Distribution License from `licensing@lessonpix.com` before shipping those assets. Browse: https://lessonpix.com/clipart/355/ASL

Suggested LessonPix categories below are starting points; search by gloss if a category does not match.

### conversation/ (ASL Core Vocab / Actions)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `hello.png` | Hello | ASL Core Vocab |
| `goodbye.png` | Goodbye | ASL Core Vocab |
| `good-morning.png` | Good morning | ASL Core Vocab / Days |
| `meet-you.png` | Meet you | ASL Core Vocab |
| `nice-to-meet-you.png` | Nice to meet you! | ASL Core Vocab |
| `im-fine.png` | I'm fine | ASL Feelings / Core Vocab |
| `excuse-me.png` | Excuse me | ASL Core Vocab |
| `thank-you.png` | Thank you | ASL Core Vocab |
| `youre-welcome.png` | You're welcome! | ASL Core Vocab |
| `please.png` | Please | ASL Core Vocab |
| `again.png` | Again | ASL Core Vocab / Actions |
| `yes.png` | Yes | ASL Core Vocab |
| `no.png` | No | ASL Core Vocab |

### wh-questions/ (ASL Core Vocab / Descriptions)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `what.png` | What? | ASL Core Vocab |
| `where.png` | Where? | ASL Core Vocab |
| `when.png` | When? | ASL Core Vocab / Days |
| `who.png` | Who? | ASL Core Vocab |
| `why.png` | Why? | ASL Core Vocab |
| `how.png` | How? | ASL Core Vocab |
| `whats-your-name.png` | What's your name? | ASL Core Vocab |
| `how-are-you.png` | How are you? | ASL Core Vocab / Feelings |

### emotions/ (ASL Feelings)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `happy.png` | Happy | ASL Feelings |
| `sad.png` | Sad | ASL Feelings |
| `angry.png` | Angry | ASL Feelings |
| `love.png` | Love | ASL Feelings |
| `scared.png` | Scared | ASL Feelings |

### animals/ (ASL Animals)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `cat.png` | Cat | ASL Animals |
| `dog.png` | Dog | ASL Animals |
| `bird.png` | Bird | ASL Animals |
| `fish.png` | Fish | ASL Animals |
| `horse.png` | Horse | ASL Animals |

### food/ (ASL Food)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `eat.png` | Eat | ASL Food / Actions |
| `drink.png` | Drink | ASL Food / Actions |
| `water.png` | Water | ASL Food |
| `apple.png` | Apple | ASL Food |
| `bread.png` | Bread | ASL Food |

### body-parts/ (ASL Body Parts)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `head.png` | Head | ASL Body Parts |
| `eye.png` | Eye | ASL Body Parts |
| `ear.png` | Ear | ASL Body Parts |
| `hand.png` | Hand | ASL Body Parts |
| `arm.png` | Arm | ASL Body Parts |

### work/ (ASL Core Vocab / Actions)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `work.png` | Work | ASL Core Vocab / Actions |
| `job.png` | Job | ASL Core Vocab |
| `boss.png` | Boss | ASL Core Vocab |
| `office.png` | Office | ASL Household / Core Vocab |
| `meeting.png` | Meeting | ASL Core Vocab / Actions |

### internet/ (ASL Core Vocab / Actions)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `internet.png` | Internet | ASL Core Vocab |
| `wifi.png` | Wi-Fi | ASL Core Vocab |
| `video-call.png` | Video call | ASL Core Vocab / Actions |
| `message.png` | Message | ASL Core Vocab / Actions |
| `download.png` | Download | ASL Actions |
| `sent.png` | Sent | ASL Actions |

### school/ (ASL Core Vocab)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `school.png` | School | ASL Core Vocab |
| `teacher.png` | Teacher | ASL Core Vocab |
| `student.png` | Student | ASL Core Vocab |
| `book.png` | Book | ASL Core Vocab |
| `homework.png` | Homework | ASL Core Vocab |

### sports/ (ASL Actions / Core Vocab)

| File | Label | LessonPix hint |
|------|-------|----------------|
| `sports.png` | Sports | ASL Actions / Core Vocab |
| `ball.png` | Ball | ASL Actions |
| `run.png` | Run | ASL Actions |
| `swim.png` | Swim | ASL Actions |
| `play.png` | Play | ASL Actions |

## Mapping (code)

- Alphabet / Numbers: `constants/aslLetters.ts`, `aslLetterImages.ts`, `aslNumberImages.ts`
- Conversation: `constants/conversation.ts`
- Questions: `constants/whQuestions.ts`
- Extra categories: `constants/dictionaryCategories.ts`
- Modules: `constants/learning.ts`
- Image resolver: `lib/signImages.ts`
- Generated maps: `constants/aslModuleImages.ts` (+ letter/number maps)

Favorites are stored locally (`favorite_lesson_ids` in AsyncStorage).
