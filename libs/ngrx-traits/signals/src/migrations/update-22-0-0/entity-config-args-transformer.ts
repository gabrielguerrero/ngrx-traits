/**
 * Rewrites the single object call form of the withEntities* features into the
 * (entityConfig, options) form:
 *
 *   withEntitiesLocalFilter({ ...productsEntityConfig, defaultFilter, filterFn })
 *   -> withEntitiesLocalFilter(productsEntityConfig, { defaultFilter, filterFn })
 *
 *   withEntitiesLocalSort({ entity, collection: 'products', defaultSort })
 *   -> withEntitiesLocalSort({ entity, collection: 'products' }, { defaultSort })
 *
 *   withEntitiesCalls({ ...productsEntityConfig, calls: (store) => ({...}) })
 *   -> withEntitiesCalls(productsEntityConfig, (store) => ({...}))
 */
import * as ts from 'typescript';

export const TRAITS_MODULE = '@ngrx-traits/signals';

const WITH_SELECT_ID = ['entity', 'collection', 'selectId'];
const NO_SELECT_ID = ['entity', 'collection'];

/** feature name -> identity props that belong in the entityConfig arg */
export const ENTITY_CONFIG_FEATURES: Record<string, string[]> = {
  withCallStatus: NO_SELECT_ID,
  withEntitiesLocalFilter: WITH_SELECT_ID,
  withEntitiesRemoteFilter: NO_SELECT_ID,
  withEntitiesHybridFilter: WITH_SELECT_ID,
  withEntitiesLocalSort: WITH_SELECT_ID,
  withEntitiesRemoteSort: NO_SELECT_ID,
  withEntitiesLocalPagination: NO_SELECT_ID,
  withEntitiesRemotePagination: WITH_SELECT_ID,
  withEntitiesRemoteScrollPagination: WITH_SELECT_ID,
  withEntitiesSingleSelection: WITH_SELECT_ID,
  withEntitiesMultiSelection: WITH_SELECT_ID,
  withEntitiesLoadingCall: WITH_SELECT_ID,
  withEntitiesCalls: WITH_SELECT_ID,
  withEntitiesSyncToRouteQueryParams: NO_SELECT_ID,
};

// the identity props are read from the declared first arg types, which is why
// selectId only moves for the features that accept it there
const ALL_IDENTITY_PROPS = WITH_SELECT_ID;

export interface ArgsChange {
  line: number;
  feature: string;
}

export interface ArgsSkip {
  line: number;
  feature: string;
  reason: string;
}

