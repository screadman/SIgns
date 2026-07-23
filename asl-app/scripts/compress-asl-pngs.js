const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_EDGE = 256;
const DIRS = ['assets/asl/letters', 'assets/asl/numbers'];

async function compressFile(filePath) {
  const before = fs.statSync(filePath).size;
  const input = fs.readFileSync(filePath);
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? MAX_EDGE;
  const height = meta.height ?? MAX_EDGE;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));

  const output = await sharp(input)
    .resize({
      width: targetWidth,
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      palette: true,
      quality: 80,
      effort: 10,
    })
    .toBuffer();

  fs.writeFileSync(filePath, output);
  const after = fs.statSync(filePath).size;
  return { before, after, name: path.basename(filePath) };
}

async function main() {
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const dir of DIRS) {
    const files = fs
      .readdirSync(dir)
      .filter((name) => name.toLowerCase().endsWith('.png'))
      .map((name) => path.join(dir, name));

    for (const file of files) {
      const result = await compressFile(file);
      beforeTotal += result.before;
      afterTotal += result.after;
      console.log(
        `${result.name}: ${Math.round(result.before / 1024)}KB -> ${Math.round(result.after / 1024)}KB`,
      );
    }
  }

  console.log(
    `TOTAL: ${(beforeTotal / 1024 / 1024).toFixed(2)}MB -> ${(afterTotal / 1024 / 1024).toFixed(2)}MB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
