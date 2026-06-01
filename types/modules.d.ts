// Ambient module declarations for packages whose .d.ts files are missing
// from the local node_modules due to incomplete extraction (disk space).
// These stubs allow TypeScript to compile without errors.
// Remove stubs once a full `npm install` completes successfully.

// react-day-picker v10 — types are in dist/cjs/index.d.ts in a full install
declare module 'react-day-picker';
