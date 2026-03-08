'use client'

import React from 'react'
import { BLOGS } from '@/common/constant/blogs'
import { BlogCard } from './BlogCard'
import Link from 'next/link'
import DotSlide from '@/common/components/elements/DotSlide'

interface BlogListProps {
    title?: string
    showViewAll?: boolean
    limit?: number
    className?: string
}

export const BlogList = ({ title, showViewAll = false, limit, className = "" }: BlogListProps) => {
    const blogsToDisplay = limit ? BLOGS.slice(0, limit) : BLOGS

    return (
        <div className={`container mx-auto ${className}`}>
            {(title || showViewAll) && (
                <div className="flex justify-between items-center mb-10 px-4 md:px-10">
                    {title && <h2 className="text-wiki-btn text-3xl font-black tracking-tight">{title}</h2>}
                    {showViewAll && (
                        <Link href="/blogs" className="text-wiki font-bold hover:underline flex items-center gap-2 transition-all">
                            Voir tout <span className="text-xl">→</span>
                        </Link>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-10">
                {blogsToDisplay.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>

            {showViewAll && (
                <div className="mt-12 flex justify-center items-center">
                    <DotSlide count={3} />
                </div>
            )}
        </div>
    )
}
