import fs from 'node:fs';
import path from 'node:path';
import { isSafeRelative, hasEntry, MANAGED_DIR } from './paths.js';

const KNOWN_FORMAT = 'teleprompter-package@1';
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const TOP_LEVEL_FIELDS = new Set([
  'format', 'name', 'version', 'description', 'license', 'author',
  'collection', 'packages', 'install', 'requires', 'personalization',
  'metadata',
]);

const OBJECT_KEYS = {
  author: new Set(['name', 'email', 'url']),
  requires: new Set(['paths']),
  requiresPath: new Set(['path', 'create']),
  installEntry: new Set(['source', 'target']),
};

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.length > 0;

function checkKeys(obj, allowed, where, errors) {
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) errors.push(`${where}: campo desconocido "${key}"`);
  }
}

// Returns whether the value survives validation so callers can gate
// downstream checks (e.g. existence) on a well-formed path.
function checkRelativePath(value, label, errors) {
  if (!isNonEmptyString(value)) {
    errors.push(`${label}: debe ser una cadena no vacía`);
    return false;
  }
  if (!isSafeRelative(value)) {
    errors.push(`${label}: ruta absoluta o con ".." no permitida`);
    return false;
  }
  return true;
}

function checkInstallEntry(entry, index, pkgDir, errors) {
  const where = `install[${index}]`;
  if (!isPlainObject(entry)) {
    errors.push(`${where}: debe ser un objeto { "source", "target" }`);
    return;
  }
  checkKeys(entry, OBJECT_KEYS.installEntry, where, errors);
  const sourceOk = checkRelativePath(entry.source, `${where}.source`, errors);
  checkRelativePath(entry.target, `${where}.target`, errors);
  if (sourceOk && !hasEntry(path.join(pkgDir, entry.source))) {
    errors.push(`${where}.source: no existe "${entry.source}" dentro del paquete`);
  }
}

function checkRequiresEntry(entry, index, errors) {
  const where = `requires.paths[${index}]`;
  if (!isPlainObject(entry)) {
    errors.push(`${where}: debe ser un objeto { "path", "create"? }`);
    return;
  }
  checkKeys(entry, OBJECT_KEYS.requiresPath, where, errors);
  if (!checkRelativePath(entry.path, `${where}.path`, errors)) return;
  const t = path.normalize(entry.path);
  if (t === MANAGED_DIR || t.startsWith(`${MANAGED_DIR}/`)) {
    errors.push(`${where}.path: "${MANAGED_DIR}/" es un prefijo reservado`);
  }
  if (entry.create !== undefined && typeof entry.create !== 'boolean') {
    errors.push(`${where}.create: debe ser booleano`);
  }
}

