import { useState, useEffect, useRef } from "react"
import "./App.css"
import FileDropZone from "./components/FileDropZone"
import { motion, AnimatePresence } from "framer-motion"


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
    const fetchDevices = () => {
      fetch("http://localhost:8000/peers")
        .then(res => res.json())
        .then(data => setDevices(data))
    }
    
    fetchDevices() // carica subito
    const interval = setInterval(fetchDevices, 5000) // aggiorna ogni 5 secondi
    
    return () => clearInterval(interval) // pulisce quando il componente si smonta
  }, [])


  return (
    <div className="container">
      <h1 className="app-title">LocalDrop</h1>
      <p className="app-subtitle">rete locale · trasferimento istantaneo</p>
      
      <p className="section-label">Dispositivi disponibili</p>
      <div className="devices-grid">
        {devices
          .filter(device => device.ip !== me?.ip)
          .map(device => (
            <FileDropZone key={device.ip} device={device} ws={ws} me={me} />
          ))}
      </div>

      <AnimatePresence>
        {incomingRequest && (
          <div className="modal-overlay">
            <motion.div 
              className="incoming-modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2>{incomingRequest.from} vuole mandarti {incomingRequest.files?.length} file</h2>
              <p>Seleziona quelli che vuoi ricevere</p>
              
              {incomingRequest.files?.map((file, index) => (
                <div key={index} className="checkbox-row">
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
                  <span className="checkbox-filename">{file.filename}</span>
                  <span className="checkbox-size">{file.size} bytes</span>
                </div>
              ))}
              <div className="btn-row">
                <button className="btn-reject" onClick={() => {
                  setIncomingRequest(null)
                  setAcceptedFiles([])
                }}>Rifiuta</button>
                <button className="btn-accept" onClick={() => {
                  incomingRequest.files
                    .filter(file => acceptedFiles.includes(file.filename))
                    .forEach(file => {
                      fetch(`http://${incomingRequest.from_ip}:8000/send-path`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ path: file.path, target_ip: me.ip })
                      })
                    })
                  setIncomingRequest(null)
                  setAcceptedFiles([])
                }}>Accetta ✓</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App