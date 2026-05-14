'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, Gift, Sparkles } from 'lucide-react'

interface Coupon {
  code: string
  discountValue: number
  discountType: 'PERCENT' | 'FIXED'
  expiryDate: string
}

const PRIZES = [
  { label: '💔 ESSAYEZ', color: '#0f172a', textColor: '#64748b', win: false },
  { label: '🎁 GAGNÉ !', color: '#059669', textColor: '#ffffff', win: true },
  { label: '🔄 REJOUEZ', color: '#0f172a', textColor: '#64748b', win: false },
  { label: '🌟 SUPER LOT', color: '#10b981', textColor: '#ffffff', win: true },
  { label: '💔 ESSAYEZ', color: '#0f172a', textColor: '#64748b', win: false },
  { label: '💎 GAGNÉ !', color: '#059669', textColor: '#ffffff', win: true },
  { label: '🔄 REJOUEZ', color: '#0f172a', textColor: '#64748b', win: false },
  { label: '🔥 MEGA LOT', color: '#10b981', textColor: '#ffffff', win: true },
]

export default function WheelOfFortune() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [activeCoupons, setActiveCoupons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const wheelRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (pathname !== '/') return
    const fetchActiveCoupons = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api'
        const response = await fetch(`${baseUrl}/v1/coupons/active`)
        if (response.ok) {
            const data = await response.json()
            setActiveCoupons(data || [])
        }
      } catch (error) {
        console.error("Wiki Wheel: Coupons API error", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fallback security to ensure it shows up
    const timer = setTimeout(() => setIsLoading(false), 2000);

    const checkCooldown = (userEmail: string) => {
      const lastSpin = localStorage.getItem(`wiki_wheel_last_spin_${userEmail}`)
      if (lastSpin) {
        const hoursSinceLastSpin = (Date.now() - parseInt(lastSpin)) / (1000 * 60 * 60)
        if (hoursSinceLastSpin < 24) setHasPlayed(true)
        else setHasPlayed(false)
      } else {
        setHasPlayed(false)
      }
    }

    const initSession = async () => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      if (token) {
        try {
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(window.atob(base64))
          // Get any unique identifier (email, sub, username)
          const identifier = payload.sub || payload.email || payload.username || payload.name
          if (identifier) {
            setEmail(identifier) // Re-using state 'email' to store the identifier
            checkCooldown(identifier)
          }
        } catch (e) {}

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api'
          const response = await fetch(`${baseUrl}/v1/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            const user = await response.json()
            const identifier = user.email || user.username || user.login
            if (identifier) {
              setEmail(identifier)
              checkCooldown(identifier)
            }
          }
        } catch (error) {}
      }
    }

    fetchActiveCoupons()
    initSession()
  }, [pathname]) // Re-check session on page changes or when navigating back to home

  const spin = async () => {
    if (isSpinning || hasPlayed || !email) return

    setIsSpinning(true)
    const roll = Math.floor(Math.random() * 100) + 1
    const isWinner = roll <= 8
    
    let winningIndex: number
    if (isWinner) winningIndex = [1, 3, 5, 7][Math.floor(Math.random() * 4)]
    else winningIndex = [0, 2, 4, 6][Math.floor(Math.random() * 4)]
    
    const sliceAngle = 360 / PRIZES.length
    const extraSpins = 10 + Math.floor(Math.random() * 5)
    // Adjust to land in the middle of the slice (offset by sliceAngle / 2)
    // The SVG rotates clockwise, but we want to point to the top (270 deg in SVG polar)
    const targetRotation = (360 * extraSpins) + (winningIndex * sliceAngle)
    
    setRotation(targetRotation)

    setTimeout(async () => {
      setIsSpinning(false)
      setResult(PRIZES[winningIndex])
      
      if (isWinner) {
        try {
          const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api'
          const response = await fetch(`${baseUrl}/v1/coupons/win`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
          })
          if (response.ok) {
            const data = await response.json()
            if (data.code) {
              setWonCoupon({
                code: data.code,
                discountValue: data.discountValue,
                discountType: data.discountType,
                expiryDate: data.expiryDate !== 'N/A' ? new Date(data.expiryDate).toLocaleDateString('fr-FR') : 'Sans expiration'
              })
            }
          }
        } catch (error) {}
      }

      localStorage.setItem(`wiki_wheel_last_spin_${email}`, Date.now().toString())
      setHasPlayed(true)
    }, 5000)
  }

  if (isLoading) return null;
  const isHome = pathname === '/' || pathname === '' || pathname === '/index';
  if (!isHome) return null;

  const renderSlices = () => {
    const size = 300
    const center = size / 2
    const radius = size / 2 - 10
    const angleStep = 360 / PRIZES.length

    return PRIZES.map((prize, i) => {
      const startAngle = i * angleStep
      const endAngle = (i + 1) * angleStep
      
      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180)
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180)
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180)
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180)

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`
      
      const midAngle = startAngle + angleStep / 2
      const textRadius = radius * 0.7
      const tx = center + textRadius * Math.cos((Math.PI * midAngle) / 180)
      const ty = center + textRadius * Math.sin((Math.PI * midAngle) / 180)

      return (
        <g key={i}>
          <path d={pathData} fill={prize.color} stroke="#1e293b" strokeWidth="1" />
          <text
            x={tx}
            y={ty}
            fill={prize.textColor}
            fontSize="9"
            fontWeight="900"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${midAngle}, ${tx}, ${ty})`}
            className="italic select-none"
            style={{ textShadow: prize.win ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}
          >
            {prize.label}
          </text>
        </g>
      )
    })
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[99] group flex items-center gap-3 bg-[#059669] text-white p-1.5 pr-4 md:p-2 md:pr-6 rounded-full shadow-[0_20px_50px_rgba(5,150,105,0.3)] hover:scale-110 transition-all duration-500 animate-bounce"
        >
          <div className="w-9 h-9 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Gift className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
          </div>
          <span className="font-bold text-xs md:text-sm tracking-tight">Cadeau surprise !</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg bg-[#0f172a] rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-[0_0_100px_rgba(16,185,129,0.1)] border border-slate-800 text-center overflow-y-auto max-h-[95vh]">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-3 hover:bg-slate-800 rounded-2xl transition-all group"
            >
              <X size={24} className="text-slate-500 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>

            <div className="mb-4 md:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <Sparkles size={12} /> Wiki Gamification
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight italic uppercase">Roue de la chance</h2>
              <p className="hidden md:block text-slate-400 font-medium max-w-[280px] mx-auto text-sm leading-relaxed">
                Tentez de remporter un coupon de réduction exclusif Wiki.tn !
              </p>
            </div>

            <div className="relative w-[240px] h-[240px] md:w-[320px] md:h-[320px] mx-auto mb-6 md:mb-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                <div className="w-6 h-8 bg-emerald-500 rounded-b-xl shadow-[0_5px_15px_rgba(16,185,129,0.4)]" />
              </div>

              <svg 
                viewBox="0 0 300 300" 
                className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${-rotation - 90 - (360/PRIZES.length/2)}deg)` }}
              >
                {renderSlices()}
                <circle cx="150" cy="150" r="25" fill="#0f172a" stroke="#1e293b" strokeWidth="4" />
                <circle cx="150" cy="150" r="6" fill="#10b981" className="animate-pulse" />
              </svg>
            </div>

            {result ? (
              <div className="animate-in zoom-in-95 duration-700">
                {result.win ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_15px_30px_rgba(16,185,129,0.3)]">
                      <Trophy size={32} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 italic uppercase">Bravo !</h3>
                    <p className="text-emerald-500/80 font-bold mb-6 text-sm">C'est gagné ! Coupon envoyé à <br/> <span className="text-emerald-400">{email}</span></p>
                    <div className="bg-slate-900/50 border-2 border-dashed border-emerald-500/30 p-5 rounded-2xl">
                       <span className="text-3xl font-black text-white tracking-[0.3em]">{wonCoupon?.code || 'ENVOI...'}</span>
                    </div>
                    {wonCoupon && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Expire le : {wonCoupon.expiryDate}
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border border-slate-800 rounded-[2.5rem] p-8">
                    <h3 className="text-2xl font-bold text-white mb-2 uppercase italic">Pas cette fois !</h3>
                    <p className="text-slate-500 text-sm mb-4 leading-relaxed">C'était tout proche... <br/> Revenez demain pour retenter votre chance !</p>
                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] bg-emerald-500/5 py-3 rounded-2xl border border-emerald-500/10">
                       Prochain essai disponible dans 24h
                    </div>
                  </div>
                )}
              </div>
            ) : hasPlayed ? (
                <div className="bg-slate-800/50 border border-slate-800 rounded-[2.5rem] p-10 animate-in fade-in">
                    <h3 className="text-xl font-bold text-white uppercase italic">Déjà tenté !</h3>
                    <p className="text-slate-500 text-sm mt-3 leading-relaxed">Chaque utilisateur a droit à un essai par 24h. <br/> À demain pour une nouvelle chance !</p>
                </div>
            ) : !email ? (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10">
                    <p className="text-slate-300 font-medium mb-6">Vous devez être connecté pour faire tourner la roue et recevoir votre cadeau.</p>
                    <button 
                        onClick={() => window.location.href = '/auth/login'}
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg"
                    >
                        SE CONNECTER
                    </button>
                </div>
            ) : (
              <button
                onClick={spin}
                disabled={isSpinning}
                className="w-full h-14 md:h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base md:text-xl rounded-2xl md:rounded-[2rem] shadow-[0_20px_40px_rgba(5,150,105,0.2)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 md:gap-4 group"
              >
                {isSpinning ? (
                   <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                ) : (
                  <>
                    <Sparkles className="group-hover:rotate-12 transition-transform duration-500" />
                    LANCER LA ROUE
                    <Sparkles className="group-hover:-rotate-12 transition-transform duration-500" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Trophy({ className, size }: { className?: string, size: number }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}
