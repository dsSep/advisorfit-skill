"""Offline release integrity, freshness and public-document link checks."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys
import zipfile

from package_skill import ROOT, VERSION, package_files, runtime_bundle


def main():
    errors = []
    for name in ['plugin.json', '.codex-plugin/plugin.json']:
        if json.loads((ROOT / name).read_text('utf-8'))['version'] != VERSION:
            errors.append(f'version mismatch: {name}')
    bundle = ROOT / 'lib/skill-data.json'
    if not bundle.exists() or json.loads(bundle.read_text('utf-8')) != runtime_bundle():
        errors.append('runtime bundle stale; run python scripts/package_skill.py')
    spec = importlib.util.spec_from_file_location('links', ROOT / 'skills/advisorfit/scripts/check_links.py')
    links = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(links)
    public_docs = [ROOT / 'README.md', ROOT / 'CHANGELOG.md', *sorted((ROOT / 'docs').glob('*.md'))]
    for path in public_docs:
        text = path.read_text('utf-8')
        if links.check(text)['findings']:
            errors.append(f'placeholder web link: {path.relative_to(ROOT)}')
        for target in re.findall(r'\[[^\]\n]+\]\(([^)\n]+)\)', text):
            if not target.startswith(('http://', 'https://', '#', 'mailto:')) and not (path.parent / target.split('#')[0]).exists():
                errors.append(f'broken local link: {path.relative_to(ROOT)} -> {target}')
    target = ROOT / 'outputs' / f'advisorfit-skill-{VERSION}.zip'
    if not target.exists():
        errors.append('release ZIP missing')
    else:
        with zipfile.ZipFile(target) as archive:
            expected = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in package_files()}
            if set(archive.namelist()) != set(expected) or any(archive.read(n) != data for n, data in expected.items()):
                errors.append('release ZIP stale or incomplete')
        checksum = target.with_suffix('.zip.sha256')
        if not checksum.exists() or checksum.read_text('ascii').split()[0] != hashlib.sha256(target.read_bytes()).hexdigest():
            errors.append('ZIP checksum mismatch')
    print(json.dumps({'version': VERSION, 'status': 'fail' if errors else 'pass', 'errors': errors,
                      'limitations': 'Offline checks only; no URL reachability, model behavior, MCP execution or comparative quality validation.'}, ensure_ascii=False, indent=2))
    return int(bool(errors))


if __name__ == '__main__':
    sys.exit(main())
