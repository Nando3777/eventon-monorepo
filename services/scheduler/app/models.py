"""Pydantic models used by the scheduler service."""

from __future__ import annotations

from datetime import datetime, time
from typing import List, Optional

from pydantic import BaseModel, Field, PositiveInt


class ScheduleWindow(BaseModel):
    """Time window for which a schedule is requested."""

    start: datetime = Field(..., description="Start of the scheduling window.")
    end: datetime = Field(..., description="End of the scheduling window.")

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}


class QuietHours(BaseModel):
    """Represents a quiet period during which shifts should be avoided."""

    start: time = Field(..., description="Local start time for the quiet period.")
    end: time = Field(..., description="Local end time for the quiet period.")

    class Config:
        json_encoders = {time: lambda t: t.strftime("%H:%M")}


class RoleConstraint(BaseModel):
    """Staffing requirements per role for a scheduling window."""

    role: str = Field(..., description="Name of the role that requires staffing.")
    headcount: PositiveInt = Field(..., description="Required number of people per shift.")
    max_hours: Optional[float] = Field(
        None,
        alias="maxHours",
        description="Maximum number of hours a single teammate can work in the window.",
    )
    min_rest_hours: Optional[float] = Field(
        None,
        alias="minRestHours",
        description="Minimum number of rest hours between shifts for teammates.",
    )

    class Config:
        allow_population_by_field_name = True


class ScheduleProposalRequest(BaseModel):
    """Payload accepted by the schedule proposal endpoint."""

    window: ScheduleWindow = Field(..., description="Window to generate a roster for.")
    constraints: List[RoleConstraint] = Field(
        default_factory=list,
        description="Collection of staffing constraints that must be satisfied.",
    )
    quiet_hours: List[QuietHours] = Field(
        default_factory=list,
        alias="quietHours",
        description="Time ranges where scheduling should avoid creating shifts.",
    )
    timezone: Optional[str] = Field(
        None,
        alias="timezone",
        description="IANA timezone name for interpreting the window and quiet hours.",
    )
    notes: Optional[str] = Field(
        None,
        description="Free-text notes attached by the requester for planner context.",
    )

    class Config:
        allow_population_by_field_name = True


class AssignmentDraft(BaseModel):
    """Represents a placeholder assignment for a single role."""

    role: str = Field(..., description="Role the assignment belongs to.")
    required_headcount: PositiveInt = Field(
        ..., alias="requiredHeadcount", description="Required headcount for the role."
    )
    planned_headcount: int = Field(
        ..., alias="plannedHeadcount", description="Number of teammates currently allocated."
    )
    max_hours_per_person: Optional[float] = Field(
        None,
        alias="maxHoursPerPerson",
        description="Maximum hours a single teammate may work for this role.",
    )
    quiet_hours: List[QuietHours] = Field(
        default_factory=list,
        alias="quietHours",
        description="Quiet hours relevant for the assignment.",
    )
    todo: List[str] = Field(
        default_factory=list,
        description="TODO markers describing the optimisation steps still required.",
    )

    class Config:
        allow_population_by_field_name = True


class SolverHints(BaseModel):
    """Metadata describing the optimisation plan for the roster."""

    status: str = Field(..., description="Current status of the optimisation pipeline.")
    notes: List[str] = Field(
        default_factory=list,
        description="Human-readable notes about pending optimisation tasks.",
    )


class ScheduleProposalResponse(BaseModel):
    """Structure returned by the schedule proposal endpoint."""

    window: ScheduleWindow = Field(..., description="Scheduling window requested by the client.")
    timezone: str = Field(..., description="Timezone used for interpreting date-times in the plan.")
    constraints: List[RoleConstraint] = Field(
        default_factory=list,
        description="Echo of the constraints supplied by the requester.",
    )
    quiet_hours: List[QuietHours] = Field(
        default_factory=list,
        alias="quietHours",
        description="Quiet-hour ranges considered during planning.",
    )
    draft_roster: List[AssignmentDraft] = Field(
        default_factory=list,
        alias="draftRoster",
        description="Draft shift assignments awaiting optimisation.",
    )
    solver: SolverHints = Field(
        ..., description="Metadata describing TODO items for the upcoming OR-Tools model."
    )

    class Config:
        allow_population_by_field_name = True
