const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'assets', 'asl');

function maps(dir) {
  return fs
    .readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith('.png'))
    .sort((a, b) => {
      const aId = a.replace('.png', '');
      const bId = b.replace('.png', '');
      if (/^\d+$/.test(aId) && /^\d+$/.test(bId)) {
        return Number(aId) - Number(bId);
      }
      return aId.localeCompare(bId);
    })
    .map((f) => {
      const id = f.replace('.png', '');
      return `  '${id}': require('../assets/asl/${dir}/${f}'),`;
    })
    .join('\n');
}

function write(name, exportName, dir) {
  const body = `import type { ImageSourcePropType } from 'react-native';

export const ${exportName}: Record<string, ImageSourcePropType> = {
${maps(dir)}
};
`;
  const out = path.join(__dirname, '..', 'constants', name);
  fs.writeFileSync(out, body);
  console.log('wrote', out);
}

write('aslLetterImages.ts', 'LETTER_IMAGES', 'letters');
write('aslNumberImages.ts', 'NUMBER_IMAGES', 'numbers');
