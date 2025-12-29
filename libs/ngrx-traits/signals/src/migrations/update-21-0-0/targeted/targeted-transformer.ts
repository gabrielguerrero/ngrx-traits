/**
 * Targeted Transformer - Phase 3: AST-aware transformations
 */

import * as ts from 'typescript';
import { TransformResult, RenameChange } from './types';
import {
  CollectionPattern,
  buildPatternsForCollections,
} from './collection-pattern-builder';

/**
 * Transform a TypeScript file using AST to avoid modifying strings/comments
 * Also handles inline templates (template literals in @Component)
 */
export function transformTypeScriptFile(
  content: string,
  filePath: string,
  collections: Set<string>
): TransformResult {
  const patterns = buildPatternsForCollections(collections);
  const allPatterns: CollectionPattern[] = [];
  patterns.forEach((p) => allPatterns.push(...p));

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const changes: RenameChange[] = [];
  const replacements: Array<{ start: number; end: number; newText: string }> = [];

  // Track if we're inside a template property of @Component
  let inComponentTemplate = false;

  function visit(node: ts.Node) {
    // Check if this is a @Component template property
    if (ts.isPropertyAssignment(node)) {
      const propName = node.name.getText(sourceFile);
      if (propName === 'template') {
        inComponentTemplate = true;
        ts.forEachChild(node, visit);
        inComponentTemplate = false;
        return;
      }
    }

    // Process template literals inside @Component template property
    if (inComponentTemplate && ts.isNoSubstitutionTemplateLiteral(node)) {
      const templateContent = node.text;
      let newContent = templateContent;

      for (const pattern of allPatterns) {
        // Reset regex lastIndex for global patterns
        pattern.pattern.lastIndex = 0;
        if (pattern.pattern.test(newContent)) {
          pattern.pattern.lastIndex = 0;
          const matches = newContent.match(pattern.pattern);
          newContent = newContent.replace(pattern.pattern, pattern.replacement);

          if (matches) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            for (const match of matches) {
              changes.push({
                oldName: match,
                newName: pattern.replacement,
                line: line + 1,
              });
            }
          }
        }
      }

      if (newContent !== templateContent) {
        const start = node.getStart(sourceFile) + 1; // Skip opening backtick
        const end = node.getEnd() - 1; // Skip closing backtick
        replacements.push({ start, end, newText: newContent });
      }
      return;
    }

    // Process identifiers (skip string literals, comments, etc.)
    if (ts.isIdentifier(node)) {
      const text = node.text;

      for (const pattern of allPatterns) {
        pattern.pattern.lastIndex = 0;
        if (pattern.pattern.test(text)) {
          pattern.pattern.lastIndex = 0;
          const newText = text.replace(pattern.pattern, pattern.replacement);
          if (newText !== text) {
            const start = node.getStart(sourceFile);
            const end = node.getEnd();
            const { line } = sourceFile.getLineAndCharacterOfPosition(start);

            replacements.push({ start, end, newText });
            changes.push({
              oldName: text,
              newName: newText,
              line: line + 1,
            });
          }
          break;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (replacements.length === 0) {
    return { modified: false, content, changes: [] };
  }

  // Sort replacements in reverse order to apply from end to start
  replacements.sort((a, b) => b.start - a.start);

  let result = content;
  for (const { start, end, newText } of replacements) {
    result = result.substring(0, start) + newText + result.substring(end);
  }

  return { modified: true, content: result, changes };
}

/**
 * Transform an HTML file using targeted regex patterns
 */
export function transformHtmlFile(
  content: string,
  collections: Set<string>
): TransformResult {
  const patterns = buildPatternsForCollections(collections);
  const changes: RenameChange[] = [];
  let result = content;
  let modified = false;

  patterns.forEach((collectionPatterns) => {
    for (const pattern of collectionPatterns) {
      const matches = result.match(pattern.pattern);
      if (matches) {
        modified = true;
        result = result.replace(pattern.pattern, pattern.replacement);

        for (const match of matches) {
          const lineNum = getLineNumber(content, content.indexOf(match));
          changes.push({
            oldName: match,
            newName: pattern.replacement,
            line: lineNum,
          });
        }
      }
    }
  });

  return { modified, content: result, changes };
}

/**
 * Get line number for a position in text
 */
function getLineNumber(text: string, position: number): number {
  const lines = text.substring(0, position).split('\n');
  return lines.length;
}
