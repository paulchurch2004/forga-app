const fs = require('fs');
const path = require('path');

const mealsDir = path.join(__dirname, '..', 'src', 'data', 'meals');
const files = [
  'dinner_extra.ts',
  'lunch_extra.ts',
  'breakfast_extra.ts',
  'morningSnack_extra.ts',
  'afternoonSnack_extra.ts',
  'bedtime_extra.ts',
];

for (const fname of files) {
  const filePath = path.join(mealsDir, fname);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixCount = 0;

  const fixed = lines.map((line) => {
    const stripped = line.trimStart();
    // Only fix string literal lines and description/name fields
    const isStringLine =
      (stripped.startsWith("'") &&
        (stripped.endsWith("',") || stripped.endsWith("'"))) ||
      stripped.includes('description:') ||
      stripped.includes('name:');

    if (!isStringLine) return line;

    // Replace ALL unescaped single quotes that look like French contractions
    // Match: any word char (unicode) + unescaped ' + any word char (unicode)
    // Use a broader approach: find ' not preceded by \ and between word-like chars
    let newLine = '';
    let inString = false;
    let stringChar = null;
    let i = 0;

    // Simple approach: find the string content between the outermost quotes
    // and replace unescaped apostrophes within
    // Actually, let's just use a pragmatic regex with broader unicode support
    const result = line.replace(
      /(\w)'(\w)/gu,
      (match, p1, p2, offset) => {
        // Check if already escaped
        if (offset > 0 && line[offset + p1.length - 1] === '\\') return match;
        fixCount++;
        return p1 + "\\'" + p2;
      }
    );
    return result;
  });

  fs.writeFileSync(filePath, fixed.join('\n'), 'utf8');
  console.log(`${fname}: ${fixCount} apostrophes fixed`);
}
