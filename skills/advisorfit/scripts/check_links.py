"""Check final Markdown for placeholder/truncated HTTP links; no network requests."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


def check(text):
    findings = []
    urls = list(re.finditer(r'https?://[^\s<>"\]\)]+', text))
    for match in urls:
        url = match.group().rstrip(',;，。；')
        decoded = unquote(url)
        line = text.count('\n', 0, match.start()) + 1
        reasons = []
        try:
            host = (urlsplit(url).hostname or '').lower()
        except ValueError:
            host = ''
        if not host:
            reasons.append('missing_or_invalid_host')
        if '...' in decoded or '…' in decoded:
            reasons.append('truncated_url')
        if host in {'example.com', 'example.org', 'example.net'} or host.endswith(('.example', '.invalid', '.test')):
            reasons.append('placeholder_domain')
        if re.search(r'待填|待补|占位|TODO|PLACEHOLDER|YOUR[_-]', decoded, re.I):
            reasons.append('placeholder_url')
        if reasons:
            findings.append({'line': line, 'url': url, 'reasons': reasons})
    # Catch Markdown destinations that have no actual URL at all.
    for match in re.finditer(r'\[[^\]\n]+\]\(([^)\n]*)\)', text):
        target = match.group(1).strip()
        if not target or re.search(r'待填|待补|已核查.*URL|真实.*URL|^URL$|^\.\.\.$|^…$', target, re.I):
            findings.append({'line': text.count('\n', 0, match.start()) + 1,
                             'target': target, 'reasons': ['placeholder_destination']})
    return {'url_count': len(urls), 'findings': findings,
            'status': 'needs_review' if findings else 'no_structural_issue_detected',
            'limitations': 'Offline syntax checks only; does not verify reachability, identity, provenance or claim support.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('markdown', type=Path)
    args = parser.parse_args()
    try:
        result = check(args.markdown.read_text(encoding='utf-8'))
    except (OSError, UnicodeError) as exc:
        print(json.dumps({'error': str(exc)}, ensure_ascii=False))
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result['findings'] else 0


if __name__ == '__main__':
    sys.exit(main())
