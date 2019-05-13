#!/usr/bin/env python
import sys
import os.path
import json


if __name__ == '__main__':
    declared_deps = {}
    with open(os.path.join(sys.argv[1], 'package.json')) as json_file:
        package_data = json.load(json_file)

    all_dependencies = package_data["dependencies"].items() + package_data["devDependencies"].items()
    for name, version in all_dependencies:
        if name not in declared_deps:
            declared_deps[name] = version
        else:
            raise 'Duplicate dependency {}'.format(name)

    with open(os.path.join(sys.argv[1], 'package-lock.json')) as json_file:
        package_lock_data = json.load(json_file)["dependencies"]

    bundled_deps = []
    for name in declared_deps:
        version = package_lock_data[name]["version"]
        if 'git' in version:
            continue

        name = name.replace('@', '').replace('/', '-')
        line = 'Provides: bundled(nodejs-{}) = {}'.format(name, version)
        bundled_deps.append(line)

    bundled_deps = sorted(bundled_deps)
    for dep in bundled_deps:
        print dep
