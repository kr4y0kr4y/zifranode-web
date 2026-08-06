import { isValidLink, notFound, privateHeaders, parseCardCookie, readCookie } from '../../../_shared/card-access.js';

async function servePrivateAsset(context) {
    const token = parseCardCookie(readCookie(context.request, 'zn_sp_card'));
    if (!token || !await isValidLink(context.env, token.linkId, token.expiresAt, token.signature)) return notFound();

    const asset = await context.env.ASSETS.fetch(context.request);
    const headers = new Headers(asset.headers);
    for (const [name, value] of Object.entries(privateHeaders())) headers.set(name, value);

    const pathname = new URL(context.request.url).pathname;
    if (pathname.endsWith('/sebastian-pinto.vcf')) {
        const url = new URL('/tarjeta/sebastian-pinto', context.request.url);
        url.searchParams.set('id', token.linkId);
        url.searchParams.set('exp', String(token.expiresAt));
        url.searchParams.set('sig', token.signature);
        const card = await asset.text();
        headers.set('Content-Type', 'text/vcard; charset=utf-8');
        return new Response(card.replace('{{PRIVATE_CARD_URL}}', url.toString()), { status: asset.status, statusText: asset.statusText, headers });
    }

    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
}

export const onRequestGet = servePrivateAsset;
export const onRequestHead = servePrivateAsset;
