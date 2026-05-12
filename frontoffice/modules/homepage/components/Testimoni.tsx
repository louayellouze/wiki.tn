import React from 'react'
import { TESTIMONI } from '@/common/constant/testimoni'
import { Card } from '@/common/components/elements/Card'
import DotSlide from '@/common/components/elements/DotSlide'

const Testimoni = () => {
    return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {TESTIMONI.map((testimoni, index) => (
                    <Card key={index} className="w-full min-h-[240px] flex flex-col justify-center items-start hover:bg-slate-100 cursor-pointer p-4">
                        <div className="flex justify-start items-center gap-4 md:gap-6 w-full mb-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0">
                                <div className="w-full h-full rounded-full border-2 border-wiki flex items-center justify-center">
                                    <img className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover" src={testimoni.image} alt={testimoni.name} />
                                </div>
                            </div>
                            <div className="text-wiki-btn text-sm md:text-base font-medium">{testimoni.name}</div>
                        </div>
                        <div className="w-full bg-wiki-light/10 rounded-2xl p-3 md:p-4 flex items-center justify-center">
                            <div className="text-wiki-btn text-xs md:text-sm font-normal">{testimoni.description}</div>
                        </div>
                    </Card>
                ))}
            </div>
            <DotSlide className='flex justify-center py-5' count={4} />
        </div>
    )
}

export default Testimoni