// Lead vetting, scoring, project type detection, and fee estimation

const PROJECT_KEYWORDS = {
  'Loft Conversion': ['loft', 'roof extension', 'dormer', 'mansard', 'attic conversion'],
  'Rear Extension': ['rear extension', 'single storey rear', 'two storey rear', 'rear addition', 'back extension'],
  'Side Extension': ['side extension', 'side return', 'infill extension', 'side addition'],
  'Front Extension': ['front extension', 'front porch', 'porch extension'],
  'New Build': ['new dwelling', 'new build', 'new house', 'erection of', 'construction of a new', 'residential unit'],
  'Basement': ['basement', 'lower ground floor', 'excavation', 'underpinning'],
  'Garage Conversion': ['garage conversion', 'convert garage', 'garage to habitable'],
  'Structural Alteration': ['structural alteration', 'remove wall', 'structural opening', 'beam installation', 'steel beam'],
  'Outbuilding': ['outbuilding', 'garden room', 'summer house', 'ancillary building'],
  'Commercial': ['commercial', 'office', 'retail', 'change of use', 'mixed use'],
};

const FEE_ESTIMATES = {
  'Loft Conversion': 3200,
  'Rear Extension': 2800,
  'Side Extension': 2600,
  'Front Extension': 2200,
  'New Build': 6500,
  'Basement': 5500,
  'Garage Conversion': 1800,
  'Structural Alteration': 2400,
  'Outbuilding': 1600,
  'Commercial': 4500,
  'Other': 2000,
};

export function detectProjectType(description = '', applicationType = '') {
  const text = (description + ' ' + applicationType).toLowerCase();
  for (const [type, keywords] of Object.entries(PROJECT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return type;
  }
  return 'Other';
}

export function estimateFee(projectType) {
  return FEE_ESTIMATES[projectType] || FEE_ESTIMATES['Other'];
}

export function calculateReadinessScore(lead) {
  let score = 0;

  // Decision granted = baseline
  if (lead.decision && lead.decision.toLowerCase().includes('grant')) score += 20;

  // Application type scoring
  const appType = (lead.application_type || '').toLowerCase();
  if (appType.includes('householder')) score += 25;
  else if (appType.includes('full')) score += 20;
  else if (appType.includes('prior approval')) score += 15;
  else if (appType.includes('lawful')) score += 10;

  // Project type scoring (structural relevance)
  const highValue = ['New Build', 'Basement', 'Loft Conversion', 'Rear Extension'];
  const medValue = ['Side Extension', 'Commercial', 'Structural Alteration'];
  const projectType = lead.project_type || detectProjectType(lead.development_description);
  if (highValue.includes(projectType)) score += 30;
  else if (medValue.includes(projectType)) score += 20;
  else score += 10;

  // Recency scoring (days post-decision)
  const daysPost = lead.days_post_decision || getDaysPostDecision(lead.decision_date);
  if (daysPost <= 30) score += 25;
  else if (daysPost <= 60) score += 20;
  else if (daysPost <= 90) score += 15;
  else if (daysPost <= 180) score += 10;
  else if (daysPost <= 365) score += 5;

  return Math.min(score, 100);
}

export function getDaysPostDecision(decisionDate) {
  if (!decisionDate) return 999;
  const decision = new Date(decisionDate);
  const now = new Date();
  return Math.floor((now - decision) / (1000 * 60 * 60 * 24));
}

export function getStatusFromScore(score) {
  if (score >= 70) return 'Hot';
  if (score >= 45) return 'Warm';
  return 'Cold';
}

export function vetLead(rawLead) {
  const projectType = detectProjectType(
    rawLead.development_description,
    rawLead.application_type
  );
  const estimatedFee = estimateFee(projectType);
  const daysPostDecision = getDaysPostDecision(rawLead.decision_date);

  const partialLead = {
    ...rawLead,
    project_type: projectType,
    estimated_fee: estimatedFee,
    days_post_decision: daysPostDecision,
  };

  const readinessScore = calculateReadinessScore(partialLead);
  const status = getStatusFromScore(readinessScore);

  return {
    ...partialLead,
    readiness_score: readinessScore,
    status,
  };
}

export function normaliseLondonLead(hit) {
  const src = hit._source || hit;
  const id = src.lpa_app_no || hit._id || `london_${Date.now()}_${Math.random()}`;
  return vetLead({
    id,
    lpa_name: src.lpa_name,
    lpa_app_no: src.lpa_app_no,
    site_address: src.site_address,
    application_type: src.application_type,
    development_description: src.development_description,
    decision: src.decision,
    decision_date: src.decision_date,
    valid_date: src.valid_date,
    uprn: src.uprn,
    site_easting: src.site_easting,
    site_northing: src.site_northing,
    region: 'London',
    source: 'london_pld',
  });
}

export function normaliseSurreyLead(feature, lpaName) {
  const props = feature.properties || feature;
  const id = props.reference || props.id || `surrey_${lpaName}_${Date.now()}_${Math.random()}`;
  return vetLead({
    id,
    lpa_name: lpaName,
    lpa_app_no: props.reference,
    site_address: props.address || props.site_address,
    application_type: props.application_type || props.type,
    development_description: props.description || props.proposal,
    decision: props.status || props.decision,
    decision_date: props.decision_date || props.decided_at,
    valid_date: props.valid_date || props.received_date,
    region: 'Surrey',
    source: 'surrey_hub',
  });
}

export function normalisePlanningApiLead(item, lpaName, region) {
  const id = item.reference || item.id || `api_${lpaName}_${Date.now()}_${Math.random()}`;
  return vetLead({
    id,
    lpa_name: lpaName,
    lpa_app_no: item.reference,
    site_address: item.address || item.site_address,
    application_type: item.application_type || item.type,
    development_description: item.description || item.proposal,
    decision: item.status || item.decision,
    decision_date: item.decision_date || item.decided_at,
    valid_date: item.valid_date || item.received_date,
    region,
    source: 'planning_api',
  });
}