// Each validator owns one field of the manifest. They receive the
// parsed object, the package directory and the error sink, so adding
// a field means adding one entry to VALIDATORS, not touching control
// flow.
const VALIDATORS = [
  function checkCollection(manifest, _ctx, errors) {
    if (manifest.collection === true) {
      errors.push('el manifiesto describe una colección; las colecciones no son instalables');
    } else if (manifest.collection !== undefined && manifest.collection !== false) {
      errors.push('collection: debe ser booleano');
    }
  },
  function checkFormat(manifest, _ctx, errors) {
    if (manifest.format !== undefined && manifest.format !== KNOWN_FORMAT) {
      errors.push(`format: desconocido "${manifest.format}" (esperado "${KNOWN_FORMAT}")`);
    }
  },
  function checkName(manifest, { pkgDir }, errors) {
    if (!isNonEmptyString(manifest.name)) {
      errors.push('name: obligatorio, cadena no vacía');
      return;
    }
    if (manifest.name.length > 64 || !NAME_RE.test(manifest.name)) {
      errors.push('name: debe ser kebab-case (minúsculas, números y guiones, máx. 64)');
    }
    if (manifest.name !== path.basename(path.resolve(pkgDir))) {
      errors.push(`name: "${manifest.name}" no coincide con el nombre del directorio`);
    }
  },
  function checkVersion(manifest, _ctx, errors) {
    if (!isNonEmptyString(manifest.version) || !SEMVER_RE.test(manifest.version)) {
      errors.push('version: obligatoria, semver explícita x.y.z');
    }
  },
  function checkInstall(manifest, { pkgDir }, errors) {
    if (!Array.isArray(manifest.install) || manifest.install.length === 0) {
      errors.push('install: obligatorio, lista no vacía de { "source", "target" }');
      return;
    }
    manifest.install.forEach((entry, index) => checkInstallEntry(entry, index, pkgDir, errors));
    // Target collisions make the plan ambiguous: two entries writing
    // the same path, one nested under the other, or the lock file
    // itself would let the second silently overwrite the first.
    const targets = manifest.install
      .map((e) => (typeof e?.target === 'string'
        ? path.normalize(e.target).replace(/\/+$/, '')
        : null))
      .filter((t) => t !== null);
    const seen = new Set();
    for (const t of targets) {
      if (t === 'teleprompter-lock.json') {
        errors.push('install: "teleprompter-lock.json" es un target reservado');
      } else if (t === MANAGED_DIR || t.startsWith(`${MANAGED_DIR}/`)) {
        errors.push(`install: "${MANAGED_DIR}/" es un prefijo reservado`);
      } else if (seen.has(t)) {
        errors.push(`install: target duplicado "${t}"`);
      } else if ([...seen].some((o) => t.startsWith(`${o}/`))) {
        errors.push(`install: target "${t}" queda dentro de otro target`);
      }
      seen.add(t);
    }
  },
  function checkRequires(manifest, _ctx, errors) {
    if (manifest.requires === undefined) return;
    if (!isPlainObject(manifest.requires)) {
      errors.push('requires: debe ser un objeto');
      return;
    }
    checkKeys(manifest.requires, OBJECT_KEYS.requires, 'requires', errors);
    if (manifest.requires.paths === undefined) return;
    if (!Array.isArray(manifest.requires.paths)) {
      errors.push('requires.paths: debe ser una lista');
      return;
    }
    manifest.requires.paths.forEach((entry, index) => checkRequiresEntry(entry, index, errors));
  },
  function checkAuthor(manifest, _ctx, errors) {
    if (manifest.author === undefined) return;
    if (!isPlainObject(manifest.author)) {
      errors.push('author: debe ser un objeto { "name", "email"?, "url"? }');
      return;
    }
    checkKeys(manifest.author, OBJECT_KEYS.author, 'author', errors);
    if (!isNonEmptyString(manifest.author.name)) {
      errors.push('author.name: obligatorio dentro de author');
    }
  },
  function checkPersonalization(manifest, { pkgDir }, errors) {
    if (manifest.personalization === undefined) return;
    if (!checkRelativePath(manifest.personalization, 'personalization', errors)) return;
    const full = path.join(pkgDir, manifest.personalization);
    if (!hasEntry(full)) {
      errors.push(`personalization: no existe "${manifest.personalization}" dentro del paquete`);
      return;
    }
    // A guide must be a file: directories cannot be displayed, and a
    // dangling symlink resolves to nothing. statSync follows links.
    let isFile = false;
    try {
      isFile = fs.statSync(full).isFile();
    } catch { /* dangling link or unreadable entry */ }
    if (!isFile) {
      errors.push(`personalization: "${manifest.personalization}" no es un archivo`);
      return;
    }
    // A symlink inside the package is fine, but its target must stay
    // inside: materializing the guide copies real content.
    const pkgReal = fs.realpathSync(pkgDir);
    if (!fs.realpathSync(full).startsWith(`${pkgReal}${path.sep}`)) {
      errors.push(`personalization: "${manifest.personalization}" apunta fuera del paquete`);
    }
  },
  function checkMetadata(manifest, _ctx, errors) {
    if (manifest.metadata !== undefined && !isPlainObject(manifest.metadata)) {
      errors.push('metadata: debe ser un objeto');
    }
  },
  ...['description', 'license'].map((field) => (manifest, _ctx, errors) => {
    if (manifest[field] !== undefined && typeof manifest[field] !== 'string') {
      errors.push(`${field}: debe ser una cadena`);
    }
  }),
];

