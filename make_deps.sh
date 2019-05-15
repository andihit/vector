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
set -e

: ${1?"Usage: $0 version"}

VER=$1
shift
PATCHES=$(echo $* | xargs --no-run-if-empty realpath)
TMP=$(mktemp -d)

pushd "$TMP"
git clone --branch v$VER https://github.com/Netflix/vector vector-$VER
cd vector-$VER

for patch in $PATCHES
do
    echo Applying patch $patch
    patch -p1 < $patch
done

npm install
popd

XZ_OPT=-9 tar cJf vector_deps-$VER.tar.xz -C "$TMP" vector-$VER/node_modules
