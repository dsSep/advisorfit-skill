"""Release checks: no network, model calls or third-party dependencies."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class PackageTests(unittest.TestCase):
    def test_runtime_bundle_is_exact_and_fresh(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        self.assertEqual(json.loads((ROOT / 'lib/skill-data.json').read_text('utf-8')), pack.runtime_bundle())
        self.assertEqual(len(pack.runtime_bundle()['files']), 6)

    def test_archive_contains_complete_skill_and_is_reproducible(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        with tempfile.TemporaryDirectory(dir=ROOT / 'outputs') as temp:
            first = pack.build(Path(temp) / 'one.zip')
            second = pack.build(Path(temp) / 'two.zip')
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with zipfile.ZipFile(first) as archive:
                names = set(archive.namelist())
                required = {'plugin.json', '.codex-plugin/plugin.json', 'README.md', 'LICENSE', 'CHANGELOG.md'}
                required |= {p.relative_to(ROOT).as_posix() for p in (ROOT / 'skills').rglob('*') if p.is_file() and '__pycache__' not in p.parts}
                self.assertTrue(required <= names)
                self.assertFalse(any('node_modules' in n or '.env' in n or 'outputs/' in n for n in names))
                for name in names:
                    self.assertEqual(archive.read(name), (ROOT / name).read_bytes())

    def test_link_checker_flags_placeholders_and_accepts_real_shape(self):
        links = module('links', ROOT / 'skills/advisorfit/scripts/check_links.py')
        self.assertTrue(links.check('[paper](https://example.com/a...)')['findings'])
        self.assertFalse(links.check('[Spec](https://agentskills.io/specification)')['findings'])

    def test_source_provenance_and_research_rules(self):
        data = json.loads((ROOT / 'docs/provenance-0.2.3.json').read_text('utf-8'))
        self.assertEqual(data['source_version'], '0.2.3')
        self.assertEqual(len(data['sha256']), 10)
        self.assertTrue(all(len(value) == 64 for value in data['sha256'].values()))
        changed = {'plugin.json', '.codex-plugin/plugin.json', 'skills/advisorfit/references/research.md'}
        for name, digest in data['sha256'].items():
            actual = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            if name in changed:
                self.assertNotEqual(actual, digest, name)
            else:
                self.assertEqual(actual, digest, name)
        research = (ROOT / 'skills/advisorfit/references/research.md').read_text('utf-8')
        self.assertNotIn('按3–5条有依据', research)
        self.assertNotIn('以截至日向前近三年为研究窗口，近五年为背景窗口', research)

    def test_freshness_comparison_detects_a_changed_reference(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        before = pack.runtime_bundle()
        with tempfile.TemporaryDirectory(dir=ROOT / 'outputs') as temp:
            skill = Path(temp)
            for name, text in before['files'].items():
                target = skill / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text, encoding='utf-8', newline='\n')
            (skill / 'references/research.md').write_text('changed source', encoding='utf-8')
            with patch.object(pack, 'SKILL', skill):
                after = pack.runtime_bundle()
            self.assertNotEqual(before, after)
            self.assertNotEqual(before['hashes']['references/research.md'], after['hashes']['references/research.md'])
            self.assertEqual(before['hashes']['SKILL.md'], after['hashes']['SKILL.md'])


if __name__ == '__main__':
    unittest.main()
