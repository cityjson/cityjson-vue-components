#!/usr/bin/env sh

# abort on errors
set -e

# build latest version
npm run build

# publish
npm publish