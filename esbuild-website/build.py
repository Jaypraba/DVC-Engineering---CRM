#!/usr/bin/env python3
"""
ES Build website generator.

Writes the static HTML pages from shared header/footer templates so the
markup stays consistent across the site. Run:  python3 build.py

The generated .html files are committed and work standalone (no build step
needed to view or host them). Re-run this only when editing shared chrome.
"""

import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# SITE DETAILS — fill these in before publishing. Anything left blank is
# rendered as a visibly-marked placeholder rather than a fake value.
# ---------------------------------------------------------------------------
SITE = {
    "domain":        "",                      # e.g. "https://www.esbuild.co.uk"
    "phone_display": "",                      # e.g. "020 7123 4567"
    "phone_href":    "",                      # e.g. "+442071234567"
    "email":         "",                      # e.g. "enquiries@esbuild.co.uk"
    "hours":         "",                      # e.g. "Monday to Friday, 8:00am - 6:00pm"
    "company_name":  "",                      # Registered company name
    "company_no":    "",                      # Company registration number
    "reg_address":   "",                      # Registered office address
    "vat_no":        "",                      # VAT registration number, if applicable
    # Set to True ONLY once insurance cover is confirmed. Controls the
    # "Are you insured?" FAQ, per the copy note in the brief.
    "insurance_confirmed": False,
}

CHECKATRADE = (
    '<script>window._checkatradeConfig = '
    '{"companyId":469672,"uniqueName":"ESBuild","theme":"red"};</script>\n'
    '    <script src="https://www.checkatrade.com/static/js/widget.js"></script>'
)

SERVICES = [
    ("extensions.html",             "House Extensions"),
    ("loft-conversions.html",       "Loft Conversions"),
    ("refurbishments.html",         "Property Refurbishments"),
    ("kitchens-bathrooms.html",     "Kitchens and Bathrooms"),
    ("structural-alterations.html", "Structural Alterations"),
    ("commercial.html",             "Commercial Construction"),
]

AREAS = ["Central London", "North London", "South London", "East London",
         "West London", "South East London", "Kent", "Surrey", "Essex",
         "Hertfordshire", "Berkshire", "Sussex"]

ICON = {
    "extensions":  '<path d="M2 20V11l6.5-5.5L15 11v9"/><path d="M15 20v-6h7v6"/><path d="M2 20h20"/>',
    "loft":        '<path d="M2 13 12 4l10 9"/><path d="M5 20v-6h5v6"/><path d="M5 20h14v-5"/>',
    "refurb":      '<rect x="3" y="4" width="12" height="5" rx="1"/><path d="M15 6.5h4a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-7v3"/><rect x="10" y="19" width="4" height="2" rx="1"/><path d="M12 15v4"/>',
    "kitchen":     '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M7 12V6a2 2 0 0 1 4 0"/><path d="M6 19l-1 2"/><path d="M18 19l1 2"/>',
    "structural":  '<path d="M3 4h18"/><path d="M3 20h18"/><path d="M6.5 4v16"/><path d="M17.5 4v16"/><path d="M6.5 12h11"/>',
    "commercial":  '<rect x="3" y="3" width="9" height="18"/><rect x="12" y="8" width="9" height="13"/><path d="M6 7h3M6 11h3M6 15h3M15.5 12h2M15.5 16h2"/>',
    "general":     '<rect x="3" y="5" width="18" height="4.5"/><rect x="3" y="14.5" width="18" height="4.5"/><path d="M9 5v4.5M15 5v4.5M6.5 14.5V19M12 14.5V19M17.5 14.5V19"/>',
}


def icon(name):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + ICON[name] + '</svg>')


def placeholder(label):
    """Render an unfilled site detail so it is impossible to publish by accident."""
    return '<span class="placeholder">%s</span>' % label


def phone_link(classes, label, block=False):
    """'Call ES Build' style link — falls back to the contact page until a number is set."""
    if SITE["phone_href"]:
        return '<a class="%s" href="tel:%s">%s</a>' % (classes, SITE["phone_href"], label)
    return '<a class="%s" href="contact.html">%s</a>' % (classes, label)


