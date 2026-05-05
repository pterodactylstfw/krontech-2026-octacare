from fastapi import APIRouter
from typing import Dict, Any
from models.schemas import ScheduleGenerationRequest
from solver.scheduler import generate_optimal_schedule

router = APIRouter()

@router.post("/generate", summary="Generare orar (OR-Tools Engine)")
async def generate_schedule(request: ScheduleGenerationRequest) -> Dict[str, Any]:
    """
    Acest endpoint declanșează algoritmul OR-Tools pentru a găsi cel mai bun orar.
    """

    result = generate_optimal_schedule(request)
    return result

@router.post("/validate", summary="Validare orar propus (Mock)")
async def validate_schedule(proposed_schedule: dict) -> Dict[str, Any]:
    """
    Validează dacă un orar modificat manual de Admin încalcă vreo constrângere hard.
    """

    return {
        "is_valid": True,
        "violations": []
    }


@router.post("/optimize-single", summary="Optimizare operatie singulara (Mock)")
async def optimize_single(surgery_request: dict) -> Dict[str, Any]:
    """
    Găsește cel mai bun slot pentru o operație nouă
    """

    return {
        "best_slot": {
            "room_id": 2,
            "start_time": "2026-05-01T14:00:00"
        },
        "alternatives": []
    }