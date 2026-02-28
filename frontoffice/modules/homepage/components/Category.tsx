'use client'

import { Card } from '@/common/components/elements/Card'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import api from '@/common/utils/api'

interface Category {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
    productCount?: number; // Optional as backend might not return it yet
}

const Category = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch top 3 categories for display, or all and slice
                const response = await api.get('/v1/categories');
                const allCategories = response.data || [];
                const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
                setCategories(shuffled.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories();
    }, []);

    // Helper to get image URL (placeholder if missing)
    const getImageUrl = (url: string) => url || '/assets/img/2-1.png';

    return (
        <div className="container mx-auto px-2 md:px-4">
            <div className="flex flex-wrap pt-6 md:pt-10 justify-center items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-full px-1 md:px-0">
                    {categories.map((category) => (
                        <Link href={`/products?category=${category.id}`} key={category.id}>
                            <Card className='w-full h-32 md:h-36 justify-center items-center gap-4 md:gap-6 lg:gap-11 relative cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-105 flex'>
                                <img className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg object-cover" src={getImageUrl(category.imageUrl)} alt={category.name} />
                                <div className="flex-col justify-center items-start gap-1 md:gap-2 inline-flex flex-1 pr-2">
                                    <div className="text-cyan-800 text-base md:text-xl lg:text-2xl font-semibold truncate w-full">{category.name}</div>
                                    <div className="text-cyan-800 text-xs md:text-base lg:text-lg font-medium">
                                        {category.productCount ? `(${category.productCount} items)` : ''}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Category