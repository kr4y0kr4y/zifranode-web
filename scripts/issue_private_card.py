"""Issue or revoke an opaque private-card link using Workers KV.

Without --write this only prints the KV operation for manual entry. With --write,
the API token is read from the environment and never stored in this project.
"""
from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

LIFETIME = 90 * 24 * 60 * 60


def kv_request(method: str, key: str, value: str | None, expiration: int | None) -> None:
    token = os.environ.get('CF_API_TOKEN')
    account = os.environ.get('CF_ACCOUNT_ID')
    namespace = os.environ.get('CF_KV_NAMESPACE_ID')
    if not all((token, account, namespace)):
        raise RuntimeError('Set CF_API_TOKEN, CF_ACCOUNT_ID and CF_KV_NAMESPACE_ID for --write')
    if not all(len(identifier) == 32 and all(c in '0123456789abcdef' for c in identifier.lower())
               for identifier in (account, namespace)):
        raise RuntimeError('Cloudflare account and namespace IDs must be 32 hex characters')

    path = f'/client/v4/accounts/{account}/storage/kv/namespaces/{namespace}/values/{urllib.parse.quote(key, safe="")}'
    query = f'?expiration={expiration}' if expiration is not None else ''
    request = urllib.request.Request(
        f'https://api.cloudflare.com{path}{query}',
        data=value.encode('utf-8') if value is not None else None,
        method=method,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/octet-stream',
            'Accept': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f'Cloudflare API returned HTTP {error.code}') from error
    if not result.get('success'):
        raise RuntimeError('Cloudflare KV operation failed: ' + json.dumps(result.get('errors', [])))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    subcommands = parser.add_subparsers(dest='action', required=True)
    issue = subcommands.add_parser('issue', help='Create a 90-day link')
    issue.add_argument('--write', action='store_true', help='Write to KV through the Cloudflare API')
    issue.add_argument('--base-url', default='https://zifranode.cl')
    revoke = subcommands.add_parser('revoke', help='Delete an issued link from KV')
    revoke.add_argument('code', help='32-character code from the short URL')
    revoke.add_argument('--write', action='store_true', help='Delete from KV through the Cloudflare API')
    args = parser.parse_args()

    if args.action == 'issue':
        parsed = urllib.parse.urlsplit(args.base_url)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.path not in ('', '/') or parsed.query or parsed.fragment:
            parser.error('--base-url must be an HTTPS origin')
        code = secrets.token_hex(16)
        expires_at = int(time.time()) + LIFETIME
        key = f'access:{code}'
        value = json.dumps({'expiresAt': expires_at, 'revoked': False}, separators=(',', ':'))
        if args.write:
            kv_request('PUT', key, value, expires_at)
        print(f"Enlace: {args.base_url.rstrip('/')}/t/{code}")
        print(f'KV key: {key}')
        print(f'KV value: {value}')
        print(f'KV expiration (Unix): {expires_at}')
        if not args.write:
            print('Pendiente: agrega esta clave y valor al namespace CARD_LINKS con la expiración indicada.')
    else:
        code = args.code.lower()
        if len(code) != 32 or any(c not in '0123456789abcdef' for c in code):
            parser.error('code must be exactly 32 hexadecimal characters')
        key = f'access:{code}'
        if args.write:
            kv_request('DELETE', key, None, None)
        print(f'KV key to delete: {key}')
        if not args.write:
            print('Pendiente: elimina esta clave del namespace CARD_LINKS para revocar el enlace.')


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as error:
        print(f'Error: {error}', file=sys.stderr)
        raise SystemExit(1) from None
