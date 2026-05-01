from ortools.sat.python import cp_model
from models.schemas import ScheduleGenerationRequest
from typing import Dict, Any
from solver.constraints import apply_room_capacity_constraints, apply_surgeon_capacity_constraints, apply_surgeon_availability_constraints

import time

def generate_optimal_schedule(request: ScheduleGenerationRequest) -> Dict[str, Any]:
    """
    Funcția principală care primește datele și construiește modelul CP-SAT.
    """

    model = cp_model.CpModel()
    surgery_vars = {}

    horizon_minutes = 7*24*60
    sterilization_time = request.rooms[0].sterilization_time_minutes if request.rooms else 45

    for surgery in request.surgeries:
        duration = surgery.duration_minutes

        start_var = model.NewIntVar(0, horizon_minutes, f'start_{surgery.id}')
        end_var = model.NewIntVar(0, horizon_minutes, f'end_{surgery.id}')
        model.Add(end_var == start_var + duration)

        surgeon_interval = model.NewIntervalVar(start_var, duration, end_var, f'surgeon_interval_{surgery.id}')

        room_presences = {}
        room_intervals = {}

        for room in request.rooms:
            presence_var = model.NewBoolVar(f'presence_s{surgery.id}_r{room.id}')
            room_presences[room.id] = presence_var

            required_type = getattr(surgery, "required_room_type", "GENERAL")
            if room.room_type != required_type:
                model.Add(presence_var == 0)
                continue

            blocked_duration = duration + room.sterilization_time_minutes

            room_start = model.NewIntVar(0, horizon_minutes, f'r_start_s{surgery.id}_r{room.id}')
            room_end = model.NewIntVar(0, horizon_minutes, f'r_end_s{surgery.id}_r{room.id}')

            model.Add(room_start == start_var).OnlyEnforceIf(presence_var)
            model.Add(room_end == start_var + blocked_duration).OnlyEnforceIf(presence_var)

            room_interval = model.NewOptionalIntervalVar(
                room_start, blocked_duration, room_end, presence_var, f'r_interval_s{surgery.id}_r{room.id}')
            room_intervals[room.id] = room_interval

        model.AddExactlyOne(room_presences.values())

        surgery_vars[surgery.id] = {
            "start": start_var,
            "end": end_var,
            "surgeon_interval": surgeon_interval,
            "room_presences": room_presences,
            "room_intervals": room_intervals,
            "duration": duration,
            "priority": surgery.priority,
            "surgeon_id": surgery.surgeon_id
        }

    # Aplicăm constrângerile HARD
    apply_room_capacity_constraints(model, surgery_vars, request.rooms)
    apply_surgeon_capacity_constraints(model, surgery_vars)
    apply_surgeon_availability_constraints(model, surgery_vars, request.surgeons_availability)

    PRIORITY_WEIGHTS = {
        "EMERGENCY": 1000,
        "URGENT": 100,
        "ELECTIVE": 1
    }

    objective_terms = []
    for data in surgery_vars.values():
        weight = PRIORITY_WEIGHTS.get(data["priority"], 1)
        objective_terms.append(data["end"] * weight)
        
    model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 10.0
    start_time = time.time()
    status = solver.Solve(model)
    generation_time_ms = int((time.time() - start_time) * 1000)

    schedule_result = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for surgery_id, vars_dict in surgery_vars.items():
            chosen_room = next (
                room_id for room_id, presence_var in vars_dict["room_presences"].items()
                if solver.Value(presence_var) == 1
            )

            schedule_result.append({
                "surgery_id": surgery_id,
                "start_time_minutes": solver.Value(vars_dict["start"]),
                "end_time_minutes": solver.Value(vars_dict["end"]),
                "room_id": chosen_room
            })

        return {
            "schedule": schedule_result,
            "score": solver.ObjectiveValue() if status == cp_model.OPTIMAL else 0.0,
            "conflicts": [],
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