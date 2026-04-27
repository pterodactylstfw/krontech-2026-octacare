from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import schedule

app = FastAPI(
    title="OR Scheduler - Python Service",
    description="Scheduling Engine powered by FastAPI and OR-Tools",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule Integration"])

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "OK", "service": "scheduling-engine"}