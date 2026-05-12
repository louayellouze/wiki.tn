'use client'

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { getRepairRequests, searchRepairRequests, updateRepairRequestStatus, deleteRepairRequest, PageResponse, sendQuote, getQuoteByRequestId, searchRepairItems, createRepairItem } from '@/services/repair.service';
import { RepairItem, RepairQuote, RepairQuoteLineRequest, RepairRequest } from '@/dtos/repair.dto';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'En attente', color: 'bg-warning', icon: Icons.Clock },
    { value: 'IN_PROGRESS', label: 'En cours', color: 'bg-primary', icon: Icons.Info },
    { value: 'COMPLETED', label: 'Terminé', color: 'bg-success', icon: Icons.CheckCircle },
    { value: 'CANCELLED', label: 'Annulé', color: 'bg-danger', icon: Icons.XCircle },
];

const StatsCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-[#1a222c] transition-all hover:scale-[1.02] duration-300">
        <div className="flex items-center justify-between">
            <div>
                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{title}</span>
                <h4 className="mt-2 text-3xl font-black text-black dark:text-white">{value}</h4>
                {trend && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-success">
                        <Icons.ArrowUp size={12} /> {trend}% <span className="text-gray-400 font-medium ml-1">vs mois dernier</span>
                    </div>
                )}
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
                <Icon size={28} />
            </div>
        </div>
    </div>
);

