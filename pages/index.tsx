import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false })

const stickerUrl = 'https://assets7.lottiefiles.com/packages/lf20_jmgekfqg.json' // small heart sparkle
const sticker2 = 'https://assets6.lottiefiles.com/packages/lf20_tfb3estd.json' // confetti burst Lottie

export default function Home() {
  const [countdown, setCountdown] = useState('-- days --:--:--')
  const [messages, setMessages] = useState<any[]>([])
  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const [lightbox, setLightbox] = useState<{src:string, caption?:string}|null>(null)

  useEffect(()=>{
    const target = nextBirthdayDate(9,9)
    const id = setInterval(()=> setCountdown(calcCountdown(target)), 1000)
    setMessages(JSON.parse(localStorage.getItem('hb_guestbook_v1')||'[]'))
    // ensure canvas matches
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return ()=>{ clearInterval(id); window.removeEventListener('resize', resizeCanvas) }
  },[])

  function resizeCanvas(){ const c = confettiRef.current; if(c){ c.width = window.innerWidth; c.height = window.innerHeight } }

  function nextBirthdayDate(month=9, day=9){ const now = new Date(); let year = now.getFullYear(); const t = new Date(year, month-1, day, 0,0,0); if(t<=now) t.setFullYear(year+1); return t }
  function calcCountdown(target:Date){ const now=new Date(); const diff=target.getTime()-now.getTime(); if(diff<=0) return "Happy Birthday Hanan! 🎉"; const days=Math.floor(diff/(1000*60*60*24)); const hrs=Math.floor((diff/(1000*60*60))%24); const mins=Math.floor((diff/(1000*60))%60); const secs=Math.floor((diff/1000)%60); return `${days} days ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}` }

  // multi-burst confetti choreography
  function multiBurst(){
    const myConfetti = confetti.create(confettiRef.current as any, { resize:true, useWorker:true })
    myConfetti({ particleCount: 120, spread:160, origin:{ y:0.35 }, colors: ['#C86B75','#E9A7A8','#7A2034','#B94A56'] })
    setTimeout(()=> myConfetti({ particleCount: 80, spread:120, origin:{ x:0.2, y:0.5 }, colors: ['#C86B75','#7A2034'] }), 250)
    setTimeout(()=> myConfetti({ particleCount: 80, spread:120, origin:{ x:0.8, y:0.5 }, colors: ['#E9A7A8','#B94A56'] }), 350)
  }

  function postMessage(name:string, text:string){
    const msgs = JSON.parse(localStorage.getItem('hb_guestbook_v1')||'[]')
    msgs.push({ name, text, t: Date.now() })
    localStorage.setItem('hb_guestbook_v1', JSON.stringify(msgs))
    setMessages(msgs.slice())
    // small confetti for celebration
    const myConfetti = confetti.create(confettiRef.current as any, { resize:true })
    myConfetti({ particleCount:30, spread:80, origin:{ y:0.6 } })
  }

  // photo upload preview
  function handlePhotoPick(e:any, slot:number){ const f = e.target.files?.[0]; if(!f) return; const reader = new FileReader(); reader.onload = (ev)=>{ const data = ev.target?.result as string; const el = document.querySelector(`[data-slot=\"${slot}\"] img`) as HTMLImageElement; const ph = document.querySelector(`[data-slot=\"${slot}\"] .placeholder`) as HTMLElement; if(el){ el.src = data; el.style.display='block'; ph && (ph.style.display='none') } }; reader.readAsDataURL(f) }

  return (
    <>
      <Head>
        <title>Happy Birthday Hanan 🎉</title>
        <meta name="description" content="A special scrapbook birthday site for Hanan" />
      </Head>

      <canvas id="confetti-canvas" ref={confettiRef} />

      <main className="min-h-screen flex items-start justify-center p-6">
        <div className="card relative w-full max-w-5xl rounded-lg p-6 shadow-2xl paper-texture">

          {/* HERO */}
          <section className="flex items-start gap-6">
            <div className="flex-1">
              <AnimatedHeadline onCelebrate={multiBurst} />
              <div className="mt-3 text-sm text-maroon/80">Countdown to Hanan's birthday</div>
              <div className="text-2xl font-bold text-maroon mt-1">{countdown}</div>
            </div>

            <div className="w-36 flex flex-col gap-2 items-end">
              <div className="lottie-wrap">
                <Lottie loop animationData={null} play style={{width:64,height:64}}>
                  <div style={{width:64,height:64}}>
                    {/* fallback static emoji while dynamic lottie loads */}
                    <div style={{fontSize:36}}>💖</div>
                  </div>
                </Lottie>
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-3 py-2 bg-maroon text-white rounded" onClick={multiBurst}>Celebrate</button>
                <DownloadBtn/>
              </div>
            </div>
          </section>

          {/* MAIN LAYOUT */}
          <section className="mt-6 grid md:grid-cols-[1fr_360px] gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Polaroid slot={1} title="Best memories" onOpen={(src,caption)=>setLightbox({src,caption})} onPick={(e)=>handlePhotoPick(e,1)} />
                <Polaroid slot={2} title="Love you always" className="ml-4" onOpen={(src,caption)=>setLightbox({src,caption})} onPick={(e)=>handlePhotoPick(e,2)} />
              </div>

              <div className="sticker bg-white/90 p-4 rounded flex items-center justify-between shadow">
                <div>
                  <div className="text-maroon font-bold">A little reminder</div>
                  <div className="text-sm text-maroon/90">The world is brighter because you're in it — keep shining always!</div>
                </div>
                <div style={{fontSize:34}}>💖</div>
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
              <label className="px-3 py-1 border rounded cursor-pointer">Upload Music<input type="file" accept="audio/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; const url = URL.createObjectURL(f); const a = document.getElementById('bg-audio') as HTMLAudioElement; a.src = url; a.play() }} /></label>
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
  const [play, setPlay] = useState(true)

  return (
    <div>
      <div className="flex items-center gap-3">
        <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="text-5xl font-bold text-maroon tracking-wide">
          {parts.map((c,i)=> (
            <motion.span key={i} initial={{y:40,opacity:0,rotate:-8}} animate={{y:0,opacity:1,rotate:0}} transition={{delay: i*0.03, type:'spring', stiffness:120}} style={{display:'inline-block'}}>{c}</motion.span>
          ))}
        </motion.h1>

        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.8}}>
          <button className="px-3 py-2 bg-rose text-white rounded" onClick={onCelebrate}>Celebrate 🎉</button>
        </motion.div>
      </div>

      <div className="mt-2 text-sm text-maroon/70">A special page for Hanan — September 9</div>
    </div>
  )
}

function Polaroid({ slot, title, className='', onOpen, onPick }: any){
  // simple 3D tilt on mouse move
  function onMove(e:any){ const el = e.currentTarget; const rect = el.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width; const y = (e.clientY - rect.top) / rect.height; const rx = (y - 0.5) * -10; const ry = (x - 0.5) * 10; el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)` }
  function onLeave(e:any){ e.currentTarget.style.transform = '' }

  return (
    <div className={`polaroid tilt p-2 ${className}`} style={{width:320}} onMouseMove={onMove} onMouseLeave={onLeave}>
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
    </div>
  )
}

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

function DownloadBtn(){
  return <button className="px-3 py-2 border rounded" onClick={async ()=>{
    const { default: html2canvas } = await import('html2canvas')
    const el = document.querySelector('.card') as HTMLElement
    const canvas = await html2canvas(el, { backgroundColor: null, scale:2 })
    const link = document.createElement('a'); link.href = canvas.toDataURL(); link.download = 'happy-birthday-hanan.png'; link.click()
  }}>Download Card</button>
}

function escapeHtml(s:any){ return String(s).replace(/[&<>"]/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]||c)) }
