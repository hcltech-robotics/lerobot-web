import logging

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect

from app.config import Settings, get_settings
from app.models.groot import (
    GrootRequest,
    GrootResponse,
    GrootStatusResponse,
)
from app.services.groot import (
    GrootService,
    GrootAlreadyRunningError,
    GrootStartError,
)
from app.utils.process_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai-control/groot",
    tags=["groot"],
)


def get_groot_service(
    settings: Settings = Depends(get_settings),
) -> GrootService:
    return GrootService(process_manager=manager, settings=settings)


@router.get("/status", response_model=GrootStatusResponse)
async def groot_status(service: GrootService = Depends(get_groot_service)):
    return service.status()


@router.post("/start", response_model=GrootResponse, status_code=201)
async def groot_start(
    req: GrootRequest,
    service: GrootService = Depends(get_groot_service),
):
    try:
        pid = await service.start(req)
        return GrootResponse(started=True, pid=pid)
    except GrootAlreadyRunningError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except GrootStartError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/stop")
async def groot_stop(service: GrootService = Depends(get_groot_service)):
    await service.stop()
    return {"stopped": True}


@router.websocket("/stream")
async def groot_stream(
    ws: WebSocket,
    service: GrootService = Depends(get_groot_service),
):
    await ws.accept()
    try:
        status = service.status()
        if not status.running:
            await ws.send_text("[GROOT] not running")
            await ws.close()
            return

        async for line in service.stream_lines():
            logger.debug("Groot WS message: %s", line)
            await ws.send_text(line)

        await ws.send_text("[GROOT] process finished")
    except WebSocketDisconnect:
        logger.info("Groot WebSocket disconnected")
        return
