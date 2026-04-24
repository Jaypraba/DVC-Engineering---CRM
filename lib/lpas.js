// All LPA configurations for London, Surrey, and national planning portals

export const LONDON_LPAS = [
  'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley',
  'Camden', 'City of London', 'Croydon', 'Ealing', 'Enfield',
  'Greenwich', 'Hackney', 'Hammersmith and Fulham', 'Haringey', 'Harrow',
  'Havering', 'Hillingdon', 'Hounslow', 'Islington', 'Kensington and Chelsea',
  'Kingston upon Thames', 'Lambeth', 'Lewisham', 'Merton', 'Newham',
  'Redbridge', 'Richmond upon Thames', 'Southwark', 'Sutton', 'Tower Hamlets',
  'Waltham Forest', 'Wandsworth', 'Westminster',
];

export const SURREY_LPAS = [
  { name: 'Elmbridge', source: 'surrey_hub', gss: 'E07000207', region: 'Surrey' },
  { name: 'Epsom and Ewell', source: 'surrey_hub', gss: 'E07000208', region: 'Surrey' },
  { name: 'Guildford', source: 'surrey_hub', gss: 'E07000209', region: 'Surrey' },
  { name: 'Mole Valley', source: 'surrey_hub', gss: 'E07000210', region: 'Surrey' },
  { name: 'Reigate and Banstead', source: 'surrey_hub', gss: 'E07000211', region: 'Surrey' },
  { name: 'Runnymede', source: 'surrey_hub', gss: 'E07000212', region: 'Surrey' },
  { name: 'Spelthorne', source: 'surrey_hub', gss: 'E07000213', region: 'Surrey' },
  { name: 'Surrey Heath', source: 'surrey_hub', gss: 'E07000214', region: 'Surrey' },
  { name: 'Tandridge', source: 'surrey_hub', gss: 'E07000215', region: 'Surrey' },
  { name: 'Waverley', source: 'surrey_hub', gss: 'E07000216', region: 'Surrey' },
  { name: 'Woking', source: 'surrey_hub', gss: 'E07000217', region: 'Surrey' },
];

export const NATIONAL_REGIONS = [
  {
    id: 'west_midlands',
    label: 'Birmingham & West Midlands',
    lpas: [
      { name: 'Birmingham', source: 'planning_api', region: 'West Midlands' },
      { name: 'Coventry', source: 'planning_api', region: 'West Midlands' },
      { name: 'Dudley', source: 'planning_api', region: 'West Midlands' },
      { name: 'Sandwell', source: 'planning_api', region: 'West Midlands' },
      { name: 'Solihull', source: 'planning_api', region: 'West Midlands' },
      { name: 'Walsall', source: 'planning_api', region: 'West Midlands' },
      { name: 'Wolverhampton', source: 'planning_api', region: 'West Midlands' },
    ],
  },
  {
    id: 'east_midlands',
    label: 'Milton Keynes / Northampton / Luton',
    lpas: [
      { name: 'Milton Keynes', source: 'planning_api', region: 'East Midlands' },
      { name: 'West Northamptonshire', source: 'planning_api', region: 'East Midlands' },
      { name: 'North Northamptonshire', source: 'planning_api', region: 'East Midlands' },
      { name: 'Luton', source: 'planning_api', region: 'East Midlands' },
      { name: 'Central Bedfordshire', source: 'planning_api', region: 'East Midlands' },
    ],
  },
  {
    id: 'surrey',
    label: 'Surrey',
    lpas: SURREY_LPAS,
  },
  {
    id: 'west_sussex',
    label: 'West Sussex',
    lpas: [
      { name: 'Adur', source: 'planning_api', region: 'West Sussex' },
      { name: 'Arun', source: 'planning_api', region: 'West Sussex' },
      { name: 'Chichester', source: 'planning_api', region: 'West Sussex' },
      { name: 'Crawley', source: 'planning_api', region: 'West Sussex' },
      { name: 'Horsham', source: 'planning_api', region: 'West Sussex' },
      { name: 'Mid Sussex', source: 'planning_api', region: 'West Sussex' },
      { name: 'Worthing', source: 'planning_api', region: 'West Sussex' },
    ],
  },
  {
    id: 'east_sussex',
    label: 'East Sussex & Brighton',
    lpas: [
      { name: 'Brighton and Hove', source: 'planning_api', region: 'East Sussex' },
      { name: 'Eastbourne', source: 'planning_api', region: 'East Sussex' },
      { name: 'Hastings', source: 'planning_api', region: 'East Sussex' },
      { name: 'Lewes', source: 'planning_api', region: 'East Sussex' },
      { name: 'Rother', source: 'planning_api', region: 'East Sussex' },
      { name: 'Wealden', source: 'planning_api', region: 'East Sussex' },
    ],
  },
];

export const APPLICATION_TYPES_LONDON = [
  'Householder',
  'Full',
  'Prior Approval',
  'Lawful Development Certificate',
];

export function getLpaRegion(lpaName) {
  if (LONDON_LPAS.includes(lpaName)) return 'London';
  const surrey = SURREY_LPAS.find((l) => l.name === lpaName);
  if (surrey) return 'Surrey';
  for (const region of NATIONAL_REGIONS) {
    if (region.lpas.some((l) => l.name === lpaName)) {
      return region.lpas.find((l) => l.name === lpaName)?.region || region.label;
    }
  }
  return 'National';
}
