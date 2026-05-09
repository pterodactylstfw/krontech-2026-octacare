from pydantic import BaseModel, Field, ConfigDict, AliasGenerator
from pydantic.alias_generators import to_camel
from typing import List, Optional, Union
from datetime import datetime, date
from uuid import UUID

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            validation_alias=to_camel,
        ),
        populate_by_name=True
    )

class RoomBase(BaseSchema):
    id: Union[str, UUID]
    name: str
    room_type: str = Field(..., description="GENERAL, CARDIAC, NEURO, etc.")
    sterilization_time_minutes: int = Field(default = 45, description="Timp necesar intre operatii")

class SurgeryRequest(BaseSchema):
    id: Union[str, UUID]
    surgeon_id: Union[str, UUID]
    surgery_type_id: Union[str, UUID]
    priority: str = Field(..., description="ELECTIVE, URGENT, EMERGENCY")
    duration_minutes: int = Field(..., gt=0, description="Durata estimata in minute")
    required_room_type: str = "GENERAL"

class SurgeonAvailability(BaseSchema):
    surgeon_id: Union[str, UUID]
    date: date
    start_time: str = Field(..., description="Format HH:MM")
    end_time: str = Field(..., description="Format HH:MM")

class ScheduleGenerationRequest(BaseSchema):
    date_range_start: date
    date_range_end: date
    surgeries: List[SurgeryRequest]
    rooms: List[RoomBase]
    surgeons_availability: List[SurgeonAvailability]