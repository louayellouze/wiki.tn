'use client'

import React from 'react'
import { BLOGS } from '@/common/constant/blogs'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react'

interface BlogDetailProps {
    id: string
}

const BlogDetail = ({ id }: BlogDetailProps) => {
    const blog = BLOGS.find(b => b.id === parseInt(id))

    if (!blog) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Article non trouvé</h1>
                <Link href="/blogs" className="text-wiki mt-4 inline-block hover:underline">
                    Retour aux actualités
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full">
                <img
                    src={blog.imageUrl || '/assets/img/blog1.png'}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-12">
                    <div className="container mx-auto px-4 md:px-10">
                        <Link href="/blogs" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Link>
                        <div className="max-w-4xl">
                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-bold uppercase tracking-widest mb-4">
                                <span className="bg-wiki px-3 py-1 rounded-lg text-white">Actualités</span>
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {blog.date}</span>
                                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Par {blog.author}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                                {blog.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 md:px-10 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                                <p className="text-xl text-slate-900 font-bold mb-8 items-center bg-slate-50 p-6 rounded-3xl border-l-4 border-wiki">
                                    {blog.description}
                                </p>
                                <div className="space-y-6">
                                    {blog.content ? (
                                        blog.content.split('\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))
                                    ) : (
                                        <p>Pas de contenu disponible pour cet article.</p>
                                    )}
                                </div>
                            </div>

                            {/* Tags or footer */}
                            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Partager :</span>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-wiki hover:text-white transition-all text-slate-400">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <Link href="/blogs" className="font-black text-wiki hover:underline">
                                    Lire plus d'articles →
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar (Optional) */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="sticky top-24">
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                    <h4 className="text-wiki-btn text-xl font-black mb-6">Articles Récents</h4>
                                    <div className="space-y-6">
                                        {BLOGS.filter(b => b.id !== parseInt(id)).slice(0, 3).map(related => (
                                            <Link href={`/blogs/${related.id}`} key={related.id} className="group block">
                                                <h5 className="text-sm font-bold text-slate-800 group-hover:text-wiki transition-colors line-clamp-2 mb-2 leading-snug">
                                                    {related.title}
                                                </h5>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{related.date}</span>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href="/blogs" className="inline-block mt-8 w-full py-3 bg-wiki-btn text-white text-center rounded-2xl font-bold hover:bg-wiki transition-colors">
                                        Voir tout le blog
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogDetail
