export type Glob = string;

type PathMeta = {
  [key: string]: {
    reason: string;
    expires: string;
    created: string;
  };
};

// Example configuration:
// # Snyk (https://snyk.io) policy file
// version: v1.14.0
//
// exclude:
//   unmanaged:
//     - test.spec.ts # single file
//     - src/lib # single directory
//     - tests/*.ts # any file with the “.ts” extension under “tests”
//     - “**/*.spec.ts” # files ending with “.spec.ts” from any directory
//     - tests?/* # files directly inside “test” and/or “tests” directories
//     - tests/** # all files and directories inside “tests”

export type Config = { exclude?: { global?: (Glob | PathMeta)[] } };
