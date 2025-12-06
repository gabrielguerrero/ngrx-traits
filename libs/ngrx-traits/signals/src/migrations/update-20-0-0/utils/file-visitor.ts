/**
 * File visitor for processing TypeScript and HTML files
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
  filePath: string;
  content: string;
  isTypeScript: boolean;
  isHtml: boolean;
}

/**
 * Walk directory recursively and find TypeScript and HTML files
 */
export function walkDirectory(dir: string, predicate?: (file: string) => boolean): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const stats = fs.statSync(currentPath);

    if (stats.isDirectory()) {
      // Skip node_modules and common build dirs
      if (['.git', 'node_modules', 'dist', 'build', '.angular'].includes(path.basename(currentPath))) {
        return;
      }

      fs.readdirSync(currentPath).forEach(file => {
        walk(path.join(currentPath, file));
      });
    } else if (stats.isFile()) {
      if (predicate ? predicate(currentPath) : isRelevantFile(currentPath)) {
        files.push(currentPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Check if file should be processed (TypeScript or HTML)
 */
export function isRelevantFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.ts' || ext === '.html';
}

/**
 * Read file safely
 */
export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Write file safely
 */
export function writeFile(filePath: string, content: string): boolean {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Get file information
 */
export function getFileInfo(filePath: string): FileInfo | null {
  const content = readFile(filePath);
  if (!content) {
    return null;
  }

  const ext = path.extname(filePath).toLowerCase();

  return {
    filePath,
    content,
    isTypeScript: ext === '.ts',
    isHtml: ext === '.html'
  };
}

/**
 * Get relative path for display
 */
export function getRelativePath(basePath: string, filePath: string): string {
  const relative = path.relative(basePath, filePath);
  return relative.startsWith('..') ? filePath : relative;
}

/**
 * Find all TypeScript files in a directory
 */
export function findTypeScriptFiles(dir: string): string[] {
  return walkDirectory(dir, (file) => file.endsWith('.ts'));
}

/**
 * Find all HTML files in a directory
 */
export function findHtmlFiles(dir: string): string[] {
  return walkDirectory(dir, (file) => file.endsWith('.html'));
}

/**
 * Get files with extension
 */
export function getFilesWithExtension(dir: string, ext: string): string[] {
  return walkDirectory(dir, (file) => file.endsWith(ext));
}

/**
 * Check if directory contains @ngrx-traits usage
 */
export function hasNgrxTraitsUsage(dir: string): boolean {
  const tsFiles = findTypeScriptFiles(dir);
  return tsFiles.some(file => {
    const content = readFile(file);
    return content ? /@ngrx-traits\/signals/.test(content) : false;
  });
}
