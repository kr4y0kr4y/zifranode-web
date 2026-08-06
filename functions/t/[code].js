import { privateHeaders } from '../_shared/card-access.js';

export async function onRequestGet(context) {
    const code = context.params.code;
    if (!code || !/^[A-Za-z0-9]{6}$/.test(code)) {
        return new Response('Not found', { status: 404, headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) });
    }

    if (!context.env.CARD_LINKS) {
        return new Response('Not found', { status: 404, headers: privateHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) });
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
