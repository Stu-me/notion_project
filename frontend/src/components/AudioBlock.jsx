import { useEffect, useRef, useState } from 'react'

const WAVEFORM_BARS = Array.from({ length: 24 }, (_, index) => index)

function AudioBlock({ block, onContentChange }) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const startRecording = async () => {
    setError('')

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      streamRef.current = stream
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => onContentChange(block._id, reader.result)
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        recorderRef.current = null
      }

      recorder.start()
      setRecording(true)
    } catch {
      setError('Microphone permission is required to record audio.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
      setRecording(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--text-primary)]">Audio note</p>
          <p className="text-xs text-[var(--text-secondary)]">Record a thought while you write</p>
        </div>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-on-accent)] transition ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'}`}
        >
          {recording ? 'Stop recording' : 'Start recording'}
        </button>
      </div>

      <div className={`audio-waveform mt-4 ${recording ? 'audio-waveform-recording' : ''}`} aria-label={recording ? 'Recording in progress' : 'Recording waveform'}>
        {WAVEFORM_BARS.map((bar) => <span key={bar} className="audio-wave-bar" />)}
      </div>

      {block.content && <audio controls src={block.content} className="mt-4 w-full" />}
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default AudioBlock
