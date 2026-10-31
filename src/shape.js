// Value-shape primitives shared by every module that reads untrusted
// JSON: the lock, the package manifest and the collection index all
// guard their contract with the same checks. An array is not a plain
// object — it indexes by position, not by the named fields the
// contracts require.
export const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

// Optional string field: absent means "not declared", present means
// it must be a string — anything else is malformed input.
export const isOptionalString = (value) => value === undefined || typeof value === 'string';
