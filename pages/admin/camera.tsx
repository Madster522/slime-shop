import React, { useRef, useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import toast from 'react-hot-toast'

export default function AdminCameraPage() {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [stream, setStream]       = useState<MediaStream | null>(null)
  const [snapshot, setSnapshot]   = useState<string | null>(null)
  const [bridgeSnap, setBridgeSnap] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [bridgeOnline, setBridgeOnline] = useState(false)
  const [loadingBridge, setLoadingBridge] = useState(false)

  // Check bridge
  useEffect(() => {
    fetch('http://localhost:5001/health', { signal: AbortSignal.timeout(2000) })
      .then(r => r.ok ? setBridgeOnline(true) : setBridgeOnline(false))
      .catch(() => setBridgeOnline(false))
  }, [])

  // Start browser camera
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play() }
      setStream(s)
      setCameraError('')
    } catch (err: any) {
      setCameraError(`Camera error: ${err.message}. Allow camera access in your browser.`)
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!
    canvasRef.current.width  = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)
    setSnapshot(canvasRef.current.toDataURL('image/jpeg', 0.9))
    toast.success('Snapshot taken!')
  }

  const fetchBridgeSnapshot = async () => {
    setLoadingBridge(true)
    try {
      const res = await fetch('http://localhost:5001/camera/snapshot')
      if (!res.ok) { toast.error('Bridge snapshot failed'); return }
      const blob = await res.blob()
      setBridgeSnap(URL.createObjectURL(blob))
      toast.success('Bridge snapshot captured!')
    } catch { toast.error('Bridge not running — start with: npm run bridge') }
    finally { setLoadingBridge(false) }
  }

  useEffect(() => () => stopCamera(), []) // eslint-disable-line

  return (
    <>
      <Head><title>Camera — Admin</title></Head>
      <AdminLayout title="Camera 📷">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Browser camera */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-bold">Browser Camera</h3>
              <span className={`w-2.5 h-2.5 rounded-full ${stream ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
            </div>
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">📷</span>
                  <p className="text-slate-500 text-sm">{cameraError || 'Camera not started'}</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="p-4 flex flex-wrap gap-3">
              {!stream ? (
                <button onClick={startCamera} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
                  📷 Start Camera
                </button>
              ) : (
                <>
                  <button onClick={takeSnapshot} className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors">
                    📸 Snapshot
                  </button>
                  <button onClick={stopCamera} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-colors">
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bridge camera */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-bold">Bridge Camera</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bridgeOnline ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                {bridgeOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
              {bridgeSnap ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bridgeSnap} alt="Bridge snapshot" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-4xl block mb-2">🖥️</span>
                  <p className="text-slate-500 text-sm">Start bridge to capture</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <button onClick={fetchBridgeSnapshot} disabled={loadingBridge || !bridgeOnline}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors">
                {loadingBridge ? 'Capturing…' : '📸 Capture from Bridge'}
              </button>
              {!bridgeOnline && (
                <p className="text-slate-500 text-xs mt-2 text-center">
                  Start bridge: <code className="font-mono bg-slate-700 px-1 rounded">npm run bridge</code>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Snapshots */}
        {(snapshot || bridgeSnap) && (
          <div className="mt-6">
            <h3 className="text-white font-bold mb-4">Snapshots</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {snapshot && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="p-3 border-b border-slate-700 text-xs text-slate-400 flex justify-between">
                    <span>Browser snapshot</span>
                    <a href={snapshot} download="snapshot.jpg" className="text-green-400 hover:underline">Download</a>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={snapshot} alt="Snapshot" className="w-full" />
                </div>
              )}
              {bridgeSnap && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="p-3 border-b border-slate-700 text-xs text-slate-400">Bridge snapshot</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bridgeSnap} alt="Bridge snapshot" className="w-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
