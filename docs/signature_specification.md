# FINGERPRINT SPECIFICATION VERSION 1.1.0

## Overview

This specification covers the generation of file fingerprints. A file fingerprint is a json document with various data extracted from the file, to facilitate security and compliance scanning through SAPI.

A file fingerprint contains the following data:

- path
- full file hash(es)
- partial file hashes (not covered yet)
- licences (not covered yet)
- full file contents of the file (for manifest files, not covered yet)

## Example Fingerprint

The following fingerprint contains a path, two format 1 hashes ("double hash"), and one format 3 hash ("uhash"):

```json
{
  "path": "test00",
  "hashes_ffm": [
    {
      "format": 1,
      "data": "Bp5by58MFpH4B4WNuaY6IA"
    },
    {
      "format": 1,
      "data": "hRE1s4V2n2r4wqv9PsA8eA"
    },
    {
      "format": 3,
      "data": "00112233445566778899AABB"
    }
  ]
}
```

## General note on empty files

It is not advisable to generate fingerprints for empty files, because our knowledge base does not contain them. It is however not an error, just completely unnecessary work for the backend.

## Full file hashes

### FORMAT 1: "double hash"

To generate hashes for format 1, you first need to detect if the file is binary. This is a simple check if any of the bytes in the file is 0x00.

Then:

- If the file is binary, you only produce one hash: an md5 over the entire unmodified file.
- If the file is text (defined as "not binary"), you need to detect the line endings.
- If the file does not have line endings, you treat it like a binary file (one hash over the entire unmodified file).
- If the file has line endings, you will need to generate two hashes. One for the entire unmodified file, and one where you have alternative line endings. Please see Detecting newline characters and Transforming line endings below.

The hash, or hashes, are base64-encoded with (optionally) the `=`-signs stripped (takes unnecessary space).

The unmodified hash must be the first one in the hash_pfm array.

### Detecting newline characters

If the file has a LF character (0x0A, 10), check if the previous character is CR (0x0D, 13), then the newline type is WINDOWS, otherwise it's LINUX. If it's the first character in the file, the file is of type LINUX. If the LF character is not found, the line endings are UNKNOWN, and we produce only one hash.

### Transforming line endings

If the file is of type LINUX, generate alternative data where the line endings are replaced with WINDOWS line endings, and vice versa.

The newline transformation algorithm works like this (pseudocode)

```pseudocode
for each byte B in the original file:
  if B is CR: ignore byte (i.e. throw away, this is important for weird line ending formats)
  if B is LF: if target line ending is UNIX, write LF, and if target
              line ending is WINDOWS, write CR LF
  else: write B
```

## Format 3: uhash

To generate a uhash, there are two cases: text file or binary file.

- A text file is processed according to the rules below
- A binary file is not modified

The resulting md5 is to-hexed and truncated to 24 characters.

### Text file

To generate a uhash for a text file you:

- strip away the UTF-8 BOM if present
- remove a set of "whitespace" bytes from the data
- generate an md5 hash over the remaining data
- truncate the hash to 24 hex characters

An UTF-8 BOM is a byte sequence at the beginning of a text document: `0xEF,0xBB,0xBF`. If this sequence is found, simply remove them.

The "whitespace" bytes removed from the data are the following:

```cpp
 constexpr const auto HORIZONTAL_TAB{std::byte(9)};
 constexpr const auto LINE_FEED{std::byte(10)};
 constexpr const auto VERTICAL_TAB{std::byte(11)};
 constexpr const auto FORM_FEED{std::byte(12)};
 constexpr const auto CARRIAGE_RETURN{std::byte(13)};
 constexpr const auto SPACE{std::byte(' ')};
```

If there are zero bytes available after BOM removal and "whitespace" byte removal, the hash will be that of the empty MD5 (`d41d8cd98f00b204e9800998ecf8427e`). After this hash is truncated the final hash would be `d41d8cd98f00b204e980` in hex.

### Binary file

To determine that a file is binary, you check if there are any null-bytes present. If the file is binary, you SHALL not modify it before generating the md5.

### Empty file

An empty file (or a file with all bytes removed) will naturally become a md5 over zero bytes (`d41d8cd98f00b204e9800998ecf8427e`, truncated to 24 hex chars).
