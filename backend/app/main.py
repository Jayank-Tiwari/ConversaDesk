from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.seed import seed_database
from app.database import engine, Base
from app.routes.auth_routes import router as auth_router
from app.models.user_model import User
from app.models.ticket_model import Ticket
from app.models.email_model import EmailRecord
from app.models.chat_model import ChatHistory
from app.models.ai_message_model import AIMessage
from app.models.department_model import Department
from app.models.comment_model import TicketComment
from app.models.analytics_model import AnalyticsLog
from app.models.notification_model import Notification
from app.routes.gmail_routes import router as gmail_router
from app.services.scheduler_service import start_scheduler
from app.routes.analytics_routes import ( router as analytics_router )
from app.routes.rag_routes import (
    router as rag_router
)
from app.routes.ai_processor_routes import (
    router as ai_processor_router
)
from app.routes.chat_routes import (
    router as chat_router
)
from app.routes.ticket_routes import ( router as ticket_router )

from app.routes.dashboard_routes import ( router as dashboard_router )

from app.routes.ticket_routes import (
    router as ticket_router
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from app.routes.analytics_routes2 import (
    router as analytics_router2
)
from app.routes.mail_reply_routes import (
    router as mail_reply_router
)



# Create Tables
Base.metadata.create_all(bind=engine)
seed_database()
app = FastAPI()
start_scheduler()
app.include_router(gmail_router)
app.include_router(rag_router)
app.include_router(ai_processor_router)
app.include_router(chat_router)
app.include_router( analytics_router )
app.include_router( ticket_router )
app.include_router(ticket_router)
app.include_router( analytics_router2 )
app.include_router(
    mail_reply_router
)
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# Routes
app.include_router(auth_router)
app.include_router( dashboard_router )
from app.websocket_manager import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def home():
    return {
        "message": "ConversaDesk Backend Running"
    }