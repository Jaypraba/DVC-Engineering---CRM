#!/usr/bin/env python3
"""
Generates the ES Build illustration set: drafting-style architectural drawings
in the brand navy, used wherever project photography has not been supplied yet.

Visual language, applied consistently across all seven drawings:
  * thin outline  = the existing building
  * solid navy    = the new construction ES Build carries out
  * faint grid    = drafting paper
  * dimension lines and load arrows give the technical register

Run: python3 make-illustrations.py
"""

import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/img/illustrations")
NAVY = "#033072"
PAPER = "#EDF2F8"

W, H = 800, 600
GROUND = 520


def doc(body, w=W, h=H, paper=PAPER):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="{NAVY}" stroke-opacity=".09" stroke-width="1"/>
    </pattern>
    <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="{NAVY}" stroke-opacity=".28" stroke-width="1.4"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="{paper}"/>
  <rect width="{w}" height="{h}" fill="url(#grid)"/>
  <g fill="none" stroke="{NAVY}" stroke-linecap="square" stroke-linejoin="miter">
{body}
  </g>
</svg>
'''


# Existing fabric: thin, semi-transparent outline.
EX = 'stroke-opacity=".5" stroke-width="2"'
EXT = 'stroke-opacity=".34" stroke-width="1.3"'   # thin detail
SOLID = f'fill="{NAVY}" stroke="none"'
GLZ = 'stroke="#EDF2F8" stroke-opacity=".55" stroke-width="2"'


def ground(x1=50, x2=750, y=GROUND):
    """Ground line with hatching below, as on a section drawing."""
    return (f'    <line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke-opacity=".62" stroke-width="2.5"/>\n'
            f'    <rect x="{x1}" y="{y}" width="{x2 - x1}" height="14" fill="url(#hatch)" stroke="none"/>')


def dim(x1, x2, y):
    """Horizontal dimension line with end ticks and arrowheads."""
    return (f'    <line x1="{x1}" y1="{y - 10}" x2="{x1}" y2="{y + 10}" {EXT}/>\n'
            f'    <line x1="{x2}" y1="{y - 10}" x2="{x2}" y2="{y + 10}" {EXT}/>\n'
            f'    <line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" {EXT}/>\n'
            f'    <path d="M{x1 + 3} {y - 4}L{x1 + 12} {y}L{x1 + 3} {y + 4}" {EXT}/>\n'
            f'    <path d="M{x2 - 3} {y - 4}L{x2 - 12} {y}L{x2 - 3} {y + 4}" {EXT}/>')


def mullions(x1, x2, y1, y2, step=40):
    """Vertical glazing bars drawn in paper colour over a solid navy mass."""
    out = []
    x = x1 + step
    while x < x2 - 2:
        out.append(f'    <line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" {GLZ}/>')
        x += step
    return "\n".join(out)


# ---------------------------------------------------------------------------
# 1. House extensions — existing house in outline, new rear extension solid.
# ---------------------------------------------------------------------------
extensions = f'''
    <!-- existing two-storey house -->
    <path d="M300 250V{GROUND}H620V250" {EX}/>
    <path d="M272 258L460 146L648 258" {EX}/>
    <path d="M556 196V112H586V178" {EX}/>
    <line x1="300" y1="392" x2="620" y2="392" {EXT}/>
    <rect x="336" y="288" width="70" height="76" {EX}/>
    <rect x="516" y="288" width="70" height="76" {EX}/>
    <rect x="336" y="424" width="70" height="76" {EX}/>
    <path d="M516 {GROUND}V424h70v96" {EX}/>
    <line x1="551" y1="424" x2="551" y2="{GROUND}" {EXT}/>

    <!-- new rear extension -->
    <rect x="118" y="372" width="184" height="148" {SOLID}/>
    <rect x="108" y="356" width="204" height="18" {SOLID}/>
{mullions(118, 302, 386, 508, 38)}
    <line x1="118" y1="386" x2="302" y2="386" {GLZ}/>
    <path d="M150 356l26-26h72l-26 26" fill="{NAVY}" fill-opacity=".45" stroke="none"/>

