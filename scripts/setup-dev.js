// scripts/setup-dev.js

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import console from 'console';

const log = (msg) => console.log(`👉 ${msg}`);
const success = (msg) => console.log(`✅ ${msg}`);
const warn = (msg) => console.log(`⚠️ ${msg}`);

// создать файл если нет
const writeFile = (path, content) => {
  if (!existsSync(path)) {
    writeFileSync(path, content);
    success(`Создан файл ${path}`);
  } else {
    warn(`Файл ${path} уже существует, пропускаем`);
  }
};

// добавить строки в файл без дублей
const appendIfMissing = (file, lines) => {
  let content = '';
  if (existsSync(file)) {
    content = readFileSync(file, 'utf-8');
  }

  const newLines = lines.filter((line) => !content.includes(line));

  if (newLines.length) {
    appendFileSync(file, '\n' + newLines.join('\n'));
    success(`Обновлён ${file}`);
  } else {
    warn(`${file} уже содержит нужные записи`);
  }
};

log('Установка зависимостей...');

const devDeps = [
  'eslint@9',
  '@eslint/js@9',
  'vue-eslint-parser',
  'typescript-eslint',
  'eslint-plugin-vue',
  'prettier',
  'eslint-config-prettier',
  'husky',
  'lint-staged',
  '@commitlint/cli',
  '@commitlint/config-conventional',
  'typescript',
  'commitizen',
  'cz-git',
];

execSync(`npm i -D ${devDeps.join(' ')}`, { stdio: 'inherit' });

log('Создание конфигурационных файлов...');

// ESLint
// TODO: обновить
const eslintConfig = `import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  prettier,
  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/multi-word-component-names": "off"
    }
  }
];
`;

writeFile('eslint.config.js', eslintConfig);

// Prettier
const prettierConfig = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
};

writeFile('.prettierrc', JSON.stringify(prettierConfig, null, 2));

// commitlint
const commitlintConfig = `module.exports = { extends: ["@commitlint/config-conventional"] };`;

writeFile('commitlint.config.cjs', commitlintConfig);

// tsconfig (если нет)
const tsconfig = {
  compilerOptions: {
    target: 'ESNext',
    module: 'ESNext',
    strict: true,
    moduleResolution: 'Node',
    esModuleInterop: true,
    skipLibCheck: true,
  },
};

writeFile('tsconfig.json', JSON.stringify(tsconfig, null, 2));

// VS Code
const vscodeSettings = {
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
  'editor.formatOnSave': true,
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': 'always',
  },
  'eslint.validate': ['javascript', 'typescript', 'vue'],
  'eslint.useFlatConfig': true,
};

mkdirSync('.vscode', { recursive: true });
writeFile('.vscode/settings.json', JSON.stringify(vscodeSettings, null, 2));

log('Настройка husky...');

execSync('npx husky init', { stdio: 'inherit' });

// перезаписываем хуки (без deprecated строк)
const huskyPreCommit = 'npx lint-staged\nnpx vue-tsc --noEmit\n';

const huskyCommitMsg = 'npx --no-install commitlint --edit "$1"\n';

writeFileSync('.husky/pre-commit', huskyPreCommit);

writeFileSync('.husky/commit-msg', huskyCommitMsg);

success('Husky настроен');

// commitizen config
const czTypes = [
  { value: 'feat', name: 'feat:     ✨ новая фича' },
  { value: 'fix', name: 'fix:      🐛 исправление бага' },
  { value: 'docs', name: 'docs:     📝 документация' },
  { value: 'style', name: 'style:    🎨 форматирование' },
  { value: 'refactor', name: 'refactor: ♻️ рефакторинг' },
  { value: 'test', name: 'test:     ✅ тесты' },
  { value: 'chore', name: 'chore:    🔧 служебное' },
];

const czConfig = `module.exports = {
  types: ${JSON.stringify(czTypes, null, 2)}
};`;
writeFile('cz.config.cjs', czConfig);

// package.json
log('Обновление package.json...');

const additionalScripts = {
  lint: 'eslint .',
  'lint:fix': 'eslint . --fix',
  format: 'prettier --write .',
  typecheck: 'vue-tsc --noEmit',
  commit: 'cz',
  prepare: 'husky',
};

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

pkg.scripts = {
  ...pkg.scripts,
  ...additionalScripts,
};

pkg['lint-staged'] = {
  '*.{js,ts,vue}': ['eslint --fix', 'prettier --write'],
};

writeFileSync('package.json', JSON.stringify(pkg, null, 2));

success('package.json обновлён');

// .gitignore
log('Обновление .gitignore...');

appendIfMissing('.gitignore', ['node_modules', 'dist', '.env', '.DS_Store', 'coverage', '*.log']);

success('Настройка завершена 🎉');
