"""Shared data models for the DVC Engineering lead generation pipeline."""

from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Lead:
    source: str                          # planning_portal | job_board | sold_property | architect_developer
    lead_type: str                       # e.g. extension, loft_conversion, structural_survey
    address: str
    description: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    postcode: Optional[str] = None
    borough: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    score: float = 0.0
    priority_flag: str = "COLD"          # HOT | WARM | COLD
    date_identified: str = field(default_factory=lambda: datetime.utcnow().date().isoformat())
    application_ref: Optional[str] = None
    raw_date: Optional[str] = None       # Original date string from source
    agent_name: Optional[str] = None
    agent_contact: Optional[str] = None
    notes: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class OutreachDraft:
    lead_id: str
    lead_address: str
    subject: str
    body: str
    score: float
    generated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        return asdict(self)
