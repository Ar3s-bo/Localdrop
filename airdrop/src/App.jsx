import { useState, useEffect, useRef } from "react"
import "./App.css"
import FileDropZone from "./components/FileDropZone"


function App() {
  const [devices, setDevices] = useState([])
  const [ws, setWs] = useState(null)

  const [me, setMe] = useState(null)
  const meRef = useRef(null)

  const [incomingRequest, setIncomingRequest] = useState(null)

  const [acceptedFiles, setAcceptedFiles] = useState([])

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
            setAcceptedFiles(data.files.map(f => f.filename))
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
      {devices
        .filter(device => device.ip !== me?.ip)
        .map(device => (
          <div key={device.ip}>
            <p>{device.name} — {device.ip}</p>
            <FileDropZone device={device} ws={ws} me={me} />
          </div>
      ))}

      {incomingRequest && (
        <div className="incoming-modal">
          <h2>{incomingRequest.from} vuole mandarti {incomingRequest.files?.length} file</h2>
          {incomingRequest.files?.map((file, index) => (
            <div key={index}>
              <input
                type="checkbox"
                checked={acceptedFiles.includes(file.filename)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAcceptedFiles(prev => [...prev, file.filename])
                  } else {
                    setAcceptedFiles(prev => prev.filter(f => f !== file.filename))
                  }
                }}
              />
              <span>{file.filename} — {file.size} bytes</span>
            </div>
          ))}
          <button onClick={() => {
            setIncomingRequest(null)
            setAcceptedFiles([])
          }}>Rifiuta</button>
          <button onClick={() => {
            incomingRequest.files
              .filter(file => acceptedFiles.includes(file.filename))
              .forEach(file => {
                fetch(`http://${incomingRequest.from_ip}:8000/send-path`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    path: file.path,
                    target_ip: me.ip
                  })
                })
              })
            setIncomingRequest(null)
            setAcceptedFiles([])
          }}>Accetta</button>
        </div>
      )}
    </div>
  )
}

export default App