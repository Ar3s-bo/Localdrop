import { useState, useEffect } from "react"
import { listen } from "@tauri-apps/api/event"


function FileDropZone({ device, ws, me }) {
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    console.log("Listening for drag-drop events...")
    const unlisten = listen("tauri://drag-drop", (event) => {
      const paths = event.payload.paths
      const fakeFiles = paths.map(p => ({ 
        name: p.split("\\").pop().split("/").pop(), 
        size: 0, 
        path: p 
      }))
      setSelectedFiles(prev => [...prev, ...fakeFiles])
    })
    return () => { unlisten.then(f => f()) }
  }, [ws, me])

  function sendFiles() {
    if (!ws || !me || selectedFiles.length === 0) return
    
    fetch(`http://${device.ip}:8000/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "file_request",
        from: me.name,
        from_ip: me.ip,
        to: device.ip,
        files: selectedFiles.map(f => ({
          filename: f.name,
          size: f.size,
          path: f.path || f.name
        }))
      })
    })
    .then(res => res.json())
    .then(() => setSelectedFiles([]))
  }

  return (
    <div className="drop-zone">
      <p>Invia file a {device.name}</p>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files)
          setSelectedFiles(prev => [...prev, ...files])
        }}
      />

      {selectedFiles.map((file, index) => (
        <div key={index}>
          <p>{file.name}</p>
        </div>
      ))}

      {selectedFiles.length > 0 && (
        <button onClick={() => sendFiles()}>
          Invia {selectedFiles.length} file
        </button>
      )}
    </div>
  )
}

export default FileDropZone