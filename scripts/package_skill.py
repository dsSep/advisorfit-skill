"""Build a deterministic full plugin ZIP and exact Skill runtime JSON (stdlib only)."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = '0.2.6'
SKILL = ROOT / 'skills/advisorfit'
RUNTIME_PATHS = ['SKILL.md'] + [f'references/{name}.md' for name in (
    'research', 'preparation', 'outreach', 'retrieval-evaluation')]


def runtime_bundle():
    files = {name: (SKILL / name).read_text(encoding='utf-8') for name in RUNTIME_PATHS}
    return {'version': VERSION, 'files': files,
            'hashes': {name: hashlib.sha256(text.encode('utf-8')).hexdigest() for name, text in files.items()}}


def write_runtime():
    target = ROOT / 'website/lib/skill-data.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(runtime_bundle(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    return target


def package_files():
    roots = ['skills']
    paths = [ROOT / name for name in (
        'plugin.json', '.codex-plugin/plugin.json', 'README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md',
        'docs/installation.md', 'docs/usage.md', 'docs/privacy.md', 'docs/limitations.md')]
    for name in roots:
        paths.extend(p for p in (ROOT / name).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc')
    return sorted(paths, key=lambda p: p.relative_to(ROOT).as_posix())


def build(target):
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in package_files():
            info = zipfile.ZipInfo(path.relative_to(ROOT).as_posix(), date_time=(2026, 11, 6, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runtime-only', action='store_true')
    args = parser.parse_args()
    print(write_runtime().relative_to(ROOT))
    if not args.runtime_only:
        target = build(ROOT / 'outputs' / f'advisorfit-skill-{VERSION}.zip')
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        target.with_suffix('.zip.sha256').write_text(f'{digest}  {target.name}\n', encoding='ascii')
        print(f'{target.relative_to(ROOT)} SHA256 {digest}')


if __name__ == '__main__':
    main()