// The shared preamble: read and parse the manifest file. Never
// throws — every problem lands in errors so the CLI can report them
// all in one pass instead of failing on the first one.
function readManifestFile(dir) {
  const manifestPath = path.join(dir, 'teleprompter.json');
  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch {
    return { manifest: null, errors: [`no existe ${manifestPath}`] };
  }
  try {
    const manifest = JSON.parse(raw);
    if (!isPlainObject(manifest)) {
      return { manifest: null, errors: ['el manifiesto debe ser un objeto JSON'] };
    }
    return { manifest, errors: [] };
  } catch (error) {
    return { manifest: null, errors: [`JSON inválido en ${manifestPath}: ${error.message}`] };
  }
}

export function loadManifest(pkgDir) {
  const warnings = [];
  const { manifest, errors } = readManifestFile(pkgDir);
  if (manifest === null) return { manifest: null, warnings, errors };

  for (const key of Object.keys(manifest)) {
    if (!TOP_LEVEL_FIELDS.has(key)) {
      warnings.push(`campo desconocido ignorado: "${key}"`);
    }
  }
  for (const validate of VALIDATORS) validate(manifest, { pkgDir }, errors);

  return { manifest: errors.length === 0 ? manifest : null, warnings, errors };
}

const COLLECTION_FIELDS = new Set([
  'format', 'name', 'description', 'license', 'author',
  'collection', 'packages', 'metadata',
]);

const PACKAGE_ONLY_FIELDS = ['version', 'install', 'requires', 'personalization'];

// A collection manifest describes the index, not an installable
// unit: the package contract's own fields are errors here, and the
// name is cosmetic — no directory match, just the name shape.
export function loadCollectionManifest(colDir) {
  const warnings = [];
  const { manifest, errors } = readManifestFile(colDir);
  if (manifest === null) return { manifest: null, warnings, errors };

  for (const key of Object.keys(manifest)) {
    if (!COLLECTION_FIELDS.has(key)) {
      warnings.push(`campo desconocido ignorado: "${key}"`);
    }
  }
  if (manifest.collection !== true) {
    errors.push('collection: debe ser true en un manifiesto de colección');
  }
  for (const field of PACKAGE_ONLY_FIELDS) {
    if (manifest[field] !== undefined) {
      errors.push(`${field}: campo de paquete no permitido en una colección`);
    }
  }
  if (manifest.format !== undefined && manifest.format !== KNOWN_FORMAT) {
    errors.push(`format: desconocido "${manifest.format}" (esperado "${KNOWN_FORMAT}")`);
  }
  if (manifest.name !== undefined
    && (!isNonEmptyString(manifest.name)
      || manifest.name.length > 64 || !NAME_RE.test(manifest.name))) {
    errors.push('name: debe ser kebab-case (minúsculas, números y guiones, máx. 64)');
  }
  if (!Array.isArray(manifest.packages)) {
    errors.push('packages: obligatorio, lista de { "path" }');
  } else {
    manifest.packages.forEach((entry, index) => {
      const where = `packages[${index}]`;
      if (!isPlainObject(entry)) {
        errors.push(`${where}: debe ser un objeto { "path" }`);
        return;
      }
      checkKeys(entry, new Set(['path']), where, errors);
      checkRelativePath(entry.path, `${where}.path`, errors);
    });
  }
  if (manifest.author !== undefined) {
    if (!isPlainObject(manifest.author)) {
      errors.push('author: debe ser un objeto { "name", "email"?, "url"? }');
    } else {
      checkKeys(manifest.author, OBJECT_KEYS.author, 'author', errors);
      if (!isNonEmptyString(manifest.author.name)) {
        errors.push('author.name: obligatorio dentro de author');
      }
    }
  }
  if (manifest.metadata !== undefined && !isPlainObject(manifest.metadata)) {
    errors.push('metadata: debe ser un objeto');
  }
  for (const field of ['description', 'license']) {
    if (manifest[field] !== undefined && typeof manifest[field] !== 'string') {
      errors.push(`${field}: debe ser una cadena`);
    }
  }

  return { manifest: errors.length === 0 ? manifest : null, warnings, errors };
}
