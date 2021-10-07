# Note about test fixtures

All test figures that contain text are formatted with UNIX-style line endings (`LF`), except for the following file, which is intentionally formatted with Windows-style (`CR LF`) line endings:

test/fixtures/dubhash-uhash/config.bat

If you check this project out with git, take care that the line endings are not modified. Otherwise, some unit tests may fail.

The files in `test/fixtures/dubhash-uhash` that end with `.result` are not used directly in the unit tests. They serve as documentation to keep the implementation in sync between `snyk-cpp-plugin` and the backend.
