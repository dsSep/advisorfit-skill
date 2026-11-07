"""Skill distribution and exact-source checks; no network or model calls."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import shutil
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]

def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

class DistributionTests(unittest.TestCase):
    def test_workbuddy_import_has_one_skill_root_and_all_referenced_resources(self):
        adapter = module('workbuddy', ROOT / 'scripts/workbuddy_package.py')
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        with tempfile.TemporaryDirectory(dir=ROOT / 'outputs') as temp:
            target = adapter.build_workbuddy(ROOT, pack.VERSION, Path(temp) / 'workbuddy.zip')
            with zipfile.ZipFile(target) as archive:
                names = archive.namelist()
                self.assertTrue(all(n.startswith('advisorfit/') and '..' not in Path(n).parts for n in names))
                self.assertIn('advisorfit/SKILL.md', names)
                self.assertIn('advisorfit/INSTALL.md', names)
                self.assertIn('advisorfit/LICENSE', names)
                self.assertFalse(any('plugin.json' in n or '/website/' in n or '/evals/' in n or '/examples/' in n for n in names))
                manifest = json.loads(archive.read('advisorfit/DISTRIBUTION.json'))
                self.assertEqual(manifest['source_skill_version'], pack.VERSION)
                for name in pack.RUNTIME_PATHS[1:]:
                    expected = (pack.SKILL / name).read_text('utf-8').encode('utf-8')
                    self.assertEqual(archive.read('advisorfit/' + name), expected)
                    self.assertEqual(manifest['source_hashes'][name], hashlib.sha256(expected).hexdigest())
                self.assertIn('advisorfit/scripts/check_links.py', names)
                text = archive.read('advisorfit/SKILL.md').decode('utf-8')
                self.assertIn('@references/outreach.md', text)
                self.assertIn('WorkBuddy负责', text)

    def test_workbuddy_build_is_reproducible_with_platform_manifest(self):
        adapter = module('workbuddy', ROOT / 'scripts/workbuddy_package.py')
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        with tempfile.TemporaryDirectory(dir=ROOT / 'outputs') as temp:
            target = Path(temp)
            first = adapter.build_workbuddy(ROOT, pack.VERSION, target / 'a.zip').read_bytes()
            self.assertEqual(first, adapter.build_workbuddy(ROOT, pack.VERSION, target / 'b.zip').read_bytes())
            with zipfile.ZipFile(target / 'a.zip') as archive:
                self.assertEqual(json.loads(archive.read('advisorfit/DISTRIBUTION.json'))['platform'], 'WorkBuddy')

    def test_workbuddy_resource_change_updates_archive_and_manifest(self):
        adapter = module('workbuddy', ROOT / 'scripts/workbuddy_package.py')
        with tempfile.TemporaryDirectory(dir=ROOT / 'outputs') as temp:
            fixture = Path(temp)
            for name in ['skills/advisorfit', 'adapters/workbuddy']:
                shutil.copytree(ROOT / name, fixture / name)
            (fixture / 'docs').mkdir()
            shutil.copyfile(ROOT / 'docs/workbuddy.md', fixture / 'docs/workbuddy.md')
            shutil.copyfile(ROOT / 'LICENSE', fixture / 'LICENSE')
            before = adapter.build_workbuddy(fixture, 'fixture', fixture / 'before.zip').read_bytes()
            changed = 'Updated outreach reference for freshness verification.\n'
            (fixture / 'skills/advisorfit/references/outreach.md').write_text(changed, encoding='utf-8', newline='\n')
            after = adapter.build_workbuddy(fixture, 'fixture', fixture / 'after.zip')
            self.assertNotEqual(before, after.read_bytes())
            with zipfile.ZipFile(after) as archive:
                self.assertEqual(archive.read('advisorfit/references/outreach.md'), changed.encode())
                manifest = json.loads(archive.read('advisorfit/DISTRIBUTION.json'))
                self.assertEqual(manifest['source_hashes']['references/outreach.md'], hashlib.sha256(changed.encode()).hexdigest())

    def test_workbuddy_case_has_matching_hashes_and_extracted_original_email(self):
        folder = ROOT / 'examples/case-004'
        record = json.loads((folder / 'record.json').read_text('utf-8'))
        for name, digest in record['sha256'].items():
            self.assertEqual(hashlib.sha256((folder / name).read_bytes()).hexdigest(), digest, name)
        self.assertIn((folder / 'email.md').read_text('utf-8').strip(), (folder / 'report.md').read_text('utf-8'))
        self.assertFalse(record['private_source_published'])

    def test_skill_only_distribution_is_complete_without_site_or_internal_reports(self):
        pack = module('pack', ROOT / 'scripts/package_skill.py')
        self.assertEqual(pack.VERSION, '0.2.10')
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

    def test_public_case_records_are_anonymous_copies(self):
        for record in (ROOT / 'examples').rglob('record.json'):
            data = json.loads(record.read_text('utf-8'))
            self.assertEqual(data['privacy_schema'], 1)
            for source in record.parent.rglob('*'):
                if source.is_file():
                    self.assertNotIn('.edu.cn', source.read_text('utf-8'), str(source))
                    self.assertNotIn('chatgpt.com/share/', source.read_text('utf-8'), str(source))

    def test_link_checker_identifies_placeholder(self):
        links = module('links', ROOT / 'skills/advisorfit/scripts/check_links.py')
        self.assertTrue(links.check('[paper](https://example.com/a...)')['findings'])
        self.assertFalse(links.check('[Skill specification](https://agentskills.io/specification)')['findings'])

if __name__ == '__main__':
    unittest.main()
