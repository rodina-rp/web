import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const possiblePaths = [
  '../node_modules/minisearch/dist/es/index.js',
  '../node_modules/minisearch/dist/umd/index.min.js',
  '../node_modules/minisearch/dist/cjs/index.js',
  '../node_modules/minisearch/dist/umd/index.js',
  '../node_modules/minisearch/dist/minisearch.min.js'
];

let sourcePath = null;
for (const possiblePath of possiblePaths) {
  const fullPath = path.join(__dirname, possiblePath);
  if (fs.existsSync(fullPath)) {
    sourcePath = fullPath;
    console.log(`Найден файл: ${possiblePath}`);
    break;
  }
}

const destPath = path.join(__dirname, '../public/js/minisearch.js');

if (sourcePath) {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, destPath);
  console.log(`MiniSearch скопирован в ${destPath}`);
} else {
  console.error('Файл MiniSearch не найден. Проверьте установку:');
  
  const stub = `console.warn('MiniSearch не найден, используется простой поиск');
export default class MiniSearch {
  constructor() { this.docs = []; }
  addAll() { return this; }
  search() { return []; }
  getDocument() { return null; }
}`;
  
  fs.writeFileSync(destPath, stub);
  console.log(`Создана заглушка MiniSearch в ${destPath}`);
}