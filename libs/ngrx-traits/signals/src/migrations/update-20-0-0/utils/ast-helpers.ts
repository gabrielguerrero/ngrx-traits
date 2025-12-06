/**
 * AST helpers for TypeScript transformations
 * Handles renaming of identifiers in TypeScript files
 */

import * as ts from 'typescript';
import { getAllPatterns } from './pattern-matchers';

export interface RenameOccurrence {
  oldName: string;
  newName: string;
  line: number;
  column: number;
  count: number;
}

/**
 * Transform TypeScript source file to rename patterns
 */
export function transformTypeScriptFile(
  sourceFile: ts.SourceFile,
  filePath: string
): { transformed: string; occurrences: RenameOccurrence[] } {
  const occurrences: RenameOccurrence[] = [];
  let result = sourceFile.text;

  const patterns = getAllPatterns();

  // Process each pattern
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

    while ((match = regex.exec(sourceFile.text)) !== null) {
      const oldName = match[0];
      const name = match[1] || match[0].replace(/[^\w]/g, '');
      const newName = pattern.replacement(oldName, name);

      if (oldName !== newName) {
        // Count occurrences and find line/column
        const lineStart = sourceFile.text.lastIndexOf('\n', match.index) + 1;
        const line = sourceFile.getLineAndCharacterOfPosition(match.index).line + 1;
        const column = match.index - lineStart + 1;

        occurrences.push({
          oldName,
          newName,
          line,
          column,
          count: 1
        });

        // Replace in result
        result = result.replace(oldName, newName);
      }
    }
  });

  return { transformed: result, occurrences };
}

/**
 * Parse TypeScript file and return AST
 */
export function parseTypeScriptFile(content: string, filePath: string): ts.SourceFile {
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
}

/**
 * Visit AST nodes and collect identifier references
 */
export function visitNodes(
  node: ts.Node,
  visitor: (node: ts.Node) => void
): void {
  visitor(node);
  ts.forEachChild(node, (child) => visitNodes(child, visitor));
}

/**
 * Extract all identifier names from a file
 */
export function extractIdentifiers(sourceFile: ts.SourceFile): string[] {
  const identifiers: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      identifiers.push(node.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return Array.from(new Set(identifiers));
}

/**
 * Check if a node is a property access expression
 */
export function isPropertyAccessExpression(node: ts.Node): node is ts.PropertyAccessExpression {
  return ts.isPropertyAccessExpression(node);
}

/**
 * Check if a node is a call expression
 */
export function isCallExpression(node: ts.Node): node is ts.CallExpression {
  return ts.isCallExpression(node);
}

/**
 * Get full text of a node
 */
export function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getFullText(sourceFile).trim();
}

/**
 * Replace text at specific position
 */
export function replaceAtPosition(
  text: string,
  startPos: number,
  endPos: number,
  replacement: string
): string {
  return text.substring(0, startPos) + replacement + text.substring(endPos);
}
