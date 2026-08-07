import { useEffect, useRef, useState } from 'react'
import SlashMenu from './SlashMenu'
import { uploadService } from '../services/uploadService'

const TYPES = ['text', 'heading', 'todo', 'image', 'audio', 'youtube']
const COLORS = ['default', 'gray', 'red', 'orange', 'green', 'blue']
const STYLES = ['normal', 'quote', 'callout', 'code', 'italic']
const WAVEFORM_BARS = Array.from({ length: 24 }, (_, index) => index)

function getYouTubeEmbedUrl(value) {
  try {
    const url = new URL(value)
    const id = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.hostname.endsWith('youtube.com')
        ? url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop()
        : ''
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : ''
  } catch {
    return ''
  }
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function AudioRecorder({ block, onContentChange }) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mediaError, setMediaError] = useState('')
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), [])

  const recordAudio = async () => {
    if (recording) {
      recorderRef.current?.stop()
      return
    }

    setMediaError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 64000 } : undefined)
      streamRef.current = stream
      chunksRef.current = []
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = async () => {
        setRecording(false)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setUploading(true)
        try {
          const mimeType = recorder.mimeType?.split(';')[0] || 'audio/webm'
          const dataUrl = await readAsDataUrl(new Blob(chunksRef.current, { type: mimeType }))
          const response = await uploadService.uploadAudio(dataUrl, mimeType)
          onContentChange(block._id, response.data.url)
        } catch (error) {
          setMediaError(error.response?.data?.message || 'Unable to upload recording.')
        } finally {
          setUploading(false)
        }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setMediaError('Microphone permission was denied or is unavailable.')
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-medium text-[var(--text-primary)]">Audio note</p><p className="text-xs text-[var(--text-secondary)]">Record a thought while you write</p></div>
        <button type="button" onClick={recordAudio} disabled={uploading} className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${recording ? 'bg-red-600' : 'bg-[var(--btn-primary-bg)]'} disabled:opacity-50`}>{recording ? 'Stop recording' : uploading ? 'Uploading…' : 'Record audio'}</button>
      </div>
      <div className={`audio-waveform mt-3 ${recording ? 'audio-waveform-recording' : ''}`} aria-label={recording ? 'Recording in progress' : 'Audio waveform'}>{WAVEFORM_BARS.map((bar) => <span key={bar} className="audio-wave-bar" />)}</div>
      {block.content && <audio className="mt-3 w-full" controls src={block.content} />}
      {mediaError && <p className="mt-2 text-xs text-red-600">{mediaError}</p>}
    </div>
  )
}

function BlockRow({ block, onContentChange, onTypeChange, onPropertiesChange, onDelete, onDragStart, onDrop, registerRef, onAddAfter, onDeleteAndFocusPrevious, onArrowNav, slashMenuOpen, onSlashOpen, onSlashClose, onSlashSelect }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const properties = block.properties || {}

  const saveContent = (event) => {
    const value = event.target.value
    onContentChange(block._id, value)
    if (value === '/') onSlashOpen()
    else onSlashClose()
  }

  const keyDown = (event) => {
    if (['image', 'audio', 'youtube'].includes(block.type)) return
    if (event.key === 'Enter' && (block.type !== 'text' || !event.shiftKey)) { event.preventDefault(); onAddAfter(block._id) }
    else if (event.key === 'Backspace' && !block.content) { event.preventDefault(); onDeleteAndFocusPrevious(block._id) }
    else if (event.key === 'ArrowUp') onArrowNav(block._id, 'up')
    else if (event.key === 'ArrowDown') onArrowNav(block._id, 'down')
  }

  const baseInput = { ref: registerRef, value: block.content || '', onChange: saveContent, onKeyDown: keyDown }
  const colors = { default: 'text-[var(--text-primary)]', gray: 'text-slate-500', red: 'text-red-600', orange: 'text-orange-600', green: 'text-emerald-600', blue: 'text-blue-600' }
  const headings = { h1: 'text-5xl font-bold', h2: 'text-4xl font-bold', h3: 'text-3xl font-bold' }
  const styles = { normal: '', quote: 'border-l-4 border-[var(--accent)] pl-4 italic text-[var(--text-secondary)]', callout: 'rounded-lg bg-[var(--accent-light)] p-3', code: 'rounded-lg bg-[var(--bg-hover)] p-3 font-mono text-sm', italic: 'italic' }
  const menu = <div className="absolute left-0 z-30 mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs shadow-[var(--shadow-elevated)]"><label className="font-semibold text-[var(--text-primary)]">Block type</label><select value={block.type} onChange={(event) => { onTypeChange(block, event.target.value); setMenuOpen(false) }} className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-input)] p-1.5">{TYPES.map((type) => <option key={type}>{type}</option>)}</select>{block.type === 'heading' && <><label className="mt-3 block font-semibold text-[var(--text-primary)]">Heading size</label><div className="mt-1 flex gap-1">{['h1', 'h2', 'h3'].map((level) => <button key={level} onClick={() => onPropertiesChange(block, { headingLevel: level })} className={`rounded px-2 py-1 ${properties.headingLevel === level ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>{level.toUpperCase()}</button>)}</div></>}{['text', 'heading'].includes(block.type) && <><label className="mt-3 block font-semibold text-[var(--text-primary)]">Text colour</label><div className="mt-1 flex flex-wrap gap-1">{COLORS.map((color) => <button key={color} onClick={() => onPropertiesChange(block, { color })} className={`rounded px-2 py-1 capitalize ${properties.color === color ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>{color}</button>)}</div></>}{block.type === 'text' && <><label className="mt-3 block font-semibold text-[var(--text-primary)]">Writing style</label><div className="mt-1 flex flex-wrap gap-1">{STYLES.map((style) => <button key={style} onClick={() => onPropertiesChange(block, { textStyle: style })} className={`rounded px-2 py-1 capitalize ${properties.textStyle === style ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>{style}</button>)}</div></>}</div>

  let content = <textarea {...baseInput} rows={1} className={`w-full resize-none bg-transparent outline-none placeholder:text-[var(--text-secondary)] ${colors[properties.color || 'default']} ${styles[properties.textStyle || 'normal']}`} placeholder="Type '/' for commands..." />
  if (block.type === 'heading') content = <input {...baseInput} className={`w-full bg-transparent outline-none ${headings[properties.headingLevel || 'h2']} ${colors[properties.color || 'default']}`} placeholder="Heading..." />
  if (block.type === 'todo') content = <div className="flex gap-2"><input type="checkbox" className="mt-1 accent-[var(--accent)]" /><input {...baseInput} className="w-full bg-transparent outline-none" placeholder="To-do..." /></div>
  if (block.type === 'image') content = <><input {...baseInput} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] p-2.5 outline-none" placeholder="Paste an image URL..." />{block.content && <img src={block.content} alt="Embedded" className="mt-3 max-h-96 rounded-lg border border-[var(--border)]" />}</>
  if (block.type === 'youtube') { const embed = getYouTubeEmbedUrl(block.content); content = <><input {...baseInput} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] p-2.5 outline-none" placeholder="Paste a YouTube URL..." />{embed ? <iframe className="mt-3 aspect-video w-full rounded-lg border border-[var(--border)]" src={embed} title="YouTube video" allowFullScreen /> : block.content && <p className="mt-2 text-xs text-red-600">Use a valid YouTube URL.</p>}</> }
  if (block.type === 'audio') content = <AudioRecorder block={block} onContentChange={onContentChange} />

  return <div draggable onDragStart={(event) => { event.dataTransfer.setData('text/plain', block._id); onDragStart(block._id) }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(block._id, event.dataTransfer.getData('text/plain'))} className="group relative flex gap-2 rounded-lg px-2 py-2 hover:bg-[var(--bg-hover)]"><div className="relative"><button onClick={() => setMenuOpen((open) => !open)} className="rounded p-1.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100" aria-label="Block options">⠿</button>{menuOpen && menu}</div><div className="min-w-0 flex-1">{content}{slashMenuOpen && <SlashMenu onSelect={onSlashSelect} />}</div><button onClick={() => onDelete(block._id)} className="self-start rounded p-1.5 text-xs text-[var(--text-secondary)] opacity-0 transition hover:text-red-600 group-hover:opacity-100" aria-label="Delete block">✕</button></div>
}

export default BlockRow