{ground()}
{dim(118, 302, 562)}
'''

# ---------------------------------------------------------------------------
# 2. Loft conversions — section through the roof, new dormer solid.
# ---------------------------------------------------------------------------
loft = f'''
    <!-- house section -->
    <path d="M210 262V{GROUND}H590V262" {EX}/>
    <path d="M182 268L400 138L618 268" {EX}/>
    <line x1="210" y1="392" x2="590" y2="392" {EX}/>
    <line x1="210" y1="262" x2="590" y2="262" {EXT}/>
    <rect x="248" y="428" width="66" height="72" {EX}/>
    <rect x="486" y="428" width="66" height="72" {EX}/>
    <rect x="248" y="300" width="66" height="66" {EX}/>

    <!-- new dormer, projecting from the right-hand roof slope -->
    <path d="M452 200h112v62H452z" {SOLID}/>
    <path d="M442 186h132v16H442z" {SOLID}/>
{mullions(452, 564, 212, 252, 37)}
    <line x1="452" y1="212" x2="564" y2="212" {GLZ}/>

    <!-- new floor structure and staircase within the roof void -->
    <line x1="230" y1="262" x2="570" y2="262" stroke-opacity=".55" stroke-width="4"/>
    <path d="M250 392v-22h26v-22h26v-22h26v-22h26v-22h26v-22h26" stroke-opacity=".55" stroke-width="2.5"/>

{ground()}
{dim(452, 564, 562)}
'''

# ---------------------------------------------------------------------------
# 3. Refurbishments — cutaway shell with renewed interior in solid navy.
# ---------------------------------------------------------------------------
refurb = f'''
    <!-- shell retained -->
    <path d="M188 252V{GROUND}H612V252" {EX}/>
    <path d="M160 260L400 148L640 260" {EX}/>
    <line x1="188" y1="386" x2="612" y2="386" {EX}/>
    <line x1="188" y1="252" x2="612" y2="252" {EX}/>

    <!-- renewed interior: rooms rebuilt -->
    <rect x="212" y="278" width="150" height="88" {SOLID}/>
    <rect x="438" y="278" width="150" height="88" {SOLID}/>
    <rect x="212" y="410" width="150" height="90" {SOLID}/>
    <rect x="438" y="410" width="150" height="90" {SOLID}/>
    <line x1="212" y1="322" x2="362" y2="322" {GLZ}/>
    <line x1="438" y1="322" x2="588" y2="322" {GLZ}/>
    <line x1="287" y1="410" x2="287" y2="500" {GLZ}/>
    <line x1="513" y1="410" x2="513" y2="500" {GLZ}/>

    <!-- new staircase between floors -->
    <path d="M378 500v-20h22v-22h22v-22h22v-22h22v-28" stroke-opacity=".6" stroke-width="2.5"/>
    <path d="M378 366v-18h22v-22h22v-22h22v-26" stroke-opacity=".6" stroke-width="2.5"/>

    <!-- renewed roof covering -->
    <path d="M176 254L400 150l224 104" stroke-opacity=".62" stroke-width="5"/>

{ground()}
{dim(188, 612, 562)}
'''

# ---------------------------------------------------------------------------
# 4. Kitchens and bathrooms — interior elevation.
# ---------------------------------------------------------------------------
kitchen = f'''
    <line x1="80" y1="128" x2="720" y2="128" {EX}/>
    <line x1="80" y1="128" x2="80" y2="{GROUND}" {EX}/>
    <line x1="720" y1="128" x2="720" y2="{GROUND}" {EX}/>

    <!-- run of base units and worktop -->
    <rect x="118" y="404" width="300" height="116" {SOLID}/>
    <rect x="110" y="390" width="316" height="16" {SOLID}/>
{mullions(118, 418, 420, 508, 75)}
    <line x1="118" y1="440" x2="418" y2="440" {GLZ}/>

    <!-- wall units -->
    <rect x="118" y="206" width="182" height="100" {SOLID}/>
    <line x1="209" y1="212" x2="209" y2="300" {GLZ}/>

    <!-- tall unit -->
    <rect x="446" y="206" width="86" height="314" {SOLID}/>
    <line x1="446" y1="330" x2="532" y2="330" {GLZ}/>

    <!-- sink and tap -->
    <rect x="180" y="360" width="86" height="30" {EX}/>
    <path d="M223 360v-34h30" stroke-opacity=".6" stroke-width="3"/>

    <!-- window -->
    <rect x="318" y="206" width="108" height="128" {EX}/>
    <line x1="372" y1="206" x2="372" y2="334" {EXT}/>
    <line x1="318" y1="270" x2="426" y2="270" {EXT}/>

    <!-- bath -->
    <path d="M568 428h134v70a18 18 0 0 1-18 18h-98a18 18 0 0 1-18-18z" {EX}/>
    <path d="M596 428v-16h78v16" {EXT}/>
    <path d="M635 412v-26h26" stroke-opacity=".6" stroke-width="3"/>

