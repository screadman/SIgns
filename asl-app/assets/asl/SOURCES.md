# Sources images ASL

## Format

Images fixes (PNG), pas de GIF pour le MVP.

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

Les lettres wpclipart et la planche Gallaudet partagent la meme base typographique
(Gallaudet), mais le style de trait n est pas identique (silhouettes vs croquis).

## Mapping

`asl-app/constants/aslLetters.ts` : `ASL_LETTERS` (A-Z) et `ASL_NUMBERS` (0-9).

## Usage dans SIgns

Autorise pour une application educative (domaine public).

## Non utilise

Lifeprint.com : interdit pour les apps sans permission ecrite.
Voir https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/index.htm
