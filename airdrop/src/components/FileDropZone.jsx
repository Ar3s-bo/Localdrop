import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"


function FileDropZone({ device, ws, me }) {

  useEffect(() => {
    const unlisten = listen("tauri://drag-drop", (event) => {
      const filePath = event.payload.paths[0]
      const fakeFile = { name: filePath.split("\\").pop(), size: 0, path: filePath }
      sendFile(fakeFile)
    })
    return () => { unlisten.then(f => f()) }
  }, [ws, me])

  function sendFile(file) {
    if (!ws || !me) return
    
    ws.send(JSON.stringify({
      type: "file_request",
      from: me.ip,
      to: device.ip,
      filename: file.name,
      size: file.size,
      file: file
    }))
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