export interface ArgsTransformResult {
  content: string;
  modified: boolean;
  changes: ArgsChange[];
  skipped: ArgsSkip[];
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

export function transformEntityConfigArgs(
  text: string,
  filePath = 'file.ts',
): ArgsTransformResult {
  // a feature call nested in another one's options is picked up by the next
  // pass, as the outer edit copies the options text as it was
  const passes: PassResult[] = [transformPass(text, filePath)];
  while (passes.length < 6 && passes[passes.length - 1].nested) {
    passes.push(transformPass(passes[passes.length - 1].content, filePath));
  }
  const last = passes[passes.length - 1];
  const content = last.content;

  // report every change at its line in the migrated content, mapping each
  // pass's call positions through the edits of the passes after it
  const changes = passes.flatMap((pass, i) =>
    pass.changes.map(({ pos, feature }) => ({
      line: lineAt(
        content,
        passes.slice(i + 1).reduce((p, later) => mapPos(p, later.edits), pos),
      ),
      feature,
    })),
  );
  return {
    content,
    modified: content !== text,
    changes: changes.sort((x, y) => x.line - y.line),
    skipped: last.skipped.map(({ pos, feature, reason }) => ({
      line: lineAt(content, pos),
      feature,
      reason,
    })),
  };
}

interface PassResult {
  content: string;
  nested: boolean;
  edits: Edit[];
  changes: { pos: number; feature: string }[];
  skipped: { pos: number; feature: string; reason: string }[];
}

function transformPass(text: string, filePath: string): PassResult {
  const result: PassResult = {
    content: text,
    nested: false,
    edits: [],
    changes: [],
    skipped: [],
  };
  if (!text.includes(TRAITS_MODULE)) return result;

  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const { features: localToFeature, namespaces } =
    findImportedFeatures(sourceFile);
  if (localToFeature.size === 0 && namespaces.size === 0) return result;

  const edits: (Edit & { pos: number; feature: string })[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.arguments.length === 1) {
      const callee = node.expression;
      const arg = node.arguments[0];
      const isConfigArg =
        ts.isObjectLiteralExpression(arg) ||
        ts.isArrowFunction(arg) ||
        ts.isFunctionExpression(arg);
      const pos = node.getStart(sourceFile);
      if (ts.isIdentifier(callee) && localToFeature.has(callee.text)) {
        const feature = localToFeature.get(callee.text)!;
        const outcome = ts.isObjectLiteralExpression(arg)
          ? rewriteArgs(feature, arg, sourceFile)
          : ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)
            ? rewriteFactoryArgs(feature, arg, node, sourceFile)
            : '';
        if (typeof outcome !== 'string') {
          edits.push({ ...outcome, pos, feature });
        } else if (outcome) {
          result.skipped.push({ pos, feature, reason: outcome });
        }
      } else if (
        isConfigArg &&
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        namespaces.has(callee.expression.text) &&
        ENTITY_CONFIG_FEATURES[callee.name.text]
      ) {
        result.skipped.push({
          pos,
          feature: callee.name.text,
          reason: 'called through a namespace import, migrate by hand',
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  if (edits.length === 0) return result;

  const outermost = dropNested(edits).sort((a, b) => a.start - b.start);
  result.nested = outermost.length < edits.length;
  result.edits = outermost;
  result.changes = outermost.map(({ pos, feature }) => ({ pos, feature }));
  let content = text;
  for (const edit of [...outermost].reverse()) {
    content =
      content.slice(0, edit.start) + edit.text + content.slice(edit.end);
  }
  result.content = content;
  return result;
}

/** where a position ends up after the (non overlapping, sorted) edits */
function mapPos(pos: number, edits: Edit[]): number {
  let delta = 0;
  for (const edit of edits) {
    if (edit.end <= pos) delta += edit.text.length - (edit.end - edit.start);
    else if (edit.start <= pos) return edit.start + delta;
  }
  return pos + delta;
}

function lineAt(text: string, pos: number): number {
  let line = 1;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * local identifier -> feature name, honouring `import { a as b }`, plus the
 * names of `import * as x` namespaces, which are only reported
 */
function findImportedFeatures(sourceFile: ts.SourceFile) {
  const features = new Map<string, string>();
  const namespaces = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== TRAITS_MODULE
    )
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings) continue;
    if (ts.isNamespaceImport(bindings)) {
      namespaces.add(bindings.name.text);
      continue;
    }
    for (const element of bindings.elements) {
      const imported = (element.propertyName ?? element.name).text;
      if (ENTITY_CONFIG_FEATURES[imported]) {
        features.set(element.name.text, imported);
      }
    }
  }
  return { features, namespaces };
}

/**
 * Returns the edit replacing the single object arg with the two args, an empty
 * string when the call has nothing to migrate, or the reason it was skipped.
 */
function rewriteArgs(
  feature: string,
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): Edit | string {
  const identityProps = ENTITY_CONFIG_FEATURES[feature];
  const elements = obj.properties;
  const spreads = elements.filter(ts.isSpreadAssignment);
  const identity = elements.filter(
    (e) => !ts.isSpreadAssignment(e) && isNamed(e, ALL_IDENTITY_PROPS),
  );
  const options = elements.filter(
    (e) => !ts.isSpreadAssignment(e) && !isNamed(e, ALL_IDENTITY_PROPS),
  );

  // withCallStatus({ prop }) and withCallStatus({ collection, initialValue })
  // stay single arg, only the entity bound form has a two-arg equivalent
  if (
    feature === 'withCallStatus' &&
    elements.some((e) => isNamed(e, ['prop']))
  )
    return '';

  if (spreads.length === 0 && identity.length === 0) return '';

  if (spreads.length > 1)
    return 'more than one spread in the config, move the entityConfig to the first arg by hand';

  if (spreads.length === 1 && identity.length > 0)
    return `spread combined with ${identity
      .map((e) => propName(e))
      .join(', ')}, move them to the first arg by hand`;

  if (spreads.length === 1 && elements[0] !== spreads[0])
    return 'options declared before the spread may be overridden by it, migrate by hand';

  // the entityConfig arg needs an entity, so e.g.
  // withCallStatus({ collection: 'x', initialValue }) stays as is, and so do
  // the anonymous withX({ entity, ...options }) which read fine in one object
  if (
    spreads.length === 0 &&
    (options.length === 0 ||
      !(isPresent(identity, 'entity') && isPresent(identity, 'collection')))
  )
    return '';

  const unsupported = identity.find((e) => !isNamed(e, identityProps));
  if (unsupported)
    return `${propName(unsupported)} is not accepted by ${feature}'s entityConfig arg`;

  if (spreads.length === 1) {
    const reason = checkEntityConfigSpread(spreads[0].expression, sourceFile);
    if (reason) return reason;
  }

  const firstArg =
    spreads.length === 1
      ? spreads[0].expression.getText(sourceFile)
      : `{ ${identity.map((e) => e.getText(sourceFile)).join(', ')} }`;

  let secondArg: string | undefined;
  if (feature === 'withEntitiesCalls') {
    const calls = options.find((e) => isNamed(e, ['calls']));
    if (!calls || options.length > 1)
      return 'withEntitiesCalls config must only have the entityConfig and calls';
    if (ts.isShorthandPropertyAssignment(calls)) secondArg = 'calls';
    else if (ts.isPropertyAssignment(calls))
      secondArg = calls.initializer.getText(sourceFile);
    else return 'calls must be a property assignment';
  } else if (options.length > 0) {
    secondArg = removeElements(
      obj,
      [...spreads, ...identity] as ts.ObjectLiteralElementLike[],
      sourceFile,
    );
  }

  return {
    start: obj.getStart(sourceFile),
    end: obj.getEnd(),
    text: secondArg === undefined ? firstArg : `${firstArg}, ${secondArg}`,
  };
}

/**
 * Factory form, withX((store) => ({ ...entityConfig, ...options })) becomes
 * withX(entityConfig, (store) => ({ ...options })). Only the spread of an
 * entityConfig that does not depend on the store is moved out.
 */
function rewriteFactoryArgs(
  feature: string,
  factory: ts.ArrowFunction | ts.FunctionExpression,
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
): Edit | string {
  const obj = returnedObjectLiteral(factory);
  if (!obj) return '';
  const elements = obj.properties;
  const spreads = elements.filter(ts.isSpreadAssignment);
  const identity = elements.filter(
    (e) => !ts.isSpreadAssignment(e) && isNamed(e, ALL_IDENTITY_PROPS),
  );
  if (spreads.length === 0 && identity.length === 0) return '';

  const skip = `factory config, move the entityConfig to the first arg by hand`;
  if (
    feature === 'withEntitiesCalls' ||
    feature === 'withEntitiesSyncToRouteQueryParams' ||
    spreads.length !== 1 ||
    identity.length > 0 ||
    elements[0] !== spreads[0] ||
    (feature === 'withCallStatus' && elements.some((e) => isNamed(e, ['prop'])))
  )
    return skip;

  const spread = spreads[0].expression;
  if (!isStoreIndependent(spread, factory)) return skip;
  // the factory read the entityConfig lazily, the first arg reads it eagerly
  const reason = checkEntityConfigSpread(spread, sourceFile, call);
  if (reason) return reason;

  const start = factory.getStart(sourceFile);
  const factoryText = factory.getText(sourceFile);
  const objStart = obj.getStart(sourceFile) - start;
  const withoutSpread =
    elements.length > 1
      ? factoryText.slice(0, spreads[0].getStart(sourceFile) - start) +
        factoryText.slice(afterComma(spreads[0], sourceFile) - start)
      : factoryText.slice(0, objStart) +
        '{}' +
        factoryText.slice(obj.getEnd() - start);

  return {
    start,
    end: factory.getEnd(),
    text: `${spread.getText(sourceFile)}, ${withoutSpread}`,
  };
}

function returnedObjectLiteral(
  factory: ts.ArrowFunction | ts.FunctionExpression,
): ts.ObjectLiteralExpression | undefined {
  let expr: ts.Expression | undefined;
  if (ts.isBlock(factory.body)) {
    const statements = factory.body.statements;
    const last = statements[statements.length - 1];
    // only a lone return, statements before it could shadow the entityConfig
    if (statements.length === 1 && last && ts.isReturnStatement(last))
      expr = last.expression;
  } else {
    expr = factory.body;
  }
  while (expr && ts.isParenthesizedExpression(expr)) expr = expr.expression;
  return expr && ts.isObjectLiteralExpression(expr) ? expr : undefined;
}

/**
 * Returns why a spread can not be moved to the entityConfig arg, or '' when it
 * can. A variable declared in the file must hold an entityConfig(...) or an
 * object literal with just the entity, collection and selectId, anything
 * declared elsewhere is taken as an entityConfig. With lazyFrom (the factory
 * form) a variable declared after the call is rejected, as reading it eagerly
 * would hit its temporal dead zone.
 */
function checkEntityConfigSpread(
  expr: ts.Expression,
  sourceFile: ts.SourceFile,
  lazyFrom?: ts.Node,
): string {
  const text = expr.getText(sourceFile);
  if (!ts.isIdentifier(expr) && !ts.isPropertyAccessExpression(expr))
    return `spread of ${text} is not a variable, migrate by hand`;

  let root: ts.Expression = expr;
  while (ts.isPropertyAccessExpression(root)) root = root.expression;
  const declarations = ts.isIdentifier(root)
    ? findVariableDeclarations(sourceFile, root.text)
    : [];

  if (
    lazyFrom &&
    declarations.some((d) => d.getStart(sourceFile) > lazyFrom.getEnd())
  )
    return `${text} is declared after the call, migrate by hand`;

  if (!ts.isIdentifier(expr)) return '';
  for (const declaration of declarations) {
    const init = declaration.initializer && unwrap(declaration.initializer);
    if (init && ts.isObjectLiteralExpression(init)) {
      const onlyIdentity = init.properties.every(
        (e) => !ts.isSpreadAssignment(e) && isNamed(e, ALL_IDENTITY_PROPS),
      );
      if (!onlyIdentity || !isPresent([...init.properties], 'entity'))
        return `${text} is not an entityConfig, migrate by hand`;
    }
  }
  return '';
}

function findVariableDeclarations(
  sourceFile: ts.SourceFile,
  name: string,
): ts.VariableDeclaration[] {
  const found: ts.VariableDeclaration[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    )
      found.push(node);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function unwrap(expr: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) ||
    ts.isSatisfiesExpression(expr) ||
    ts.isTypeAssertionExpression(expr)
  )
    expr = expr.expression;
  return expr;
}

/** true when the expression reads no identifier bound by the factory params */
function isStoreIndependent(
  expr: ts.Expression,
  factory: ts.ArrowFunction | ts.FunctionExpression,
): boolean {
  if (!ts.isIdentifier(expr) && !ts.isPropertyAccessExpression(expr))
    return false;
  const params = new Set<string>();
  const collect = (name: ts.BindingName) => {
    if (ts.isIdentifier(name)) params.add(name.text);
    else
      name.elements.forEach(
        (el) => !ts.isOmittedExpression(el) && collect(el.name),
      );
  };
  factory.parameters.forEach((p) => collect(p.name));
  let root: ts.Expression = expr;
  while (ts.isPropertyAccessExpression(root)) root = root.expression;
  return ts.isIdentifier(root) && !params.has(root.text);
}

/**
 * Returns the object literal text without the given elements, keeping the
 * formatting and comments of the rest.
 */
function removeElements(
  obj: ts.ObjectLiteralExpression,
  toRemove: ts.ObjectLiteralElementLike[],
  sourceFile: ts.SourceFile,
): string {
  const start = obj.getStart(sourceFile);
  const text = obj.getText(sourceFile);
  const elements = obj.properties;
  const removed = new Set(toRemove);
  const ranges: [number, number][] = [];
  let lastKeptIndex = elements.length - 1;
  while (removed.has(elements[lastKeptIndex])) lastKeptIndex--;

  elements.forEach((el, i) => {
    if (!removed.has(el)) return;
    if (i < lastKeptIndex) {
      ranges.push([el.getStart(sourceFile), afterComma(el, sourceFile)]);
    } else if (i === elements.length - 1) {
      // trailing removed elements go from the comma of the last kept one
      ranges.push([
        commaAfter(elements[lastKeptIndex], sourceFile),
        el.getEnd(),
      ]);
    }
  });

  let out = text;
  for (const [s, e] of ranges.sort((a, b) => b[0] - a[0])) {
    out = out.slice(0, s - start) + out.slice(e - start);
  }
  return out;
}

/**
 * Position after the element's comma and the whitespace following it, so
 * removing up to it drops comments before the comma (they belong to the
 * element) but keeps any comment leading the next element.
 */
function afterComma(el: ts.Node, sourceFile: ts.SourceFile): number {
  const text = sourceFile.text;
  const scanner = scanFrom(el.getEnd(), sourceFile);
  let pos = el.getEnd();
  if (scanner.scan() === ts.SyntaxKind.CommaToken) pos = scanner.getTextPos();
  while (/\s/.test(text[pos])) pos++;
  return pos;
}

/** start of the comma following the element, keeping comments before it */
function commaAfter(el: ts.Node, sourceFile: ts.SourceFile): number {
  const scanner = scanFrom(el.getEnd(), sourceFile);
  return scanner.scan() === ts.SyntaxKind.CommaToken
    ? scanner.getTokenPos()
    : el.getEnd();
}

function scanFrom(pos: number, sourceFile: ts.SourceFile): ts.Scanner {
  return ts.createScanner(
    ts.ScriptTarget.Latest,
    true,
    ts.LanguageVariant.Standard,
    sourceFile.text,
    undefined,
    pos,
  );
}

function propName(el: ts.ObjectLiteralElementLike): string | undefined {
  const name = el.name;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function isNamed(el: ts.ObjectLiteralElementLike, names: string[]): boolean {
  const name = propName(el);
  return name !== undefined && names.includes(name);
}

function isPresent(elements: ts.ObjectLiteralElementLike[], name: string) {
  return elements.some((e) => isNamed(e, [name]));
}

function dropNested<T extends Edit>(edits: T[]): T[] {
  return edits.filter(
    (edit) =>
      !edits.some(
        (other) =>
          other !== edit && other.start <= edit.start && other.end >= edit.end,
      ),
  );
}
