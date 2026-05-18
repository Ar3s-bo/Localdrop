import { useState, useEffect, useRef } from "react"
import "./App.css"
import FileDropZone from "./components/FileDropZone"


function App() {
  const [devices, setDevices] = useState([])
  const [ws, setWs] = useState(null)

  const [me, setMe] = useState(null)
  const meRef = useRef(null)

  const [incomingRequest, setIncomingRequest] = useState(null)

  useEffect(() => {
    fetch("http://localhost:8000/me")
      .then(res => res.json())
      .then(data => {
        setMe(data)
        meRef.current = data

        // connetti WebSocket solo dopo che me è pronto
        const websocket = new WebSocket("ws://localhost:8000/ws")
        setWs(websocket)

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data)
          console.log("meRef.current:", meRef.current)
          if (data.type === "file_request" && data.to === meRef.current?.ip) {
            setIncomingRequest(data)
          }
        }

        websocket.onclose = () => console.log("WebSocket disconnesso")
      }, 2000)
  }, [])

  useEffect(() => {
    fetch("http://localhost:8000/peers")
      .then(res => res.json())
      .then(data => setDevices(data))
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
            fetch(`http://${incomingRequest.from_ip}:8000/send-path`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                path: incomingRequest.path,
                target_ip: me.ip
              })
            })
            .then(res => res.json())
            .then(data => console.log("trasferimento:", data))
            setIncomingRequest(null)
          }}>Accetta</button>
        </div>
      )}
    </div>
  )
}

export default App