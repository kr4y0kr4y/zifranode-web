const encoder = new TextEncoder();

export function notFound() {
    return new Response('Not found', {
        status: 404,
        headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' })
    });
}

export function privateHeaders(headers = {}) {
    return {
        'Cache-Control': 'no-store, private',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive',
        'X-Frame-Options': 'DENY',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        ...headers
    };
}

export function readCookie(request, name) {
    const prefix = `${name}=`;
    const cookie = request.headers.get('Cookie') || '';
    const value = cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
    return value ? value.slice(prefix.length) : null;
}

function base64UrlToBytes(value) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmacKey(secret, usage) {
    return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

function payload(linkId, expiresAt) {
    return `sebastian-pinto\n${linkId}\n${expiresAt}`;
}

export async function signLink(secret, linkId, expiresAt) {
    const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), encoder.encode(payload(linkId, expiresAt)));
    return bytesToBase64Url(new Uint8Array(signature));
}

export async function isValidLink(env, linkId, expiresAt, signature) {
    if (!env.CARD_LINK_SECRET || !env.CARD_LINKS || !/^[a-f0-9]{32}$/.test(linkId)) return false;
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

    try {
        const record = await env.CARD_LINKS.get(`sebastian-pinto:${linkId}`, 'json');
        if (!record || record.revoked || record.expiresAt !== expiresAt) return false;

        return crypto.subtle.verify(
            'HMAC',
            await hmacKey(env.CARD_LINK_SECRET, 'verify'),
            base64UrlToBytes(signature),
            encoder.encode(payload(linkId, expiresAt))
        );
    } catch {
        return false;
    }
}

export async function isValidOpaqueLink(env, code) {
    if (!env.CARD_LINKS || !/^[a-f0-9]{32}$/.test(code)) return null;
    try {
        const record = await env.CARD_LINKS.get(`access:${code}`, 'json');
        if (!record || record.revoked || !Number.isSafeInteger(record.expiresAt)) return null;
        if (record.expiresAt <= Math.floor(Date.now() / 1000)) return null;
        return record;
    } catch {
        return null;
    }
}

export function opaqueCardCookie(code, expiresAt) {
    const maxAge = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
    return `zn_sp_card=opaque.${code}; Path=/contacto/sebastian-pinto; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function cardCookie(linkId, expiresAt, signature) {
    const maxAge = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));
    return `zn_sp_card=${linkId}.${expiresAt}.${signature}; Path=/contacto/sebastian-pinto; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function parseCardCookie(value) {
    if (!value) return null;
    const [linkId, expiry, signature] = value.split('.');
    if (linkId === 'opaque') return /^[a-f0-9]{32}$/.test(expiry || '') && !signature ? { opaqueCode: expiry } : null;
    const expiresAt = Number(expiry);
    return linkId && signature && Number.isSafeInteger(expiresAt) ? { linkId, expiresAt, signature } : null;
}
