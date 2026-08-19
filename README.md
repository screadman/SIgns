# SIGNS

A mobile app that makes learning American Sign Language (ASL) accessible and fun: a free-browse visual dictionary, gamified quizzes, streaks, and personalized push notifications, built entirely offline-first with no backend required.

Built with: React Native, Expo Router, TypeScript, NativeWind

---

## What it does

SIGNS lets anyone learn ASL through a searchable visual dictionary covering 12 categories (alphabet, numbers, everyday conversation, emotions, and more), reinforced by interactive quizzes with a streak-and-XP progression system inspired by Duolingo.

- Visual dictionary: 12 vocabulary categories, instant search, favorites
- Adaptive quizzes: multiple-choice practice generated dynamically per lesson
- Real progress tracking: streaks and XP computed from actual usage history, not simulated counters
- Achievements: badge system tied to real milestones
- Smart reminders: local push notifications that adapt their message to the user's live streak count
- Fully offline: zero backend dependency; all state lives on-device via AsyncStorage

---

## Technical highlights

A few things worth a closer look in the codebase:

- File-based routing architecture using Expo Router, with route groups separating tab navigation, auth, and modal-style flows without polluting the URL structure
- Automated asset pipeline: a Node script (scripts/gen-asl-image-maps.js) scans image folders and regenerates typed image lookup maps, so adding new illustrated content never requires touching TypeScript by hand
- Streak-aware notification content: reminder copy is generated at schedule time using the user's real, calculated streak (not hardcoded), then re-synced on every app launch to stay current
- Defensive data handling: progress data read from local storage is validated and deduplicated before use, so corrupted or partial AsyncStorage state degrades gracefully instead of crashing

---

## Tech stack

| Layer | Tools |
|---|---|
| Framework | React Native (Expo SDK 57) |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind) and StyleSheet |
| Language | TypeScript |
| Local persistence | AsyncStorage |
| Native features | expo-notifications, expo-camera, expo-image-picker |
| Animation | react-native-reanimated |

---

## Running it locally

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS/Android), or press w for the web preview.

---

## Team

Built by Rayann Sagnon and Steven Atchall as a collaborative side project.

<img width="1001" height="2048" alt="WhatsApp Image 2026-08-19 at 9 11 24 AM" src="https://github.com/user-attachments/assets/98204ba1-6173-471f-9f65-f2ebe3b160b1" /> <img width="1004" height="2048" alt="WhatsApp Image 2026-08-19 at 9 11 24 AM (2)" src="https://github.com/user-attachments/assets/f96b7197-5b94-4108-8149-07ada9ecd2b2" /> <img width="1003" height="2048" alt="WhatsApp Image 2026-08-19 at 9 11 24 AM (1)" src="https://github.com/user-attachments/assets/ebc8585b-622f-4df3-9b64-d5f3aaddd46e" />



