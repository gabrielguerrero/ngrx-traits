interface DiffEntry {
  text: string;
  style: string;
}

export function deepDiff(name: string, oldObj: any, newObj: any): void {
  const diffEntries: DiffEntry[] = [];

  // Helper to add a diff entry
  function addDiffEntry(text: string, style: string): void {
    diffEntries.push({ text, style });
  }

  // Recursive helper that builds the diff entries.
  function diffHelper(path: string, a: any, b: any): void {
    // Both values are objects (or arrays) and not null
    if (
      typeof a === 'object' &&
      a !== null &&
      typeof b === 'object' &&
      b !== null
    ) {
      // If both are arrays, compare by index.
      if (Array.isArray(a) && Array.isArray(b)) {
        const maxLength = Math.max(a.length, b.length);
        for (let i = 0; i < maxLength; i++) {
          const currentPath = `${path}[${i}]`;
          if (i >= a.length) {
            // b has an extra element.
            addDiffEntry(
              `+ ${currentPath}: ${JSON.stringify(b[i])}`,
              'color: green',
            );
          } else if (i >= b.length) {
            // a had an element that is now removed.
            addDiffEntry(
              `- ${currentPath}: ${JSON.stringify(a[i])}`,
              'color: red',
            );
          } else {
            diffHelper(currentPath, a[i], b[i]);
          }
        }
      }
      // If both are plain objects, compare their keys.
      else if (!Array.isArray(a) && !Array.isArray(b)) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const key of keys) {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in a)) {
            addDiffEntry(
              `+ ${currentPath}: ${JSON.stringify(b[key])}`,
              'color: green',
            );
          } else if (!(key in b)) {
            addDiffEntry(
              `- ${currentPath}: ${JSON.stringify(a[key])}`,
              'color: red',
            );
          } else {
            diffHelper(currentPath, a[key], b[key]);
          }
        }
      }
      // Mismatched types: one is an array, the other an object.
      else {
        addDiffEntry(`- ${path}: ${JSON.stringify(a)}`, 'color: red');
        addDiffEntry(`+ ${path}: ${JSON.stringify(b)}`, 'color: green');
      }
    }
    // At least one value is primitive or null.
    else {
      if (a !== b) {
        addDiffEntry(`- ${path}: ${JSON.stringify(a)}`, 'color: red');
        addDiffEntry(`+ ${path}: ${JSON.stringify(b)}`, 'color: green');
      }
    }
  }

  // Start the recursive diff process.
  diffHelper('', oldObj, newObj);

  // If no differences are found, log a message.
  if (diffEntries.length === 0) {
    console.log(name, 'No differences found.');
    return;
  }

  // Build a single output string with '%c' markers for styles.
  const outputString = diffEntries.map((entry) => `%c${entry.text}`).join('\n');
  const styles = diffEntries.map((entry) => entry.style);

  // Print everything in one console.log call.
  console.log(name);
  console.log(outputString, ...styles);
}