ARROW = ('<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" '
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M2 8h11"/><path d="M9 4l4 4-4 4"/></svg>')


# ---------------------------------------------------------------------------
# Shared chrome
# ---------------------------------------------------------------------------

def head(page, title, description):
    canonical = ""
    if SITE["domain"]:
        canonical = '\n    <link rel="canonical" href="%s/%s">' % (
            SITE["domain"].rstrip("/"), "" if page == "index.html" else page)
    return f'''<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title}</title>
    <meta name="description" content="{description}">{canonical}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ES Build">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="assets/img/logo-stacked.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#033072">
    <link rel="icon" href="assets/img/favicon-32.png" sizes="32x32">
    <link rel="icon" href="assets/img/favicon.png" sizes="180x180">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
'''


def header(page):
    def link(href, label):
        cur = ' aria-current="page"' if href == page else ''
        return '<li><a href="%s"%s>%s</a></li>' % (href, cur, label)

    services_open = ' data-open="false"'
    sub = "\n".join(
        '                        <li><a href="%s"%s>%s</a></li>'
        % (h, ' aria-current="page"' if h == page else '', l) for h, l in SERVICES)

    phone = ('<a class="nav-phone" href="tel:%s">%s</a>' % (SITE["phone_href"], SITE["phone_display"])
             if SITE["phone_href"] and SITE["phone_display"] else '')

    return f'''<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="ES Build - home">
            <img src="assets/img/logo-horizontal.png" alt="ES Build" width="1090" height="240">
        </a>

        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation menu">
            <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>

        <nav class="nav" id="primary-nav" aria-label="Primary">
            <ul class="nav-links">
                <li class="has-menu"{services_open}>
                    <button type="button" aria-expanded="false">
                        Services
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>
                    </button>
                    <ul class="submenu">
{sub}
                    </ul>
                </li>
                {link("projects.html", "Projects")}
                {link("about.html", "About")}
                {link("areas.html", "Areas We Cover")}
                {link("faqs.html", "FAQs")}
                {link("contact.html", "Contact")}
            </ul>
            <div class="nav-cta">
                {phone}
                <a class="btn btn--primary btn--sm" href="contact.html">Request a Quotation</a>
            </div>
        </nav>
    </div>
</header>

<main id="main">
'''


def trust_band():
    return '''<section class="trust-band" aria-labelledby="reviews-heading">
    <div class="container trust-inner">
        <p class="eyebrow" id="reviews-heading">Verified reviews</p>
        <h2 class="sr-only">ES Build reviews on Checkatrade</h2>
        <!-- Checkatrade widget. The script renders into this container. -->
        <div class="checkatrade-widget" id="checkatrade-widget"></div>
    </div>
</section>
'''


def cta_band(heading, body, primary=("contact.html", "Request a Quotation")):
    return f'''<section class="cta-band">
    <div class="chevron-field" aria-hidden="true"></div>
    <div class="container">
        <div class="cta-inner">
            <div>
                <h2>{heading}</h2>
                <p>{body}</p>
            </div>
            <div class="btn-row">
                <a class="btn btn--light" href="{primary[0]}">{primary[1]}</a>
                {phone_link("btn btn--outline-light", "Call ES Build")}
            </div>
        </div>
    </div>
</section>
'''


def footer(page):
    services = "\n".join('                    <li><a href="%s">%s</a></li>' % (h, l) for h, l in SERVICES)

    company_rows = [
        (SITE["company_name"], "Registered company name"),
        ("Company number %s" % SITE["company_no"] if SITE["company_no"] else "", "Company registration number"),
        (SITE["reg_address"], "Registered office address"),
        ("VAT %s" % SITE["vat_no"] if SITE["vat_no"] else "", "VAT registration number, if applicable"),
    ]
    company = "\n".join(
        '                    <span>%s</span>' % (val if val else placeholder(lbl))
        for val, lbl in company_rows)

    contact_rows = []
    if SITE["phone_href"] and SITE["phone_display"]:
        contact_rows.append('<li><a href="tel:%s">%s</a></li>' % (SITE["phone_href"], SITE["phone_display"]))
    else:
        contact_rows.append('<li>%s</li>' % placeholder("Telephone number"))
    if SITE["email"]:
        contact_rows.append('<li><a href="mailto:%s">%s</a></li>' % (SITE["email"], SITE["email"]))
    else:
        contact_rows.append('<li>%s</li>' % placeholder("Email address"))
    contact_rows.append('<li>London and South East England</li>')
    contact_rows.append('<li>%s</li>' % (SITE["hours"] if SITE["hours"] else placeholder("Business hours")))
    contact = "\n".join('                    %s' % r for r in contact_rows)

    return f'''</main>

<footer class="site-footer">
    <div class="container">
        <div class="footer-top">
            <div class="footer-brand">
                <img src="assets/img/logo-stacked.png" alt="ES Build" width="900" height="549">
                <p>Construction, extensions, conversions and property refurbishment across London and the South East.</p>
            </div>

            <div>
                <h4>Services</h4>
                <ul class="footer-links">
{services}
                </ul>
            </div>

            <div>
                <h4>Company</h4>
                <ul class="footer-links">
                    <li><a href="about.html">About ES Build</a></li>
                    <li><a href="projects.html">Our Projects</a></li>
                    <li><a href="areas.html">Areas We Cover</a></li>
                    <li><a href="faqs.html">FAQs</a></li>
                    <li><a href="contact.html">Contact Us</a></li>
                    <li><a href="privacy.html">Privacy Policy</a></li>
                </ul>
            </div>

            <div>
                <h4>Contact</h4>
                <ul class="footer-links">
{contact}
                </ul>
            </div>
        </div>

        <div class="footer-company">
{company}
        </div>

        <div class="footer-bottom">
            <p>&copy; <span id="year">2026</span> ES Build. All rights reserved.</p>
            <ul>
                <li><a href="privacy.html">Privacy Policy</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </div>
    </div>
</footer>

<script src="assets/js/site.js"></script>
<script>document.getElementById("year").textContent = new Date().getFullYear();</script>
{CHECKATRADE}
</body>
</html>
'''


def page_hero(title, lead, eyebrow, crumbs, page):
    trail = ['<a href="index.html">Home</a>']
    for label, href in crumbs:
        trail.append('<span aria-hidden="true">/</span>')
        trail.append('<a href="%s">%s</a>' % (href, label) if href else '<span>%s</span>' % label)
    return f'''<section class="page-hero">
    <div class="chevron-field" aria-hidden="true"></div>
    <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">{"".join(trail)}</nav>
        <div class="page-hero-inner">
            <p class="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p class="lead">{lead}</p>
        </div>
    </div>
</section>
'''


def checklist(items):
    lis = "\n".join('            <li>%s</li>' % i for i in items)
    return '        <ul class="checklist">\n%s\n        </ul>' % lis


PAGES = {}


def write_all():
    for name, html in PAGES.items():
        with open(os.path.join(HERE, name), "w", encoding="utf-8") as fh:
            fh.write(html)
        print("wrote %s (%d bytes)" % (name, len(html)))

    missing = [k for k, v in SITE.items() if v == ""]
    if missing:
        print("\nPlaceholders still to fill in build.py SITE{}: " + ", ".join(missing))


# ---------------------------------------------------------------------------
# HOMEPAGE
# ---------------------------------------------------------------------------
SERVICE_CARDS = [
    ("extensions", "House Extensions", "extensions.html", "Explore House Extensions",
     "Create the additional space your property needs with a professionally managed rear, "
     "side-return, wraparound or double-storey extension. We coordinate the construction process "
     "carefully, from site preparation and structural work through to finishes and final completion."),
    ("loft", "Loft Conversions", "loft-conversions.html", "Explore Loft Conversions",
     "Unlock valuable space within your roof and create a new bedroom, office, bathroom or living area. "
     "Our loft conversion services can include dormer construction, roof alterations, structural "
     "installation, insulation, staircases and internal finishes."),
    ("refurb", "Property Refurbishments", "refurbishments.html", "Explore Refurbishments",
     "Transform outdated or underperforming properties through a carefully planned refurbishment. "
     "We undertake complete and partial refurbishments, including structural alterations, new layouts, "
     "finishes, flooring, decoration and building-services coordination."),
    ("kitchen", "Kitchen and Bathroom Renovations", "kitchens-bathrooms.html", "Explore Kitchens and Bathrooms",
     "We deliver practical, well-finished kitchens and bathrooms tailored to the property and the way "
     "the space will be used. Our team coordinates the associated building work, plumbing, electrics, "
     "tiling, joinery, installation and decoration."),
    ("structural", "Structural Alterations", "structural-alterations.html", "Discuss Structural Work",
     "ES Build carries out structural alterations in accordance with the relevant drawings, calculations "
     "and Building Control requirements. Typical works include wall removals, steel installations, new "
     "openings, lintel replacements and alterations associated with extensions and internal remodelling."),
    ("commercial", "Commercial Construction and Fit-Outs", "commercial.html", "Discuss Your Commercial Project",
     "We help businesses, landlords and commercial property owners adapt, refurbish and improve their "
     "premises. Our work can include office refurbishments, retail fit-outs, internal alterations, "
     "landlord works and property maintenance."),
    ("general", "General Building Works", "contact.html", "Request a Quotation",
     "From masonry repairs and roofing work to carpentry, plastering and decorating, ES Build provides "
     "coordinated building services for projects of varying sizes."),
]

REASONS = [
    ("Clear Quotations",
     "We provide a defined scope of work so you can understand what is included, what is excluded and how the project will be delivered."),
    ("Coordinated Delivery",
     "Your project is managed through each construction stage, helping to maintain momentum and reduce avoidable delays."),
    ("Quality Workmanship",
     "We focus on the details that influence the appearance, performance and longevity of the completed work."),
    ("Respect for Your Property",
     "Our team works responsibly, maintains an organised site and takes practical steps to minimise disruption."),
    ("Consistent Communication",
     "We keep clients informed about progress, upcoming activities and any decisions required during the project."),
    ("End-to-End Capability",
     "We can coordinate multiple trades and construction activities, giving you a clearer point of responsibility throughout the work."),
]

PROCESS = [
    ("Initial Consultation", "We discuss the property, proposed work, priorities, budget and intended programme."),
    ("Site Visit", "Where required, we visit the property to inspect the site, review access and develop a clearer understanding of the project."),
    ("Scope and Quotation", "We prepare a quotation setting out the proposed construction work and relevant commercial terms."),
    ("Pre-Construction Planning", "Before work begins, we review the available drawings, specifications, approvals, programme requirements and procurement arrangements."),
    ("Construction", "Our team carries out and coordinates the work, with regular communication throughout the project."),
    ("Completion and Handover", "We review the completed work, address agreed finishing items and formally hand the project back to the client."),
]

PROJECT_CATEGORIES = [
    ("Extensions", "Rear, side-return, wraparound and multi-storey additions."),
    ("Loft conversions", "Dormers, hip-to-gable alterations and rooflight conversions."),
    ("Full refurbishments", "Whole-property renewal, strip-out and reconfiguration."),
    ("Kitchens and bathrooms", "Coordinated building work, services and installation."),
    ("Structural alterations", "Wall removals, steelwork and new openings."),
    ("Commercial projects", "Office refurbishments, retail fit-outs and landlord works."),
]


def service_card(key, title, href, cta, body, wide=False):
    if wide:
        return f'''            <article class="card card--wide">
                <div class="card-mark">{icon(key)}</div>
                <div class="card-wide-body">
                    <h3>{title}</h3>
                    <p>{body}</p>
                </div>
                <a class="link-arrow" href="{href}">{cta}</a>
            </article>'''
    return f'''            <article class="card">
                <div class="card-mark">{icon(key)}</div>
                <h3>{title}</h3>
                <p>{body}</p>
                <a class="link-arrow" href="{href}">{cta}</a>
            </article>'''


def project_placeholder_card(title, blurb):
    return f'''            <article class="project-card">
                <div class="project-media">
                    <div class="chevron-field" aria-hidden="true"></div>
                    <img class="placeholder-mark" src="assets/img/logo-mark.png" alt="" width="669" height="512" loading="lazy">
                </div>
                <div class="project-body">
                    <p class="project-meta">{title}</p>
                    <h3>Project title</h3>
                    <p>{blurb}</p>
                    <p class="placeholder">Replace with project photography and details</p>
                </div>
            </article>'''


HOME_TITLE = "ES Build | Construction Company in London and the South East"
HOME_DESC = ("ES Build delivers house extensions, loft conversions, refurbishments, structural "
             "alterations and commercial construction across London and the South East.")

_home_services = "\n".join(
    service_card(*c, wide=(i == len(SERVICE_CARDS) - 1)) for i, c in enumerate(SERVICE_CARDS))
_home_reasons = "\n".join(
    f'''            <div>
                <span class="reason-num">{i + 1:02d}</span>
                <h3>{t}</h3>
                <p>{b}</p>
            </div>''' for i, (t, b) in enumerate(REASONS))
_home_steps = "\n".join(
    f'''            <li>
                <div>
                    <h3>{t}</h3>
                    <p>{b}</p>
                </div>
            </li>''' for t, b in PROCESS)
_home_areas = "\n".join('            <div>%s</div>' % a for a in AREAS)
_home_projects = "\n".join(project_placeholder_card(t, b) for t, b in PROJECT_CATEGORIES[:6])
_home_pills = "\n".join('                <li>%s</li>' % t for t, _ in PROJECT_CATEGORIES)

_home_jsonld = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "ES Build",
  "description": "ES Build is a construction company delivering extensions, conversions, refurbishments and property improvement projects across London and the South East.",
  "areaServed": [%s],
  "knowsAbout": ["House extensions", "Loft conversions", "Property refurbishments", "Structural alterations", "Kitchen and bathroom renovations", "Commercial fit-outs", "General building works"]
}
</script>''' % ", ".join('"%s"' % a for a in AREAS)

PAGES["index.html"] = (
    head("index.html", HOME_TITLE, HOME_DESC)
    + header("index.html")
    + f'''
