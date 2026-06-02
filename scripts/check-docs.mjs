import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const docsConfigPath = path.join(root, 'docs.json');
const docsConfig = JSON.parse(fs.readFileSync(docsConfigPath, 'utf8'));
const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const httpMethods = new Set(['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS']);

function parseOpenApiEndpointRef(value) {
  const match = /^([A-Z]+)\s+(\/\S+)$/.exec(value);
  if (!match || !httpMethods.has(match[1])) return null;
  return { method: match[1], apiPath: match[2] };
}

function normalizeOpenApiSources(openapi) {
  if (!openapi) return [];
  if (typeof openapi === 'string') return [openapi];
  if (Array.isArray(openapi)) return openapi;
  if (typeof openapi.source === 'string') return [openapi.source];
  return [];
}

function collectPages(node, pages = [], inheritedOpenApiSources = []) {
  if (typeof node === 'string') {
    if (inheritedOpenApiSources.length === 0 || !parseOpenApiEndpointRef(node)) {
      pages.push(node);
    }
    return pages;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectPages(item, pages, inheritedOpenApiSources);
    return pages;
  }
  if (node && typeof node === 'object') {
    const nodeOpenApiSources = normalizeOpenApiSources(node.openapi);
    const nextOpenApiSources = nodeOpenApiSources.length > 0 ? nodeOpenApiSources : inheritedOpenApiSources;
    for (const key of ['pages', 'groups', 'tabs', 'anchors', 'dropdowns', 'versions']) {
      if (node[key]) collectPages(node[key], pages, nextOpenApiSources);
    }
  }
  return pages;
}

function collectOpenApiEndpointRefs(node, refs = [], inheritedOpenApiSources = []) {
  if (typeof node === 'string') {
    const endpoint = parseOpenApiEndpointRef(node);
    if (endpoint && inheritedOpenApiSources.length > 0) {
      for (const source of inheritedOpenApiSources) refs.push({ source, ...endpoint });
    }
    return refs;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectOpenApiEndpointRefs(item, refs, inheritedOpenApiSources);
    return refs;
  }
  if (node && typeof node === 'object') {
    const nodeOpenApiSources = normalizeOpenApiSources(node.openapi);
    const nextOpenApiSources = nodeOpenApiSources.length > 0 ? nodeOpenApiSources : inheritedOpenApiSources;
    for (const key of ['pages', 'groups', 'tabs', 'anchors', 'dropdowns', 'versions']) {
      if (node[key]) collectOpenApiEndpointRefs(node[key], refs, nextOpenApiSources);
    }
  }
  return refs;
}

function collectOpenApiSources(node, sources = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectOpenApiSources(item, sources);
    return sources;
  }
  if (node && typeof node === 'object') {
    if (node.openapi) {
      sources.push(...normalizeOpenApiSources(node.openapi));
    }
    for (const key of ['pages', 'groups', 'tabs', 'anchors', 'dropdowns', 'versions']) {
      if (node[key]) collectOpenApiSources(node[key], sources);
    }
  }
  return sources;
}

const pages = collectPages(docsConfig.navigation);
assert(pages.length > 0, 'docs.json must include at least one navigation page.');

const openApiSources = collectOpenApiSources(docsConfig.navigation);
const openApiEndpointRefs = collectOpenApiEndpointRefs(docsConfig.navigation);

const trackedNodeModules = spawnSync('git', ['ls-files', 'node_modules'], {
  cwd: root,
  encoding: 'utf8'
});
assert(
  trackedNodeModules.status === 0,
  `Unable to inspect tracked files: ${trackedNodeModules.stderr || trackedNodeModules.stdout}`
);
assert(
  trackedNodeModules.stdout.trim().length === 0,
  'node_modules must not be committed. Run `git rm -r --cached node_modules` and keep dependencies installed locally.'
);

for (const page of pages) {
  assert(fs.existsSync(path.join(root, `${page}.mdx`)), `Navigation page is missing: ${page}.mdx`);
}

for (const source of openApiSources) {
  const openApiPath = path.join(root, source);
  assert(fs.existsSync(openApiPath), `OpenAPI source is missing: ${source}`);
  if (fs.existsSync(openApiPath)) {
    const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    const paths = Object.keys(spec.paths || {});
    const isAdminSpec = source.includes('admin');
    for (const apiPath of paths) {
      assert(!apiPath.startsWith('/internal/'), `${source} must not expose internal path: ${apiPath}`);
      assert(apiPath !== '/health' && apiPath !== '/ready' && apiPath !== '/metrics', `${source} must not expose component path: ${apiPath}`);
      assert(apiPath !== '/api/v1/auth/dev-login', `${source} must not expose dev-login`);
      assert(
        isAdminSpec ? apiPath.startsWith('/admin/v1') : apiPath.startsWith('/api/v1'),
        `${source} contains path outside its public boundary: ${apiPath}`
      );
      const pathItem = spec.paths[apiPath] || {};
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!['get', 'post', 'patch', 'delete', 'put'].includes(method)) continue;
        for (const [statusCode, response] of Object.entries(operation.responses || {})) {
          if (!statusCode.startsWith('2') || statusCode === '204' || statusCode === '302') continue;
          assert(response.content, `${source} ${method.toUpperCase()} ${apiPath} ${statusCode} is missing response content`);
        }
      }
    }
  }
}

for (const { source, method, apiPath } of openApiEndpointRefs) {
  const openApiPath = path.join(root, source);
  if (!fs.existsSync(openApiPath)) continue;
  const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
  const operation = spec.paths?.[apiPath]?.[method.toLowerCase()];
  assert(operation, `${source} is missing referenced operation: ${method} ${apiPath}`);
}

for (const logoPath of [docsConfig.favicon, docsConfig.logo?.light, docsConfig.logo?.dark].filter(Boolean)) {
  const relativePath = logoPath.replace(/^\//, '');
  assert(fs.existsSync(path.join(root, relativePath)), `Referenced asset is missing: ${logoPath}`);
}

const bannedPatterns = [
  new RegExp(['Mintlify', 'Starter'].join(' '), 'i'),
  new RegExp(['Plant', 'Store'].join(' '), 'i'),
  new RegExp(['sandbox', 'mintlify'].join('\\.'), 'i'),
  new RegExp(['dashboard', 'mintlify'].join('\\.'), 'i'),
  new RegExp(['user', 'cms'].join('-'), 'i'),
  new RegExp('\\b' + ['C', 'M', 'S'].join('') + '\\b'),
  new RegExp('\\b' + ['front', 'end'].join('') + '\\b', 'i')
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(md|mdx|json|svg|yml|yaml)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of walk(root)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of bannedPatterns) {
    assert(!pattern.test(content), `${path.relative(root, file)} contains banned stale content: ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error('Docs checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Docs checks passed for ${pages.length} navigation pages.`);
