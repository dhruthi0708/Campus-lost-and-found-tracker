import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanLine, CheckCircle2, XCircle, Camera } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { PageHeader } from '../components/ui'

// Staff scan the one-time QR emailed to the owner. A valid scan completes the handover automatically.
export default function Verify() {
  const { verifyHandover } = useApp()
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const videoRef = useRef(null)
  const canScan = typeof window !== 'undefined' && 'BarcodeDetector' in window

  async function submit(raw) {
    const token = String(raw).trim()
    if (!token || busy) return
    setBusy(true)
    setResult(await verifyHandover(token))
    setBusy(false); setCode('')
  }

  useEffect(() => {
    if (!scanning) return
    let stream, raf, stopped = false
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((s) => {
      stream = s; videoRef.current.srcObject = s; videoRef.current.play()
      const tick = async () => {
        if (stopped) return
        try { const r = await detector.detect(videoRef.current); if (r[0]) { setScanning(false); submit(r[0].rawValue); return } } catch { /* retry */ }
        raf = requestAnimationFrame(tick)
      }
      tick()
    }).catch(() => { setResult({ ok: false, error: 'Camera unavailable. Paste the code below instead.' }); setScanning(false) })
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [scanning]) // eslint-disable-line

  return (
    <div className="page page--narrow">
      <PageHeader title="Secure handover" subtitle="Scan the owner's emailed QR code. A valid, unused code completes the handover instantly." />
      <section className="panel">
        {canScan && <button className="btn btn--primary" onClick={() => { setResult(null); setScanning((s) => !s) }}><Camera size={16} /> {scanning ? 'Stop camera' : 'Scan QR with camera'}</button>}
        {scanning && <video ref={videoRef} className="verify__video" muted playsInline />}
        <form className="verify__input" onSubmit={(e) => { e.preventDefault(); submit(code) }}>
          <ScanLine size={18} />
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Or paste the code (CFH-…) / use a USB QR scanner" aria-label="Handover code" autoFocus />
          <button className="btn btn--ghost" disabled={busy}>Verify</button>
        </form>
        {!canScan && <p className="muted">Camera scanning needs Chrome/Edge. A USB or phone QR scanner that types the code also works.</p>}
      </section>

      {result && !result.ok && <p className="notice notice--error"><XCircle size={16} /> {result.error}</p>}
      {result?.ok && (
        <section className="panel verify-card verify-card--ok">
          <CheckCircle2 size={40} />
          <h2>Handed over ✔</h2>
          <p><b>{result.claim.itemName}</b> is now marked <b>Handed Over</b>.</p>
          <p>Check ID: <b>{result.claimant.name}</b>{result.claimant.rollNo && ` · ${result.claimant.rollNo}`}{result.claimant.department && ` · ${result.claimant.department}`}</p>
          <Link to={`/claims/${result.claim.id}`}>Open claim →</Link>
        </section>
      )}
    </div>
  )
}