<section class="hero">
    <div class="chevron-field" aria-hidden="true"></div>
    <img class="hero-mark" src="assets/img/logo-mark.png" alt="" width="669" height="512" aria-hidden="true">
    <div class="container">
        <div class="hero-inner">
            <p class="eyebrow">Construction &middot; London &amp; South East</p>
            <h1>Building Better Spaces Across London and the South East</h1>
            <p class="lead">Professional construction, refurbishment and property improvement services delivered with careful planning, dependable workmanship and clear communication.</p>
            <div class="btn-row">
                <a class="btn btn--light" href="contact.html">Request a Quotation {ARROW}</a>
                <a class="btn btn--outline-light" href="projects.html">View Our Projects</a>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="hero-markers">
            <div><span>Coverage</span>Greater London and South East England</div>
            <div><span>Sectors</span>Residential and commercial</div>
            <div><span>Scope</span>Defined written quotations</div>
            <div><span>Delivery</span>Managed end to end</div>
        </div>
    </div>
</section>

<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Introduction</p>
            <h2>Construction Delivered Properly</h2>
        </div>
        <div class="stack-sm">
            <p class="lead">ES Build is a London and South East construction company delivering residential and commercial building projects from initial preparation through to completion.</p>
            <p>Whether you are extending your home, refurbishing a property or improving a commercial space, our team provides a structured and practical service focused on quality, programme control and attention to detail.</p>
            <p>We work closely with homeowners, landlords, developers, designers and property professionals to turn well-considered plans into completed spaces that are built to perform and made to last.</p>
        </div>
    </div>
</section>

<section class="section section--sand" aria-labelledby="services-heading">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Services</p>
            <h2 id="services-heading">Our Construction Services</h2>
        </div>
        <div class="grid grid--3">
{_home_services}
        </div>
    </div>
</section>

