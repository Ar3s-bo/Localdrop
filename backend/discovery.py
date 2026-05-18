import socket
import threading
import json
import time


BROADCAST_PORT = 37020
BROADCAST_INTERVAL = 5

peers = {}
peers_lock = threading.Lock()

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]
    s.close()
    return ip

def broadcast_presence(device_name):
    ip = get_local_ip()
    message = json.dumps({
        "name": device_name,
        "ip": ip,   
        "port": 8000
    })
    
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.bind(("", 0))
    
    while True:
        s.sendto(message.encode(), ("<broadcast>", BROADCAST_PORT))
        time.sleep(BROADCAST_INTERVAL)

def listen_for_peers():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("", BROADCAST_PORT))
    
    while True:
        data, addr = s.recvfrom(1024)
        try:
            peer_info = json.loads(data.decode())
            with peers_lock:
                peers[peer_info["ip"]] = peer_info
        except json.JSONDecodeError:
            continue
        
def start_discovery(device_name):
    t1 = threading.Thread(target=broadcast_presence, args=(device_name,), daemon=True)
    t2 = threading.Thread(target=listen_for_peers, daemon=True)
    t1.start()
    t2.start()