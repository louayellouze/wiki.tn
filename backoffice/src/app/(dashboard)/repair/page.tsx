'use client'

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { isInfoline } from '@/services/auth.service';
import { searchRepairItems, createRepairItem, updateRepairItem, deleteRepairItem, PageResponse, uploadFile } from '@/services/repair.service';
import { RepairItem, RepairSection } from '@/dtos/repair.dto';
import * as Icons from 'lucide-react';

const SECTIONS: { value: RepairSection; label: string }[] = [
    { value: 'HERO', label: 'En-tête (Hero)' },
    { value: 'ABOUT', label: 'À Propos' },
    { value: 'CERTIFICATION', label: 'Certifications' },
    { value: 'SERVICE', label: 'Services' },
    { value: 'DEVICE', label: 'Appareils' },
    { value: 'DIAGNOSIS', label: 'Catégories Diagnostic' },
    { value: 'PRICE_CARD', label: 'Cartes de Prix' },
    { value: 'OBJECTIVE', label: 'Objectifs' },
    { value: 'PROCESS', label: 'Étapes (Process)' },
];

const RepairCMSPage = () => {
    const [pageData, setPageData] = useState<PageResponse<RepairItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<RepairSection>('HERO');
    const [devices, setDevices] = useState<RepairItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<RepairItem> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await searchRepairItems({
                section: selectedSection,
                query: searchQuery,
                page: currentPage,
                size: pageSize,
                sort: 'orderIndex,asc'
            });
            setPageData(response);
        } catch (error) {
            console.error("Erreur lors du chargement des contenus", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDevices = async () => {
        try {
            const response = await searchRepairItems({
                section: 'DEVICE',
                size: 100
            });
            setDevices(response.content);
        } catch (error) {
            console.error("Erreur lors du chargement des appareils", error);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchDevices();
    }, [selectedSection, currentPage, pageSize]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
            fetchItems();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
        try {
            await deleteRepairItem(id);
            fetchItems();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const handleToggleActive = async (item: RepairItem) => {
        try {
            await updateRepairItem(item.id, { ...item, active: !item.active });
            fetchItems();
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await uploadFile(file);
            setEditingItem(prev => ({ ...prev!, [field]: response.fileUrl }));
        } catch (error) {
            alert("Erreur lors du téléchargement de l'image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editingItem.title) return;

        try {
            if (editingItem.id) {
                await updateRepairItem(editingItem.id, editingItem as RepairItem);
            } else {
                await createRepairItem({
                    ...editingItem,
                    section: selectedSection,
                    active: true,
                    orderIndex: pageData?.totalElements || 0
                } as any);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchItems();
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName="Wiki Repair CMS" />

            {/* Premium Header/Search Bar */}
            <div className="mb-6 rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-[#1a222c]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-xl">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icons.Search size={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher par titre, catégorie ou référence..."
                            className="w-full rounded-xl border border-stroke bg-gray-50 py-3 pl-12 pr-4 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-[#2d3a4b] dark:text-white transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value as RepairSection)}
                            className="rounded-xl border border-stroke bg-gray-50 py-3 px-5 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-[#2d3a4b] dark:text-white transition-all shadow-sm font-medium"
                        >
                            {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        
                        {isClient && !isInfoline() && (
                            <button
                                onClick={() => {
                                    setEditingItem({ section: selectedSection, orderIndex: 0, active: true });
                                    setIsModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-3 text-center font-black text-white hover:bg-opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                            >
                                <Icons.Plus size={20} />
                                Ajouter
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-[#1a222c] overflow-hidden">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-[#2d3a4b]">
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">ID</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 min-w-[300px]">Produit / Item</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Section</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Index</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400">Prix</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 text-center">Statut</th>
                                <th className="py-4 px-6 font-black text-xs uppercase text-body dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            <p className="text-gray-400 font-medium">Chargement des données...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageData?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-gray-400 font-medium italic">
                                        Aucun résultat pour cette recherche ou section
                                    </td>
                                </tr>
                            ) : (
                                pageData?.content.map((item) => (
                                    <tr key={item.id} className="border-b border-stroke dark:border-[#2d3a4b] hover:bg-gray-50 dark:hover:bg-[#24303f] transition-colors group">
                                        <td className="py-5 px-6">
                                            <span className="text-sm font-bold text-gray-400">#{item.id}</span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-[#1a222c] border border-stroke dark:border-strokedark p-1">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                            <Icons.Image size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black dark:text-white line-clamp-1">{item.title}</p>
                                                    {item.subtitle && <p className="text-xs text-primary font-bold mt-0.5">{item.subtitle}</p>}
                                                    <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-medium">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="inline-flex rounded-lg bg-primary/10 py-1 px-3 text-xs font-black uppercase text-primary">
                                                {item.section}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold dark:text-white min-w-[20px]">{item.orderIndex}</span>
                                                {isClient && !isInfoline() && (
                                                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={async () => {
                                                                await updateRepairItem(item.id, { ...item, orderIndex: item.orderIndex - 1 });
                                                                fetchItems();
                                                            }}
                                                            className="text-gray-500 hover:text-primary"
                                                        >
                                                            <Icons.ChevronUp size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                await updateRepairItem(item.id, { ...item, orderIndex: item.orderIndex + 1 });
                                                                fetchItems();
                                                            }}
                                                            className="text-gray-500 hover:text-primary"
                                                        >
                                                            <Icons.ChevronDown size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-sm font-black dark:text-white">
                                                {item.price && item.price > 0 ? `${item.price.toFixed(3)} DT` : "-"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => !isInfoline() && handleToggleActive(item)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${item.active ? 'bg-success' : 'bg-danger'} ${isInfoline() ? 'cursor-default opacity-80' : ''}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${item.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            {isClient && !isInfoline() && (
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Trash size={18} />
                                                    </button>
                                                </div>
                                            )}
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
                            Affichage de {pageData.number * pageData.size + 1} à {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)} sur {pageData.totalElements} éléments
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={pageData.number === 0}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b] disabled:opacity-30 transition-all"
                            >
                                <Icons.ChevronLeft size={20} />
                            </button>
                            {Array.from({ length: pageData.totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${currentPage === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b]'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={pageData.number >= pageData.totalPages - 1}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-[#2d3a4b] disabled:opacity-30 transition-all"
                            >
                                <Icons.ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form remains as-is (already matches dark theme logic) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-[#1a222c] p-8 shadow-2xl border border-strokedark">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">
                                {editingItem?.id ? 'Modifier' : 'Ajouter'} - {SECTIONS.find(s => s.value === selectedSection)?.label}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <Icons.XCircle size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-300">Titre <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editingItem?.title || ''}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev!, title: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                />
                            </div>

                            {(selectedSection === 'HERO' || selectedSection === 'DIAGNOSIS' || selectedSection === 'PRICE_CARD') && (
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-300">Sous-titre / Info</label>
                                    <input
                                        type="text"
                                        value={editingItem?.subtitle || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev!, subtitle: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-300">Description</label>
                                <textarea
                                    rows={3}
                                    value={editingItem?.description || ''}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-300">Ordre</label>
                                    <input
                                        type="number"
                                        value={editingItem?.orderIndex || 0}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev!, orderIndex: parseInt(e.target.value) }))}
                                        className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                    />
                                </div>
                                {selectedSection === 'PRICE_CARD' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-300">Prix (DT)</label>
                                        <input
                                            type="number"
                                            value={editingItem?.price || 0}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                                            className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                        />
                                    </div>
                                )}
                            </div>

                            {selectedSection === 'PRICE_CARD' && (
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-300">Appareil Cible</label>
                                    <select
                                        value={editingItem?.targetDevice || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev!, targetDevice: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                    >
                                        <option value="">Tous les appareils</option>
                                        {devices.map(d => (
                                            <option key={d.id} value={d.title as string}>{d.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(selectedSection === 'SERVICE' || selectedSection === 'DEVICE' || selectedSection === 'OBJECTIVE') && (
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-300">Nom de l'icône (Lucide)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Smartphone, Tool, Shield"
                                        value={editingItem?.iconName || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev!, iconName: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner font-mono text-sm"
                                    />
                                </div>
                            )}

                            {(selectedSection === 'HERO' || selectedSection === 'ABOUT') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-300">URL de l'image de fond</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingItem?.imageUrl || ''}
                                                onChange={(e) => setEditingItem(prev => ({ ...prev!, imageUrl: e.target.value }))}
                                                className="flex-1 rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                            />
                                            <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all border border-primary/50">
                                                <Icons.Upload size={20} />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl')} disabled={isUploading} />
                                            </label>
                                        </div>
                                        {isUploading && <p className="text-[10px] text-primary animate-pulse mt-1">Téléchargement en cours...</p>}
                                    </div>
                                    {selectedSection === 'HERO' && (
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-gray-300">Lien du Logo (Wiki Repair)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="/img/wiki-repair-logo.png"
                                                    value={editingItem?.logoUrl || ''}
                                                    onChange={(e) => setEditingItem(prev => ({ ...prev!, logoUrl: e.target.value }))}
                                                    className="flex-1 rounded-lg border border-slate-700 bg-[#2d3a4b] py-3 px-5 text-white outline-none focus:border-primary transition-all shadow-inner"
                                                />
                                                <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all border border-primary/50">
                                                    <Icons.Upload size={20} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-xl border border-slate-700 py-4 font-bold text-gray-400 hover:bg-slate-800 transition-all hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-primary py-4 font-black text-white hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairCMSPage;