<section class="section section--navy" aria-labelledby="why-heading">
    <div class="chevron-field" aria-hidden="true" style="opacity:.5"></div>
    <div class="container" style="position:relative;z-index:2">
        <div class="section-head">
            <p class="eyebrow">Why choose ES Build?</p>
            <h2 id="why-heading">A More Accountable Approach to Construction</h2>
            <p class="lead">Construction projects require more than skilled trades. They need effective planning, coordination and communication.</p>
        </div>
        <div class="reason-grid">
{_home_reasons}
        </div>
    </div>
</section>

<section class="section" aria-labelledby="projects-heading">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Featured projects</p>
            <h2 id="projects-heading">Selected Projects</h2>
            <p>Explore a selection of extensions, refurbishments, conversions and property improvements completed across London and the South East. Each project reflects our commitment to considered planning, dependable construction and high-quality finishes.</p>
            <ul class="pill-list mt-lg">
{_home_pills}
            </ul>
        </div>
        <div class="grid grid--3">
{_home_projects}
        </div>
        <div class="btn-row">
            <a class="btn btn--primary" href="projects.html">View All Projects {ARROW}</a>
        </div>
    </div>
</section>

<section class="section section--sand" aria-labelledby="process-heading">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Our process</p>
            <h2 id="process-heading">From First Conversation to Final Completion</h2>
        </div>
        <ol class="steps">
{_home_steps}
        </ol>
    </div>
</section>

<section class="section" aria-labelledby="coverage-heading">
    <div class="container split">
        <div>
            <p class="eyebrow">Coverage</p>
            <h2 id="coverage-heading">Serving London and the South East</h2>
            <p>ES Build undertakes projects throughout Greater London and across South East England. Our principal service areas include:</p>
            <p><a class="link-arrow" href="areas.html">See all areas we cover</a></p>
        </div>
        <div>
            <div class="area-grid">
{_home_areas}
            </div>
            <p class="form-note">If your location is not listed, <a href="contact.html">contact us</a> to discuss whether we can support your project.</p>
        </div>
    </div>
</section>

'''
    + cta_band("Planning a Construction Project?",
               "Tell us what you are looking to build, extend or improve. We will review your "
               "requirements and explain the appropriate next steps.")
    + trust_band()
    + footer("index.html").replace("</body>", _home_jsonld + "\n</body>")
)


# ---------------------------------------------------------------------------
# SERVICE PAGES
# ---------------------------------------------------------------------------

def service_page(page, title, seo_title, description, eyebrow, lead, intro, scope_heading,
                 scope, closing, cta_heading, cta_body, cta_label, related_note=None):
    intro_html = "\n".join('            <p>%s</p>' % p for p in intro)
    closing_html = "\n".join('            <p>%s</p>' % p for p in closing) if closing else ""
    related = "\n".join(
        '                <li><a href="%s">%s</a></li>' % (h, l)
        for h, l in SERVICES if h != page)

    return (
        head(page, seo_title, description)
        + header(page)
        + page_hero(title, lead, eyebrow, [("Services", None), (title, None)], page)
        + f'''
<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Overview</p>
            <h2>{scope_heading}</h2>
            <p class="form-note">Related services</p>
            <ul class="footer-links" style="margin-top:.75rem">
{related}
            </ul>
        </div>
        <div class="stack-sm">
{intro_html}
        </div>
    </div>
</section>

<section class="section section--sand" aria-labelledby="scope-heading">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Scope of work</p>
            <h2 id="scope-heading">What the work can include</h2>
        </div>
{checklist(scope)}
        <div class="mt-lg measure-wide">
{closing_html}
        </div>
    </div>
</section>

