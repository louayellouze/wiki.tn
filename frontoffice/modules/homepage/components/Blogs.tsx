import React from 'react'
import { BLOGS } from '@/common/constant/blogs'
import { Card } from '@/common/components/elements/Card'
import DotSlide from '@/common/components/elements/DotSlide'

const Blogs = () => {
    return (
        <div className="container mx-auto">
            <div className="w-11/12 h-9 gap-96 flex flex-wrap justify-between m-auto p-10 mb-5">
                <div className="text-wiki-btn text-2xl font-semibold">Latest news</div>
                <div className="text-wiki-btn text-xl font-medium cursor-pointer hover:text-wiki">View all</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-10 mb-5">
                {BLOGS.map((blog, index) => (
                    <Card key={index} className="flex flex-col cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100 overflow-hidden">
                        <div className="p-5 flex flex-col flex-1 gap-3">
                            <div className="inline-flex px-3 py-1 rounded-full border border-neutral-200 w-fit">
                                <span className="text-wiki-btn text-xs font-semibold">{blog.date}</span>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <h3 className="text-wiki-btn text-xl font-bold line-clamp-2">{blog.title}</h3>
                                <p className="text-slate-600 text-sm font-normal line-clamp-3 leading-relaxed">
                                    {blog.description}
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-wiki-btn text-xs font-medium">Par {blog.author}</span>
                                <span className="text-wiki-btn text-xs font-bold hover:underline">Lire plus →</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="p-5 justify-center items-center flex mb-5">
                <DotSlide count={4} />
            </div>
        </div>
    )
}

export default Blogs