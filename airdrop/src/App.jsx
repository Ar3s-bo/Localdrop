import { useState, useEffect } from "react"
import "./App.css"
import FileDropZone from "./components/FileDropZone"

function App() {
  const [devices, setDevices] = useState([])

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
          <FileDropZone device={device} />
        </div>
      ))}
    </div>
  )
}

export default App