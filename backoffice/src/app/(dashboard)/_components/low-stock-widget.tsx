"use client";

import { useEffect, useState } from "react";
import { getLowStockProducts } from "@/services/product.service";
import { Product } from "@/dtos/product.dto";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function LowStockWidget() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLowStockProducts(10) // Threshold of 10 for alerts
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="glass-premium rounded-2xl p-6 h-full animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-12 bg-white/5 rounded"></div>
            <div className="h-12 bg-white/5 rounded"></div>
        </div>
    </div>
  );

  return (
    <div className="glass-premium rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" size={20} />
          Alertes de Stock
        </h3>
        <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full font-medium">
          {products.length} produits
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2 custom-scrollbar">
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Tous les stocks sont corrects.
          </div>
        ) : (
          products
            .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
            .slice(0, 10)
            .map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/products?search=${product.reference}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors duration-200">
                  {product.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Ref: {product.reference}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${product.quantity === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {product.quantity}
                </p>
                <p className="text-[10px] text-gray-500">en stock</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link 
        href="/products" 
        className="mt-4 text-center text-xs text-primary hover:underline transition-all"
      >
        Voir tout le catalogue
      </Link>
    </div>
  );
}
