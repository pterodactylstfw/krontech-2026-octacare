from ortools.sat.python import cp_model
from models.schemas import ScheduleGenerationRequest
from typing import Dict, Any

import time
from datetime import datetime, timedelta

from solver.constraints import apply_room_capacity_constraints, apply_surgeon_capacity_constraints, apply_surgeon_availability_constraints

def generate_optimal_schedule(request: ScheduleGenerationRequest) -> Dict[str, Any]:
    """
    Funcția principală care primește datele și construiește modelul CP-SAT.
    """

    model = cp_model.CpModel()
    surgery_vars = {}

    days = (request.date_range_end - request.date_range_start).days + 1
    horizon_minutes = max(1, days) * 24 * 60
    sterilization_time = request.rooms[0].sterilization_time_minutes if request.rooms else 45

    for surgery in request.surgeries:
        duration = surgery.duration_minutes
        # Sanitizăm ID-ul pentru a fi un nume de variabilă valid (fără cratime)
        s_safe_id = surgery.id.replace("-", "_")

        start_var = model.NewIntVar(0, horizon_minutes, f'start_{s_safe_id}')
        end_var = model.NewIntVar(0, horizon_minutes, f'end_{s_safe_id}')
        model.Add(end_var == start_var + duration)

        is_scheduled = model.NewBoolVar(f'is_scheduled_{s_safe_id}')
        surgeon_interval = model.NewOptionalIntervalVar(
            start_var, duration, end_var, is_scheduled, f'surgeon_interval_{s_safe_id}')

        room_presences = {}
        room_intervals = {}

        for room in request.rooms:
            r_safe_id = room.id.replace("-", "_")
            presence_var = model.NewBoolVar(f'presence_s{s_safe_id}_r{r_safe_id}')
            room_presences[room.id] = presence_var

            required_type = getattr(surgery, "required_room_type", "GENERAL")
            if required_type != "GENERAL" and room.room_type != required_type:
                model.Add(presence_var == 0)
                continue

            blocked_duration = duration + room.sterilization_time_minutes

            room_start = model.NewIntVar(0, horizon_minutes, f'r_start_s{s_safe_id}_r{r_safe_id}')
            room_end = model.NewIntVar(0, horizon_minutes, f'r_end_s{s_safe_id}_r{r_safe_id}')

            model.Add(room_start == start_var).OnlyEnforceIf(presence_var)
            model.Add(room_end == start_var + blocked_duration).OnlyEnforceIf(presence_var)

            room_interval = model.NewOptionalIntervalVar(
                room_start, blocked_duration, room_end, presence_var, f'r_interval_s{s_safe_id}_r{r_safe_id}')
            room_intervals[room.id] = room_interval

        model.Add(sum(room_presences.values()) == is_scheduled)

        surgery_vars[surgery.id] = {
            "start": start_var,
            "end": end_var,
            "surgeon_interval": surgeon_interval,
            "room_presences": room_presences,
            "room_intervals": room_intervals,
            "duration": duration,
            "priority": surgery.priority,
            "surgeon_id": surgery.surgeon_id,
            "is_scheduled": is_scheduled
        }

    # Aplicăm constrângerile HARD
    apply_room_capacity_constraints(model, surgery_vars, request.rooms)
    apply_surgeon_capacity_constraints(model, surgery_vars)
    apply_surgeon_availability_constraints(model, surgery_vars, request.surgeons_availability, request.date_range_start)

    PRIORITY_WEIGHTS = {
        "EMERGENCY": 1000,
        "URGENT": 100,
        "ELECTIVE": 1
    }

    DROP_PENALTIES = {
        "EMERGENCY": 1000000000,
        "URGENT": 100000000,
        "ELECTIVE": 10000000
    }

    objective_terms = []
    for data in surgery_vars.values():
        weight = PRIORITY_WEIGHTS.get(data["priority"], 1)
        drop_penalty = DROP_PENALTIES.get(data["priority"], 10000)

        objective_terms.append(data["end"] * weight)
        objective_terms.append((1 - data["is_scheduled"]) * drop_penalty)

    surgeon_to_surgeries = {}
    for s_id, data in surgery_vars.items():
        doc = data["surgeon_id"]
        if doc not in surgeon_to_surgeries:
            surgeon_to_surgeries[doc] = []
        surgeon_to_surgeries[doc].append(data)

    for doc, surgeries_data in surgeon_to_surgeries.items():
        if len(surgeries_data) > 1:
            doc_start = model.NewIntVar(0, horizon_minutes, f'doc_start_{doc}')
            doc_end = model.NewIntVar(0, horizon_minutes, f'doc_end_{doc}')

            for data in surgeries_data:
                model.Add(doc_start <= data["start"])
                model.Add(doc_end >= data["end"])

            span = model.NewIntVar(0, horizon_minutes, f'span_{doc}')
            model.Add(span == doc_end - doc_start)
            objective_terms.append(span * 10)

    model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 8.0
    start_time = time.time()
    status = solver.Solve(model)
    generation_time_ms = int((time.time() - start_time) * 1000)

    schedule_result = []
    conflicts = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        base_datetiime = datetime.combine(request.date_range_start, datetime.min.time())

        for surgery_id, vars_dict in surgery_vars.items():
            if solver.Value(vars_dict["is_scheduled"]) == 1:
                chosen_room = next (
                    room_id for room_id, presence_var in vars_dict["room_presences"].items()
                    if solver.Value(presence_var) == 1
                )

                start_min = solver.Value(vars_dict["start"])
                end_min = solver.Value(vars_dict["end"])

                exact_start_time = base_datetiime + timedelta(minutes=start_min)
                exact_end_time = base_datetiime + timedelta(minutes=end_min)

                schedule_result.append({
                    "surgery_id": surgery_id,
                    "start_time": exact_start_time.isoformat(),
                    "end_time": exact_end_time.isoformat(),
                    "room_id": chosen_room
                })
            else:
                request_surgeries = {s.id: s for s in request.surgeries}
                surg_info = request_surgeries[surgery_id]
                conflicts.append(f"Operatia {surgery_id} ({surg_info.priority}) a fost amanata din lipsa de resurse.")

        return {
            "schedule": schedule_result,
            "score": solver.ObjectiveValue() if status == cp_model.OPTIMAL else 0.0,
            "conflicts": conflicts,
            "generation_time_ms": generation_time_ms,
            "status": "SUCCESS"
        }
    
    else:
        return {
            "schedule": [],
            "score": 0,
            "conflicts": ["Nu s-a putut gasi o planificare valida care sa respecte toate constrangerile."],
            "generation_time_ms": generation_time_ms,
            "status": "FAILED"
        }