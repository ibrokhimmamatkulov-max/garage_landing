/* eslint-disable */
const fs = require('fs');

const outputPath =
  'C:\\Users\\ms_jura\\.gemini\\antigravity-ide\\brain\\42eccbf3-cb0a-4b27-9feb-0c0abef137b4\\.system_generated\\steps\\1177\\output.txt';

try {
  const content = fs.readFileSync(outputPath, 'utf8');
  const lines = content.split(/\r?\n/);

  let inGlobalVars = false;
  let currentKey = null;
  let currentObj = {};

  const textStyles = {};
  const fills = {};
  const layouts = {};
  const effects = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('globalVars:')) {
      inGlobalVars = true;
      continue;
    }

    if (!inGlobalVars) continue;

    const matchKey = line.match(/^\s{4}(\w+):/);
    if (matchKey) {
      const key = matchKey[1];
      currentKey = key;
      currentObj = {};

      if (key.startsWith('style_')) {
        textStyles[key] = currentObj;
      } else if (key.startsWith('fill_')) {
        fills[key] = [];
      } else if (key.startsWith('layout_')) {
        layouts[key] = currentObj;
      } else if (key.startsWith('effect_')) {
        effects[key] = currentObj;
      }
      continue;
    }

    if (currentKey) {
      if (currentKey.startsWith('fill_')) {
        const matchVal = line.match(/^\s{6}-\s*['"]?([^'"]+)['"]?/);
        if (matchVal) {
          fills[currentKey].push(matchVal[1]);
        }
      } else {
        const matchProp = line.match(/^\s{6}(\w+):\s*['"]?([^'"]+)['"]?/);
        if (matchProp) {
          currentObj[matchProp[1]] = matchProp[2];
        }
      }
    }
  }

  console.log('TEXT STYLES:');
  console.log(JSON.stringify(textStyles, null, 2));

  console.log('\nFILLS:');
  console.log(JSON.stringify(fills, null, 2));

  console.log('\nEFFECTS:');
  console.log(JSON.stringify(effects, null, 2));
} catch (e) {
  console.error('Error:', e);
}
