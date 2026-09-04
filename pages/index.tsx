import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false })

// Phase A2: upgraded animations, placeholder synthesized music, vertical reels

export default function Home(){
  const [countdown, setCountdown] = useState('-- days --:--:--')
  const [messages, setMessages] = useState<any[]>([])
  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const [lightbox, setLightbox] = useState<{src:string, caption?:string}|null>(null)
  const audioState = useRef<{ctx?:AudioContext, osc?:OscillatorNode, playing:boolean}>({playing:false})
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(()=>{
    const target = nextBirthdayDate(9,9)
    const id = setInterval(()=> setCountdown(calcCountdown(target)), 1000)
    setMessages(JSON.parse(localStorage.getItem('hb_guestbook_v1')||'[]'))
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return ()=>{ clearInterval(id); window.removeEventListener('resize', resizeCanvas) }
  },[])

  function resizeCanvas(){ const c = confettiRef.current; if(c){ c.width = window.innerWidth; c.height = window.innerHeight } }
  function nextBirthdayDate(month=9, day=9){ const now = new Date(); let year = now.getFullYear(); const t = new Date(year, month-1, day, 0,0,0); if(t<=now) t.setFullYear(year+1); return t }
  function calcCountdown(target:Date){ const now=new Date(); const diff=target.getTime()-now.getTime(); if(diff<=0) return "Happy Birthday Hanan! 🎉"; const days=Math.floor(diff/(1000*60*60*24)); const hrs=Math.floor((diff/(1000*60*60))%24); const mins=Math.floor((diff/(1000*60))%60); const secs=Math.floor((diff/1000)%60); return `${days} days ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}` }

  // stronger choreography
  function celebrate(){
    const myConfetti = confetti.create(confettiRef.current as any, { resize:true, useWorker:true })
    myConfetti({ particleCount: 180, spread: 160, origin:{ y:0.35 }, colors: ['#C86B75','#E9A7A8','#7A2034','#B94A56'] })
    setTimeout(()=> myConfetti({ particleCount: 90, spread: 120, origin:{ x:0.2, y:0.55 }, colors: ['#C86B75','#7A2034'] }), 200)
    setTimeout(()=> myConfetti({ particleCount: 90, spread: 120, origin:{ x:0.8, y:0.55 }, colors: ['#E9A7A8','#B94A56'] }), 350)
    // small lottie burst can be triggered via state if needed
    // short celebratory beep
    try{ const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.02; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{ o.stop(); ctx.close(); }, 160); }catch(e){}
  }

  function postMessage(name:string, text:string){
    const msgs = JSON.parse(localStorage.getItem('hb_guestbook_v1')||'[]')
    msgs.push({ name, text, t: Date.now() })
    localStorage.setItem('hb_guestbook_v1', JSON.stringify(msgs))
    setMessages(msgs.slice())
    const myConfetti = confetti.create(confettiRef.current as any, { resize:true })
    myConfetti({ particleCount:30, spread:80, origin:{ y:0.6 } })
  }

  // synth placeholder music: a soft arpeggio loop (no external file)
  function togglePlaceholderMusic(){
    if(audioState.current.playing){
      try{ audioState.current.osc?.stop(); audioState.current.ctx?.close(); }catch(e){}
      audioState.current = {playing:false}
      setIsPlaying(false)
      return
    }
    // create a layered synth-ish pattern
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioState.current.ctx = ctx
    const master = ctx.createGain(); master.gain.value = 0.04; master.connect(ctx.destination)

    // simple arpeggio using oscillators sequenced with setInterval
    const freqs = [440, 550, 660, 880]
    let i=0
    const osc = ctx.createOscillator(); // single oscillator; we will create small envelope per note using gain nodes
    // Instead create scheduled notes using small Gain nodes
    const interval = setInterval(()=>{
      const note = ctx.createOscillator()
      const g = ctx.createGain()
      note.type = 'sine'
      note.frequency.value = freqs[i%freqs.length]
      g.gain.value = 0.0001
      note.connect(g); g.connect(master)
      const now = ctx.currentTime
      g.gain.linearRampToValueAtTime(0.04, now + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
      note.start(now)
      note.stop(now + 0.6)
      i++
    }, 300)

    audioState.current.osc = { } as any
    (audioState.current as any).stopInterval = ()=> clearInterval(interval)
    audioState.current.playing = true
    setIsPlaying(true)
  }

  return (
    <>
      <Head>
        <title>Happy Birthday Hanan 🎉</title>
        <meta name="description" content="A special scrapbook birthday site for Hanan" />
      </Head>

      <canvas id="confetti-canvas" ref={confettiRef} />

      <main className="min-h-screen flex items-start justify-center p-6">
        <div className="card relative w-full max-w-5xl rounded-lg p-6 shadow-2xl paper-texture">

          <section className="flex items-start gap-6">
            <div className="flex-1">
              <AnimatedHeadline onCelebrate={celebrate} />
              <div className="mt-3 text-sm text-maroon/80">Countdown to Hanan's birthday</div>
              <div className="text-2xl font-bold text-maroon mt-1">{countdown}</div>
            </div>

            <div className="w-40 flex flex-col gap-2 items-end">
              <div className="lottie-wrap">
                <Lottie loop play animationData={null} style={{width:64,height:64}} />
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-3 py-2 bg-maroon text-white rounded" onClick={celebrate}>Celebrate</button>
                <button className="px-3 py-2 border rounded" onClick={togglePlaceholderMusic}>{isPlaying? 'Stop Music' : 'Play Demo Music'}</button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid md:grid-cols-[1fr_360px] gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <Polaroid slot={1} title="Best memories" onOpen={(s,c)=>setLightbox({src:s, caption:c})} onPick={(e)=>handlePhotoPick(e,1)} />
                <Polaroid slot={2} title="Love you always" onOpen={(s,c)=>setLightbox({src:s, caption:c})} onPick={(e)=>handlePhotoPick(e,2)} />
                <div className="w-full">
                  <h3 className="text-maroon font-semibold mb-2">Reels — short clips & memories</h3>
                  <Reels/>
                </div>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="note bg-pink/70 p-4 rounded text-maroon font-dancing">Good vibes only<br/><div className="mt-2 text-lg">Save this for your bestie's birthday 🎂</div></div>

              <div className="guestbook bg-white p-3 rounded border">
                <div className="text-maroon font-semibold mb-2">Guestbook — Leave a wish</div>
                <Guestbook onPost={(n,t)=>postMessage(n,t)} messages={messages} />
              </div>
            </aside>
          </section>

          <footer className="mt-4 flex justify-between items-center text-sm text-maroon/90">
            <div>Made with ❤️ for Hanan — 9/9</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border rounded" onClick={async ()=>{
                const { default: html2canvas } = await import('html2canvas')
                const el = document.querySelector('.card') as HTMLElement
                const canvas = await html2canvas(el, { backgroundColor: null, scale:2 })
                const link = document.createElement('a'); link.href = canvas.toDataURL(); link.download = 'happy-birthday-hanan.png'; link.click()
              }}>Download Card</button>
            </div>
          </footer>

        </div>

        <audio id="bg-audio" loop />

        <AnimatePresence>
          {lightbox && (
            <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(null)}>
              <motion.div initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} transition={{type:'spring'}} className="bg-white rounded p-3 max-w-3xl w-full m-4">
                <div className="flex justify-between items-start">
                  <div className="font-bold">{lightbox.caption || ''}</div>
                  <button className="px-2 py-1" onClick={()=>setLightbox(null)}>Close</button>
                </div>
                <div className="mt-3">
                  <img src={lightbox.src} style={{width:'100%',borderRadius:8}} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </>
  )
}

