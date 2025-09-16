"""Lightweight OR-Tools example demonstrating the scheduler entrypoint."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

try:
  from ortools.sat.python import cp_model
except ModuleNotFoundError as exc:  # pragma: no cover - optional dependency for local dev
  raise ModuleNotFoundError(
      "OR-Tools is required to run the scheduler service. Install the optional dev tooling or run `pip install -r requirements.txt`."
  ) from exc


@dataclass(frozen=True)
class Task:
  """A scheduled task stub."""

  name: str
  duration: int  # minutes


def build_daily_schedule(tasks: Iterable[Task], *, horizon_minutes: int = 8 * 60) -> dict[str, int]:
  """Assigns each task a start time using a simple CP-SAT model."""

  model = cp_model.CpModel()
  horizon = horizon_minutes
  task_vars = {}

  for task in tasks:
    start_var = model.new_int_var(0, horizon - task.duration, f"start_{task.name}")
    task_vars[task.name] = start_var

  # Simple ordering to avoid overlap.
  previous = None
  for task in tasks:
    if previous is not None:
      model.add(task_vars[previous] + task.duration <= task_vars[task.name])
    previous = task.name

  model.minimize(sum(task_vars.values()))

  solver = cp_model.CpSolver()
  solver.parameters.max_time_in_seconds = 2
  solver_status = solver.solve(model)

  if solver_status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    raise RuntimeError('No feasible schedule found')

  return {name: solver.value(var) for name, var in task_vars.items()}


if __name__ == '__main__':
  demo_schedule = build_daily_schedule(
      [Task('ingest', 60), Task('optimize', 90), Task('report', 45)]
  )
  for task_name, start in demo_schedule.items():
    print(f"{task_name} starts at minute {start}")