'''
        + cta_band(cta_heading, cta_body, ("contact.html", cta_label))
        + trust_band()
        + footer(page)
    )


PAGES["extensions.html"] = service_page(
    page="extensions.html",
    title="House Extensions Across London and the South East",
    seo_title="House Extensions in London and the South East | ES Build",
    description="ES Build constructs rear, side-return, wraparound and multi-storey house extensions "
                "across London and the South East, coordinating structural work, trades and finishes.",
    eyebrow="House Extensions",
    lead="A well-designed extension can improve how your property functions while adding valuable internal space.",
    intro=[
        "ES Build constructs rear extensions, side-return extensions, wraparound extensions and "
        "multi-storey additions. We coordinate the structural work, building envelope, internal trades "
        "and finishing activities required to bring the project together.",
        "Where architects, structural engineers or other consultants are appointed, we work with their "
        "drawings and specifications to deliver the approved design.",
    ],
    scope_heading="Extensions built around how you use your home",
    scope=[
        "Site preparation and enabling works", "Groundworks and foundations",
        "Drainage alterations", "Masonry and structural construction",
        "Structural steel installation", "Roofing and weatherproofing",
        "Windows, doors and glazing", "Plumbing and electrical coordination",
        "Insulation, plastering and flooring", "Kitchen and bathroom installation",
        "Decorating and final finishes",
    ],
    closing=["Where architects, structural engineers or other consultants are appointed, we work with "
             "their drawings and specifications to deliver the approved design."],
    cta_heading="Discuss Your Extension",
    cta_body="Send us the property details and what you are looking to build. We will review your "
             "requirements and explain the appropriate next steps.",
    cta_label="Discuss Your Extension",
)

PAGES["loft-conversions.html"] = service_page(
    page="loft-conversions.html",
    title="Make Better Use of Your Roof Space",
    seo_title="Loft Conversions in London and the South East | ES Build",
    description="ES Build delivers dormer, hip-to-gable and rooflight loft conversions across London "
                "and the South East, built to the approved design and Building Control requirements.",
    eyebrow="Loft Conversions",
    lead="A loft conversion can provide valuable additional accommodation without increasing the footprint of your property.",
    intro=[
        "ES Build delivers loft conversions designed around the structure, character and practical "
        "requirements of each building.",
        "Depending on the property and approved design, the work may include dormer construction, "
        "structural floors and steelwork, staircase installation, insulation, rooflights, en-suite "
        "bathrooms and full internal finishes.",
    ],
    scope_heading="Loft conversions designed around your building",
    scope=[
        "Dormer construction", "Hip-to-gable alterations", "Rooflight conversions",
        "Structural floors and steelwork", "Staircase installation",
        "Roof insulation and ventilation", "Windows and rooflights", "En-suite bathrooms",
        "Electrical and plumbing work", "Plastering, joinery and decoration",
    ],
    closing=["We construct the work in accordance with the relevant design information and Building "
             "Control requirements."],
    cta_heading="Request a Loft Conversion Quotation",
    cta_body="Tell us about your property and the space you would like to create. We will review the "
             "details and explain the appropriate next steps.",
    cta_label="Request a Loft Conversion Quotation",
)

PAGES["refurbishments.html"] = service_page(
    page="refurbishments.html",
    title="Refurbishments That Improve the Entire Property",
    seo_title="Property Refurbishments in London and the South East | ES Build",
    description="ES Build undertakes complete and partial property refurbishments for homeowners, "
                "landlords, investors and developers across London and the South East.",
    eyebrow="Property Refurbishments",
    lead="ES Build undertakes complete and partial refurbishments for homeowners, landlords, investors and developers.",
    intro=[
        "We can modernise finishes, alter layouts, upgrade essential services and coordinate the "
        "multiple trades required to deliver a cohesive result.",
        "Whether the property requires targeted improvement or comprehensive renewal, we establish a "
        "clear delivery strategy before construction begins.",
    ],
    scope_heading="Complete and partial refurbishment",
    scope=[
        "Property strip-out", "Internal reconfiguration", "Structural wall removals",
        "Electrical and plumbing upgrades", "Heating installations", "Plastering and decorating",
        "Flooring and joinery", "Kitchen installations", "Bathroom installations",
        "Roofing and external repairs", "Windows and doors", "Bespoke finishing work",
    ],
    closing=["Whether the property requires targeted improvement or comprehensive renewal, we establish "
             "a clear delivery strategy before construction begins."],
    cta_heading="Plan Your Refurbishment",
    cta_body="Send us the property details and the outcome you are working towards. We will review your "
             "requirements and explain the appropriate next steps.",
    cta_label="Plan Your Refurbishment",
)

PAGES["kitchens-bathrooms.html"] = service_page(
    page="kitchens-bathrooms.html",
    title="Kitchen and Bathroom Renovations",
    seo_title="Kitchen and Bathroom Renovations in London and the South East | ES Build",
    description="ES Build delivers practical, well-finished kitchens and bathrooms across London and "
                "the South East, coordinating the building work, services, installation and decoration.",
    eyebrow="Kitchens and Bathrooms",
    lead="We deliver practical, well-finished kitchens and bathrooms tailored to the property and the way the space will be used.",
    intro=[
        "Our team coordinates the associated building work, plumbing, electrics, tiling, joinery, "
        "installation and decoration.",
        "Kitchens and bathrooms bring several trades together in a small area, so sequencing matters. "
        "We plan the order of works before starting on site so each stage is ready for the next.",
    ],
    scope_heading="Coordinated across every trade involved",
    scope=[
        "Associated building work", "Plumbing", "Electrics", "Tiling",
        "Joinery", "Installation", "Decoration",
    ],
    closing=["Where the work forms part of a wider extension or refurbishment, we coordinate it within "
             "the overall construction programme."],
    cta_heading="Explore Kitchens and Bathrooms",
    cta_body="Tell us about the room, the property and how the space will be used. We will review your "
             "requirements and explain the appropriate next steps.",
    cta_label="Request a Quotation",
)

PAGES["structural-alterations.html"] = service_page(
    page="structural-alterations.html",
    title="Structural Alterations",
    seo_title="Structural Alterations in London and the South East | ES Build",
    description="ES Build carries out structural alterations including wall removals, steel "
                "installations and new openings, in accordance with the relevant drawings, calculations "
                "and Building Control requirements.",
    eyebrow="Structural Alterations",
    lead="ES Build carries out structural alterations in accordance with the relevant drawings, calculations and Building Control requirements.",
    intro=[
        "Typical works include wall removals, steel installations, new openings, lintel replacements "
        "and alterations associated with extensions and internal remodelling.",
        "Structural work should always be based on approved design information. Where a structural "
        "engineer is appointed, we build to their drawings and calculations.",
    ],
    scope_heading="Built to the approved design information",
    scope=[
        "Wall removals", "Steel installations", "New openings", "Lintel replacements",
        "Alterations associated with extensions", "Alterations associated with internal remodelling",
    ],
    closing=["Planning permission, Building Regulations approval and any party wall requirements should "
             "be established before the relevant work begins."],
    cta_heading="Discuss Structural Work",
    cta_body="Send us the drawings or a description of the alteration you are planning. We will review "
             "the details and explain the appropriate next steps.",
    cta_label="Discuss Structural Work",
)

PAGES["commercial.html"] = service_page(
    page="commercial.html",
    title="Commercial Construction and Refurbishment",
    seo_title="Commercial Construction and Fit-Outs in London and the South East | ES Build",
    description="ES Build supports landlords, business owners and property professionals with "
                "commercial construction, refurbishment and fit-out projects across London and the South East.",
    eyebrow="Commercial",
    lead="ES Build supports landlords, business owners and property professionals with commercial construction, refurbishment and fit-out projects.",
    intro=[
        "We understand the importance of programme management, cost visibility and minimising "
        "disruption to neighbouring occupiers and business operations.",
        "Contact our team to discuss your premises, intended use and delivery requirements.",
    ],
    scope_heading="Adapting commercial premises",
    scope=[
        "Office refurbishments", "Retail fit-outs", "Landlord works", "Internal alterations",
        "Property upgrades", "Repair and maintenance work", "Decoration and finishes",
        "Building-services coordination",
    ],
    closing=["Contact our team to discuss your premises, intended use and delivery requirements."],
    cta_heading="Discuss a Commercial Project",
    cta_body="Tell us about the premises, the intended use and your delivery requirements. We will "
             "review your enquiry and explain the appropriate next steps.",
    cta_label="Discuss a Commercial Project",
)


# ---------------------------------------------------------------------------
# ABOUT
# ---------------------------------------------------------------------------
PAGES["about.html"] = (
    head("about.html",
         "About ES Build | Construction Company in London and the South East",
         "ES Build provides construction and property improvement services across London and the "
         "South East, based on defined scopes, realistic planning and straightforward communication.")
    + header("about.html")
    + page_hero(
        "Built on Quality, Reliability and Accountability",
        "ES Build provides construction and property improvement services across London and the South East.",
        "About ES Build", [("About", None)], "about.html")
    + f'''
<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Who we are</p>
            <h2>A contractor you can hold to a scope</h2>
        </div>
        <div class="stack-sm">
            <p class="lead">We understand that appointing a contractor is a significant decision. Our approach is therefore based on defined scopes, realistic planning, responsible site management and straightforward communication.</p>
            <p>From residential extensions and refurbishments to structural alterations and commercial fit-outs, we coordinate each project with a focus on quality, efficiency and long-term value.</p>
            <p>We aim to build productive relationships with our clients, consultants and suppliers. This collaborative approach helps resolve decisions efficiently and keeps everyone aligned throughout the construction process.</p>
        </div>
    </div>
</section>

<section class="section section--navy" aria-labelledby="commitment-heading">
    <div class="chevron-field" aria-hidden="true" style="opacity:.5"></div>
    <div class="container" style="position:relative;z-index:2">
        <div class="split">
            <div>
                <p class="eyebrow">Our commitment</p>
                <h2 id="commitment-heading">Our Commitment</h2>
            </div>
            <div class="stack-sm">
                <p class="lead">Our objective is simple: to deliver well-built projects through professional management, skilled workmanship and clear accountability.</p>
                <p>We believe clients should know what is happening, what comes next and who is responsible. That principle informs how we plan, communicate and deliver our work.</p>
            </div>
        </div>
    </div>
