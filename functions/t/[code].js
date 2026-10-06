import { isValidOpaqueLink, opaqueCardCookie, privateHeaders } from '../_shared/card-access.js';

export async function onRequestGet(context) {
    const code = context.params.code;
    if (!code || !/^(?:[a-f0-9]{32}|[A-Za-z0-9]{6}|[A-Za-z0-9]{12})$/.test(code)) {
        return new Response('Not found', { status: 404, headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) });
    }

    if (!context.env.CARD_LINKS) {
        return new Response('Not found', { status: 404, headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) });
    }

    if (/^[a-f0-9]{32}$/.test(code)) {
        const record = await isValidOpaqueLink(context.env, code);
        if (!record) return new Response('Not found', { status: 404, headers: privateHeaders() });
        return new Response(null, {
            status: 302,
            headers: privateHeaders({
                Location: '/contacto/sebastian-pinto/',
                'Set-Cookie': opaqueCardCookie(code, record.expiresAt)
            })
        });
    }

    const target = await context.env.CARD_LINKS.get(`short:${code}`);
    if (!target) {
        return new Response('Not found', { status: 404, headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) });
    }

    return new Response(null, {
        status: 302,
        headers: privateHeaders({ Location: target }),
    });
}
