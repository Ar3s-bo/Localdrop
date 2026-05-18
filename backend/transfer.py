from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil
import httpx
import json
from platformdirs import user_downloads_dir


router = APIRouter()

DOWNLOAD_DIR = Path(user_downloads_dir())

DOWNLOAD_DIR.mkdir(exist_ok=True)

@router.post("/send")
async def receive_file(file: UploadFile = File(...)):
    file_path = DOWNLOAD_DIR / file.filename
    print("salvo file in:", file_path)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"status": "ok", "filename": file.filename}


@router.post("/send-path")
async def send_from_path(data: dict):
    print("ricevuta richiesta di trasferimento:", data["path"])
    print("target:", data["target_ip"])
    file_path = Path(data["path"])
    target_ip = data["target_ip"]
    
    async with httpx.AsyncClient() as client:
        with open(str(file_path), "rb") as f:
            response = await client.post(
                f"http://{target_ip}:8000/send",
                files={"file": (file_path.name, f)}
            )
    return response.json()
