"""Offline release checks for the allowlisted Cloudflare Pages output."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
        self.images_without_alt = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate id: {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag == 'img' and 'alt' not in attrs:
            self.images_without_alt.append(attrs.get('src'))
        for name in ('href', 'src'):
            if name in attrs:
                self.refs.append(attrs[name])


def main():
    assert OUT.is_dir(), 'Run scripts/build_site.py first'
    assert not (OUT / 'contacto').exists(), 'Private card was published as static content'
    assert not (OUT / 'functions').exists(), 'Function source was published as static content'
    assert not (OUT / 'admin').exists(), 'Administrative endpoint was published as static content'
    assert not (OUT / 'gen_services.py').exists(), 'Development script was published'
    html_count = 0
    for page in OUT.rglob('*.html'):
        html_count += 1
        parsed = References()
        parsed.feed(page.read_text(encoding='utf-8'))
        assert not parsed.images_without_alt, f'{page}: image missing alt'
        for ref in parsed.refs:
            split = urlsplit(ref)
            if split.scheme or split.netloc or ref.startswith(('mailto:', 'tel:', '#', 'data:')):
                if ref.startswith('#'):
                    assert ref[1:] in parsed.ids, f'{page}: missing anchor {ref}'
                continue
            target_path = unquote(split.path)
            target = (OUT / target_path.lstrip('/')) if target_path.startswith('/') else (page.parent / target_path)
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'{page}: missing {ref}'
            if split.fragment and target == page:
                assert split.fragment in parsed.ids, f'{page}: missing anchor {ref}'
    projects = (OUT / 'proyectos.html').read_text(encoding='utf-8')
    assert projects.count('class="project-case"') == 6
    assert 'Y muchos más proyectos.' in projects
    assert 'projects.js' not in projects
    private_function = (ROOT / 'functions/contacto/sebastian-pinto/[[path]].js').read_text()
    assert 'ASSETS.fetch' not in private_function
    assert 'isValidOpaqueLink(context.env, token.opaqueCode)' in private_function
    assert not (ROOT / 'functions/admin/crear-enlace-sebastian-pinto/index.js').exists(), 'Public admin function still exists'
    assert '"/admin/*"' not in (OUT / '_routes.json').read_text(), 'Public admin route still active'
    assert (ROOT / 'contacto/sebastian-pinto/contact-card.js').read_bytes() == (ROOT / 'contacto/sebastian-pinto/contact-card-script.txt').read_bytes()
    for original, module in (
        ('sebastian-pinto.vcf', 'sebastian-pinto-module.txt'),
        ('assets/perfil-sebastian-pinto.jpeg', 'assets/perfil-sebastian-pinto.bin'),
        ('assets/ZifraNode_Brochure_Corp.pdf', 'assets/ZifraNode_Brochure_Corp.bin'),
    ):
        base = ROOT / 'contacto/sebastian-pinto'
        assert (base / original).read_bytes() == (base / module).read_bytes()
    print(f'Checked {html_count} HTML pages, local references, anchors and private output')


if __name__ == '__main__':
    main()
