from ortools.sat.python import cp_model
from models.schemas import ScheduleGenerationRequest
from typing import Dict, Any
from solver.constraints import apply_room_capacity_constraints, apply_surgeon_capacity_constraints

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
        start_var = model.NewIntVar(0, horizon_minutes, f'start_{surgery.id}')
        duration = surgery.duration_minutes
        end_var = model.NewIntVar(0, horizon_minutes, f'end_{surgery.id}')

        model.Add(end_var == start_var + duration)

        surgeon_interval = model.NewIntervalVar(start_var, duration, end_var, f'surgeon_interval_{surgery.id}')

        blocked_duration = duration + sterilization_time

        room_free_var = model.NewIntVar(0, horizon_minutes, f'room_free_{surgery.id}')
        room_interval = model.NewIntervalVar(start_var, blocked_duration, room_free_var, f'room_interval_{surgery.id}')

        surgery_vars[surgery.id] = {
            "start": start_var,
            "end": end_var,
            "room_interval": room_interval,
            "surgeon_interval": surgeon_interval,
            "duration": duration,
            "priority": surgery.priority,
            "surgeon_id": surgery.surgeon_id
        }

    # Aplicăm constrângerile HARD
    apply_room_capacity_constraints(model, surgery_vars)
    apply_surgeon_capacity_constraints(model, surgery_vars)

    model.Minimize(sum(data["end"] for data in surgery_vars.values()))

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 10.0
    start_time = time.time()
    status = solver.Solve(model)
    generation_time_ms = int((time.time() - start_time) * 1000)

    schedule_result = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for surgery_id, vars_dict in surgery_vars.items():
            schedule_result.append({
                "surgery_id": surgery_id,
                "start_time_minutes": solver.Value(vars_dict["start"]),
                "end_time_minutes": solver.Value(vars_dict["end"]),
                "room_id": 1
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