"""API routes for the scheduler service."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter

from ..config import get_settings
from ..models import (
    AssignmentDraft,
    QuietHours,
    RoleConstraint,
    ScheduleProposalRequest,
    ScheduleProposalResponse,
    SolverHints,
)

router = APIRouter(prefix="/schedule", tags=["schedule"])


def _build_assignment_drafts(
    constraints: List[RoleConstraint], quiet_hours: List[QuietHours]
) -> List[AssignmentDraft]:
    """Generate stub assignments for the provided constraints."""

    drafts: List[AssignmentDraft] = []
    for constraint in constraints:
        todo_entries = [
            "TODO: translate this constraint set into OR-Tools decision variables.",
            "TODO: implement CP-SAT optimisation using ortools==9.10.4067.",
        ]
        drafts.append(
            AssignmentDraft(
                role=constraint.role,
                required_headcount=constraint.headcount,
                planned_headcount=0,
                max_hours_per_person=constraint.max_hours,
                quiet_hours=quiet_hours,
                todo=todo_entries,
            )
        )
    return drafts


@router.post("/propose", response_model=ScheduleProposalResponse)
async def propose_schedule(
    request: ScheduleProposalRequest,
) -> ScheduleProposalResponse:
    """Return a placeholder roster responding to the provided constraints."""

    settings = get_settings()
    timezone = request.timezone or settings.default_timezone

    drafts = _build_assignment_drafts(request.constraints, request.quiet_hours)

    solver_metadata = SolverHints(
        status="stub",
        notes=[
            "This response is a stub – optimisation is not yet implemented.",
            "TODO: formulate the roster problem with OR-Tools and compute assignments.",
        ],
    )

    return ScheduleProposalResponse(
        window=request.window,
        timezone=timezone,
        constraints=request.constraints,
        quiet_hours=request.quiet_hours,
        draft_roster=drafts,
        solver=solver_metadata,
    )
