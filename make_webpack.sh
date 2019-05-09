#!/bin/bash
#
# Copyright (c) 2019 Red Hat.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the
# Free Software Foundation; either version 2 of the License, or (at your
# option) any later version.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
# for more details.
#

: ${1?"Usage: $0 version"}


VER=$1
TMP=$(mktemp -d)

pushd "$TMP"
git clone --branch v$VER https://github.com/Netflix/vector vector-$VER
cd vector-$VER
npm install
node_modules/webpack/bin/webpack.js --display-error-details --config webpack.prod.js
popd

tar czf vector_webpack-$VER.tar.gz -C "$TMP" vector-$VER/dist
tar czf vector_testlibs-$VER.tar.gz -C "$TMP" vector-$VER/node_modules
