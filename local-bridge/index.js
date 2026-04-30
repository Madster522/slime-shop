// Slime Shop Local Bridge Service
// Run: node local-bridge/index.js
// Bridges USB/Bambu printers and local camera to the Next.js app

const http = require('http')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const PORT = 5001
const ALLOWED_ORIGIN = 'http://localhost:3000'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function parseQuery(url) {
  const q = {}
  const search = url.split('?')[1] || ''
  search.split('&').forEach(p => {
    const [k, v] = p.split('=')
    if (k) q[k] = decodeURIComponent(v || '')
  })
  return q
}

const server = http.createServer((req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const urlPath = req.url.split('?')[0]
  const query = parseQuery(req.url)

  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'slime-shop-bridge', port: PORT }))
    return
  }

  if (urlPath === '/printer/list') {
    const cmd = process.platform === 'win32'
      ? 'wmic printer get Name /format:csv'
      : 'lpstat -a'
    exec(cmd, (err, stdout) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      if (err) { res.end(JSON.stringify({ printers: [], error: err.message })); return }
      const lines = stdout.split('\n').filter(l => l.trim() && !l.includes('Node') && !l.includes('Name'))
      const printers = lines.map(l => l.replace(/,/g, '').trim()).filter(Boolean)
      res.end(JSON.stringify({ printers }))
    })
    return
  }

  if (urlPath === '/printer/status') {
    const cmd = process.platform === 'win32'
      ? 'wmic printer get Name,PrinterStatus /format:csv'
      : 'lpstat -p'
    exec(cmd, (err, stdout) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      if (err) { res.end(JSON.stringify({ online: false, status: 'offline', error: err.message })); return }
      const online = stdout.toLowerCase().includes('idle') || stdout.toLowerCase().includes('printer')
      res.end(JSON.stringify({ online, status: online ? 'idle' : 'offline' }))
    })
    return
  }

  if (urlPath === '/camera/snapshot') {
    const outputPath = path.join(__dirname, 'snapshot.jpg')
    const cmd = process.platform === 'win32'
      ? `ffmpeg -y -f dshow -i video="Integrated Camera" -frames:v 1 "${outputPath}" 2>&1`
      : `ffmpeg -y -f v4l2 -i /dev/video0 -frames:v 1 "${outputPath}" 2>&1`
    exec(cmd, (err) => {
      if (err || !fs.existsSync(outputPath)) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'ffmpeg not available or no camera. Install ffmpeg to use this feature.' }))
        return
      }
      const img = fs.readFileSync(outputPath)
      res.writeHead(200, { 'Content-Type': 'image/jpeg' })
      res.end(img)
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`\n✅ Slime Shop bridge running on http://localhost:${PORT}`)
  console.log('   Keep this running while using the admin panel.\n')
  console.log('   Endpoints:')
  console.log('   GET /health           — health check')
  console.log('   GET /printer/list     — list USB printers')
  console.log('   GET /printer/status   — printer status')
  console.log('   GET /camera/snapshot  — take a photo (needs ffmpeg)\n')
})
