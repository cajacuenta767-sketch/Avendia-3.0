import re

with open('c:/Users/PC/Documents/ChatGPT/Avend Escala 3.0/frontend/src/config/workflows.ts', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'define\(\s*"([^"]+)"\s*,\s*"([^"]+)"', text)
print(f'Total workflow definitions in workflows.ts: {len(matches)}')
by_module = {}
for m, t in matches:
    by_module.setdefault(m, []).append(t)

for m, tools in by_module.items():
    print(f'\nModule: {m} ({len(tools)} tools):')
    for tool in tools:
        print(f'  - {tool}')

# Also check education.ts for the catalog of all tools
with open('c:/Users/PC/Documents/ChatGPT/Avend Escala 3.0/frontend/src/config/education.ts', 'r', encoding='utf-8') as f:
    edu_text = f.read()

edu_matches = re.findall(r'id:\s*"([^"]+)",\s*title:\s*"([^"]+)"', edu_text)
print(f'\nTotal tools defined in education.ts: {len(edu_matches)}')
for tid, title in edu_matches:
    print(f'  {tid}: {title}')
