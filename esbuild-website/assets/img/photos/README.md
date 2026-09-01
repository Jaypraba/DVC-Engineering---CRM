# Photography drop-in folder

Drop a file named `<slot>.jpg` (or `.jpeg`, `.png`, `.webp`) into this folder and
re-run `python3 build.py` from the site root. The build picks it up automatically
and it replaces the architectural illustration in that slot — no markup changes.

| Slot filename | Where it appears | Suggested size |
| --- | --- | --- |
| `hero` | Homepage hero background (tinted navy at 28%) | 2400 × 1400, landscape |
| `project-extensions` | "Extensions" category card, homepage + projects | 1200 × 900 (4:3) |
| `project-loft-conversions` | "Loft conversions" category card | 1200 × 900 |
| `project-refurbishments` | "Full refurbishments" category card | 1200 × 900 |
| `project-kitchens-bathrooms` | "Kitchens and bathrooms" category card | 1200 × 900 |
| `project-structural-alterations` | "Structural alterations" category card | 1200 × 900 |
| `project-commercial` | "Commercial projects" category card | 1200 × 900 |
| `service-extensions` | House Extensions page, scope section | 1200 × 900 |
| `service-loft-conversions` | Loft Conversions page | 1200 × 900 |
| `service-refurbishments` | Refurbishments page | 1200 × 900 |
| `service-kitchens-bathrooms` | Kitchens and Bathrooms page | 1200 × 900 |
| `service-structural-alterations` | Structural Alterations page | 1200 × 900 |
| `service-commercial` | Commercial page | 1200 × 900 |
| `about` | About page, opening section | 1200 × 900 |
| `coverage` | Coverage banner, homepage + Areas We Cover | 2400 × 600 (4:1) |

## Notes

- **The hero photo is the highest-impact single image on the site.** A wide shot
  of completed work, or of a live site, transforms the homepage.
- Photographs replacing a `project-*` slot appear on cards labelled "Project
  category", so they read as representative of that type of work rather than as a
  specific case study. Individual case studies belong on project pages built from
  `project-template.html`.
- Alt text for photographs currently falls back to empty. When you add a photo,
  set a real description via the `visual()` call's `alt` argument in `build.py` —
  it matters for both accessibility and SEO.
- Export at roughly 2× the display size, then compress. Aim for under 300 KB per
  image; WebP is the best format if your host supports it.
