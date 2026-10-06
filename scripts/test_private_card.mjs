import assert from 'node:assert/strict';
import { isValidOpaqueLink, parseCardCookie } from '../functions/_shared/card-access.js';
import { onRequestGet } from '../functions/t/[code].js';

const code = '0123456789abcdef0123456789abcdef';
const expiresAt = Math.floor(Date.now() / 1000) + 3600;
const records = new Map([[`access:${code}`, { expiresAt, revoked: false }]]);
const kv = {
    async get(key, type) {
        const record = records.get(key) ?? null;
        return type === 'json' ? record : record;
    }
};

function request(path, testedCode = code) {
    return onRequestGet({
        params: { code: testedCode },
        env: { CARD_LINKS: kv },
        request: new Request(`https://zifranode.cl${path}`)
    });
}

assert.ok(await isValidOpaqueLink({ CARD_LINKS: kv }, code));
const response = await request(`/t/${code}`);
assert.equal(response.status, 302);
assert.equal(response.headers.get('Location'), '/contacto/sebastian-pinto/');
const cookie = response.headers.get('Set-Cookie');
assert.ok(cookie.includes('HttpOnly'));
assert.ok(cookie.includes('Secure'));
assert.deepEqual(parseCardCookie(cookie.split(';')[0].split('=')[1]), { opaqueCode: code });

records.set(`access:${code}`, { expiresAt, revoked: true });
assert.equal((await request(`/t/${code}`)).status, 404);
records.set(`access:${code}`, { expiresAt: Math.floor(Date.now() / 1000) - 1, revoked: false });
assert.equal((await request(`/t/${code}`)).status, 404);
assert.equal((await request('/t/invalid', 'invalid')).status, 404);
assert.equal(parseCardCookie('opaque.not-a-code'), null);
assert.deepEqual(parseCardCookie('a'.repeat(32) + '.123.signature'), {
    linkId: 'a'.repeat(32), expiresAt: 123, signature: 'signature'
});

console.log('Private card access checks passed');
