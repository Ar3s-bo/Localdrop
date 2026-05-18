import { useState, useEffect } from "react"
import "./App.css"
import FileDropZone from "./components/FileDropZone"

function App() {
  const [devices, setDevices] = useState([])
  const [ws, setWs] = useState(null)

  const [me, setMe] = useState(null)

  const [incomingRequest, setIncomingRequest] = useState(null)

  useEffect(() => {
    fetch("http://localhost:8000/me")
      .then(res => res.json())
      .then(data => setMe(data))
  }, [])

  useEffect(() => {
    fetch("http://localhost:8000/peers")
      .then(res => res.json())
      .then(data => setDevices(data))
  }, [])

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws")
    setWs(ws)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === "file_request") {
        setIncomingRequest(data)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnesso")
    }

    return () => ws.close()
  }, [])

  return (
    <div className="container">
      <h1>LocalDrop</h1>
      <h2>Dispositivi trovati</h2>
      {devices.map(device => (
        <div key={device.ip}>
          <p>{device.name} — {device.ip}</p>
          <FileDropZone device={device} ws={ws} me={me} />
        </div>
      ))}

      {incomingRequest && (
        <div className="incoming-modal">
          <h2>{incomingRequest.from} vuole mandarti un file</h2>
          <p>{incomingRequest.filename} — {incomingRequest.size} bytes</p>
          <button onClick={() => setIncomingRequest(null)}>Rifiuta</button>
          <button onClick={() => {
            // accetta - per ora solo chiude il popup
            setIncomingRequest(null)
          }}>Accetta</button>
        </div>
      )}
    </div>
  )
}

export default App