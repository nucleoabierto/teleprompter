import fs from 'node:fs';
import path from 'node:path';
import { isSafeRelative, hasEntry } from './paths.js';

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
  checkRelativePath(entry.path, `${where}.path`, errors);
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
  function checkPersonalization(manifest, _ctx, errors) {
    if (manifest.personalization === undefined) return;
    checkRelativePath(manifest.personalization, 'personalization', errors);
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

// Never throws: every problem lands in errors so the CLI can report
// them all in one pass instead of failing on the first one.
export function loadManifest(pkgDir) {
  const warnings = [];
  const errors = [];
  const manifestPath = path.join(pkgDir, 'teleprompter.json');

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch {
    return { manifest: null, warnings, errors: [`no existe ${manifestPath}`] };
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    return { manifest: null, warnings, errors: [`JSON inválido en ${manifestPath}: ${error.message}`] };
  }
  if (!isPlainObject(manifest)) {
    return { manifest: null, warnings, errors: ['el manifiesto debe ser un objeto JSON'] };
  }

  for (const key of Object.keys(manifest)) {
    if (!TOP_LEVEL_FIELDS.has(key)) {
      warnings.push(`campo desconocido ignorado: "${key}"`);
    }
  }
  for (const validate of VALIDATORS) validate(manifest, { pkgDir }, errors);

  return { manifest: errors.length === 0 ? manifest : null, warnings, errors };
}