</section>

<section class="section" aria-labelledby="about-process">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Our process</p>
            <h2 id="about-process">From First Conversation to Final Completion</h2>
        </div>
        <ol class="steps">
{_home_steps}
        </ol>
    </div>
</section>

<section class="section section--sand" aria-labelledby="about-services">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">What we do</p>
            <h2 id="about-services">Our Construction Services</h2>
        </div>
        <div class="grid grid--3">
{"".join(service_card(*c) + chr(10) for c in SERVICE_CARDS[:6])}
        </div>
    </div>
</section>

'''
    + cta_band("Planning a Construction Project?",
               "Tell us what you are looking to build, extend or improve. We will review your "
               "requirements and explain the appropriate next steps.")
    + trust_band()
    + footer("about.html")
)


# ---------------------------------------------------------------------------
# PROJECTS
# ---------------------------------------------------------------------------
_projects_grid = "\n".join(project_placeholder_card(t, b) for t, b in PROJECT_CATEGORIES)
_projects_pills = "\n".join('                <li>%s</li>' % t for t, _ in PROJECT_CATEGORIES)

PAGES["projects.html"] = (
    head("projects.html",
         "Our Projects | ES Build Construction, London and the South East",
         "Extensions, refurbishments, conversions and structural work completed by ES Build across "
         "London and the South East.")
    + header("projects.html")
    + page_hero(
        "Our Work",
        "Every property presents different constraints, opportunities and construction requirements.",
        "Projects", [("Projects", None)], "projects.html")
    + f'''
<section class="section">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Portfolio</p>
            <h2>Extensions, refurbishments, conversions and structural work</h2>
            <p>Our project portfolio demonstrates how ES Build approaches extensions, refurbishments, conversions and structural work across London and the South East.</p>
            <ul class="pill-list mt-lg">
{_projects_pills}
            </ul>
        </div>
        <div class="grid grid--3">
{_projects_grid}
        </div>
        <p class="form-note mt-lg">Project entries follow a consistent structure. See <a href="project-template.html">the project page template</a> for the fields recorded against each one.</p>
    </div>
</section>

'''
    + cta_band("Planning a Construction Project?",
               "Tell us what you are looking to build, extend or improve. We will review your "
               "requirements and explain the appropriate next steps.")
    + trust_band()
    + footer("projects.html")
)

PROJECT_FIELDS = [
    ("Project location", "The area or borough the project was delivered in."),
    ("Type of property", "For example a Victorian terrace, a 1930s semi-detached house or a ground-floor retail unit."),
    ("Client brief", "What the client asked for and the outcome they were working towards."),
    ("Scope of work", "The construction activities included in the contracted scope."),
    ("Key challenges", "Access, structure, existing condition, occupancy or programme constraints."),
    ("ES Build's solution", "How the challenges were addressed and the work was sequenced."),
    ("Programme duration", "Construction period on site."),
    ("Before-and-after photographs", "A matched pair of images for each key area."),
    ("Client testimonial", "Where available."),
]
_project_fields_html = "\n".join(
    f'''            <div>
                <span class="reason-num">{i + 1:02d}</span>
                <h3>{t}</h3>
                <p>{b}</p>
            </div>''' for i, (t, b) in enumerate(PROJECT_FIELDS))

PAGES["project-template.html"] = (
    head("project-template.html",
         "Project Page Template | ES Build",
         "The layout used for each ES Build project case study.")
    + header("projects.html")
    + page_hero(
        "Project Page Template",
        "This page shows the structure each project case study follows. Duplicate it per project, or "
        "map the fields to a CMS collection.",
        "Projects", [("Projects", "projects.html"), ("Template", None)], "project-template.html")
    + f'''
<section class="section">
    <div class="container">
        <p class="placeholder">This is a layout template, not a completed project. Replace every field below with real project content.</p>
        <div class="split mt-lg">
            <div>
                <p class="eyebrow">Project</p>
                <h2>Project title</h2>
                <ul class="contact-detail">
                    <li><div class="k">Location</div><div class="v">Project location</div></li>
                    <li><div class="k">Property type</div><div class="v">Type of property</div></li>
                    <li><div class="k">Programme duration</div><div class="v">Construction period on site</div></li>
                </ul>
            </div>
            <div class="stack-sm">
                <h3>Client brief</h3>
                <p>What the client asked for and the outcome they were working towards.</p>
                <h3>Scope of work</h3>
                <p>The construction activities included in the contracted scope.</p>
                <h3>Key challenges</h3>
                <p>Access, structure, existing condition, occupancy or programme constraints.</p>
                <h3>ES Build&rsquo;s solution</h3>
                <p>How the challenges were addressed and the work was sequenced.</p>
            </div>
        </div>
    </div>
</section>

<section class="section section--sand" aria-labelledby="ba-heading">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Photography</p>
            <h2 id="ba-heading">Before and after</h2>
        </div>
        <div class="grid grid--2">
            <article class="project-card">
                <div class="project-media"><div class="chevron-field" aria-hidden="true"></div><img class="placeholder-mark" src="assets/img/logo-mark.png" alt="" width="669" height="512" loading="lazy"></div>
                <div class="project-body"><p class="project-meta">Before</p><p class="placeholder">Add photograph</p></div>
            </article>
            <article class="project-card">
                <div class="project-media"><div class="chevron-field" aria-hidden="true"></div><img class="placeholder-mark" src="assets/img/logo-mark.png" alt="" width="669" height="512" loading="lazy"></div>
                <div class="project-body"><p class="project-meta">After</p><p class="placeholder">Add photograph</p></div>
            </article>
        </div>
    </div>
</section>

<section class="section section--navy" aria-labelledby="fields-heading">
    <div class="chevron-field" aria-hidden="true" style="opacity:.5"></div>
    <div class="container" style="position:relative;z-index:2">
        <div class="section-head">
            <p class="eyebrow">Reference</p>
            <h2 id="fields-heading">Fields recorded for every project</h2>
        </div>
        <div class="reason-grid">
{_project_fields_html}
        </div>
    </div>
</section>

'''
    + cta_band("Planning a Construction Project?",
               "Tell us what you are looking to build, extend or improve. We will review your "
               "requirements and explain the appropriate next steps.")
    + trust_band()
    + footer("projects.html")
)


# ---------------------------------------------------------------------------
# AREAS
# ---------------------------------------------------------------------------
_areas_grid = "\n".join('                <div>%s</div>' % a for a in AREAS)

PAGES["areas.html"] = (
    head("areas.html",
         "Areas We Cover | ES Build, London and the South East",
         "ES Build undertakes construction projects throughout Greater London and across South East "
         "England, including Kent, Surrey, Essex, Hertfordshire, Berkshire and Sussex.")
    + header("areas.html")
    + page_hero(
        "Serving London and the South East",
        "ES Build undertakes projects throughout Greater London and across South East England.",
        "Coverage", [("Areas We Cover", None)], "areas.html")
    + f'''