function AnimatedHeadline({ onCelebrate }: any){
  const text = 'Happy Birthday, Hanan!'
  const parts = text.split('')
  const containerRef = useRef<HTMLDivElement|null>(null)

  // small parallax on mouse
  useEffect(()=>{
    const el = containerRef.current
    if(!el) return
    function onMove(e:MouseEvent){ const x = (e.clientX / window.innerWidth - 0.5)*8; const y = (e.clientY / window.innerHeight - 0.5)*6; el.style.transform = `translate3d(${x}px, ${y}px, 0)` }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  },[])

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-4">
        <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.05}} className="text-6xl font-extrabold leading-tight text-maroon tracking-tighter">
          {parts.map((c,i)=> (
            <motion.span key={i} initial={{y:60, rotate:-12, opacity:0}} animate={{y:0, rotate:0, opacity:1}} transition={{delay: i*0.04, type:'spring', stiffness:140}} style={{display:'inline-block'}}>{c}</motion.span>
          ))}
        </motion.h1>

        <motion.button initial={{scale:0}} animate={{scale:1}} transition={{delay:0.9}} className="px-3 py-2 bg-rose text-white rounded" onClick={onCelebrate}>Celebrate</motion.button>
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}} className="mt-2 text-sm text-maroon/70">A special page for Hanan — September 9</motion.div>
    </div>
  )
}

