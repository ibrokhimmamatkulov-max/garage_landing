import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

const ROOT_DIR = 'src';
const ENTRYPOINT_FILE = 'index.vue';

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function walk(dirPath, result = []) {
  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath, result);
      continue;
    }

    if (entry === ENTRYPOINT_FILE) {
      result.push(fullPath);
    }
  }

  return result;
}

function extractDefineOptionsName(content) {
  const match = content.match(/defineOptions\s*\(\s*\{[\s\S]*?name\s*:\s*['"]([^'"]+)['"]/m);
  return match?.[1] ?? null;
}

function run() {
  const files = walk(ROOT_DIR);
  const violations = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    const actualName = extractDefineOptionsName(content);
    const folderName = basename(dirname(filePath));
    const expectedName = toPascalCase(folderName);

    if (!actualName) {
      violations.push({
        filePath,
        reason: `missing defineOptions({ name: '${expectedName}' })`,
      });
      continue;
    }

    if (actualName !== expectedName) {
      violations.push({
        filePath,
        reason: `expected name '${expectedName}', got '${actualName}'`,
      });
    }
  }

  if (!violations.length) {
    console.log(`Entrypoint name check passed: ${files.length} index.vue files.`);
    return;
  }

  console.error('Entrypoint name check failed:');
  for (const violation of violations) {
    console.error(`- ${violation.filePath}: ${violation.reason}`);
  }
  process.exitCode = 1;
}

run();
