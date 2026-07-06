// Shared content for the public marketing site (dvceng.com).
// Kept in one place so copy, service list and coverage area stay consistent
// across pages and structured data.

export const BUSINESS = {
  name: 'DVC Engineering Ltd',
  legalName: 'DVC Engineering Ltd',
  tagline: 'Structural Engineering Consultancy',
  description:
    'DVC Engineering is a structural engineering consultancy based in London, providing structural calculations, drawings and building regulations support for residential and commercial projects across London, Surrey, Sussex and the Midlands.',
  url: 'https://www.dvceng.com',
  email: 'enquiries@dvceng.com',
  addressLocality: 'London',
  postalCode: 'EC2A 4NE',
  addressCountry: 'GB',
};

export const SERVICES = [
  {
    slug: 'loft-conversions',
    name: 'Loft Conversions',
    summary: 'Structural design for loft, dormer and mansard conversions, including new floor joists, steel beams and roof alterations.',
  },
  {
    slug: 'rear-extensions',
    name: 'Rear Extensions',
    summary: 'Calculations and drawings for single and two-storey rear extensions, covering beams, foundations and steelwork.',
  },
  {
    slug: 'side-extensions',
    name: 'Side Extensions',
    summary: 'Structural design for side return and infill extensions, including party wall considerations where relevant.',
  },
  {
    slug: 'front-extensions',
    name: 'Front Extensions & Porches',
    summary: 'Structural calculations for front extensions and porch additions.',
  },
  {
    slug: 'new-builds',
    name: 'New Builds',
    summary: 'Full structural design for new residential dwellings, from foundations through to roof structure.',
  },
  {
    slug: 'basements',
    name: 'Basements & Underpinning',
    summary: 'Structural design for basement excavations, lower ground floor conversions and underpinning works.',
  },
  {
    slug: 'garage-conversions',
    name: 'Garage Conversions',
    summary: 'Structural checks and design for converting garages into habitable living space.',
  },
  {
    slug: 'structural-alterations',
    name: 'Structural Alterations',
    summary: 'Load-bearing wall removal, steel beam (RSJ) installation and structural openings for open-plan layouts.',
  },
  {
    slug: 'outbuildings',
    name: 'Outbuildings & Garden Rooms',
    summary: 'Structural design for garden rooms, summer houses and other ancillary buildings.',
  },
  {
    slug: 'commercial',
    name: 'Commercial Projects',
    summary: 'Structural surveys and calculations for change of use, mixed-use and commercial fit-out projects.',
  },
];

export const LONDON_BOROUGHS = [
  'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden',
  'City of London', 'Croydon', 'Ealing', 'Enfield', 'Greenwich', 'Hackney',
  'Hammersmith and Fulham', 'Haringey', 'Harrow', 'Havering', 'Hillingdon',
  'Hounslow', 'Islington', 'Kensington and Chelsea', 'Kingston upon Thames',
  'Lambeth', 'Lewisham', 'Merton', 'Newham', 'Redbridge',
  'Richmond upon Thames', 'Southwark', 'Sutton', 'Tower Hamlets',
  'Waltham Forest', 'Wandsworth', 'Westminster',
];

export const NATIONAL_REGIONS = [
  {
    label: 'Birmingham & West Midlands',
    areas: ['Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall', 'Wolverhampton'],
  },
  {
    label: 'Milton Keynes, Northamptonshire & Luton',
    areas: ['Milton Keynes', 'West Northamptonshire', 'North Northamptonshire', 'Luton', 'Central Bedfordshire'],
  },
  {
    label: 'Surrey',
    areas: ['Elmbridge', 'Epsom and Ewell', 'Guildford', 'Mole Valley', 'Reigate and Banstead', 'Runnymede', 'Spelthorne', 'Surrey Heath', 'Tandridge', 'Waverley', 'Woking'],
  },
  {
    label: 'West Sussex',
    areas: ['Adur', 'Arun', 'Chichester', 'Crawley', 'Horsham', 'Mid Sussex', 'Worthing'],
  },
  {
    label: 'East Sussex & Brighton',
    areas: ['Brighton and Hove', 'Eastbourne', 'Hastings', 'Lewes', 'Rother', 'Wealden'],
  },
];

export const FAQS = [
  {
    q: 'What does a structural engineer do for a loft conversion or extension?',
    a: 'A structural engineer assesses the existing building, designs the new structural elements needed (such as steel beams, new foundations or floor joists), and produces calculations and drawings that a builder can construct from and that Building Control can approve. This is separate from — and in addition to — any planning permission process.',
  },
  {
    q: 'Do I need a structural engineer for a rear or side extension?',
    a: 'Almost always, yes. Building Control will typically require structural calculations for any extension that alters load-bearing walls, adds new openings, or changes the foundations, even for single-storey extensions.',
  },
  {
    q: 'What is the difference between planning permission and Building Regulations approval?',
    a: 'Planning permission relates to whether a project can be built at all (size, appearance, impact on neighbours) and is granted by the local planning authority. Building Regulations approval relates to whether it is built safely and to standard — this is where structural calculations and drawings are required. A project can need one, both, or neither depending on its scope.',
  },
  {
    q: 'Do I need a party wall agreement for my extension or loft conversion?',
    a: 'If your works involve a shared wall with a neighbouring property, excavation near their foundations, or building on the boundary line, the Party Wall etc. Act 1996 will usually apply. This is a separate legal process to planning and Building Regulations, and is worth raising with your engineer or a party wall surveyor early.',
  },
  {
    q: 'How long does it take to get structural calculations?',
    a: 'Turnaround depends on project complexity, but straightforward domestic projects such as loft conversions or single-storey extensions are typically the quickest to turn around once a site visit and drawings are available.',
  },
  {
    q: 'What areas does DVC Engineering cover?',
    a: 'DVC Engineering covers all London boroughs, plus Surrey, West Sussex, East Sussex & Brighton, Birmingham & the West Midlands, and the Milton Keynes / Northamptonshire / Luton corridor. See our Areas We Cover page for the full list.',
  },
  {
    q: 'What information do I need to provide to get a quote?',
    a: 'The site address, a brief description of the works (e.g. rear extension, loft conversion, wall removal), and any architectural drawings or planning application documents you already have. This lets us give an accurate estimate of scope and fee.',
  },
  {
    q: 'Do you work directly with architects and builders?',
    a: 'Yes. DVC Engineering regularly works alongside architects, builders and homeowners, and can liaise directly with your design team to keep drawings and calculations coordinated.',
  },
];
