from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from discovery import start_discovery, peers
from transfer import router as transfer_router
from ws_manager import manager
from discovery import start_discovery, peers, get_local_ip

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transfer_router)

@app.get("/peers")
def get_peers():
        return list(peers.values())
    
@app.on_event("startup")
def startup_event():
    import socket
    device_name = socket.gethostname()
    start_discovery(device_name)
    
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except:
        manager.disconnect(websocket)

@app.get("/me")
def get_me():
    import socket
    return {"name": socket.gethostname(), "ip": get_local_ip()}
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
