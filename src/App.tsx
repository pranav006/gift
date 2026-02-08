import { useState, useEffect } from 'react'
import {
  Heart,
  ShieldAlert,
  Sparkles,
  Car,
  Waves,
  X,
  MapPin,
} from 'lucide-react'

type MemoryPhase = 'none' | 'beach' | 'drive'
type SuggestionStep = 'none' | 'first_batch' | 'question' | 'remaining_batch' | 'final_question'

const FUNNY_TEXTS = [
  'Try again!',
  'Nice try 😉',
  'Wrong button!',
  'Are you sure?',
  'Think again!',
  'Nope!',
  'Click Yes!',
]

const NO_BUTTON_POPUP_MESSAGES = [
  "You don't fix me; you just stay. That's the kind of safe I needed.",
  "You in the passenger seat, city lights passing. Simple. Perfect.",
  "We've solved half our problems on empty roads after midnight.",
  "Every long drive with you feels like a tiny adventure we didn't plan.",
  "The best conversations we've had were in the car when the world was asleep.",
  "Driving with you at night is when I feel most us.",
]

// Formspree (optional): set to your form URL from https://formspree.io to record responses. If not set or request fails, we fall back to opening her email to you.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'
const PARTNER_EMAIL = 'pranavsanalk13@gmail.com'

