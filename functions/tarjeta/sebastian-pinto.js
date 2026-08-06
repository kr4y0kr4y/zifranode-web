import { cardCookie, isValidLink, notFound, privateHeaders } from '../_shared/card-access.js';

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const linkId = url.searchParams.get('id') || '';
    const expiresAt = Number(url.searchParams.get('exp'));
    const signature = url.searchParams.get('sig') || '';

    if (!await isValidLink(context.env, linkId, expiresAt, signature)) return notFound();

    return new Response(null, {
        status: 302,
        headers: privateHeaders({
            Location: '/contacto/sebastian-pinto/',
            'Set-Cookie': cardCookie(linkId, expiresAt, signature)
        })
    });
}
