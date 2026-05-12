'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import HeaderTop from '@/common/components/layouts/HeaderTop'
import HeaderBottom from '@/common/components/layouts/HeaderBottom'
import Footer from '@/common/components/layouts/Footer'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Package, Truck, CheckCircle, Clock, Search, AlertCircle, ShoppingBag, MapPin, Check, X } from 'lucide-react'

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // New: Recent orders for logged-in users
    const [myOrders, setMyOrders] = useState<any[]>([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [recentTracks, setRecentTracks] = useState<any[]>([])

    // Load recent tracks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recent_tracks')
        if (saved) {
            try {
                setRecentTracks(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse recent tracks")
            }
        }
    }, [])

    const saveToRecent = useCallback((id: string, mail: string, status: string, total: number) => {
        setRecentTracks(prev => {
            const newTrack = { id, email: mail, status, total, timestamp: Date.now() }
            const updated = [newTrack, ...prev.filter(t => t.id !== id)].slice(0, 3)
            localStorage.setItem('recent_tracks', JSON.stringify(updated))
            return updated
        })
    }, []);

  const fetchMyOrders = useCallback(async (token: string, mail?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8089/api'
      const response = await fetch(`${baseUrl}/v1/orders/my`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyOrders(data)
      }
    } catch (err) {
      console.error("❌ Network error fetching orders:", err)
    }
  }, []);

  const performTrack = useCallback(async (id: string, mail: string) => {
    if (!id || !mail) {
      setError("Informations manquantes pour le suivi.")
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)
    
    try {
      const token = localStorage.getItem('accessToken')
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8089/api'}/v1/orders/public/track?id=${id}&email=${mail}`
      const headers: any = {}

      if (token) {
        url = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8089/api'}/v1/orders/${id}`
        headers['Authorization'] = `Bearer ${token}`
      }

      console.log(`📡 Tentative de suivi (${token ? 'AUTH' : 'PUBLIC'}): ID=${id}`)
      
      const res = await fetch(url, { headers })
      const data = await res.json()

      if (res.ok) {
        setOrder(data)
        saveToRecent(id, mail || data.userEmail || '', data.status, data.totalAmount)
        setTimeout(() => {
          const el = document.getElementById('order-details-root')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        setError(data.error || 'Commande introuvable. Vérifiez l\'ID et l\'Email.')
      }
    } catch (err) {
      console.error("❌ Erreur API Suivi:", err)
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [saveToRecent]);

  // Safe date formatter to handle Spring Boot LocalDateTime arrays or ISO strings
  const formatDateSafely = (dateInput: any) => {
      if (!dateInput) return '--/--/----';
      try {
          let date;
          if (Array.isArray(dateInput)) {
              date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
          } else {
              date = new Date(dateInput);
          }
          if (isNaN(date.getTime())) return '--/--/----';
          return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
          return '--/--/----';
      }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    
    if (token) {
      setIsLoggedIn(true)
      const decoded = decodeToken(token)
      const emailFromToken = decoded?.sub || decoded?.email
      
      if (emailFromToken) {
        setEmail(emailFromToken)
        fetchMyOrders(token, emailFromToken)
      } else {
        fetchMyOrders(token)
      }
    }

    const sOrderId = searchParams.get('orderId')
    const sEmail = searchParams.get('email')
    if (sOrderId && sEmail) {
      performTrack(sOrderId, sEmail)
    }
  }, [searchParams, performTrack, fetchMyOrders])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    performTrack(orderId, email)
  }

  const getStatusStep = (status: string) => {
    const steps = {
      PENDING: 1,
      CONFIRMED: 1,
      ARTICLE_BEING_PURCHASED: 2,
      PC_BEING_ASSEMBLED: 2,
      ORDER_BEING_PICKED_UP: 2,
      SHIPPED: 3,
      IN_DELIVERY_ARAMEX: 3,
      IN_DELIVERY_OWN_MEANS: 3,
      DELIVERED: 4,
      DELIVERED_TO_STORE: 4,
      ORDER_ARRIVED_AT_STORE: 4,
    }
    return (steps as any)[status] || 1
  }

  const currentStep = order ? getStatusStep(order.status) : 0
  const isCancelled = order?.status === 'CANCELLED'

  return (
    <main className="min-h-screen bg-slate-50">
      <HeaderTop />
      <HeaderBottom />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Suivi Élite Wiki</h1>
          <p className="text-slate-500 font-medium">Consultez l&apos;avancement de vos achats en temps réel.</p>
        </div>

        {/* Logged in OR Guest with Recent Tracks */}
        {(isLoggedIn && myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length > 0) || (!isLoggedIn && recentTracks.length > 0) ? (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Package size={14} className="text-emerald-500" /> 
              {isLoggedIn ? "Vos commandes en cours" : "Consultations récentes"}
            </h2>
            
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {(isLoggedIn ? myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') : recentTracks)
                .slice(0, 4)
                .map((o) => {
                  const isCurrent = order?.id.toString() === o.id.toString()
                  return (
                    <button
                      key={o.id}
                      disabled={loading}
                      onClick={() => {
                        const currentToken = localStorage.getItem('accessToken')
                        const decoded = decodeToken(currentToken || '')
                        const mailToUse = email || decoded?.sub || decoded?.email || o.email || ''
                        
                        console.log("🖱️ Sélection commande:", o.id, "Email utilisé:", mailToUse)
                        
                        if (!mailToUse) {
                            setError("Impossible de déterminer l'email associé. Veuillez le saisir manuellement.")
                            return
                        }

                        setOrderId(o.id.toString())
                        setEmail(mailToUse)
                        performTrack(o.id.toString(), mailToUse)
                      }}
                      className={`group relative bg-white rounded-[32px] border p-1 transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-xl ${
                        isCurrent ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-emerald-500/20 scale-[1.02]' : 'border-slate-100 shadow-slate-200/40'
                      } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      <div className={`${isCurrent ? 'bg-emerald-50/30' : 'bg-slate-50/50'} rounded-[30px] p-4 flex flex-col relative overflow-hidden`}>
                        {isCurrent && <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl" />}
                        
                        <div className="relative z-10 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">#{o.id}</p>
                            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />}
                          </div>
                          
                          <p className="text-lg font-black text-slate-900 mb-2">{o.totalAmount?.toLocaleString() || o.total?.toLocaleString()} DT</p>
                          
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                              style={{ width: `${(getStatusStep(o.status) / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          </div>
        ) : null}

        {/* Manual search form - only show if not logged in OR if searching for another order */}
        {(!isLoggedIn || (isLoggedIn && myOrders.length === 0) || order) && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-8 mb-12 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <form onSubmit={handleTrack} className="grid md:grid-cols-3 gap-6 items-end relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Numéro de commande</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ex: 25"
                  className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email de la commande</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-slate-900/20 active:scale-95"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <><Search size={20} /> SUIVRE</>}
              </button>
            </form>

            {error && (
              <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-center gap-3 text-red-600 font-bold animate-shake">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
          </div>
        )}

        {loading && !order && (
            <div className="py-20 flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-4" />
                <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
            </div>
        )}

        {order && (
          <div id="order-details-root" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-mt-10">
            {/* Status Stepper - ELITE PRO VERSION */}
            <div className="bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-900/20 p-10 border border-white/5 relative overflow-hidden group">
              {/* Animated background lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#10b981,transparent_70%)]" />
              </div>
              
              {isCancelled ? (
                <div className="text-center py-4 relative z-10">
                  <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <XCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Commande Annulée</h2>
                  <p className="text-slate-400 mt-2 font-medium">Cette commande a été annulée. Contactez-nous pour toute assistance.</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h2 className="text-white font-black text-xl uppercase italic tracking-tight">État de l&apos;expédition</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Mise à jour en temps réel</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Dernière étape</p>
                        <p className="text-white font-bold text-sm">
                            {currentStep === 1 ? 'Validation' : currentStep === 2 ? 'Préparation' : currentStep === 3 ? 'En route' : 'Livré'}
                        </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute top-[28px] left-0 w-full h-1 bg-white/5 z-0" />
                    <div 
                      className="absolute top-[28px] left-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 z-0 transition-all duration-[2000ms] ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />
                    
                    <div className="relative z-10 flex justify-between items-center">
                      {[
                        { icon: Clock, label: 'Validation' },
                        { icon: Package, label: 'Préparation' },
                        { icon: Truck, label: 'Expédition' },
                        { icon: CheckCircle, label: 'Livraison' }
                      ].map((step, i) => {
                        const isActive = currentStep > i
                        const isCurrent = currentStep === i + 1
                        return (
                          <div key={i} className="flex flex-col items-center gap-4 text-center w-20 sm:w-32">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border-2",
                              isActive ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] scale-110" : "bg-slate-800 border-white/5 text-slate-500",
                              isCurrent && "animate-pulse"
                            )}>
                              <step.icon size={24} />
                            </div>
                            <p className={cn("font-black uppercase tracking-tighter text-[10px] sm:text-xs transition-colors duration-500", isActive ? "text-white" : "text-slate-600")}>
                              {step.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 italic">
                   <ShoppingBag size={22} className="text-emerald-500" /> DÉTAILS DE LA COMMANDE
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Numéro</span>
                    <span className="text-slate-900 font-black">#{order.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Date</span>
                    <span className="text-slate-900 font-bold">{formatDateSafely(order.orderDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Montant Total</span>
                    <span className="text-emerald-600 font-black text-xl">{order.totalAmount?.toLocaleString()} DT</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Paiement</span>
                    <span className="text-slate-900 font-bold uppercase">{order.paymentMethod?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 italic">
                   <Truck size={22} className="text-emerald-500" /> LIVRAISON
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-2">Adresse de livraison</span>
                    <p className="text-slate-900 font-bold leading-relaxed">{order.address}</p>
                    <p className="text-slate-900 font-bold mt-1">{order.postalCode}</p>
                  </div>
                  {order.trackingNumber && (
                    <div className="pt-2">
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-2">Numéro de suivi</span>
                       <p className="text-emerald-600 font-black tracking-widest">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="pt-2">
                       <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-2">Date d&apos;expédition</span>
                       <p className="text-slate-900 font-black">{formatDateSafely(order.shippedAt)}</p>
                    </div>
                  )}
                  <div className="pt-4">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-2">Téléphone</span>
                    <p className="text-slate-900 font-black">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section - ELITE PRO VERSION (Moved up for priority) */}
            {(order.deliveryLatitude || order.address) && (
              <div className={`relative bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border transition-all duration-1000 group ${
                order.status === 'SHIPPED' ? 'border-emerald-500/50 ring-[12px] ring-emerald-500/10' : 'border-white/5'
              }`}>
                {/* Elite Header */}
                <div className={`px-8 py-7 flex items-center justify-between relative z-20 ${order.status === 'SHIPPED' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-slate-800'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${order.status === 'SHIPPED' ? 'bg-white/20 animate-pulse' : 'bg-emerald-500'}`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg uppercase italic tracking-tight">
                        {order.status === 'SHIPPED' ? "Localisation en temps réel" : "Point de chute"}
                      </h3>
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping" />
                         <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                           {order.status === 'SHIPPED' ? "VÉHICULE EN MOUVEMENT" : "DESTINATION VALIDÉE"}
                         </p>
                      </div>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="hidden sm:block px-6 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-inner">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5 text-center">Track ID</p>
                      <p className="text-sm font-black text-white tracking-[0.1em]">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                <div className="w-full h-[500px] relative z-10">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                    loading="lazy"
                    src={
                      order.deliveryLatitude && order.deliveryLongitude 
                      ? `https://www.openstreetmap.org/export/embed.html?bbox=${order.deliveryLongitude - 0.005},${order.deliveryLatitude - 0.005},${order.deliveryLongitude + 0.005},${order.deliveryLatitude + 0.005}&layer=mapnik&marker=${order.deliveryLatitude},${order.deliveryLongitude}`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(order.address + ", " + (order.postalCode || ""))}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                    }
                  />
                  
                  {/* Elite Overlay Info Card */}
                  <div className="absolute bottom-8 left-8 right-8 z-30">
                    <div className="bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[35px] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-bottom-12 duration-1000">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-2xl relative ${order.status === 'SHIPPED' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-slate-800'}`}>
                            <Truck size={36} className={order.status === 'SHIPPED' ? 'animate-bounce' : ''} />
                            {order.status === 'SHIPPED' && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">ADRESSE DE RÉCEPTION</p>
                            <h4 className="text-xl font-black text-white leading-tight mb-1">{order.address}</h4>
                            <p className="text-slate-400 font-bold text-sm">{order.postalCode || '7000'} • TUNISIE, TN</p>
                        </div>

                        <div className="w-full md:w-px h-px md:h-16 bg-white/10" />

                        <div className="flex flex-col items-center md:items-end gap-1">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temps estimé</p>
                             <p className="text-2xl font-black text-white">
                                {order.status === 'SHIPPED' ? '± 25 min' : '-- min'}
                             </p>
                             <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">
                                Prioritaire
                             </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Glassmorphism Decorative Bottom Bar */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-white/20 to-emerald-500 z-40" />
              </div>
            )}

            {/* Order Items Details - PROFESSIONAL CARD VERSION */}
            {order.items && order.items.length > 0 && (
              <div className="relative group animate-in fade-in zoom-in-95 duration-700">
                {/* Background Shadow/Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-[40px] -z-10" />
                
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  {/* Header of the Pro Card */}
                  <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Détails de l&apos;expédition</h3>
                        <p className="text-slate-400 text-[10px] font-bold">{order.items.length} Article(s) vérifié(s)</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-tighter">
                      Réf: WIKI-{order.id}
                    </div>
                  </div>

                  {/* Manifest Content */}
                  <div className="p-8">
                    <div className="grid gap-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-6 group/item">
                          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-2 group-hover/item:border-emerald-200 group-hover/item:shadow-lg group-hover/item:shadow-emerald-500/5 transition-all duration-300">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.imageUrl}`} alt={item.productTitle} className="w-full h-full object-contain" width={80} height={80} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <Package size={32} />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-900 font-black text-base truncate mb-1">{item.productTitle}</h4>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase">Qté: {item.quantity}</span>
                              <span className="text-xs font-bold text-slate-400">{item.price.toLocaleString()} DT / unité</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} <span className="text-[10px]">DT</span></p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Luxury Receipt Divider */}
                    <div className="my-8 flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-slate-100" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="h-[1px] flex-1 bg-slate-100" />
                    </div>

                    {/* Pro Summary Footer */}
                    <div className="bg-slate-50 rounded-[32px] p-6 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Sous-total</span>
                        <span>{(order.totalAmount + (order.discountAmount || 0)).toLocaleString()} DT</span>
                      </div>
                      
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between items-center text-xs font-black text-rose-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Réduction {order.couponCode ? `[${order.couponCode}]` : ''}
                          </span>
                          <span>-{order.discountAmount.toLocaleString()} DT</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Montant Total TTC</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{order.totalAmount.toLocaleString()} <span className="text-sm">DT</span></p>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                           <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                              <Check size={24} strokeWidth={4} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <TrackOrderContent />
    </Suspense>
  )
}

function XCircle({ size, className }: { size: number, className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

function decodeToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