const App = () => {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [proposalAccepted, setProposalAccepted] = useState(false)
  const [showMemories, setShowMemories] = useState(false)
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>('none')

  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const [noButtonText, setNoButtonText] = useState('No')
  const [noTryCount, setNoTryCount] = useState(0)
  const [popupIndex, setPopupIndex] = useState(-1)
  const [suggestionStep, setSuggestionStep] = useState<SuggestionStep>('none')
  const [showGiftAsk, setShowGiftAsk] = useState(false)
  const [giftWish, setGiftWish] = useState('')
  const [giftSubmitted, setGiftSubmitted] = useState(false)
  const [giftSending, setGiftSending] = useState(false)
  const [usedMailtoFallback, setUsedMailtoFallback] = useState(false)

  const SECRET_KEY = '2510'
  const progress = Math.min(password.length / 4, 1)
  const manTopOffset = -300 + progress * 300
  const roomScale = 1.1 - progress * 0.1

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 4).replace(/[^0-9]/g, '')
    setPassword(val)
    if (error) setError(false)
  }

  const handleUnlock = () => {
    if (password === SECRET_KEY) {
      setIsLoading(true)
      setTimeout(() => {
        setIsUnlocked(true)
        setIsLoading(false)
      }, 1500)
    } else {
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 1000)
    }
  }

  const BEACH_DURATION_MS = 3500
  const DRIVE_DURATION_MS = 5500

  const handleYes = () => {
    setProposalAccepted(true)
    setTimeout(() => {
      setShowMemories(true)
      setMemoryPhase('beach')
      setTimeout(() => {
        setMemoryPhase('drive')
        // After final memory (drive), go to gift page
        setTimeout(() => {
          setShowMemories(false)
          setShowGiftAsk(true)
        }, DRIVE_DURATION_MS)
      }, BEACH_DURATION_MS)
    }, 800)
  }

  const STILL_DONT_LOVE = "Still you don't love? 😏 Okay, we'll fix that..."

  const PLAYS_BEFORE_SUGGESTIONS = 3
  const FIRST_BATCH_END = 2   // show 0, 1, 2 then back to question
  const SUGGESTION_DURATION_MS = 3200
  const STILL_DONT_LOVE_DURATION_MS = 4500

  const moveNoButton = () => {
    const nextCount = noTryCount + 1
    setNoTryCount(nextCount)
    setNoButtonPos({
      x: Math.random() * 260 - 130,
      y: Math.random() * 260 - 130,
    })
    setNoButtonText(FUNNY_TEXTS[Math.floor(Math.random() * FUNNY_TEXTS.length)])
    // After 2–3 funny plays: start first batch of suggestions (0, 1, 2)
    if (nextCount >= PLAYS_BEFORE_SUGGESTIONS && suggestionStep === 'none') {
      setSuggestionStep('first_batch')
      setPopupIndex(0)
    }
    // She hovered No again after first batch: show remaining suggestions (3, 4, 5, 6)
    if (suggestionStep === 'question') {
      setSuggestionStep('remaining_batch')
      setPopupIndex(3)
    }
  }

  const handleNoClick = () => {
    moveNoButton()
    // In final question, clicking No = swap to Yes and proceed
    if (suggestionStep === 'final_question') {
      handleYes()
    }
  }

  const goToFirstPage = () => {
    setShowMemories(false)
    setProposalAccepted(false)
    setMemoryPhase('none')
    setNoButtonPos({ x: 0, y: 0 })
    setNoButtonText('No')
    setNoTryCount(0)
    setPopupIndex(-1)
    setSuggestionStep('none')
    setShowGiftAsk(false)
    setIsUnlocked(false)
    setPassword('')
  }

  // Auto-advance suggestions: first batch 0→1→2→question; remaining 3→4→5→6→final_question
  useEffect(() => {
    if (popupIndex < 0 || popupIndex > 6) return
    const isFirstBatchEnd = suggestionStep === 'first_batch' && popupIndex === FIRST_BATCH_END
    const isStillDontLove = popupIndex === 6
    const delay = isStillDontLove ? STILL_DONT_LOVE_DURATION_MS : SUGGESTION_DURATION_MS

    const t = setTimeout(() => {
      if (isFirstBatchEnd) {
        setPopupIndex(-1)
        setSuggestionStep('question')
        return
      }
      if (isStillDontLove) {
        setPopupIndex(-1)
        setSuggestionStep('final_question')
        return
      }
      if (popupIndex === 5) setPopupIndex(6)
      else setPopupIndex((i) => i + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [popupIndex, suggestionStep])

  const openMailtoFallback = (wish: string) => {
    const subject = encodeURIComponent("Valentine's gift wish")
    const body = encodeURIComponent(`Her gift wish:\n\n${wish}`)
    window.location.href = `mailto:${PARTNER_EMAIL}?subject=${subject}&body=${body}`
  }

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const wish = giftWish.trim()
    if (!wish) return
    setGiftSending(true)

    const formspreeNotConfigured = FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')

    if (formspreeNotConfigured) {
      openMailtoFallback(wish)
      setUsedMailtoFallback(true)
      setGiftSubmitted(true)
      setGiftSending(false)
      return
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          'Gift wish': wish,
          _subject: "Valentine's gift wish",
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      setGiftSubmitted(true)
    } catch {
      openMailtoFallback(wish)
      setUsedMailtoFallback(true)
      setGiftSubmitted(true)
    } finally {
      setGiftSending(false)
    }
  }

  if (isUnlocked) {
    return (
      <div className="min-h-screen w-full bg-[#070204] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-rose-900/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-900/10 blur-[160px] rounded-full" />

        {/* Heart Burst Overlay */}
        {proposalAccepted && (
          <div className="fixed inset-0 z-[100] pointer-events-none">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 flex items-center justify-center animate-heart-burst-out"
                style={
                  {
                    '--tx': `${(Math.random() - 0.5) * 2400}px`,
                    '--ty': `${(Math.random() - 0.5) * 2400}px`,
                    '--rot': `${Math.random() * 720}deg`,
                    animationDelay: `${Math.random() * 0.5}s`,
                  } as React.CSSProperties
                }
              >
                <Heart
                  className="text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  size={Math.random() * 30 + 15}
                />
              </div>
            ))}
          </div>
        )}

        {/* Cinematic memory sequence */}
        {showMemories && (
          <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black overflow-hidden">
            {memoryPhase === 'beach' && (
              <div className="absolute inset-0 z-20 animate-zoom-out-in">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-20" />
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Beach"
                />
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="text-center space-y-4">
                    <Waves className="mx-auto text-rose-300 w-20 h-20 animate-pulse" />
                    <h2 className="text-5xl md:text-6xl font-black italic tracking-[0.3em] text-white drop-shadow-[0_0_30px_rgba(255,100,100,0.8)]">
                      THE BEGINNING
                    </h2>
                    <p className="text-rose-200 uppercase tracking-[0.5em] text-sm font-bold">
                      Where the waves met our story
                    </p>
                  </div>
                </div>
              </div>
            )}

            {memoryPhase === 'drive' && (
              <div className="absolute inset-0 z-30 animate-slide-up-in">
                <div className="absolute inset-0 bg-black/60 z-20" />
                <div className="absolute inset-0 opacity-40">
                  <div
                    className="absolute h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent top-1/3 animate-dash"
                    style={{ '--d': '2s' } as React.CSSProperties}
                  />
                  <div
                    className="absolute h-1 w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent top-1/2 animate-dash"
                    style={{ '--d': '3s' } as React.CSSProperties}
                  />
                  <div
                    className="absolute h-1 w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent top-2/3 animate-dash"
                    style={{ '--d': '1.5s' } as React.CSSProperties}
                  />
                </div>
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920&auto=format&fit=crop"
                  className="w-full h-full object-cover scale-110 animate-drive-parallax"
                  alt="City Drive"
                />
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-24 px-8">
                  <div className="w-full max-w-5xl bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 blur-[80px] rounded-full" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-rose-400">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[10px] font-black uppercase tracking-[0.6em]">
                            Destination: Forever
                          </span>
                        </div>
                        <h3 className="text-4xl font-black italic text-white flex items-center gap-4">
                          Night Cruise <Car className="animate-bounce" />
                        </h3>
                        <div className="flex items-center gap-2 text-white/40">
                          <MapPin size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Passing through Memory Lane
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-5xl font-black italic text-rose-500">∞</div>
                          <div className="text-[10px] text-white/30 font-bold uppercase mt-1">
                            Speed
                          </div>
                        </div>
                        <div className="h-12 w-[1px] bg-white/10" />
                        <div className="text-center">
                          <div className="text-4xl font-black italic text-white">LOVE</div>
                          <div className="text-[10px] text-white/30 font-bold uppercase mt-1">
                            Fuel
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={goToFirstPage}
              className="absolute top-10 right-10 z-[100] p-5 bg-white/10 hover:bg-rose-600 rounded-full transition-all text-white backdrop-blur-xl group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        )}

        {/* Suggestions: one by one from inside screen to surface; blurred bg so user focuses on text */}
        {popupIndex >= 0 && !proposalAccepted && !showMemories && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6 py-8 pointer-events-none"
            aria-live="polite"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" aria-hidden />
            <p
              key={popupIndex}
              className="relative z-10 text-white text-center text-xl sm:text-2xl md:text-3xl leading-relaxed font-medium max-w-2xl animate-emerge-to-surface px-4"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
            >
              {popupIndex === 6
                ? STILL_DONT_LOVE
                : NO_BUTTON_POPUP_MESSAGES[popupIndex]}
            </p>
          </div>
        )}

        {/* Main UI */}
        <div
          className={`z-10 w-full max-w-3xl text-center space-y-16 transition-all duration-500 ease-out ${
            showMemories ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {showGiftAsk ? (
            /* Gift wish: type and it reaches partner */
            <div className="space-y-8 animate-fade-in w-full max-w-lg mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-rose-50 italic">
                What gift do you want for this special day?
              </h2>
              <p className="text-white/70 text-sm">
                Type below — your wish is saved and he can view it.
              </p>
              {!giftSubmitted ? (
                <form onSubmit={handleGiftSubmit} className="flex flex-col gap-4">
                  <textarea
                    value={giftWish}
                    onChange={(e) => setGiftWish(e.target.value)}
                    placeholder="Type the gift you want..."
                    className="w-full min-h-[140px] px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none text-lg"
                    maxLength={500}
                    disabled={giftSending}
                  />
                  <button
                    type="submit"
                    disabled={!giftWish.trim() || giftSending}
                    className="py-4 px-8 rounded-2xl bg-rose-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors flex items-center justify-center gap-2"
                  >
                    {giftSending ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send to him'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <p className="text-white/90 text-lg font-medium">Your gift wish:</p>
                  <p className="text-rose-100 bg-white/10 rounded-2xl p-5 text-left border border-white/20 text-lg">
                    {giftWish.trim()}
                  </p>
                  <p className="text-rose-200/90 text-sm">
                    {usedMailtoFallback
                      ? "Your email app opened — hit Send so he gets your wish."
                      : "Sent. He can view your wish."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300 font-black">
                    Proposal Protocol
                  </span>
                </div>
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-[0.85]">
                  Will You <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500">
                    Be Mine?
                  </span>
                </h1>
              </div>

              {!proposalAccepted ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative min-h-[140px]">
                  <button
                    onClick={handleYes}
                    className="group relative px-16 md:px-20 py-6 md:py-8 bg-rose-600 hover:bg-rose-500 rounded-[2.5rem] font-black text-2xl md:text-3xl transition-all hover:scale-110 hover:shadow-[0_0_80px_rgba(225,29,72,0.6)] active:scale-95 z-20"
                  >
                    YES
                    <Heart
                      className="absolute -top-3 -right-3 text-white fill-white group-hover:animate-bounce"
                      size={28}
                    />
                  </button>
                  <div
                    className="transition-transform duration-200 ease-out z-10"
                    style={{ transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)` }}
                  >
                    <button
                      onMouseEnter={moveNoButton}
                      onClick={handleNoClick}
                      className="px-10 md:px-14 py-5 md:py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-bold text-lg md:text-xl text-white/30 transition-all duration-200 hover:bg-white/10 hover:text-white"
                    >
                      {noButtonText}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-zoom-in-50">
                  <div className="text-4xl md:text-5xl font-black text-rose-100 italic">
                    I KNEW IT! ❤️
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-[2px] bg-rose-500/30" />
                    <p className="text-white/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse">
                      Launching Cinematic Experience
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Login screen (Vault)
  return (
    <div className="min-h-screen w-full bg-[#0a0507] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans cursor-default">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-rose-500 animate-petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          >
            🌹
          </div>
        ))}
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="relative w-full aspect-[1/1.9] bg-[#0e0a0b] rounded-[5rem] shadow-[0_80px_160px_-30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col border-[1px] border-rose-500/20">
          <div className="relative flex-[1.4] overflow-hidden bg-[#1a0f12]">
            <div
              className="absolute inset-0 opacity-20 transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${roomScale})`,
                border: '40px solid #2a1a1e',
                borderBottomWidth: '100px',
              }}
            />
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="absolute z-20 transition-all duration-1000"
                style={{ top: `${manTopOffset}px`, left: '50%', marginLeft: '-110px' }}
              >
                <img
                  src="https://r2.erweima.ai/i/pM-lRofDRzCxG6yT0B-h5A.png"
                  alt=""
                  className="h-[220px] object-contain"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
              <div
                className={`absolute bottom-20 transition-all duration-1000 z-30 ${
                  progress === 1 ? 'scale-150 opacity-100' : 'scale-0 opacity-0'
                }`}
              >
                <Heart className="text-rose-500 fill-rose-500 w-20 h-20 drop-shadow-[0_0_40px_rgba(225,29,72,1)] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/[0.04] backdrop-blur-3xl px-10 pt-8 pb-14 flex flex-col items-center relative border-t border-rose-500/20">
            <h2 className="text-4xl font-black text-white mb-6 tracking-tighter italic text-center">
              Keyphrase.
            </h2>
            <div className="w-full relative mb-10 flex justify-center items-center gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`relative transition-all duration-500 rounded-xl h-10 w-10 flex items-center justify-center border ${
                    password.length > i
                      ? 'bg-rose-600 border-rose-400'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {password.length > i && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              ))}
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={password}
                onChange={handlePasswordChange}
                className="absolute inset-0 opacity-0 cursor-pointer caret-transparent"
              />
            </div>
            <button
              onClick={handleUnlock}
              disabled={password.length < 4 || isLoading}
              className={`group relative w-full h-[74px] rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-700 ${
                password.length === 4
                  ? 'bg-rose-600 text-white'
                  : 'bg-white/5 text-white/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-sm font-black uppercase tracking-[0.3em]">
                  Unlock Proposal
                </span>
              )}
            </button>
            {error && (
              <div className="absolute bottom-6 flex items-center gap-2 animate-shake">
                <ShieldAlert size={12} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">
                  Access Denied
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
