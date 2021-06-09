#!/usr/bin/env bash
set -e

shasum -a 256 -c snyk-linux-arm64
shasum -a 256 -c snyk-linux-armv7
shasum -a 256 -c snyk-macos.sha256
shasum -a 256 -c snyk-win-x64-unsigned.exe.sha256
shasum -a 256 -c snyk-win-x86-unsigned.exe.sha256
shasum -a 256 -c docker-mac-signed-bundle.tar.gz.sha256
