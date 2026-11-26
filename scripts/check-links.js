import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { parse } from 'parse5';
import ts from 'typescript';

const base = new URL('https://joaovictoreth1.github.io/Portfolio/');
const root = resolve('.');
const errors = [];
const ids = new Set();
const references = [];
const files = new Set();
const external = new Set();

const html = await readFile('index.html', 'utf8');
const css = await readFile('assets/site.css', 'utf8');
const page = parse(html, {
  onParseError: ({ code, startLine }) =>
    errors.push(`index.html:${startLine}: ${code}`),
});

/** @param {import('parse5').DefaultTreeAdapterTypes.Node} node */
function inspect(node) {
  if ('attrs' in node) {
    const attrs = new Map(node.attrs.map(({ name, value }) => [name, value]));
    const id = attrs.get('id');
    if (id) {
      if (ids.has(id)) errors.push(`duplicate id: ${id}`);
      ids.add(id);
    }
    for (const attr of ['href', 'src']) {
      const value = attrs.get(attr);
      if (value !== undefined) references.push({ value, base });
    }
    if (
      attrs.get('property') === 'og:image' ||
      attrs.get('property') === 'og:url'
    ) {
      references.push({ value: attrs.get('content') ?? '', base });
    }
    if (
      attrs.get('target') === '_blank' &&
      !attrs.get('rel')?.split(/\s+/).includes('noopener')
    ) {
      errors.push(`missing noopener: ${attrs.get('href')}`);
    }
  }
  if ('childNodes' in node) for (const child of node.childNodes) inspect(child);
}

inspect(page);
for (const [, path] of css.matchAll(/url\(["']?([^"'()]+)["']?\)/g)) {
  references.push({ value: path, base: new URL('assets/site.css', base) });
}

for (const reference of references) {
  const { value } = reference;
  try {
    if (!value.trim()) throw new Error('empty URL');
    const url = new URL(value, reference.base);
    if (
      url.protocol === 'mailto:' &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(url.pathname)
    )
      continue;
    if (url.protocol !== 'https:' || url.username || url.password)
      throw new Error('unsafe URL');
    if (url.origin !== base.origin) {
      external.add(url.href);
      continue;
    }
    if (!url.pathname.startsWith(base.pathname))
      throw new Error('escapes the GitHub Pages project path');
    const relative =
      decodeURIComponent(url.pathname.slice(base.pathname.length)) ||
      'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) throw new Error('escapes the project');
    if (
      url.hash &&
      (relative !== 'index.html' ||
        !ids.has(decodeURIComponent(url.hash.slice(1))))
    ) {
      throw new Error('unknown fragment');
    }
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    if (files.has(relative)) continue;
    files.add(relative);
    if (relative.endsWith('.js')) {
      const source = ts.createSourceFile(
        relative,
        await readFile(file, 'utf8'),
        ts.ScriptTarget.ES2023,
      );
      for (const statement of source.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier)
        )
          continue;
        const specifier = statement.moduleSpecifier.text;
        if (!specifier.startsWith('.'))
          throw new Error(`non-relative browser import: ${specifier}`);
        references.push({ value: specifier, base: url });
      }
    }
  } catch (error) {
    errors.push(
      `${value || '(missing)'}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked HTML syntax, ${files.size} local files and ${external.size} external HTTPS URLs (syntax only).`,
  );
}
