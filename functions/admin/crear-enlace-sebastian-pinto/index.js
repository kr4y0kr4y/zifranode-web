import { privateHeaders, signLink } from '../../_shared/card-access.js';

const NINETY_DAYS = 90 * 24 * 60 * 60;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function denied() {
    return new Response('Unauthorized', { status: 401, headers: privateHeaders({ 'WWW-Authenticate': 'Bearer' }) });
}

function randomShortCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(bytes, b => CHARS[b % CHARS.length]).join('');
}

export async function onRequestPost(context) {
    const expected = context.env.CARD_ADMIN_TOKEN;
    const supplied = context.request.headers.get('Authorization');
    if (!expected || supplied !== `Bearer ${expected}` || !context.env.CARD_LINKS || !context.env.CARD_LINK_SECRET) return denied();

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + NINETY_DAYS;
    const linkId = crypto.randomUUID().replace(/-/g, '');
    await context.env.CARD_LINKS.put(
        `sebastian-pinto:${linkId}`,
        JSON.stringify({ expiresAt, revoked: false }),
        { expiration: expiresAt }
    );

    const signature = await signLink(context.env.CARD_LINK_SECRET, linkId, expiresAt);
    const fullUrl = new URL('/tarjeta/sebastian-pinto', context.request.url);
    fullUrl.searchParams.set('id', linkId);
    fullUrl.searchParams.set('exp', String(expiresAt));
    fullUrl.searchParams.set('sig', signature);

    const code = randomShortCode();
    const shortUrl = new URL(`/t/${code}`, context.request.url);
    await context.env.CARD_LINKS.put(
        `short:${code}`,
        fullUrl.toString(),
        { expiration: expiresAt }
    );

    return Response.json({ shortUrl: shortUrl.toString(), url: fullUrl.toString(), expiresAt }, { headers: privateHeaders() });
}
