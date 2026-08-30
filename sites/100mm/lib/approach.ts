/** The delivery sequence, used on the home page and in full on /approach. */
export const stages = [
  {
    number: "01",
    title: "Paid site visit",
    duration: "Two hours on site",
    summary:
      "An interior designer, a structural engineer and a contractor attend together. You get three professional views in the same room, arguing in front of you.",
    detail:
      "We take levels and dimensions, open up nothing but look at everything, and establish what the building will and will not allow. You are not sold to. Nobody on the visit is trying to win the job in the room.",
  },
  {
    number: "02",
    title: "Written report",
    duration: "Within five working days",
    summary:
      "A document, not a phone call. Structural feasibility, a realistic cost band, consent and party wall exposure, and a recommended route forward.",
    detail:
      "The report is yours. If it says the project is not worth doing, or that another practice suits it better, that is what it says. Several clients have used ours to decide not to build.",
  },
  {
    number: "03",
    title: "Design and technical package",
    duration: "Typically 8–16 weeks",
    summary:
      "Where the report recommends proceeding, we develop the scheme with our interior design team and DVC Engineering, to a level a contractor can price without guessing.",
    detail:
      "Party wall notices are served as soon as the structural strategy is fixed rather than at the end of design — the single most reliable way to protect the programme.",
  },
  {
    number: "04",
    title: "Procurement",
    duration: "4–6 weeks",
    summary:
      "The package goes out to a short list of trades and suppliers on a like-for-like basis, so the numbers you compare are genuinely comparable.",
    detail:
      "You see the tender returns. Our fee does not move with the build cost, so we have no interest in the expensive option winning.",
  },
  {
    number: "05",
    title: "Build and project management",
    duration: "6–18 months",
    summary:
      "We run the site. One point of contact, a fixed reporting rhythm, and a cost report you can read without a quantity surveying degree.",
    detail:
      "Variations are priced before they are instructed, never after. If something changes, you know what it costs before anyone picks up a tool.",
  },
  {
    number: "06",
    title: "Handover and aftercare",
    duration: "12 months",
    summary:
      "Full O&M documentation, warranties, and a twelve-month defects period with a named person to call.",
    detail:
      "We return at six and twelve months whether or not you have raised anything, because most defects worth finding are ones nobody reports.",
  },
] as const;
