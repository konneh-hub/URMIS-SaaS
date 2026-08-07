import glob
import json
import os
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent

fetch_re = re.compile(r"fetch\(\s*(?:`([^`]*)`|\"([^\"]*)\"|'([^']*)')")
route_re = re.compile(r"\b(?:router\.(?:get|post|put|patch|delete)\(|app\.use\()")

results = {}

for pattern in [
    str(root / 'src' / '**' / '*.js'),
    str(root / 'src' / '**' / '*.jsx'),
    str(root / 'src' / '**' / '*.ts'),
    str(root / 'src' / '**' / '*.tsx'),
]:
    for file_path in glob.glob(pattern, recursive=True):
        if os.path.isdir(file_path):
            continue

        try:
            with open(file_path, 'r', encoding='utf8', errors='ignore') as f:
                content = f.read()
        except Exception:
            continue

        matches = []
        for m in fetch_re.finditer(content):
            raw = m.group(1) or m.group(2) or m.group(3)
            if raw and '/api/' in raw:
                matches.append(raw.strip())

        if matches:
            results[file_path.replace('\\', '/')] = sorted(set(matches))

backend_routes = []
for file_path in glob.glob(str(root / 'backend' / 'src' / '**' / '*.js'), recursive=True):
    if os.path.isdir(file_path):
        continue
    try:
        with open(file_path, 'r', encoding='utf8', errors='ignore') as f:
            lines = f.readlines()
    except Exception:
        continue

    for i, line in enumerate(lines, start=1):
        if route_re.search(line):
            backend_routes.append({'file': file_path.replace('\\', '/'), 'line': i, 'text': line.strip()})

output = {
    'frontend': results,
    'backend': sorted(backend_routes, key=lambda x: (x['file'], x['line'])),
}

with open(root / 'scripts' / 'api_mapping_detailed.json', 'w', encoding='utf8') as f:
    json.dump(output, f, indent=2)

print('Written scripts/api_mapping_detailed.json')
