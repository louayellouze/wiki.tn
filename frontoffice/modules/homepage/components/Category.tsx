'use client'

import { Card } from '@/common/components/elements/Card'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { categoryService } from '@/common/services/categoryService'
import { CategoryMinResponse } from '@/app/dtos/product'

interface Category {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
    slug: string;
    parentId?: number | null;
    isFeatured: boolean;
    productCount?: number;
}

const Category = () => {
    const [categories, setCategories] = useState<CategoryMinResponse[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Intersection Observer to detect visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasBeenVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasBeenVisible) return;

        const fetchCategories = async () => {
            try {
                // Use the new service that returned lightweight DTOs
                const allCategories = await categoryService.getAllCategories() as CategoryMinResponse[];
                
                // 1. Filter only parent categories
                const parentCategories = allCategories.filter(cat => !cat.parentId);
                
                // 2. Shuffle randomly
                const shuffled = [...parentCategories].sort(() => 0.5 - Math.random());
                
                // 3. Take at least 5 (up to 6 for better grid on large screens)
                const selected = shuffled.slice(0, Math.max(5, Math.min(6, shuffled.length)));
                
                setCategories(selected);
                
                // Trigger animation after a short delay
                setTimeout(() => setIsVisible(true), 100);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories();
    }, [hasBeenVisible]);

    // Helper to get image URL (placeholder if missing)
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/assets/img/2-1.png';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        return `${baseUrl}${url}`;
    };

    return (
        <section ref={sectionRef} className="py-12 md:py-20 min-h-[300px]">
            <div className="container mx-auto px-4">
                <div className="mb-10 md:mb-14 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-wiki-dark mb-4">
                        Catégories
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-wiki to-wiki-dark mx-auto rounded-full"></div>
                </div>

                <div className={`flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {categories.map((category, index) => (
                        <Link 
                            href={`/${category.slug || ''}`} 
                            key={category.slug || `cat-${index}`}
                            className="group flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2"
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {/* Circle Container */}
                            <div className="relative">
                                <div className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg group-hover:shadow-2xl group-hover:border-wiki transition-all duration-300">
                                    <img 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        src={getImageUrl(category.imageUrl)} 
                                        alt={category.name} 
                                    />
                                </div>
                                {/* Subtle Glow Effect */}
                                <div className="absolute inset-0 rounded-full bg-wiki/0 group-hover:bg-wiki/10 blur-xl transition-all duration-300 -z-10"></div>
                            </div>

                            {/* Category Name */}
                            <div className="text-center">
                                <h3 className="text-sm md:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-wiki-dark transition-colors uppercase tracking-wide">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Category