{ground(80, 720)}
{dim(110, 426, 562)}
'''

# ---------------------------------------------------------------------------
# 5. Structural alterations — new steel over a formed opening.
# ---------------------------------------------------------------------------
_courses = "\n".join(
    f'    <line x1="120" y1="{y}" x2="680" y2="{y}" {EXT}/>' for y in range(224, 300, 24))
_arrows = "\n".join(
    f'    <path d="M{x} 210v58M{x - 7} 258l7 10 7-10" stroke-opacity=".45" stroke-width="2"/>'
    for x in range(270, 561, 58))

structural = f'''
    <!-- retained wall over -->
    <path d="M120 200h560v100H120z" {EX}/>
{_courses}
    <path d="M120 300v220" {EX}/>
    <path d="M680 300v220" {EX}/>

    <!-- masonry removed below the new beam -->
    <path d="M288 362h224v158H288z" stroke-dasharray="9 7" stroke-opacity=".4" stroke-width="2"/>

    <!-- new steel beam, shown in elevation with its flanges marked -->
    <rect x="222" y="300" width="356" height="62" {SOLID}/>
    <line x1="222" y1="313" x2="578" y2="313" {GLZ}/>
    <line x1="222" y1="349" x2="578" y2="349" {GLZ}/>

    <!-- padstones bearing onto the retained piers -->
    <rect x="222" y="362" width="66" height="40" {SOLID}/>
    <rect x="512" y="362" width="66" height="40" {SOLID}/>
    <path d="M222 402h66v118h-66z" {EX}/>
    <path d="M512 402h66v118h-66z" {EX}/>

    <!-- load transferred to the new beam -->
{_arrows}

{ground(90, 710)}
{dim(228, 572, 562)}
'''

# ---------------------------------------------------------------------------
# 6. Commercial — glazed frontage with a new ground-floor fit-out.
# ---------------------------------------------------------------------------
_panes = []
for r, y in enumerate(range(150, 391, 80)):
    for c, x in enumerate(range(150, 631, 80)):
        op = ".10" if (r + c) % 3 else ".22"
        _panes.append(f'    <rect x="{x}" y="{y}" width="80" height="80" fill="{NAVY}" '
                      f'fill-opacity="{op}" stroke="{NAVY}" stroke-opacity=".34" stroke-width="1.3"/>')
_panes = "\n".join(_panes)

commercial = f'''
    <!-- existing frame -->
    <path d="M150 150h560v270H150z" {EX}/>
{_panes}
    <line x1="150" y1="150" x2="710" y2="150" {EX}/>

    <!-- new signage band and shopfront -->
    <rect x="140" y="404" width="580" height="34" {SOLID}/>
    <rect x="150" y="438" width="560" height="82" {SOLID}/>
{mullions(150, 710, 452, 508, 70)}
    <rect x="390" y="446" width="80" height="74" fill="{PAPER}" stroke="none"/>
    <line x1="430" y1="446" x2="430" y2="520" {EX}/>
    <path d="M120 404h600" stroke-opacity=".55" stroke-width="3"/>

{ground(100, 740)}
{dim(150, 710, 562)}
'''

# ---------------------------------------------------------------------------
# 7. Skyline — wide banner for the coverage pages.
# ---------------------------------------------------------------------------
def _roofline(seed, y0, op, width):
    """A run of terraced roof shapes at a given depth."""
    import random
    r = random.Random(seed)
    x = -40
    d = [f"M{x} 400"]
    while x < 1640:
        w = r.choice([70, 90, 110, 130, 150, 175])
        h = r.choice([55, 80, 110, 140, 175, 210, 245])
        top = y0 - h
        if r.random() < .45:      # pitched
            d.append(f"L{x} {top + 22}L{x + w / 2:.0f} {top}L{x + w} {top + 22}")
        else:                     # flat with parapet
            d.append(f"L{x} {top}L{x + w} {top}")
        x += w
        d.append(f"L{x} 400")
    d.append("Z")
    return (f'    <path d="{" ".join(d)}" fill="{NAVY}" fill-opacity="{op}" stroke="{NAVY}" '
            f'stroke-opacity="{op}" stroke-width="{width}"/>')

skyline = f'''
{_roofline(7, 330, ".16", 1.5)}
{_roofline(3, 360, ".30", 1.5)}
{_roofline(11, 392, ".85", 1.5)}
    <line x1="0" y1="400" x2="1600" y2="400" stroke-opacity=".9" stroke-width="3"/>
'''

DRAWINGS = {
    "extensions": (extensions, W, H),
    "loft-conversions": (loft, W, H),
    "refurbishments": (refurb, W, H),
    "kitchens-bathrooms": (kitchen, W, H),
    "structural-alterations": (structural, W, H),
    "commercial": (commercial, W, H),
    "skyline": (skyline, 1600, 400),
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, (body, w, h) in DRAWINGS.items():
        path = os.path.join(OUT, "illus-%s.svg" % name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(doc(body, w, h))
        print("wrote %-44s %5.1f KB" % (os.path.relpath(path, os.path.dirname(OUT)),
                                        os.path.getsize(path) / 1024))
