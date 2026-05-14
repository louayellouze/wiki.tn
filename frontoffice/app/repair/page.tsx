'use client'

import React, { useEffect, useState } from 'react';
import HeaderTop from '@/common/components/layouts/HeaderTop';
import HeaderBottom from '@/common/components/layouts/HeaderBottom';
import Footer from '@/common/components/layouts/Footer';
import { repairService } from '@/common/services/repairService';
import { AuthService } from '@/common/services/authService';
import { RepairItem, RepairRequest } from '@/app/dtos/repair';
import * as Icons from 'lucide-react';
import Image from 'next/image';

const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (Icons as any)[name];
    if (!IconComponent) return <Icons.HelpCircle size={size} className={className} />;
    return <IconComponent size={size} className={className} />;
};

export default function RepairPage() {
    const [pageData, setPageData] = useState<{ [key: string]: RepairItem[] }>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('');
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    
    // Form state — persisté en sessionStorage pour ne pas perdre les données
    const [formData, setFormData] = useState<Partial<RepairRequest>>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('repair_form_draft');
            if (saved) return JSON.parse(saved);
        }
        return { subject: '', status: 'PENDING' };
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const updateForm = (updates: Partial<RepairRequest>) => {
        const next = { ...formData, ...updates };
        setFormData(next);
        sessionStorage.setItem('repair_form_draft', JSON.stringify(next));
    };

    // Pré-remplir le formulaire avec les données de l'utilisateur connecté
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        setIsLoggedIn(true);

        // Ne pré-remplir que si le formulaire est vide (pas de brouillon sauvegardé)
        const draft = sessionStorage.getItem('repair_form_draft');
        const hasDraft = draft && JSON.parse(draft).firstName;
        if (hasDraft) return;

        AuthService.getCurrentUser()
            .then(user => {
                const prefilled: Partial<RepairRequest> = {
                    firstName: user.firstName || '',
                    lastName:  user.lastName  || '',
                    email:     user.email     || '',
                    phone:     user.phone     || '',
                    status:    'PENDING',
                };
                setFormData(prefilled);
                sessionStorage.setItem('repair_form_draft', JSON.stringify(prefilled));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const items = await repairService.getRepairItems();
                const grouped = items.reduce((acc, item) => {
                    if (!acc[item.section]) acc[item.section] = [];
                    acc[item.section].push(item);
                    return acc;
                }, {} as { [key: string]: RepairItem[] });
                
                setPageData(grouped);
                
                if (grouped['DIAGNOSIS']?.length > 0) {
                    setActiveTab(grouped['DIAGNOSIS'][0].title);
                }
                if (grouped['DEVICE']?.length > 0) {
                    setSelectedDevice(grouped['DEVICE'][0].title);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await repairService.submitRepairRequest({
                ...formData,
                deviceType: selectedDevice
            });
            alert("Votre demande a été envoyée avec succès ! Notre équipe vous contactera sous peu.");
            setFormData({ subject: '', status: 'PENDING' });
            sessionStorage.removeItem('repair_form_draft');
        } catch (error) {
            alert("Une erreur est survenue lors de l'envoi de votre demande.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement de Wiki Repair...</div>;

    const hero = pageData['HERO']?.[0];
    const about = pageData['ABOUT']?.[0];
    const certifications = pageData['CERTIFICATION'] || [];
    const services = pageData['SERVICE'] || [];
    const devices = pageData['DEVICE'] || [];
    const diagnosisTabs = pageData['DIAGNOSIS'] || [];
    const priceCards = (pageData['PRICE_CARD'] || []).filter(card => 
        card.subtitle === activeTab && 
        (!card.targetDevice || card.targetDevice === selectedDevice)
    );
    const objectives = pageData['OBJECTIVE'] || [];

    return (
        <main className="bg-white min-h-screen font-sans">
            <HeaderTop />
            <HeaderBottom />

            {/* Hero Section */}
            {hero && (
                <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 bg-gradient-to-br from-slate-50 to-white">
                    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                            <div className="flex justify-center lg:justify-start">
                                {hero.logoUrl && (
                                    <Image 
                                        src={hero.logoUrl} 
                                        alt="Wiki Repair Logo" 
                                        width={200}
                                        height={112}
                                        className="h-20 lg:h-28 w-auto drop-shadow-xl animate-in zoom-in duration-700"
                                    />
                                )}
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-800">
                                {hero.subtitle?.split('Wiki Repair').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="text-wiki">Wiki Repair</span>}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight">
                                {hero.title}
                            </h1>
                            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed whitespace-pre-line">
                                {hero.description}
                            </p>
                            <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button 
                                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-10 py-5 bg-wiki hover:bg-wiki-dark text-white rounded-2xl font-black text-lg shadow-xl shadow-wiki/30 transition-all hover:scale-105 active:scale-95"
                                >
                                    Faire une demande
                                </button>
                                <a 
                                    href="tel:22414444"
                                    className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-700 hover:border-wiki hover:text-wiki rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-sm"
                                >
                                    <Icons.Phone size={20} /> Appelez-nous
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-200">
                            {hero.imageUrl && (
                                <>
                                    <div className="absolute inset-0 bg-wiki/10 rounded-[3rem] rotate-3 -z-10 blur-2xl"></div>
                                    <Image 
                                        src={hero.imageUrl} 
                                        alt="Wiki Repair" 
                                        width={800}
                                        height={600}
                                        className="rounded-[3rem] shadow-2xl w-full object-cover transition-transform hover:scale-[1.02] duration-500" 
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* About Section */}
            {about && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-20 items-center">
                            <div className="w-full lg:w-1/2 relative">
                                {about.imageUrl && (
                                    <Image src={about.imageUrl} alt="About" className="rounded-3xl shadow-xl w-full" width={800} height={600} />
                                )}
                                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-wiki/10 hidden lg:block max-w-[280px] z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-wiki/10 p-2.5 rounded-xl text-wiki">
                                            <Icons.ArrowRight size={20} className="bg-wiki/20 rounded-full p-0.5" />
                                        </div>
                                        <h4 className="font-black text-slate-900 leading-tight">Réparez avec Confiance</h4>
                                    </div>
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                        Grâce à cette exigence et à notre savoir-faire technique, nous vous assurons des interventions rapides, durables et conformes aux meilleures pratiques du secteur.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 space-y-10">
                                <div className="space-y-4">
                                    <div className="h-1.5 w-24 bg-wiki rounded-full"></div>
                                    <h2 className="text-4xl font-black text-slate-900">{about.title}</h2>
                                </div>
                                <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-wiki/30 pl-6">
                                    {about.description}
                                </p>
                                
                                <div className="space-y-8 pt-4">
                                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <Icons.Award className="text-wiki" /> Exigences Qualité & Certifications
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {certifications.map(cert => (
                                            <div key={cert.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default border border-slate-200">
                                                <span className="font-bold text-slate-700">{cert.title}</span>
                                                <Icons.CheckCircle2 className="text-wiki" size={20} />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="px-8 py-4 bg-wiki text-white rounded-xl font-bold shadow-lg shadow-wiki/20 hover:opacity-90 transition-opacity">
                                        Contactez Nous
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <h3 className="text-wiki font-bold tracking-[0.3em] uppercase">Nos Services</h3>
                        <h2 className="text-4xl font-black text-slate-900">Des solutions adaptées à chaque besoin</h2>
                        <div className="h-1.5 w-32 bg-wiki mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map(service => (
                            <div key={service.id} className="group bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 flex flex-col items-center text-center">
                                <div className="mb-8 p-5 rounded-3xl bg-slate-50 text-slate-400 group-hover:bg-wiki/10 group-hover:text-wiki transition-all duration-500 shadow-inner">
                                    <DynamicIcon name={service.iconName || 'Settings'} size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-6">{service.title}</h4>
                                <div className="text-slate-500 leading-relaxed text-[13px] font-medium space-y-3">
                                    {service.description?.split('. ').map((point, idx) => (
                                        <p key={idx} className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-wiki/30 mt-2 shrink-0"></span>
                                            {point}{!point.endsWith('.') && point.length > 0 ? '.' : ''}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Diagnostic & Pricing Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center justify-center mb-16 space-y-6">
                        <h2 className="text-3xl font-black flex items-center gap-3">
                            Choisissez votre appareil : <span className="text-wiki">{selectedDevice}</span>
                        </h2>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 w-full max-w-4xl">
                            {devices.map(device => (
                                <button 
                                    key={device.id}
                                    onClick={() => setSelectedDevice(device.title)}
                                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl transition-all duration-300 border-2 ${selectedDevice === device.title ? 'bg-wiki/5 border-wiki shadow-lg' : 'bg-white border-transparent hover:bg-slate-50'}`}
                                >
                                    <DynamicIcon name={device.iconName || 'Smartphone'} size={48} className={selectedDevice === device.title ? 'text-wiki' : 'text-slate-400'} />
                                    <span className={`text-xs font-bold ${selectedDevice === device.title ? 'text-wiki' : 'text-slate-500'}`}>{device.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {diagnosisTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.title)}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === tab.title ? 'bg-wiki text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    <div className="text-center mb-12 animate-in fade-in duration-700">
                        <h3 className="text-2xl font-serif text-slate-700 italic">&quot; {diagnosisTabs.find(t => t.title === activeTab)?.description || "Un Bon Diagnostic, C'est Déjà La Moitié De La Réparation !"} &quot;</h3>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        {priceCards.map(card => (
                            <div key={card.id} className="flex flex-col sm:flex-row items-center justify-between p-8 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                    <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-wiki/10 group-hover:text-wiki transition-colors">
                                        <Icons.Search size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-900">{card.title}</h4>
                                        <p className="text-slate-500">{card.description}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center sm:items-end gap-4 min-w-[150px]">
                                    <div className="text-3xl font-black text-wiki">
                                        {card.price} <span className="text-sm font-bold uppercase ml-1">DT</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, subject: `Réparation: ${card.title} (${activeTab})` }));
                                            document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-wiki transition-colors flex items-center gap-2 group/btn"
                                    >
                                        Choisir <Icons.ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Objectives Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-wiki font-bold tracking-[0.3em] uppercase">Nos Objectifs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {objectives.map(obj => (
                            <div key={obj.id} className="bg-white p-10 rounded-3xl flex flex-col items-center text-center shadow-sm border border-slate-100">
                                <div className="mb-6 bg-wiki/5 p-4 rounded-2xl text-wiki">
                                    <DynamicIcon name={obj.iconName || 'Activity'} size={40} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-3">{obj.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{obj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section (How it works) */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <h3 className="text-wiki font-bold tracking-[0.3em] uppercase text-sm">Le Parcours</h3>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900">Comment ça marche ?</h2>
                        <div className="h-1.5 w-24 bg-wiki mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1 bg-slate-100 -z-10"></div>
                        
                        {(pageData['PROCESS'] || []).map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center text-center px-4 md:px-8 relative group">
                                <div className="w-28 h-28 rounded-[2.5rem] bg-white border-8 border-slate-50 flex items-center justify-center text-wiki shadow-xl group-hover:rotate-6 group-hover:bg-wiki group-hover:text-white transition-all duration-500 mb-10 z-10">
                                    <DynamicIcon name={step.iconName || 'Settings'} size={40} />
                                    <div className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-lg ring-4 ring-white shadow-xl">
                                        {idx + 1}
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h4>
                                <p className="text-slate-500 leading-relaxed max-w-xs">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact & Repair Form Section */}
            <section id="contact-form" className="py-24 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20">
                        {/* Form Side */}
                        <div className="lg:w-2/3 space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-slate-900">Comment pouvons-nous vous aider ?</h2>
                                <p className="text-slate-500 text-lg">
                                    Une question ou un commentaire ? Remplissez le formulaire ci-dessous, et nous vous répondrons dans les plus brefs délais. Notre équipe est à votre écoute.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-5 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100">

                                {/* Badge connecté */}
                                {isLoggedIn && (
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm text-emerald-700 font-semibold">
                                        <Icons.CheckCircle2 size={16} />
                                        Vos informations ont été pré-remplies depuis votre compte
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Nom <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" required placeholder="Votre Nom"
                                            value={formData.lastName || ''}
                                            readOnly={isLoggedIn}
                                            className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl border outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400 ${isLoggedIn ? 'bg-emerald-50 border-emerald-200 cursor-default' : 'bg-white border-slate-200 focus:border-wiki'}`}
                                            onChange={(e) => !isLoggedIn && updateForm({ lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Prénom <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" required placeholder="Votre Prénom"
                                            value={formData.firstName || ''}
                                            readOnly={isLoggedIn}
                                            className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl border outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400 ${isLoggedIn ? 'bg-emerald-50 border-emerald-200 cursor-default' : 'bg-white border-slate-200 focus:border-wiki'}`}
                                            onChange={(e) => !isLoggedIn && updateForm({ firstName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email" required placeholder="Votre email"
                                        value={formData.email || ''}
                                        readOnly={isLoggedIn}
                                        className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl border outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400 ${isLoggedIn ? 'bg-emerald-50 border-emerald-200 cursor-default' : 'bg-white border-slate-200 focus:border-wiki'}`}
                                        onChange={(e) => !isLoggedIn && updateForm({ email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Téléphone <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel" required placeholder="Votre numéro de téléphone"
                                        value={formData.phone || ''}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400"
                                        onChange={(e) => updateForm({ phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Objet de la demande <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formData.subject || ''}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base appearance-none"
                                        onChange={(e) => updateForm({ subject: e.target.value })}
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="Réparation">Réparation</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Recyclage">Recyclage</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900 ml-1">Message <span className="text-red-500">*</span></label>
                                    <textarea
                                        required placeholder="Décrivez votre problème..." rows={5}
                                        value={formData.message || ''}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400"
                                        onChange={(e) => updateForm({ message: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Type d&apos;appareil</label>
                                        <input
                                            type="text" placeholder="Ex: Smartphone, Ordinateur..." value={selectedDevice}
                                            readOnly
                                            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none shadow-sm text-slate-700 text-base cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Marque</label>
                                        <input
                                            type="text" placeholder="Ex: Apple, Samsung..."
                                            value={formData.brand || ''}
                                            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400"
                                            onChange={(e) => updateForm({ brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Modèle</label>
                                        <input
                                            type="text" placeholder="Ex: iPhone 13, MacBook Pro..."
                                            value={formData.model || ''}
                                            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400"
                                            onChange={(e) => updateForm({ model: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-900 ml-1">Numéro de série</label>
                                        <input
                                            type="text" placeholder="Si disponible..."
                                            value={formData.serialNumber || ''}
                                            className="w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white border border-slate-200 focus:border-wiki outline-none transition-all shadow-sm text-slate-900 text-base placeholder:text-slate-400"
                                            onChange={(e) => updateForm({ serialNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-wiki hover:bg-wiki-dark text-white rounded-2xl font-black text-xl shadow-xl shadow-wiki/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar Side */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-10 space-y-8">
                                <div className="bg-wiki/5 p-12 rounded-[3.5rem] text-center border border-wiki/10 space-y-8 animate-in fade-in slide-in-from-right duration-1000">
                                    <div className="bg-wiki p-6 rounded-3xl inline-block text-white shadow-lg shadow-wiki/20">
                                        <Icons.PhoneCall size={48} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black text-slate-900">Besoin d&apos;une Assistance Immédiate ?</h3>
                                        <p className="text-slate-500 leading-relaxed">
                                            Pour toute question ou aide urgente, contactez directement notre service client ou notre support technique. Nos équipes sont là pour vous aider à chaque étape.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Client</p>
                                        <p className="text-4xl font-black text-wiki">22 414 444</p>
                                    </div>
                                    <div className="pt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Horaires</p>
                                            <p className="text-xs font-bold text-slate-700">8h30 - 18h30</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Jours</p>
                                            <p className="text-xs font-bold text-slate-700">Lun - Sam</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-white/10 p-3 rounded-xl">
                                            <Icons.Clock size={24} />
                                        </div>
                                        <h4 className="font-bold">Intervention Express</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        La plupart de nos diagnostics et réparations standards sont effectués en moins d&apos;une heure.
                                    </p>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-wiki"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

const customStyles = `
@keyframes bounce-slow {
    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
.animate-bounce-slow {
    animation: bounce-slow 4s infinite;
}
`;