<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Service areas</p>
            <h2>Our principal service areas</h2>
            <p>If your location is not listed, contact us to discuss whether we can support your project.</p>
            <div class="btn-row">
                <a class="btn btn--primary" href="contact.html">Check your postcode {ARROW}</a>
            </div>
        </div>
        <div>
            <div class="area-grid">
{_areas_grid}
            </div>
        </div>
    </div>
</section>

<section class="section section--sand" aria-labelledby="areas-services">
    <div class="container">
        <div class="section-head">
            <p class="eyebrow">Available across every area</p>
            <h2 id="areas-services">Our Construction Services</h2>
        </div>
        <div class="grid grid--3">
{"".join(service_card(*c) + chr(10) for c in SERVICE_CARDS[:6])}
        </div>
    </div>
</section>

'''
    + cta_band("Planning a Construction Project?",
               "Send us the property postcode and a description of the work. We will confirm "
               "availability and explain the appropriate next steps.")
    + trust_band()
    + footer("areas.html")
)


# ---------------------------------------------------------------------------
# FAQs
# ---------------------------------------------------------------------------
FAQS = [
    ("Do you provide free quotations?",
     ["We can review initial project information without charge. Depending on the size and complexity "
      "of the work, a site visit may be required before a detailed quotation can be prepared. Any "
      "applicable consultation or survey fee will be confirmed in advance."]),
    ("Which areas do you cover?",
     ["We undertake projects throughout Greater London and across South East England. Contact us with "
      "the property postcode so we can confirm availability."]),
    ("Can you work from architectural and structural drawings?",
     ["Yes. We can review and construct from drawings and specifications prepared by your appointed "
      "architect, structural engineer or designer."]),
    ("Can you arrange design and approvals?",
     ["Where required, we can help coordinate introductions to suitable architects, engineers and other "
      "consultants. Planning permission, Building Regulations approval and any party wall requirements "
      "should be established before the relevant work begins."]),
    ("Do I need planning permission?",
     ["This depends on the property and proposed work. Some projects may qualify as permitted "
      "development, while others require formal planning permission. Appropriate professional advice "
      "should be obtained before construction starts."]),
    ("How long will my project take?",
     ["The programme depends on the scale of the work, site conditions, design complexity, approvals "
      "and availability of materials. We provide an indicative construction programme once the scope "
      "has been properly assessed."]),
    ("Will I receive a written quotation?",
     ["Yes. Our quotation will identify the proposed scope, price basis, payment arrangements and "
      "relevant exclusions or assumptions."]),
    ("__INSURANCE__",
     ["ES Build holds appropriate public liability and contractor insurance for the work it undertakes. "
      "Copies of relevant documentation can be provided upon request."]),
    ("Do you manage subcontractors and specialist trades?",
     ["Yes. Where subcontractors or specialist trades are required, we coordinate their activities as "
      "part of the agreed construction scope."]),
    ("Can we remain in the property during the work?",
     ["This depends on the scale and nature of the project. For substantial structural alterations or "
      "full refurbishments, temporary relocation may be safer and more practical. We can discuss this "
      "during the planning stage."]),
]


def build_faqs():
    """The insurance answer is only published once cover is confirmed (see SITE)."""
    html, jsonld = [], []
    for q, answers in FAQS:
        insurance = q == "__INSURANCE__"
        if insurance:
            q = "Are you insured?"
        body = "\n".join('            <p>%s</p>' % a for a in answers)
        block = f'''        <details>
            <summary>{q}</summary>
            <div class="faq-body">
{body}
            </div>
        </details>'''
        if insurance and not SITE["insurance_confirmed"]:
            html.append(
                "        <!-- HOLD: the brief marks this answer \"use only if confirmed\".\n"
                "             Set SITE[\"insurance_confirmed\"] = True in build.py and re-run\n"
                "             once cover is verified, then this block is published.\n"
                + block.replace("--", "&#45;&#45;") + "\n        -->")
            continue
        html.append(block)
        jsonld.append(
            '    {"@type": "Question", "name": %s, "acceptedAnswer": {"@type": "Answer", "text": %s}}'
            % (_json_str(q), _json_str(" ".join(answers))))
    return "\n".join(html), ",\n".join(jsonld)


def _json_str(s):
    return '"%s"' % s.replace("\\", "\\\\").replace('"', '\\"')


_faq_html, _faq_jsonld = build_faqs()
_faq_schema = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
%s
  ]
}
</script>''' % _faq_jsonld

PAGES["faqs.html"] = (
    head("faqs.html",
         "Frequently Asked Questions | ES Build Construction",
         "Answers to common questions about quotations, coverage, planning permission, programme "
         "duration and how ES Build delivers construction projects.")
    + header("faqs.html")
    + page_hero(
        "Frequently Asked Questions",
        "Common questions about quotations, coverage, approvals and how a project runs from first "
        "conversation to handover.",
        "Support", [("FAQs", None)], "faqs.html")
    + f'''
<section class="section">
    <div class="container" style="max-width:900px">
        <div class="faq">
{_faq_html}
        </div>
        <p class="form-note mt-lg">Cannot find what you need? <a href="contact.html">Send us your question</a> and we will come back to you.</p>
    </div>
</section>

'''
    + cta_band("Still Have a Question?",
               "Tell us about the property and the work you are planning. We will review your enquiry "
               "and explain the appropriate next steps.")
    + trust_band()
    + footer("faqs.html").replace("</body>", _faq_schema + "\n</body>")
)


# ---------------------------------------------------------------------------
# CONTACT
# ---------------------------------------------------------------------------
_contact_rows = []
if SITE["phone_href"] and SITE["phone_display"]:
    _contact_rows.append(('Telephone', '<a href="tel:%s">%s</a>' % (SITE["phone_href"], SITE["phone_display"])))
else:
    _contact_rows.append(('Telephone', placeholder("Insert telephone number")))
if SITE["email"]:
    _contact_rows.append(('Email', '<a href="mailto:%s">%s</a>' % (SITE["email"], SITE["email"])))
else:
    _contact_rows.append(('Email', placeholder("Insert email address")))
_contact_rows.append(('Operating area', 'London and South East England'))
_contact_rows.append(('Business hours', SITE["hours"] if SITE["hours"] else placeholder("Insert opening hours")))
_contact_html = "\n".join(
    '                <li><div class="k">%s</div><div class="v">%s</div></li>' % (k, v)
    for k, v in _contact_rows)

