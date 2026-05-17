import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"


function FileDropZone({ device }) {

  useEffect(() => {
    const unlisten = listen("tauri://drag-drop", (event) => {
      const filePath = event.payload.paths[0]
      
      fetch("http://localhost:8000/send-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, target_ip: device.ip })
      })
      .then(res => res.json())
      .then(data => console.log("Successo:", data))
      .catch(err => console.error("Errore:", err))
    })
    return () => { unlisten.then(f => f()) }
  }, [])

  function sendFile(file) {
    const formData = new FormData()
    formData.append("file", file)
    fetch(`http://${device.ip}:8000/send`, {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => console.log("Successo:", data))
    .catch(err => console.error("Errore:", err))
  }

  return (
    <div className="drop-zone">
      <p>Invia file a {device.name}</p>
      <input
        type="file"
        onChange={(e) => sendFile(e.target.files[0])}
      />
    </div>
  )
}

export default FileDropZone