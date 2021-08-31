## Overview

This specification covers the generation of file fingerprints. A file fingerprint is a json document with various data extracted from the file, to facilitate security and compliance scanning through SAPI.

A file fingerprint contains the following data, all of which are optional:
* path
* full file hashes
* partial file hashes (not covered yet)
* licences (not covered yet)
* full file contents of the file (for manifest files, not covered yet)

## Example Fingerprint 

The following fingerprint contains a path and one file hash.

{
  "path": "test00",
  "hashes_ffm": [
    {
      "format": 3,
      "data": "00112233445566778899AABB"
    }
  ]
}

## General note on empty files

It is not advisable to generate fingerprints for empty files, because our knowledge base does not contain them.
It is however not an error, just completely unnessesary work for the backend.

## Full file hashes

### Format 3: uhash

To generate a uhash, there is two cases: text file or binary file.
A text file is processed according to rules below. A binary file is not modified.
The resulting md5 is to-hexed and truncated to 24 characters.

#### Text file
To generate a uhash for a text file you simply remove a set of bytes from the data, and then generate an md5 over the remaining data.

The bytes removed are the following:

```
 constexpr const auto HORIZONTAL_TAB{std::byte(9)};
 constexpr const auto LINE_FEED{std::byte(10)};
 constexpr const auto VERTICAL_TAB{std::byte(11)};
 constexpr const auto FORM_FEED{std::byte(12)};
 constexpr const auto CARRIAGE_RETURN{std::byte(13)};
 constexpr const auto SPACE{std::byte(' ')};
 ```

#### Binary file
To determine that a file is binary, you check if there are any null-bytes present.
If the file is binary, you SHALL not modify it before generating the md5.

#### Empty file
An empty file will naturally become an md5 over zero bytes (d41d8cd98f00b204e9800998ecf8427e, truncated to 24 hex chars).