const RepairRequestsPage = () => {
    const [pageData, setPageData] = useState<PageResponse<RepairRequest> | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
    const [repairItems, setRepairItems] = useState<RepairItem[]>([]);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteLines, setQuoteLines] = useState<RepairQuoteLineRequest[]>([{ quantity: 1, unitPrice: 0 }]);
    const [adminNote, setAdminNote] = useState('');
    const [existingQuote, setExistingQuote] = useState<RepairQuote | null>(null);
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    const fetchRepairItems = async () => {
        try {
            const [priceCards, diagnosis] = await Promise.all([
                searchRepairItems({ section: 'PRICE_CARD', size: 100 }),
                searchRepairItems({ section: 'DIAGNOSIS', size: 100 })
            ]);
            setRepairItems([...priceCards.content, ...diagnosis.content]);
        } catch (error) {
            console.error("Erreur chargement pièces", error);
        }
    };

    const fetchExistingQuote = async (requestId: number) => {
        try {
            const quote = await getQuoteByRequestId(requestId);
            setExistingQuote(quote);
        } catch (error) {
            setExistingQuote(null);
        }
    };

    useEffect(() => {
        fetchRepairItems();
    }, []);

    useEffect(() => {
        if (selectedRequest) {
            fetchExistingQuote(selectedRequest.id);
        }
    }, [selectedRequest]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await searchRepairRequests({
                status: selectedStatus || undefined,
                query: searchQuery,
                page: currentPage,
                size: pageSize,
                sort: 'createdAt,desc'
            });
            setPageData(response);
        } catch (error) {
            console.error("Erreur lors du chargement des demandes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [selectedStatus, currentPage, pageSize]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
            fetchRequests();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer cette demande ?")) return;
        try {
            await deleteRepairRequest(id);
            fetchRequests();
        } catch (error) {
            alert("Erreur");
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateRepairRequestStatus(id, status);
            fetchRequests();
            if (selectedRequest?.id === id) {
                setSelectedRequest(prev => prev ? { ...prev, status: status as any } : null);
            }
        } catch (error) {
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const handleSendQuote = async () => {
        if (!selectedRequest) return;
        if (quoteLines.length === 0 || quoteLines.some(l => !l.description && !l.repairItemId)) {
            alert("Veuillez remplir les lignes du devis correctement");
            return;
        }

        setIsSubmittingQuote(true);
        try {
            await sendQuote(selectedRequest.id, {
                adminNote,
                lines: quoteLines
            });
            setIsQuoteModalOpen(false);
            fetchExistingQuote(selectedRequest.id);
            fetchRequests();
            alert("Devis envoyé avec succès !");
        } catch (error) {
            alert("Erreur lors de l'envoi du devis");
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    const addQuoteLine = () => {
        setQuoteLines([...quoteLines, { quantity: 1, unitPrice: 0 }]);
    };

    const removeQuoteLine = (index: number) => {
        setQuoteLines(quoteLines.filter((_, i) => i !== index));
    };

    const updateQuoteLine = (index: number, field: keyof RepairQuoteLineRequest, value: any) => {
        const newLines = [...quoteLines];
        newLines[index] = { ...newLines[index], [field]: value };
        
        // If repairItemId is updated, auto-fill unitPrice and description
        if (field === 'repairItemId') {
            const item = repairItems.find(i => i.id === value);
            if (item) {
                newLines[index].unitPrice = item.price || 0;
                newLines[index].description = item.title as string;
            }
        }
        
        setQuoteLines(newLines);
    };

    const handleAddToCatalogue = async (index: number) => {
        const line = quoteLines[index];
        if (!line.description || !line.unitPrice) {
            alert("Description et prix requis");
            return;
        }

        try {
            const newItem = await createRepairItem({
                title: line.description,
                price: line.unitPrice,
                section: 'PRICE_CARD',
                active: true,
                orderIndex: 0,
                targetDevice: selectedRequest?.deviceType
            } as any);
            
            updateQuoteLine(index, 'repairItemId', newItem.id);
            fetchRepairItems();
            alert("Ajouté au catalogue !");
        } catch (error) {
            alert("Erreur catalogue");
        }
    };

    const exportToCSV = () => {
        if (!pageData) return;
        const headers = ["ID", "Date", "Client", "Email", "Téléphone", "Appareil", "Sujet", "Statut"];
        const rows = pageData.content.map(req => [
            req.id,
            format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm'),
            `${req.firstName} ${req.lastName}`,
            req.email,
            req.phone,
            `${req.deviceType} ${req.brand} ${req.model}`,
            req.subject,
            req.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `demandes_reparation_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName="Demandes de Réparation" />

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
                <StatsCard 
                    title="Total Demandes" 
                    value={pageData?.totalElements || 0} 
                    icon={Icons.ClipboardList} 
                    color="bg-primary"
                    trend={12}
                />
                <StatsCard 
                    title="En Attente" 
                    value={pageData?.content.filter(r => r.status === 'PENDING').length || 0} 
                    icon={Icons.Clock} 
                    color="bg-warning" 
                />
                <StatsCard 
                    title="En Cours" 
                    value={pageData?.content.filter(r => r.status === 'IN_PROGRESS').length || 0} 
                    icon={Icons.Info} 
                    color="bg-blue-500" 
                />
                <StatsCard 
                    title="Terminées" 
                    value={pageData?.content.filter(r => r.status === 'COMPLETED').length || 0} 
                    icon={Icons.CheckCircle} 
                    color="bg-success" 
                />
            </div>

            {/* Premium Header/Search Bar */}
            <div className="mb-6 rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-[#1a222c]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-xl">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icons.Search size={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher par client, email ou appareil..."
                            className="w-full rounded-xl border border-stroke bg-gray-50 py-3 pl-12 pr-4 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-[#2d3a4b] dark:text-white transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-black rounded-lg bg-success text-white hover:bg-success/90 transition-all shadow-lg shadow-success/20 mr-2"
                        >
                            <Icons.Download size={18} /> Exporter CSV
                        </button>
                        <button
                            onClick={() => setSelectedStatus('')}
                            className={`whitespace-nowrap px-4 py-2 text-sm font-black rounded-lg transition-all ${
                                selectedStatus === '' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d3a4b]'
                            }`}
                        >
                            Tous
                        </button>
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedStatus(opt.value)}
                                className={`whitespace-nowrap px-4 py-2 text-sm font-black rounded-lg transition-all ${
                                    selectedStatus === opt.value ? `${opt.color} text-white shadow-lg` : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d3a4b]'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-[#1a222c] overflow-hidden">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-[#2d3a4b]">
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Date</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 min-w-[200px]">Client</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Appareil</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Sujet</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 text-center">Statut</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            <p className="text-gray-400 font-medium">Chargement des demandes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageData?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400 font-medium italic">
                                        Aucune demande trouvée
                                    </td>
                                </tr>
                            ) : (
                                pageData?.content.map((req) => (
                                    <tr key={req.id} className="border-b border-stroke dark:border-[#2d3a4b] hover:bg-gray-50 dark:hover:bg-[#24303f] transition-colors group">
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-black dark:text-white">
                                                    {format(new Date(req.createdAt), 'dd MMM yyyy', { locale: fr })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                    {format(new Date(req.createdAt), 'HH:mm', { locale: fr })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 dark:text-white">{req.firstName} {req.lastName}</span>
                                                <span className="text-xs text-primary font-medium">{req.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase">{req.deviceType}</span>
                                                <span className="text-xs text-gray-400 font-medium">{req.brand} {req.model}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-xs font-bold text-gray-500 italic max-w-[150px] block truncate">
                                                {req.subject}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex rounded-lg px-3 py-1 text-[10px] font-black uppercase text-white shadow-sm ${STATUS_OPTIONS.find(s => s.value === req.status)?.color}`}>
                                                    {STATUS_OPTIONS.find(s => s.value === req.status)?.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Détails"
                                                >
                                                    <Icons.Eye size={18} />
                                                </button>
                                                <div className="relative group/status">
                                                    <button className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors">
                                                        <Icons.Clock size={18} />
                                                    </button>
                                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover/status:block z-50 w-40 rounded-xl bg-white shadow-2xl border border-stroke dark:bg-[#1a222c] dark:border-strokedark p-2 animate-in fade-in slide-in-from-bottom-2">
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => handleStatusUpdate(req.id, opt.value)}
                                                                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors mb-1 last:mb-0 ${req.status === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-[#2d3a4b] text-gray-400 hover:text-white'}`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Icons.Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {pageData && pageData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stroke px-6 py-6 dark:border-strokedark sm:flex-row">
                        <p className="text-sm font-medium text-gray-400">
                            Page {pageData.number + 1} sur {pageData.totalPages} ({pageData.totalElements} demandes au total)
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={pageData.number === 0}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b] disabled:opacity-30 transition-all font-bold"
                            >
                                <Icons.ChevronLeft size={20} />
                            </button>
                            {Array.from({ length: Math.min(5, pageData.totalPages) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm transition-all ${currentPage === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={pageData.number >= pageData.totalPages - 1}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b] disabled:opacity-30 transition-all font-bold"
                            >
                                <Icons.ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Detail Modal Enhanced */}
            {selectedRequest && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl bg-[#1a222c] p-8 shadow-2xl border border-strokedark animate-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Demande #{selectedRequest.id}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                                    Reçue le {format(new Date(selectedRequest.createdAt), 'dd MMMM yyyy  HH:mm', { locale: fr })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white transition-colors">
                                <Icons.XCircle size={28} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Icons.User size={14} className="text-primary" /> Informations Client
                                    </h4>
                                    <div className="bg-[#2d3a4b] p-5 rounded-2xl border border-slate-700">
                                        <p className="font-black text-xl text-white mb-1">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                                        <div className="space-y-1">
                                            <p className="flex items-center gap-2 text-primary font-bold text-sm"><Icons.Mail size={14} /> {selectedRequest.email}</p>
                                            <p className="flex items-center gap-2 text-success font-bold text-sm"><Icons.Phone size={14} /> {selectedRequest.phone}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Icons.Smartphone size={14} className="text-primary" /> Appareil
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm bg-[#2d3a4b]/50 p-5 rounded-2xl border border-slate-700/50">
                                        <div className="bg-[#1a222c] p-3 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Type</p>
                                            <p className="font-black text-white uppercase text-xs">{selectedRequest.deviceType}</p>
                                        </div>
                                        <div className="bg-[#1a222c] p-3 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Marque</p>
                                            <p className="font-black text-white uppercase text-xs">{selectedRequest.brand}</p>
                                        </div>
                                        <div className="bg-[#1a222c] p-3 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Modèle</p>
                                            <p className="font-black text-white uppercase text-xs">{selectedRequest.model}</p>
                                        </div>
                                        <div className="bg-[#1a222c] p-3 rounded-xl border border-slate-700">
                                            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">S/N</p>
                                            <p className="font-black text-white text-xs">{selectedRequest.serialNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Sujet</h4>
                                    <p className="font-black text-white bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl text-sm">
                                        {selectedRequest.subject}
                                    </p>
                                </section>
                                
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Message</h4>
                                    <div className="p-5 bg-[#2d3a4b] border border-slate-700 rounded-2xl text-sm font-medium italic text-gray-300 leading-relaxed shadow-inner">
                                        "{selectedRequest.message}"
                                    </div>
                                </section>

                                {selectedRequest.photoUrl && (
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Photo jointe</h4>
                                        <a href={selectedRequest.photoUrl} target="_blank" rel="noopener noreferrer" className="block relative h-44 w-full rounded-2xl overflow-hidden border border-slate-700 group/img shadow-xl">
                                            <img src={selectedRequest.photoUrl} alt="Repair Attachment" className="object-cover w-full h-full transition-transform duration-500 group-hover/img:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                <span className="text-white text-[10px] font-black px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm border border-white/20">VOIR EN GRAND</span>
                                            </div>
                                        </a>
                                    </section>
                                )}
                            </div>
                        </div>

                        {/* Existing Quote Section */}
                        {existingQuote && (
                            <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-primary/30 animate-in slide-in-from-top-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <Icons.FileText className="text-primary" size={18} /> Devis Envoyé
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                        existingQuote.status === 'ACCEPTED' ? 'bg-success text-white' : 
                                        existingQuote.status === 'REJECTED' ? 'bg-danger text-white' : 'bg-primary text-white'
                                    }`}>
                                        {existingQuote.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {existingQuote.lines?.map((line, i) => (
                                        <div key={i} className="flex justify-between text-xs text-gray-300 border-b border-slate-700/50 pb-2">
                                            <span>{line.description} x{line.quantity}</span>
                                            <span className="font-bold text-white">{(line.totalPrice || 0).toFixed(3)} DT</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-2 text-primary font-black">
                                        <span>TOTAL</span>
                                        <span>{(existingQuote.totalPrice || 0).toFixed(3)} DT</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => {
                                        if (existingQuote) {
                                            setQuoteLines(existingQuote.lines.map(line => ({
                                                repairItemId: line.repairItem?.id,
                                                description: line.description,
                                                quantity: line.quantity,
                                                unitPrice: line.unitPrice
                                            })));
                                            setAdminNote(existingQuote.adminNote || '');
                                        } else {
                                            setQuoteLines([{ quantity: 1, unitPrice: 0 }]);
                                            setAdminNote('');
                                        }
                                        setIsQuoteModalOpen(true);
                                    }}
                                    disabled={existingQuote?.status === 'ACCEPTED'}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-lg ${
                                        existingQuote?.status === 'ACCEPTED' 
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-none' 
                                        : 'bg-primary text-white hover:bg-opacity-90 shadow-primary/20'
                                    }`}
                                >
                                    <Icons.Plus size={12} /> {existingQuote?.status === 'ACCEPTED' ? 'Devis Validé (Fixé)' : existingQuote ? 'Modifier le devis' : 'Générer un Devis'}
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Notification envoyée à ${selectedRequest.email} !`);
                                    }}
                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-warning/10 text-warning border border-warning/20 hover:bg-warning hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Icons.Mail size={12} /> Notifier le client
                                </button>
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleStatusUpdate(selectedRequest.id, opt.value)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                            selectedRequest.status === opt.value 
                                            ? `${opt.color} text-white shadow-lg` 
                                            : 'bg-slate-800 text-gray-500 hover:bg-slate-700 hover:text-gray-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setSelectedRequest(null)} 
                                className="px-10 py-3 rounded-2xl bg-primary text-white font-black text-sm hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Generation Modal */}
            {isQuoteModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-4xl rounded-3xl bg-[#1a222c] p-8 shadow-2xl border border-primary/20 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Icons.Calculator className="text-primary" /> 
                                    {existingQuote ? 'Modifier le devis' : 'Nouveau Devis'} pour #{selectedRequest.id}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">Client: {selectedRequest.firstName} {selectedRequest.lastName} | {selectedRequest.deviceType}</p>
                            </div>
                            <button onClick={() => setIsQuoteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <Icons.XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
                                <div className="grid grid-cols-12 gap-4 mb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <div className="col-span-5">Pièce / Service</div>
                                    <div className="col-span-2 text-center">Quantité</div>
                                    <div className="col-span-2 text-right">Prix Unitaire</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-1"></div>
                                </div>

                                <div className="space-y-4">
                                    {quoteLines.map((line, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-center animate-in slide-in-from-left duration-300">
                                            <div className="col-span-5 space-y-2">
                                                <select
                                                    value={line.repairItemId || ''}
                                                    onChange={(e) => updateQuoteLine(index, 'repairItemId', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    className="w-full rounded-xl border border-slate-700 bg-[#2d3a4b] py-2 px-4 text-xs text-white outline-none focus:border-primary transition-all"
                                                >
                                                    <option value="">-- Sélectionner une pièce (Catalogue) --</option>
                                                    {repairItems.map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            [{item.section}] {item.title} - {item.price?.toFixed(3)} DT
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Description personnalisée..."
                                                        value={line.description || ''}
                                                        onChange={(e) => updateQuoteLine(index, 'description', e.target.value)}
                                                        className="flex-1 rounded-xl border border-slate-700 bg-[#2d3a4b] py-2 px-4 text-xs text-white outline-none focus:border-primary transition-all"
                                                    />
                                                    {!line.repairItemId && line.description && (
                                                        <button 
                                                            onClick={() => handleAddToCatalogue(index)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors border border-primary/20"
                                                            title="Ajouter au catalogue"
                                                        >
                                                            <Icons.Save size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={line.quantity}
                                                    onChange={(e) => updateQuoteLine(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-full rounded-xl border border-slate-700 bg-[#2d3a4b] py-2 px-4 text-center text-xs text-white outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={line.unitPrice}
                                                    onChange={(e) => updateQuoteLine(index, 'unitPrice', parseFloat(e.target.value))}
                                                    className="w-full rounded-xl border border-slate-700 bg-[#2d3a4b] py-2 px-4 text-right text-xs text-white outline-none focus:border-primary transition-all font-bold"
                                                />
                                            </div>
                                            <div className="col-span-2 text-right font-black text-sm text-primary">
                                                {(line.quantity * line.unitPrice).toFixed(3)} DT
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button 
                                                    onClick={() => removeQuoteLine(index)}
                                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg"
                                                >
                                                    <Icons.MinusCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addQuoteLine}
                                    className="mt-6 flex items-center gap-2 text-xs font-black text-primary hover:text-white transition-colors"
                                >
                                    <Icons.PlusCircle size={20} /> AJOUTER UNE LIGNE
                                </button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Note Administrative (Optionnel)</label>
                                <textarea
                                    rows={3}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Ex: Main d'oeuvre incluse, Garantie 3 mois..."
                                    className="w-full rounded-2xl border border-slate-700 bg-[#2d3a4b] p-4 text-sm text-white outline-none focus:border-primary transition-all shadow-inner"
                                ></textarea>
                            </div>

                            <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-6 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase">Total Devis (TTC)</p>
                                    <p className="text-3xl font-black text-white">
                                        {quoteLines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0).toFixed(3)} <span className="text-sm">TND</span>
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsQuoteModalOpen(false)}
                                        className="px-8 py-3 rounded-2xl border border-slate-700 font-bold text-gray-400 hover:bg-slate-800 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSendQuote}
                                        disabled={isSubmittingQuote || existingQuote?.status === 'ACCEPTED'}
                                        className={`px-10 py-3 rounded-2xl font-black transition-all flex items-center gap-2 shadow-xl ${
                                            existingQuote?.status === 'ACCEPTED'
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-opacity-90 hover:scale-105 active:scale-95 shadow-primary/30'
                                        } disabled:opacity-50`}
                                    >
                                        {isSubmittingQuote ? (
                                            <Icons.Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <Icons.Send size={20} />
                                        )}
                                        {existingQuote?.status === 'ACCEPTED' ? 'DEVIS DÉJÀ ACCEPTÉ' : 'ENVOYER LE DEVIS'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairRequestsPage;
