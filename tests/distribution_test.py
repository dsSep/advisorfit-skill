"""Skill distribution and exact-source checks; no network or model calls."""
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

class DistributionTests(unittest.TestCase):
    def test_skill_only_distribution_is_complete_without_site_or_internal_reports(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        self.assertEqual(pack.VERSION, '0.2.6')
        with tempfile.TemporaryDirectory(dir=ROOT / "outputs") as temp:
            with zipfile.ZipFile(pack.build(Path(temp) / 'skill.zip')) as archive:
                names = archive.namelist()
                for name in ['plugin.json', '.codex-plugin/plugin.json', 'LICENSE', 'README.md',
                             'skills/advisorfit/SKILL.md', 'skills/advisorfit/references/outreach.md']:
                    self.assertIn(name, names)
                self.assertFalse(any(n.startswith(('website/', 'evals/', 'tests/')) or 'mcp' in n.lower() or 'promotion' in n for n in names))
                for name in names:
                    self.assertEqual(archive.read(name), (ROOT / name).read_bytes())

    def test_runtime_contains_exact_current_core_and_task_references(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        actual = json.loads((ROOT / 'website/lib/skill-data.json').read_text('utf-8'))
        self.assertEqual(actual, pack.runtime_bundle())
        self.assertEqual(len(actual['files']), 5)
        for name, text in actual['files'].items():
            self.assertEqual(text, (ROOT / 'skills/advisorfit' / name).read_text('utf-8'))
            self.assertNotIn('MCP', text)

    def test_distribution_is_byte_reproducible(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        with tempfile.TemporaryDirectory(dir=ROOT / "outputs") as temp:
            first = pack.build(Path(temp) / 'first.zip')
            second = pack.build(Path(temp) / 'second.zip')
            self.assertEqual(first.read_bytes(), second.read_bytes())

    def test_reference_change_is_detected(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        before = pack.runtime_bundle()
        with tempfile.TemporaryDirectory(dir=ROOT / "outputs") as temp:
            skill = Path(temp)
            for name, text in before['files'].items():
                target = skill / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text, encoding='utf-8')
            (skill / 'references/research.md').write_text('changed', encoding='utf-8')
            with patch.object(pack, 'SKILL', skill):
                self.assertNotEqual(before, pack.runtime_bundle())

    def test_historical_answers_and_literal_comparisons_are_preserved(self):
        bundle = json.loads((ROOT / 'website/lib/historical-cases.json').read_text('utf-8'))
        self.assertEqual(len(bundle), 2)
        for case in bundle:
            folder = ROOT / 'examples' / case['id']
            for condition in ['without-skill', 'with-skill']:
                content = (folder / (condition + '.md')).read_text('utf-8')
                self.assertEqual(case[condition], content)
                self.assertEqual(case['hashes'][condition], hashlib.sha256(content.encode()).hexdigest())
            record = json.loads((folder / 'record.json').read_text('utf-8'))
            for name, digest in record['sha256'].items():
                self.assertEqual(hashlib.sha256((folder / name).read_bytes()).hexdigest(), digest, name)
            for item in case['comparisons']:
                for key, condition in [('without', 'without-skill'), ('with', 'with-skill')]:
                    self.assertIn(item[key], (folder / (condition + '.raw.txt')).read_text('utf-8'))

    def test_link_checker_identifies_placeholder(self):
        links = module('links', ROOT / 'skills/advisorfit/scripts/check_links.py')
        self.assertTrue(links.check('[paper](https://example.com/a...)')['findings'])
        self.assertFalse(links.check('[Skill specification](https://agentskills.io/specification)')['findings'])

if __name__ == '__main__':
    unittest.main()
