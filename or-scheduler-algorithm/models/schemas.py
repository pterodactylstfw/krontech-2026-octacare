from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date

class RoomBase(BaseModel):
    id: str
    name: str
    room_type: str = Field(..., description="GENERAL, CARDIAC, NEURO, etc.")
    sterilization_time_minutes: int = Field(default = 45, description="Timp necesar intre operatii")

class SurgeryRequest(BaseModel):
    id: str
    surgeon_id: str
    surgery_type_id: str
    priority: str = Field(..., description="ELECTIVE, URGENT, EMERGENCY")
    duration_minutes: int = Field(..., gt=0, description="Durata estimata in minute")
    required_room_type: str = "GENERAL"

class SurgeonAvailability(BaseModel):
    surgeon_id: str
    date: date
    start_time: str = Field(..., description="Format HH:MM")
    end_time: str = Field(..., description="Format HH:MM")

class ScheduleGenerationRequest(BaseModel):
    date_range_start: date
    date_range_end: date
    surgeries: List[SurgeryRequest]
    rooms: List[RoomBase]
    surgeons_availability: List[SurgeonAvailability]