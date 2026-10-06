import { isValidLink, isValidOpaqueLink, notFound, privateHeaders, parseCardCookie, readCookie } from '../../_shared/card-access.js';
import html from '../../../contacto/sebastian-pinto/index.html';
import css from '../../../contacto/sebastian-pinto/tarjeta.css';
import script from '../../../contacto/sebastian-pinto/contact-card-script.txt';
import vcf from '../../../contacto/sebastian-pinto/sebastian-pinto-module.txt';
import portrait from '../../../contacto/sebastian-pinto/assets/perfil-sebastian-pinto.bin';
import brochure from '../../../contacto/sebastian-pinto/assets/ZifraNode_Brochure_Corp.bin';

const assets = {
    '': [html, 'text/html; charset=utf-8'],
    'index.html': [html, 'text/html; charset=utf-8'],
    'tarjeta.css': [css, 'text/css; charset=utf-8'],
    'contact-card.js': [script, 'text/javascript; charset=utf-8'],
    'assets/perfil-sebastian-pinto.jpeg': [portrait, 'image/jpeg'],
    'assets/ZifraNode_Brochure_Corp.pdf': [brochure, 'application/pdf']
};

async function servePrivateAsset(context) {
    const token = parseCardCookie(readCookie(context.request, 'zn_sp_card'));
    if (!token) return notFound();
    const valid = token.opaqueCode
        ? await isValidOpaqueLink(context.env, token.opaqueCode)
        : await isValidLink(context.env, token.linkId, token.expiresAt, token.signature);
    if (!valid) return notFound();

    const pathname = new URL(context.request.url).pathname;
    const prefix = '/contacto/sebastian-pinto/';
    if (pathname === '/contacto/sebastian-pinto') {
        return new Response(null, { status: 308, headers: privateHeaders({ Location: prefix }) });
    }
    if (!pathname.startsWith(prefix)) return notFound();
    const key = pathname.slice(prefix.length);
    let asset = assets[key];
    if (key === 'sebastian-pinto.vcf') {
        const url = token.opaqueCode
            ? new URL(`/t/${token.opaqueCode}`, context.request.url)
            : new URL('/tarjeta/sebastian-pinto', context.request.url);
        if (!token.opaqueCode) {
            url.searchParams.set('id', token.linkId);
            url.searchParams.set('exp', String(token.expiresAt));
            url.searchParams.set('sig', token.signature);
        }
        asset = [vcf.replace('{{PRIVATE_CARD_URL}}', url.toString()), 'text/vcard; charset=utf-8'];
    }
    if (!asset) return notFound();

    const headers = privateHeaders({ 'Content-Type': asset[1] });
    if (key === 'sebastian-pinto.vcf') headers['Content-Disposition'] = 'attachment; filename="sebastian-pinto.vcf"';
    if (key.endsWith('.pdf')) headers['Content-Disposition'] = 'attachment; filename="ZifraNode_Brochure_Corp.pdf"';
    return new Response(context.request.method === 'HEAD' ? null : asset[0], { status: 200, headers });
}

export const onRequestGet = servePrivateAsset;
export const onRequestHead = servePrivateAsset;