function Polaroid({ slot, title, className='', onOpen, onPick }: any){
  function onMove(e:any){ const el = e.currentTarget; const rect = el.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width; const y = (e.clientY - rect.top) / rect.height; const rx = (y - 0.5) * -10; const ry = (x - 0.5) * 10; el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0) scale(1.02)` }
  function onLeave(e:any){ e.currentTarget.style.transform = '' }

  return (
    <motion.div initial={{opacity:0, y:30, rotate: -6}} animate={{opacity:1, y:0, rotate:0}} transition={{type:'spring', stiffness:120}} className={`polaroid tilt p-2 ${className}`} style={{width:320}} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="tape w-16 h-5 bg-pink -translate-y-2 rotate-12" />
      <div className="photo relative bg-gradient-to-br from-rose to-maroon rounded cursor-pointer flex items-center justify-center" data-slot={slot} onClick={()=>{
        const img = (document.querySelector(`[data-slot=\"${slot}\"] img`) as HTMLImageElement)
        if(img && img.src) onOpen && onOpen(img.src, title)
        else (document.getElementById(`photo${slot}`) as HTMLInputElement).click()
      }}>
        <span className="placeholder text-white font-semibold">Add photo</span>
        <img src="" alt="" style={{display:'none', width:'100%', height:'100%', objectFit:'cover'}} />
      </div>
      <div className="text-center text-sm mt-2 text-maroon/90">{title}</div>
      <input id={`photo${slot}`} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </motion.div>
  )
}

function Reels(){
  // small vertical reels demo — uses placeholder gradient cards that auto-loop
  const items = new Array(5).fill(0).map((_,i)=>({ id:i, title:`Memory ${i+1}` }))
  const [index, setIndex] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=> setIndex(i=> (i+1)%items.length), 2800)
    return ()=> clearInterval(t)
  },[])

  return (
    <div className="relative overflow-hidden rounded" style={{height:220}}>
      {items.map((it, i)=> (
        <motion.div key={it.id} initial={{opacity:0, y:20}} animate={{opacity: i===index?1:0, y: i===index?0:20}} transition={{duration:0.6}} className="absolute inset-0 flex items-center justify-center" style={{background: `linear-gradient(135deg, rgba(200,107,117,0.1), rgba(122,32,52,0.1))`, borderRadius:8}}>
          <div className="text-center p-6">
            <div className="text-xl font-semibold text-maroon">{it.title}</div>
            <div className="mt-2 text-sm text-maroon/80">Swipe on mobile — or watch the loop</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function handlePhotoPick(e:any, slot:number){ const f = e.target.files?.[0]; if(!f) return; const reader = new FileReader(); reader.onload = (ev)=>{ const data = ev.target?.result as string; const el = document.querySelector(`[data-slot=\"${slot}\"] img`) as HTMLImageElement; const ph = document.querySelector(`[data-slot=\"${slot}\"] .placeholder`) as HTMLElement; if(el){ el.src = data; el.style.display='block'; ph && (ph.style.display='none') } }; reader.readAsDataURL(f) }

function Guestbook({ onPost, messages }: any){
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  return (
    <div>
      <div className="flex flex-col gap-2">
        <input className="p-2 border rounded" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <textarea className="p-2 border rounded" rows={3} placeholder="Write a short message for Hanan..." value={text} onChange={e=>setText(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-maroon text-white rounded" onClick={()=>{ if(!text) return; onPost(name||'Anonymous', text); setName(''); setText('') }}>Post</button>
          <button className="px-3 py-1 border rounded" onClick={()=>{ if(!confirm('Clear all guestbook messages from this browser?')) return; localStorage.removeItem('hb_guestbook_v1'); window.location.reload() }}>Clear</button>
        </div>
      </div>

      <div className="mt-3 max-h-60 overflow-auto space-y-2">
        {messages.slice().reverse().map((m:any, i:number)=> (
          <div key={i} className="p-2 bg-white rounded border-l-4 border-rose shadow-sm">
            <div className="text-xs text-maroon/80">{escapeHtml(m.name)} • {new Date(m.t).toLocaleString()}</div>
            <div className="mt-1 text-sm">{escapeHtml(m.text)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function escapeHtml(s:any){ return String(s).replace(/[&<>"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]||c)) }
