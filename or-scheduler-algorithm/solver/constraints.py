from ortools.sat.python import cp_model

def apply_room_capacity_constraints(model: cp_model.CpModel, surgery_vars: dict, rooms: list):
    """
    Constrângere HARD: O sală -> o singură operație la un moment dat.
    Preia toate intervalele de timp ale operațiilor și forțează modelul
    să nu le suprapună.
    """

    for room in rooms:
        intervals_in_this_room = []

        for data in surgery_vars.values():
            if room.id in data["room_intervals"]:
                intervals_in_this_room.append(data["room_intervals"][room.id])

        if intervals_in_this_room:
            model.AddNoOverlap(intervals_in_this_room)

def apply_surgeon_capacity_constraints(model: cp_model.CpModel, surgery_vars: dict):
    """
    Constrângere HARD: Un chirurg nu poate fi în 2 locații simultan.
    Grupăm intervalele de timp după surgeon_id și aplicăm NoOverlap pe fiecare grup.
    """

    surgeon_intervals = {}

    for data in surgery_vars.values():
        s_id = data["surgeon_id"]
        if s_id not in surgeon_intervals:
            surgeon_intervals[s_id] = []
        surgeon_intervals[s_id].append(data["surgeon_interval"])

    for s_id, intervals in surgeon_intervals.items():
        if len(intervals) > 1:
            model.AddNoOverlap(intervals)

def apply_surgeon_availability_constraints(model: cp_model.CpModel, surgery_vars: dict, availabilities: list, base_date):
    """
    Constrângere HARD: Operația trebuie să se desfășoare strict în timpul programului chirurgului.
    """

    surgeon_shifts = {}

    for shift in availabilities:
        s_id = shift.surgeon_id
        if s_id not in surgeon_shifts:
            surgeon_shifts[s_id] = []

        day_offset = (shift.date - base_date).days
        if day_offset < 0:
            continue

        start_parts = shift.start_time.split(":")
        start_mins = day_offset * 24 * 60 + int(start_parts[0]) * 60 + int(start_parts[1])
        
        end_parts = shift.end_time.split(":")
        end_mins = day_offset * 24 * 60 + int(end_parts[0]) * 60 + int(end_parts[1])

        surgeon_shifts[s_id].append({"start": start_mins, "end": end_mins})
    
    for surgery_id, data in surgery_vars.items():
        s_id = data["surgeon_id"]

        if s_id in surgeon_shifts:
            shifts = surgeon_shifts[s_id]
            shift_vars = []

            for i, shift in enumerate(shifts):
                shift_var = model.NewBoolVar(f"surgery_{surgery_id}_in_shift_{i}")
                shift_vars.append(shift_var)

                model.Add(data["start"] >= shift["start"]).OnlyEnforceIf(shift_var)
                model.Add(data["end"] <= shift["end"]).OnlyEnforceIf(shift_var)
            
            model.AddExactlyOne(shift_vars)