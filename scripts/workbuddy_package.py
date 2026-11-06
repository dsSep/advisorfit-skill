"""Create a WorkBuddy import ZIP from the canonical Skill; no user settings or network."""
import hashlib
import json
from pathlib import Path
import re
import zipfile


def build_workbuddy(root, version, target):
    root, target = Path(root), Path(target)
    skill = root / 'skills/advisorfit'
    metadata = json.loads((root / 'adapters/workbuddy/metadata.json').read_text('utf-8'))
    metadata['version'] = version
    canonical = (skill / 'SKILL.md').read_text('utf-8')
    body = canonical.split('---', 2)[2].lstrip()
    body, count = re.subn(r'ChatGPT(?:、Codex或WorkBuddy|或Codex)负责', 'WorkBuddy负责', body, count=1)
    if count != 1:
        raise ValueError('Canonical host introduction changed; review the WorkBuddy adaptation.')
    notice = ('## WorkBuddy运行方式\n\n'
              '使用当前已授权且可用的搜索、网页阅读与文件能力；没有相应能力时请用户提供材料，并标明实际阅读范围。'
              '本包不配置额外模型密钥或连接器，不发送邮件。仅使用用户授权的任务文件，不主动将真实简历、联系方式或导师选择结论写入长期记忆；'
              '宿主自身的数据保留与记忆设置由用户在客户端管理，本技能不承诺关闭平台记录。\n\n')
    body = body.replace('## 先判断本轮需要完成什么', notice + '## 先判断本轮需要完成什么', 1)
    body = re.sub(r'\[([^\]]+)\]\((references/[^)]+)\)', lambda m: f'{m[1]}（@{m[2]}）', body)
    # JSON strings and inline arrays are valid YAML values, including multilingual metadata.
    header = '\n'.join(f'{key}: {json.dumps(value, ensure_ascii=False)}' for key, value in metadata.items())
    files = {'SKILL.md': ('---\n' + header + '\n---\n\n' + body).encode('utf-8')}
    source_hashes = {'SKILL.md': hashlib.sha256(canonical.encode('utf-8')).hexdigest()}
    for folder in ['references', 'scripts']:
        for path in sorted((skill / folder).rglob('*')):
            if not path.is_file() or '__pycache__' in path.parts or path.suffix == '.pyc':
                continue
            if path.is_symlink():
                raise ValueError('Skill resources must be regular files.')
            name = path.relative_to(skill).as_posix()
            files[name] = path.read_text('utf-8').encode('utf-8')
            source_hashes[name] = hashlib.sha256(files[name]).hexdigest()
    files['LICENSE'] = (root / 'LICENSE').read_text('utf-8').encode('utf-8')
    files['INSTALL.md'] = (root / 'docs/workbuddy.md').read_text('utf-8').encode('utf-8')
    manifest = {'platform': 'WorkBuddy', 'source_skill_version': version,
                'hash_format': 'SHA256 of UTF-8 text with LF line endings', 'source_hashes': source_hashes,
                'adapter_changes': ['WorkBuddy metadata', 'host introduction and task privacy boundary', '@references pointers'],
                'client_import_status': 'Package checked; this exact ZIP has not been imported by the maintainer into WorkBuddy.'}
    files['DISTRIBUTION.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo('advisorfit/' + name, date_time=(2026, 11, 7, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return target
