'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/common/components/elements/Card'

interface BlogCardProps {
    blog: {
        id: number
        title: string
        date: string
        description: string
        author: string
        imageUrl?: string
    }
}

export const BlogCard = ({ blog }: BlogCardProps) => {
    return (
        <Link href={`/blogs/${blog.id}`} className="group">
            <Card className="flex flex-col h-full cursor-pointer hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden rounded-[2rem] bg-white">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={blog.imageUrl || '/assets/img/blog1.png'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50">
                            <span className="text-wiki-btn text-xs font-black uppercase tracking-wider">{blog.date}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-1 gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                        <h3 className="text-wiki-btn text-xl font-bold line-clamp-2 group-hover:text-wiki transition-colors leading-tight">
                            {blog.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">
                            {blog.description}
                        </p>
                    </div>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-wiki/10 flex items-center justify-center text-wiki font-bold text-xs">
                                {blog.author.charAt(0)}
                            </div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{blog.author}</span>
                        </div>
                        <span className="text-wiki text-sm font-black group-hover:translate-x-1 transition-transform">Lire plus →</span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
