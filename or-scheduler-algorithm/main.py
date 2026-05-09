from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from api.routes import schedule
import logging

app = FastAPI(
    title="OR Scheduler - Python Service",
    description="Scheduling Engine powered by FastAPI and OR-Tools",
    version="1.0.0"
)

logger = logging.getLogger("uvicorn")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    logger.error(f"❌ Validation error: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors},
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