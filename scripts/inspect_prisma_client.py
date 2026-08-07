from pathlib import Path
import json
root = Path(__file__).resolve().parent.parent
client = root / 'node_modules' / '@prisma' / 'client'
print('client exists', client.exists())
for p in ['package.json', 'index.d.ts', 'index.js']:
    path = client / p
    print(p, path.exists())
    if path.exists():
        if path.suffix == '.json':
            print(json.loads(path.read_text(encoding='utf8')))
        else:
            print(path.read_text(encoding='utf8')[:1000])
        print('---')
