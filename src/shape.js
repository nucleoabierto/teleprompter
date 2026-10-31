// Value-shape primitives shared by every module that reads untrusted
// JSON: the lock, the package manifest and the collection index all
// guard their contract with the same checks. An array is not a plain
// object — it indexes by position, not by the named fields the
// contracts require.
export const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

// Optional string field: absent means "not declared", present means
// it must be a string — anything else is malformed input.
export const isOptionalString = (v) => v === undefined || typeof v === 'string';
