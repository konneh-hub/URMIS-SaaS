import glob
import re
import os

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(root)

api_paths = set()
fetch_re = re.compile(r'fetch\((?:`([^`]*)`|"([^"]*)"|\'([^\']*)\')')
for pattern in ['src/**/*.js','src/**/*.jsx','src/**/*.ts','src/**/*.tsx']:
    for file_path in glob.glob(pattern, recursive=True):
        if os.path.isdir(file_path):
            continue
        try:
            with open(file_path, 'r', encoding='utf8', errors='ignore') as f:
                content = f.read()
        except OSError:
            continue
        for match in fetch_re.finditer(content):
            raw = match.group(1) or match.group(2) or match.group(3)
            if raw and '/api/' in raw:
                api_paths.add(raw.strip())

print('FRONTEND_FETCHEndpoints')
for path in sorted(api_paths):
    print(path)

routes = []
route_match = re.compile(r'(router\.(?:get|post|put|patch|delete)\(|app\.use\()')
for file_path in glob.glob('backend/src/**/*.js', recursive=True):
    if os.path.isdir(file_path):
        continue
    try:
        with open(file_path, 'r', encoding='utf8', errors='ignore') as f:
            for i, line in enumerate(f, 1):
                if route_match.search(line):
                    routes.append((file_path, i, line.strip()))
    except OSError:
        continue

print('BACKEND_ROUTE_DEFINITIONS')
for file_path, i, line in sorted(routes):
    print(f'{file_path}:{i}:{line}')
