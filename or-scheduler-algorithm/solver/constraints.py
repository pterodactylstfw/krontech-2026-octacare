from ortools.sat.python import cp_model

def apply_room_capacity_constraints(model: cp_model.CpModel, surgery_vars: dict):
    """
    Constrângere HARD: O sală -> o singură operație la un moment dat.
    Preia toate intervalele de timp ale operațiilor și forțează modelul
    să nu le suprapună.
    """

    all_intervals = [data["room_interval"] for data in surgery_vars.values()]
    model.AddNoOverlap(all_intervals)

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