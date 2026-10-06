"""Create a deliberately allowlisted Cloudflare Pages static output.

Publish only dist/, never the project root. Private card sources remain outside dist
and are imported into the authenticated Pages Function bundle.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ROOT_FILES = {
    '_headers', '_redirects', '_routes.json', 'robots.txt', 'sitemap.xml',
    'site.css', 'experience.css', 'site.js', 'logo_favicon.png', 'logo_header.png',
}


def copy(source: Path) -> None:
    target = OUT / source.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / 'scripts/render_projects.py')], check=True)
    # Wrangler bundles text (.txt) and binary (.bin) modules into the Function.
    # Keep these generated copies synchronized with the editable originals.
    private = ROOT / 'contacto/sebastian-pinto'
    for original, module in (
        ('contact-card.js', 'contact-card-script.txt'),
        ('sebastian-pinto.vcf', 'sebastian-pinto-module.txt'),
        ('assets/perfil-sebastian-pinto.jpeg', 'assets/perfil-sebastian-pinto.bin'),
        ('assets/ZifraNode_Brochure_Corp.pdf', 'assets/ZifraNode_Brochure_Corp.bin'),
    ):
        shutil.copy2(private / original, private / module)
    if OUT.is_symlink():
        raise RuntimeError('Refusing to replace a symlinked dist directory')
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for name in sorted(ROOT_FILES):
        source = ROOT / name
        if not source.is_file():
            raise FileNotFoundError(source)
        copy(source)
    for source in sorted(ROOT.glob('*.html')):
        copy(source)
    copy(ROOT / 'diagnostico/index.html')
    for source in sorted((ROOT / 'images/web').glob('*.webp')):
        copy(source)
    forbidden = ('contacto/', 'functions/', 'scripts/', 'docs/', 'perfil2.jpeg', 'gen_services.py')
    outputs = [p.relative_to(OUT).as_posix() for p in OUT.rglob('*') if p.is_file()]
    if any(path.startswith(forbidden) for path in outputs):
        raise RuntimeError('Private or source-only file entered the public output')
    print(f'Built {len(outputs)} public files in {OUT}')


if __name__ == '__main__':
    main()