_ENQUIRY_CHECKLIST = [
    "Your name and contact details",
    "The property address or postcode",
    "A brief description of the proposed work",
    "Your anticipated budget",
    "Your preferred start date",
    "Any available drawings, photographs or approvals",
]
_enquiry_html = "\n".join('                <li>%s</li>' % i for i in _ENQUIRY_CHECKLIST)

_project_options = "\n".join(
    '                            <option>%s</option>' % l for _, l in SERVICES
) + "\n                            <option>General building works</option>\n                            <option>Something else</option>"

PAGES["contact.html"] = (
    head("contact.html",
         "Contact ES Build | Request a Construction Quotation",
         "Send ES Build the details of your extension, conversion, refurbishment or commercial "
         "construction project and our team will review your enquiry.")
    + header("contact.html")
    + page_hero(
        "Start Your Project with ES Build",
        "If you are planning an extension, conversion, refurbishment or commercial construction "
        "project, send us the details and our team will review your enquiry.",
        "Contact", [("Contact", None)], "contact.html")
    + f'''
<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Before you send</p>
            <h2>To help us assess the project</h2>
            <p>Please provide as much of the following as you can. The more detail we have, the more useful our first response will be.</p>
            <ul class="checklist" style="grid-template-columns:1fr">
{_enquiry_html}
            </ul>

            <h3 class="mt-lg">Contact details</h3>
            <ul class="contact-detail">
{_contact_html}
            </ul>
        </div>

        <div>
            <div class="form-card">
                <h2 style="font-size:1.5rem">Send an enquiry</h2>
                <!-- Wire this form to a handler before publishing: set data-endpoint to your
                     form service URL (or replace with Framer's built-in Form component). -->
                <form id="enquiry-form" data-endpoint="" method="post" action="">
                    <div class="field-row">
                        <div class="field">
                            <label for="name">Your name</label>
                            <input id="name" name="name" type="text" autocomplete="name" required>
                        </div>
                        <div class="field">
                            <label for="email">Email address</label>
                            <input id="email" name="email" type="email" autocomplete="email" required>
                        </div>
                    </div>
                    <div class="field-row">
                        <div class="field">
                            <label for="phone">Telephone</label>
                            <input id="phone" name="phone" type="tel" autocomplete="tel">
                        </div>
                        <div class="field">
                            <label for="postcode">Property address or postcode</label>
                            <input id="postcode" name="postcode" type="text" autocomplete="postal-code" required>
                        </div>
                    </div>
                    <div class="field">
                        <label for="project-type">Type of project</label>
                        <select id="project-type" name="project-type">
                            <option value="">Please select</option>
{_project_options}
                        </select>
                    </div>
                    <div class="field">
                        <label for="description">Description of the proposed work</label>
                        <textarea id="description" name="description" required></textarea>
                    </div>
                    <div class="field-row">
                        <div class="field">
                            <label for="budget">Anticipated budget <span class="hint">Optional</span></label>
                            <input id="budget" name="budget" type="text">
                        </div>
                        <div class="field">
                            <label for="start-date">Preferred start date <span class="hint">Optional</span></label>
                            <input id="start-date" name="start-date" type="text" placeholder="For example, spring 2026">
                        </div>
                    </div>
                    <div class="field">
                        <label for="documents">Do you have drawings, photographs or approvals?</label>
                        <select id="documents" name="documents">
                            <option value="">Please select</option>
                            <option>Yes &ndash; architectural drawings</option>
                            <option>Yes &ndash; structural drawings or calculations</option>
                            <option>Yes &ndash; planning or Building Regulations approval</option>
                            <option>Yes &ndash; photographs only</option>
                            <option>Not yet</option>
                        </select>
                    </div>
                    <label class="form-consent">
                        <input type="checkbox" name="consent" required>
                        <span>I agree that ES Build may use these details to respond to my enquiry, as set out in the <a href="privacy.html">Privacy Policy</a>.</span>
                    </label>
                    <button class="btn btn--primary" type="submit" style="width:100%">Submit Your Enquiry {ARROW}</button>
                    <p class="form-note" id="form-status" role="status"></p>
                    <p class="form-note">Drawings, photographs and approvals can be sent by email once we have your enquiry.</p>
                </form>
            </div>
        </div>
    </div>
</section>

<script>
(function () {{
    var form = document.getElementById("enquiry-form");
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {{
        if (!form.dataset.endpoint) {{
            e.preventDefault();
            status.textContent = "This form is not connected to a handler yet. Add your form endpoint before publishing.";
            status.style.color = "#B3261E";
        }}
    }});
}})();
</script>

'''
    + trust_band()
    + footer("contact.html")
)


# ---------------------------------------------------------------------------
# PRIVACY POLICY
# ---------------------------------------------------------------------------
PRIVACY_SECTIONS = [
    ("Who we are", "The identity and contact details of the data controller, including the registered company name, registered office address and company number."),
    ("What information we collect", "The personal data collected through the enquiry form, by telephone, by email and through the website, including any analytics or cookie data."),
    ("How we use your information", "The purposes for processing, such as responding to enquiries, preparing quotations, administering contracts and meeting legal obligations."),
    ("Lawful basis for processing", "The UK GDPR lawful basis relied on for each processing purpose."),
    ("Who we share information with", "Any subcontractors, consultants, suppliers or service providers that personal data may be shared with."),
    ("How long we keep information", "Retention periods for enquiries, quotations, contracts and project records."),
    ("Your rights", "The rights available under UK data protection law and how to exercise them."),
    ("Cookies and analytics", "Any cookies set by the website or by embedded third-party content, including the Checkatrade review widget."),
    ("How to contact us or complain", "Contact details for data protection queries and the right to complain to the Information Commissioner's Office."),
]
_privacy_html = "\n".join(
    f'''            <div>
                <h3>{t}</h3>
                <p>{b}</p>
            </div>''' for t, b in PRIVACY_SECTIONS)

PAGES["privacy.html"] = (
    head("privacy.html", "Privacy Policy | ES Build",
         "How ES Build collects, uses and protects personal information submitted through this website.")
    + header("privacy.html")
    + page_hero(
        "Privacy Policy",
        "How ES Build collects, uses and protects personal information submitted through this website.",
        "Legal", [("Privacy Policy", None)], "privacy.html")
    + f'''
<section class="section">
    <div class="container" style="max-width:900px">
        <p class="placeholder">This page is a structure, not a policy. The wording below must be written or reviewed by ES Build (or its adviser) to reflect actual data-handling practices before the site goes live.</p>
        <div class="grid mt-lg">
{_privacy_html}
        </div>
    </div>
</section>

'''
    + trust_band()
    + footer("privacy.html")
)


if __name__ == "__main__":
    write_all()
