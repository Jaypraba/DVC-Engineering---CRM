#!/usr/bin/env python3
"""
Bundles the whole site into a single self-contained HTML file for sharing as a
clickable preview: all 14 pages, CSS and JS inlined, images as data URIs, and a
hash router so the navigation works exactly as it does on the real site.

The published site is the multi-page build; this is only for review.
Run: python3 bundle-preview.py <output.html>
"""

import base64
import mimetypes
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

PAGES = [
    ("index", "Home"), ("about", "About"), ("extensions", "House Extensions"),
    ("loft-conversions", "Loft Conversions"), ("refurbishments", "Property Refurbishments"),
    ("kitchens-bathrooms", "Kitchens and Bathrooms"),
    ("structural-alterations", "Structural Alterations"),
    ("commercial", "Commercial Construction"), ("projects", "Projects"),
    ("project-template", "Project Template"), ("areas", "Areas We Cover"),
    ("faqs", "FAQs"), ("contact", "Contact"), ("privacy", "Privacy Policy"),
]


def read(p):
    with open(os.path.join(HERE, p), encoding="utf-8") as fh:
        return fh.read()


def grab(html, tag, attr):
    m = re.search(r'<%s %s>(.*?)</%s>' % (tag, attr, tag), html, re.S)
    if not m:
        raise SystemExit("could not find <%s %s> " % (tag, attr))
    return m.group(1)


def data_uri(path):
    full = os.path.join(HERE, path)
    mime = mimetypes.guess_type(full)[0] or "application/octet-stream"
    if path.endswith(".svg"):
        mime = "image/svg+xml"
    with open(full, "rb") as fh:
        return "data:%s;base64,%s" % (mime, base64.b64encode(fh.read()).decode())


def inline_assets(html):
    cache = {}

    def sub(m):
        path = m.group(1)
        if path not in cache:
            cache[path] = data_uri(path)
        return 'src="%s"' % cache[path]

    return re.sub(r'src="(assets/img/[^"]+)"', sub, html)


def rewrite_links(html):
    """Internal page links become hash routes so the preview navigates in-place."""
    def sub(m):
        return 'href="#/%s"' % m.group(1)
    return re.sub(r'href="([a-z0-9-]+)\.html"', sub, html)


index = read("index.html")
header = grab(index, "header", 'class="site-header"')
footer = grab(index, "footer", 'class="site-footer"')

titles, bodies = {}, []
for slug, _ in PAGES:
    src = read(slug + ".html")
    titles[slug] = re.search(r"<title>(.*?)</title>", src, re.S).group(1).strip()
    main = grab(src, "main", 'id="main"')
    hidden = "" if slug == "index" else " hidden"
    bodies.append('<div class="page" data-page="%s"%s>%s</div>' % (slug, hidden, main))

css = read("assets/css/site.css")
js = read("assets/js/site.js")

doc = """<div id="site">
%s
<main id="main">
%s
</main>
%s
</div>""" % (header, "\n".join(bodies), footer)

doc = rewrite_links(doc)
doc = inline_assets(doc)

# The artifact sandbox will not load third-party scripts, so the Checkatrade
# widget cannot render here. Say so rather than showing an empty band.
doc = doc.replace(
    '<div class="checkatrade-widget" id="checkatrade-widget"></div>',
    '<div class="checkatrade-widget"><p class="preview-note">The Checkatrade '
    'reviews widget renders here on the published site. Preview pages cannot load '
    'third-party scripts.</p></div>')

nav_titles = {s: t for s, t in titles.items()}

out = f'''<title>ES Build</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {{ color-scheme: light; }}
{css}
/* Preview-only: notes where live third-party content would sit. */
.preview-note {{
  margin: 0; font-size: .9rem; color: var(--muted); max-width: 46ch;
  border: 1px dashed var(--line-strong); border-radius: var(--radius);
  padding: 1rem 1.25rem; background: #fff;
}}
</style>

{doc}

<script>
{js}
</script>
<script>
(function () {{
  "use strict";
  var TITLES = {nav_titles!r};
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));

  function slugFromHash() {{
    var h = (location.hash || "").replace(/^#\\/?/, "").split("#")[0];
    return TITLES.hasOwnProperty(h) ? h : "index";
  }}

  function markNav(slug) {{
    document.querySelectorAll("#site .nav-links a").forEach(function (a) {{
      var target = (a.getAttribute("href") || "").replace(/^#\\//, "");
      if (target === slug) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }});
  }}

  function route(scroll) {{
    var slug = slugFromHash();
    pages.forEach(function (p) {{ p.hidden = p.dataset.page !== slug; }});
    document.title = TITLES[slug];
    markNav(slug);
    document.body.classList.remove("nav-open");
    var t = document.querySelector(".nav-toggle");
    if (t) t.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".has-menu").forEach(function (m) {{
      m.setAttribute("data-open", "false");
    }});
    if (scroll !== false) window.scrollTo(0, 0);
  }}

  window.addEventListener("hashchange", function () {{ route(true); }});
  route(false);
}})();
</script>
'''

dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "preview.html")
with open(dest, "w", encoding="utf-8") as fh:
    fh.write(out)
print("wrote %s (%.0f KB)" % (dest, os.path.getsize(dest) / 1024))
