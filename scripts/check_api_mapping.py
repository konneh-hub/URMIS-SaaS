import json
import re
from pathlib import Path
import glob

root = Path(__file__).resolve().parent.parent
mapping_path = root / 'scripts' / 'api_mapping_detailed.json'

with mapping_path.open('r', encoding='utf8') as f:
    data = json.load(f)

frontend_paths = set()
for paths in data['frontend'].values():
    for p in paths:
        canonical = re.sub(r"\$\{[^}]+\}", ':param', p)
        frontend_paths.add(canonical)

backend_patterns = set()
for file_path in glob.glob(str(root / 'backend' / 'src' / '**' / '*.js'), recursive=True):
    if Path(file_path).is_dir():
        continue
    text = Path(file_path).read_text(encoding='utf8', errors='ignore')
    for m in re.finditer(r"\brouter\.(?:get|post|put|patch|delete)\(\s*['\"]([^'\"]+)['\"]", text):
        pattern = re.sub(r":[^/]+", ':param', m.group(1))
        backend_patterns.add(pattern)
    for m in re.finditer(r"app\.use\(\s*['\"]([^'\"]+)['\"]", text):
        pattern = re.sub(r":[^/]+", ':param', m.group(1))
        backend_patterns.add(pattern)

missing = []
for p in sorted(frontend_paths):
    matched = False
    for b in backend_patterns:
        if p == b or p.startswith(b.rstrip('/') + '/') or b.rstrip('/') == '' or b == p:
            matched = True
            break
    if not matched:
        missing.append(p)

print('FRONTEND_PATHS', len(frontend_paths))
print('BACKEND_PATTERNS', len(backend_patterns))
print('MISSING', len(missing))
if missing:
    print('\nUNMATCHED FRONTEND PATHS:')
    for p in missing:
        print(p)

print('\nFRONTEND PREFIXES:')
prefixes = sorted({p.split('/')[1] for p in frontend_paths if p})
for prefix in prefixes:
    print(prefix)
