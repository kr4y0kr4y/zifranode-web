"""Render the public case studies as HTML so links and content work without JS."""
from __future__ import annotations

import ast
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "projects-data.js"
PAGE = ROOT / "proyectos.html"


def h(value: str) -> str:
    return html.escape(str(value), quote=True)


def projects():
    source = DATA.read_text(encoding="utf-8")
    source = re.sub(r"^//.*$", "", source, flags=re.MULTILINE)
    source = source.replace("window.znProjects =", "", 1).strip().rstrip(";")
    source = re.sub(r"(?m)^(\s*)([a-zA-Z]\w*):", r"\1'\2':", source)
    source = source.replace('{ src:', "{ 'src':").replace(', alt:', ", 'alt':")
    result = ast.literal_eval(source)
    if not isinstance(result, list) or len({p['id'] for p in result}) != len(result):
        raise ValueError("Invalid or duplicated project identifiers")
    return result


def render_index(items):
    photographed = [p for p in items if p['gallery']][:2]
    others = [p for p in items if p not in photographed]
    cards = []
    for p in photographed:
        photo = p['gallery'][0]
        cards.append(
            f'<a class="project-index-feature" href="#{h(p["id"])}">'
            f'<img src="{h(photo["src"])}" alt="{h(photo["alt"])}" loading="lazy">'
            f'<span>Caso {h(p["number"])} / {h(p["clientType"])}</span>'
            f'<strong>{h(p["title"])}</strong><small>Ver el caso ↗</small></a>'
        )
    links = [
        f'<a class="project-index-link" href="#{h(p["id"])}"><span>{h(p["number"])}</span><strong>{h(p["title"])}</strong><b aria-hidden="true">↗</b></a>'
        for p in others
    ]
    return ('<div class="project-index-intro"><span class="eyebrow">Explora nuestro trabajo</span>'
            '<p>Empieza por dos proyectos con registro fotográfico o ve directo al caso que te interese.</p></div>\n'
            '<div class="project-index-featured">' + '\n'.join(cards) + '</div>\n'
            '<div class="project-index-rest">' + '\n'.join(links) + '</div>')


def render_cases(items):
    out = []
    for p in items:
        parts = [f'<article class="project-case" id="{h(p["id"])}">',
                 '<div class="project-case-heading">',
                 f'<span class="eyebrow">Caso {h(p["number"])} / {h(p["clientType"])}</span>',
                 f'<h2>{h(p["title"])}</h2>', f'<p>{h(p["description"])}</p>', '</div>']
        gallery = p['gallery']
        if gallery:
            parts.append(f'<div class="project-gallery project-gallery--{len(gallery)}">')
            for photo in gallery:
                parts.append(f'<img src="{h(photo["src"])}" alt="{h(photo["alt"])}" loading="lazy">')
            parts.append('</div>')
        kind = ' project-facts--four' if len(p['sections']) > 3 else ''
        parts.append(f'<div class="project-facts{kind}">')
        for section in p['sections']:
            parts += ['<section class="project-fact">', f'<h3>{h(section["label"])}</h3>', f'<p>{h(section["text"])}</p>']
            if section.get('bullets'):
                parts.append('<ul class="project-bullets">')
                parts += [f'<li>{h(item)}</li>' for item in section['bullets']]
                parts.append('</ul>')
            if section.get('note'):
                parts.append(f'<p class="project-note">{h(section["note"])}</p>')
            parts.append('</section>')
        parts.append('</div>')
        if p['technologies']:
            parts.append('<div class="tags">')
            parts += [f'<span>{h(item)}</span>' for item in p['technologies']]
            parts.append('</div>')
        parts.append('</article>')
        out.append('\n'.join(parts))
    return '\n'.join(out)


def replace_block(page: str, name: str, rendered: str) -> str:
    start = f'<!-- {name}_START -->'
    end = f'<!-- {name}_END -->'
    before, rest = page.split(start, 1)
    _, after = rest.split(end, 1)
    return before + start + '\n' + rendered + '\n' + end + after


if __name__ == '__main__':
    page = PAGE.read_text(encoding='utf-8')
    items = projects()
    page = replace_block(page, 'PROJECT_INDEX', render_index(items))
    page = replace_block(page, 'PROJECT_CASES', render_cases(items))
    PAGE.write_text(page, encoding='utf-8')
    print(f'Rendered {len(items)} selected case studies')
