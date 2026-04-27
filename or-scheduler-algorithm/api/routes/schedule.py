from fastapi import APIRouter
from typing import Dict, Any
from models.schemas import ScheduleGenerationRequest

router = APIRouter()

@router.post("/generate", summary="Generare orar (Mock)")
async def generate_schedule(request: ScheduleGenerationRequest) -> Dict[str, Any]:
    """
    Acest endpointva declansa algoritmul OR-Tools.
    Momentan returnează un răspuns dummy pentru ca echipa de Frontend/Java să poată testa integrarea.
    """

    return {
        "schedule": [
            {
                "surgery_id": request.surgeries[0].id if request.surgeries else 1,
                "room_id": request.rooms[0].id if request.rooms else 1,
                "start_time": "2026-05-01T08:00:00",
               "end_time": "2026-05-01T10:00:00"
            }
        ],
        "score": 95.5,
        "conflicts": [],
        "generation_time_ms": 120
    }


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