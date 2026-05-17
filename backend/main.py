from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from discovery import start_discovery, peers
from transfer import router as transfer_router

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
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)