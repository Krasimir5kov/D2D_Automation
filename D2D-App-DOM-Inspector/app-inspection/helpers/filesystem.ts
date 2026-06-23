import * as fs from 'fs';
import * as path from 'path';

export const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function saveJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveText(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function saveHtml(filePath: string, html: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, html, 'utf-8');
}

export function appendText(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf-8');
}

export function outputPath(...segments: string[]): string {
  return path.join(OUTPUT_DIR, ...segments);
}

export function screenshotPath(name: string): string {
  return outputPath('screenshots', `${sanitizeFilename(name)}.png`);
}

export function domPath(name: string): string {
  return outputPath('dom', `${sanitizeFilename(name)}.html`);
}

export function accessibilityPath(name: string): string {
  return outputPath('accessibility', `${sanitizeFilename(name)}.txt`);
}

export function pageMdPath(name: string): string {
  return outputPath('pages', `${sanitizeFilename(name)}.md`);
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_\-\.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function humanTimestamp(): string {
  return new Date().toISOString();
}

export function initOutputDirs(): void {
  const dirs = [
    outputPath('pages'),
    outputPath('dom'),
    outputPath('accessibility'),
    outputPath('screenshots'),
    outputPath('flows'),
    outputPath('data'),
    outputPath('reports'),
    outputPath('test-suggestions'),
  ];
  dirs.forEach(ensureDir);
}
