"use client";

import { useState, useEffect } from "react";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/coupon.service";
import { Coupon } from "@/dtos/coupon.dto";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Edit, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discountType: "PERCENT",
    discountValue: 0,
    minOrderAmount: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCoupon(editingId, formData);
        toast.success("Coupon mis à jour");
      } else {
        await createCoupon(formData);
        toast.success("Coupon créé");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ code: "", discountType: "PERCENT", discountValue: 0, minOrderAmount: 0, isActive: true });
      fetchCoupons();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData(coupon);
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete.id);
      toast.success("Coupon supprimé");
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Coupons</h2>
          <p className="text-gray-400">Créez et gérez les codes promotionnels</p>
        </div>
        <button 
  onClick={() => { setShowForm(!showForm); setEditingId(null); }} 
  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-sm"
>
  {showForm ? <X size={18} /> : <Plus size={18} />}
  {showForm ? "Annuler" : "Nouveau Coupon"}
</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-premium p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Code Promo</label>
            <input 
  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
  value={formData.code} 
  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
  placeholder="WIKI2024"
  required
/>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
              value={formData.discountType}
              onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
            >
              <option value="PERCENT">Pourcentage (%)</option>
              <option value="FIXED">Montant Fixe (DT)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Valeur</label>
            <input 
  type="number"
  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
  value={formData.discountValue} 
  onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
  required
/>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Montant Min. Commande</label>
            <input 
  type="number"
  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
  value={formData.minOrderAmount} 
  onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
/>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Date d'expiration</label>
            <input 
  type="datetime-local"
  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
  value={formData.expiryDate ? formData.expiryDate.split('.')[0] : ""} 
  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
/>
          </div>
          <div className="flex items-end pb-1">
             <button 
  type="submit" 
  className="w-full px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-sm"
>
  {editingId ? "Mettre à jour" : "Enregistrer"}
</button>
          </div>
        </form>
      )}

      <div className="glass-premium rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead className="text-white">Code</TableHead>
              <TableHead className="text-white">Réduction</TableHead>
              <TableHead className="text-white">Min. Achat</TableHead>
              <TableHead className="text-white">Expiration</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : coupons.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Aucun coupon trouvé</TableCell></TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} className="hover:bg-white/5 border-white/5">
                  <TableCell className="font-mono font-bold text-primary flex items-center gap-2">
                    <Tag size={14} />
                    {coupon.code}
                  </TableCell>
                  <TableCell className="text-white">
                    {coupon.discountValue} {coupon.discountType === 'PERCENT' ? '%' : 'DT'}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {coupon.minOrderAmount} DT
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Jamais'}
                  </TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <span className="flex items-center gap-1 text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full w-fit">
                        <Check size={12} /> Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded-full w-fit">
                        <X size={12} /> Inactif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-2 text-gray-400 hover:text-white transition-colors">
  <Edit size={16} />
</button>
<button onClick={() => { setCouponToDelete(coupon); setIsDeleteModalOpen(true); }} className="p-2 text-red-400 hover:text-red-500 transition-colors">
  <Trash size={16} />
</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal Delete */}
      {isDeleteModalOpen && couponToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => { setIsDeleteModalOpen(false); setCouponToDelete(null); }}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-2xl border border-red-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                    <Trash size={32} />
                </div>
                <button onClick={() => { setIsDeleteModalOpen(false); setCouponToDelete(null); }} className="rounded-full p-2 text-gray-400 hover:bg-white/10 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white uppercase tracking-tight">Supprimer le coupon</h3>
            <p className="mb-8 text-gray-400 leading-relaxed font-medium">
              Voulez-vous vraiment supprimer le coupon <span className="text-red-500 font-bold">{couponToDelete.code}</span> ?
              <br />
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setCouponToDelete(null); }} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">
                <X size={16} /> Annuler
              </button>
              <button onClick={handleDelete} className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
