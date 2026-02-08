import { useState, useEffect } from 'react'
import {
  Heart,
  ShieldAlert,
  Sparkles,
  Car,
  Waves,
  X,
  MapPin,
  Gift,
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

// Sensitive values: stored encoded, resolved at runtime to avoid plain-text in bundle/source.
// This app runs entirely in the browser; determined users can still inspect network/memory.
const _0 = (s: string) => {
  try {
    return (typeof atob !== 'undefined' ? atob : () => '')(s)
  } catch {
    return ''
  }
}
const _1: string[] = [
  'aHR0cHM6Ly93d3cuYW1hem9uLmluL2cvSUVDM0w3NVJTSFRINzdJTz9yZWY9Z2NfZW1haWw=',
  'ZmYxNTBiYzUxNzA0Y2JjMmZiMmY0MTJjMmQ4YTc5YWZiNjIxMmM5ZGZmM2Q2MTI3YzJiMGY5MzdhMzNlYTVlZA==',
]
const _2 = () => _0(_1[0])
const _3 = () => _0(_1[1])

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 30

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const App = () => {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [, setLockoutTick] = useState(0)
  const [proposalAccepted, setProposalAccepted] = useState(false)
  const [showMemories, setShowMemories] = useState(false)
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>('none')

  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const [noButtonText, setNoButtonText] = useState('No')
  const [noTryCount, setNoTryCount] = useState(0)
  const [popupIndex, setPopupIndex] = useState(-1)
  const [suggestionStep, setSuggestionStep] = useState<SuggestionStep>('none')
  const [showGiftAsk, setShowGiftAsk] = useState(false)

  const progress = Math.min(password.length / 4, 1)
  const manTopOffset = -300 + progress * 300
  const roomScale = 1.1 - progress * 0.1
  const now = Math.floor(Date.now() / 1000)
  const isLockedOut = lockoutUntil > now
  const lockoutRemaining = Math.max(0, lockoutUntil - now)

  useEffect(() => {
    if (lockoutUntil <= 0) return
    const id = setInterval(() => {
      const n = Math.floor(Date.now() / 1000)
      if (n >= lockoutUntil) setLockoutUntil(0)
      else setLockoutTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [lockoutUntil])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 4).replace(/[^0-9]/g, '')
    setPassword(val)
    if (error) setError(false)
  }

  const handleUnlock = async () => {
    if (isLockedOut) return
    const trimmed = password.trim()
    if (!trimmed) return
    setIsLoading(true)
    let didUnlock = false
    try {
      const inputHash = await sha256Hex(trimmed)
      if (inputHash === _3()) {
        didUnlock = true
        setTimeout(() => {
          setIsUnlocked(true)
          setIsLoading(false)
        }, 3000)
        return
      }
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 1000)
      const next = failedAttempts + 1
      setFailedAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        setLockoutUntil(now + LOCKOUT_SECONDS)
      }
    } finally {
      if (!didUnlock) setIsLoading(false)
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
    // Keep offset within ±100px so button stays visible on small screens
    setNoButtonPos({
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
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

  if (isUnlocked) {
    return (
      <div className="min-h-screen min-h-dvh w-full bg-gradient-to-br from-[#1a0510] via-[#0d0510] to-[#0a0515] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto font-sans animate-unlock-enter">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-rose-500/25 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] -translate-x-1/2 -translate-y-1/2 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-40 h-40 bg-amber-500/15 blur-[80px] rounded-full pointer-events-none" />

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
                <div className="absolute inset-0 flex items-center justify-center z-30 px-4">
                  <div className="text-center space-y-2 sm:space-y-4">
                    <Waves className="mx-auto text-cyan-300 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-[0.2em] sm:tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-rose-200 drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
                      THE BEGINNING
                    </h2>
                    <p className="text-cyan-100/90 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-xs sm:text-sm font-bold">
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
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-8 sm:pb-16 md:pb-24 px-4 sm:px-6 md:px-8">
                  <div className="w-full max-w-5xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl p-6 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] border border-white/30 shadow-[0_50px_100px_rgba(0,0,0,0.8),0_0_60px_rgba(244,63,94,0.1)] relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/30 blur-[80px] rounded-full" />
                    <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-rose-400">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em]">
                            Destination: Forever
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-white flex items-center justify-center md:justify-start gap-2 sm:gap-4">
                          Night Cruise <Car className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce shrink-0" />
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-white/40">
                          <MapPin size={14} className="shrink-0" />
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest">
                            Passing through Memory Lane
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl md:text-5xl font-black italic text-rose-500">∞</div>
                          <div className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase mt-1">
                            Speed
                          </div>
                        </div>
                        <div className="h-8 sm:h-12 w-[1px] bg-white/10" />
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl md:text-4xl font-black italic text-white">LOVE</div>
                          <div className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase mt-1">
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
              className="absolute top-4 right-4 sm:top-10 sm:right-10 z-[100] p-3 sm:p-5 bg-white/10 hover:bg-rose-600 rounded-full transition-all text-white backdrop-blur-xl group min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-6 h-6 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" size={24} />
            </button>
          </div>
        )}

        {/* Suggestions: one by one from inside screen to surface; blurred bg so user focuses on text */}
        {popupIndex >= 0 && !proposalAccepted && !showMemories && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 pointer-events-none"
            aria-live="polite"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" aria-hidden />
            <p
              key={popupIndex}
              className="relative z-10 text-center text-base sm:text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium max-w-2xl animate-emerge-to-surface px-3 sm:px-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-white to-pink-100"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
            >
              {popupIndex === 6
                ? STILL_DONT_LOVE
                : NO_BUTTON_POPUP_MESSAGES[popupIndex]}
            </p>
          </div>
        )}

        {/* Main UI */}
        <div
          className={`z-10 w-full max-w-3xl text-center space-y-8 sm:space-y-12 md:space-y-16 transition-all duration-500 ease-out px-2 sm:px-4 ${
            showMemories ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {showGiftAsk ? (
            /* Surprise: Amazon gift card link only */
            <div className="animate-fade-in w-full max-w-lg mx-auto px-1">
              <div className="space-y-4 sm:space-y-6 p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-rose-500/25 via-pink-500/20 to-purple-600/25 border-2 border-rose-400/40 shadow-[0_0_60px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-rose-500/30 to-pink-500/30 rounded-full border border-rose-400/30">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-rose-100 uppercase tracking-wider">Surprise for you</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                  You have a surprise!
                </h2>
                <p className="text-white/90 text-sm sm:text-base">
                  A little something for you. Click below to claim it.
                </p>
                <a
                  href={_2()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 py-4 px-6 sm:py-5 sm:px-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-900 font-black text-base sm:text-lg shadow-[0_8px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-100 min-h-[48px] w-full sm:w-auto"
                >
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  Open your gift
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-400/30 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-rose-200 font-black">
                    Proposal Protocol
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter italic leading-[0.9] sm:leading-[0.85] drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  Will You <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-fuchsia-400">
                    Be Mine?
                  </span>
                </h1>
              </div>

              {!proposalAccepted ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 relative min-h-[120px] sm:min-h-[140px]">
                  <button
                    onClick={handleYes}
                    className="group relative px-12 py-5 sm:px-16 sm:py-6 md:px-20 md:py-8 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl md:text-3xl text-white bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-[0_8px_40px_rgba(225,29,72,0.5)] transition-all hover:scale-110 active:scale-95 z-20 border border-rose-400/30 min-h-[48px]"
                  >
                    YES
                    <Heart
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-white fill-white group-hover:animate-bounce w-6 h-6 sm:w-7 sm:h-7"
                    />
                  </button>
                  <div
                    className="transition-transform duration-200 ease-out z-10"
                    style={{ transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)` }}
                  >
                    <button
                      onMouseEnter={moveNoButton}
                      onClick={handleNoClick}
                      className="px-8 py-4 sm:px-10 sm:py-5 md:px-14 md:py-6 bg-white/5 border border-white/20 rounded-[1.5rem] sm:rounded-[2.5rem] font-bold text-base sm:text-lg md:text-xl text-white/40 transition-all duration-200 hover:bg-white/15 hover:text-white hover:border-white/30 min-h-[48px]"
                    >
                      {noButtonText}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 animate-zoom-in-50">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200 italic drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                    I KNEW IT! ❤️
                  </div>
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="w-12 sm:w-16 h-[3px] bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded-full" />
                    <p className="text-rose-300/80 uppercase tracking-[0.4em] sm:tracking-[0.6em] text-[9px] sm:text-[10px] font-black animate-pulse">
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
    <div className="min-h-screen min-h-dvh w-full bg-gradient-to-b from-[#0f0608] via-[#0a0507] to-[#080508] text-white flex items-center justify-center p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto font-sans cursor-default">
      {/* Proposal loading animation (3 sec) when correct key submitted */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#0f0608] to-[#080508] p-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 flex justify-center animate-proposal-heart"
                style={{
                  left: `${10 + (i % 6) * 16}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2.6s',
                }}
              >
                <Heart
                  className="text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                  size={24 + (i % 3) * 12}
                />
              </div>
            ))}
          </div>
          <div className="relative z-10 text-center animate-proposal-text px-4">
            <p className="text-rose-200/90 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-3">
              Unlocking my heart
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
              Preparing your surprise
            </h2>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-rose-900/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-petal"
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
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-900/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] min-w-0 max-h-[100dvh] flex items-center justify-center z-10 my-auto">
        <div className="relative w-full max-h-[100dvh] aspect-[1/1.9] max-w-[min(440px,100vw-1.5rem)] rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[5rem] overflow-hidden flex flex-col border-2 border-rose-500/30 shadow-[0_0_60px_rgba(190,24,93,0.15),0_80px_160px_-30px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#1a0e12] to-[#0e080a]">
          <div className="relative flex-[1.4] min-h-0 overflow-hidden bg-gradient-to-b from-[#2a151c] to-[#1a0f14]">
            <div
              className="absolute inset-0 opacity-20 transition-transform duration-1000 ease-out"
              style={{
                transform: `scale(${roomScale})`,
                border: 'min(40px, 8vw) solid #2a1a1e',
                borderBottomWidth: 'min(100px, 18vw)',
              }}
            />
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="absolute z-20 transition-all duration-1000"
                style={{ top: `${manTopOffset}px`, left: '50%', marginLeft: 'min(-110px, -25vw)' }}
              >
                <img
                  src="https://r2.erweima.ai/i/pM-lRofDRzCxG6yT0B-h5A.png"
                  alt=""
                  className="h-[140px] sm:h-[200px] md:h-[220px] object-contain"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
              <div
                className={`absolute bottom-12 sm:bottom-20 transition-all duration-1000 z-30 ${
                  progress === 1 ? 'scale-150 opacity-100' : 'scale-0 opacity-0'
                }`}
              >
                <Heart className="text-rose-500 fill-rose-500 w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_0_40px_rgba(225,29,72,1)] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-gradient-to-b from-rose-950/20 to-black/40 backdrop-blur-3xl px-5 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-10 md:px-10 md:pt-8 md:pb-14 flex flex-col items-center justify-center relative border-t border-rose-500/30">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-rose-200 to-pink-200 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tighter italic text-center drop-shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              Keyphrase.
            </h2>
            <div className="w-full relative mb-6 sm:mb-10 flex justify-center items-center gap-2 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`relative transition-all duration-500 rounded-lg sm:rounded-xl h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center border-2 ${
                    password.length > i
                      ? 'bg-gradient-to-b from-rose-500 to-rose-600 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  {password.length > i && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </div>
              ))}
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={password}
                onChange={handlePasswordChange}
                className="absolute inset-0 opacity-0 cursor-pointer caret-transparent min-w-[120px]"
              />
            </div>
            {isLockedOut && (
              <p className="text-rose-400/90 text-xs sm:text-sm font-medium mb-2 text-center">
                Too many attempts. Try again in {lockoutRemaining}s.
              </p>
            )}
            <button
              onClick={handleUnlock}
              disabled={password.length < 4 || isLoading || isLockedOut}
              className={`group relative w-full min-h-[52px] sm:min-h-[64px] md:h-[74px] rounded-xl sm:rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-700 border-2 ${
                password.length === 4 && !isLockedOut
                  ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border-rose-400/50 shadow-[0_8px_30px_rgba(244,63,94,0.35)] hover:shadow-[0_8px_40px_rgba(244,63,94,0.45)]'
                  : 'bg-white/5 text-white/20 border-white/10'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLockedOut ? (
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/50">
                  Locked
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  Unlock Proposal
                </span>
              )}
            </button>
            {error && (
              <div className="absolute bottom-3 sm:bottom-6 flex items-center gap-2 animate-shake">
                <ShieldAlert size={12} className="text-rose-500 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-rose-500">
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
