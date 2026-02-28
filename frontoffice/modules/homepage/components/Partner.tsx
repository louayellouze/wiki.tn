import React from 'react'
import { PARTNERS } from '@/common/constant/partners'

const Partner = () => {
    return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
            <div className="w-full bg-sky-100 rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 items-center justify-items-center">
                    {PARTNERS.map((partner, index) => (
                        <div key={index} className='transition ease-in-out hover:-translate-y-1 hover:scale-110'>
                            <a href={partner.url} target='_blank' rel="noopener noreferrer" className='cursor-pointer'>
                                <img className="rounded-xl p-2 max-w-full h-auto" src={partner.logo} alt={`Partner ${index + 1}`} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Partner