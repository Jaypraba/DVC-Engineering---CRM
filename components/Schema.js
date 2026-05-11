export const FIRM = {
  name: 'DVC Engineering',
  legalName: 'DVC Engineering Ltd',
  url: 'https://dvceng.com',
  telephone: '',
  email: 'info@dvceng.com',
  address: {
    streetAddress: '86-90 Paul Street',
    addressLocality: 'London',
    postalCode: 'EC2A 4NE',
    addressCountry: 'GB',
  },
  geo: { latitude: 51.5246, longitude: -0.0836 },
  openingHours: ['Mo-Fr 09:00-18:00'],
  areaServed: [
    'London', 'Islington', 'Hackney', 'Tower Hamlets', 'Southwark', 'Lambeth',
    'Wandsworth', 'Hammersmith and Fulham', 'Kensington and Chelsea', 'Camden',
    'Barnet', 'Haringey', 'Enfield', 'Waltham Forest', 'Newham', 'Greenwich',
  ],
  serviceArea: 'London and the South East',
};

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    name: FIRM.name,
    legalName: FIRM.legalName,
    url: FIRM.url,
    email: FIRM.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: FIRM.address.streetAddress,
      addressLocality: FIRM.address.addressLocality,
      postalCode: FIRM.address.postalCode,
      addressCountry: FIRM.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: FIRM.geo.latitude,
      longitude: FIRM.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    areaServed: FIRM.areaServed.map(area => ({
      '@type': 'City',
      name: area,
    })),
    description:
      'DVC Engineering provides structural engineering services across London and the South East, including structural surveys, loft conversions, extensions, load-bearing wall removal, beam design, and foundation design.',
    knowsAbout: [
      'Structural Engineering',
      'Structural Surveys',
      'Loft Conversions',
      'Load-bearing Wall Removal',
      'Steel Beam Design',
      'Foundation Design',
      'Temporary Works',
      'Building Control',
    ],
    logo: {
      '@type': 'ImageObject',
      url: 'https://dvceng.com/images/logo.png',
    },
  };
}

export function serviceSchema({ name, description, url, provider = FIRM.name, areaServed = FIRM.serviceArea }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: {
      '@type': 'LocalBusiness',
      name: provider,
      url: FIRM.url,
    },
    areaServed,
    serviceType: name,
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://dvceng.com${item.path}`,
    })),
  };
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

export function articleSchema({ headline, description, datePublished, dateModified, url, authorName = 'DVC Engineering' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    url: `https://dvceng.com${url}`,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: FIRM.url,
    },
    publisher: {
      '@type': 'Organization',
      name: FIRM.name,
      url: FIRM.url,
    },
  };
}
