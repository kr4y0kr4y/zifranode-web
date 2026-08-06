import { privateHeaders, signLink } from '../_shared/card-access.js';

const NINETY_DAYS = 90 * 24 * 60 * 60;

function denied() {
    return new Response('Unauthorized', { status: 401, headers: privateHeaders({ 'WWW-Authenticate': 'Bearer' }) });
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
    const url = new URL('/tarjeta/sebastian-pinto', context.request.url);
    url.searchParams.set('id', linkId);
    url.searchParams.set('exp', String(expiresAt));
    url.searchParams.set('sig', signature);

    return Response.json({ url: url.toString(), expiresAt }, { headers: privateHeaders() });
}
