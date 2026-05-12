import React, { useEffect, useState } from 'react'
import { PARTNERS } from '@/common/constant/partners'
import { getBrands, Brand } from '@/common/services/brandService'

const Partner = () => {
    const [brands, setBrands] = useState<{ name: string, logo: string, url: string }[]>([]);

    useEffect(() => {
        const fetchBrandsData = async () => {
            try {
                const data = await getBrands();
                if (data && data.length > 0) {
                    setBrands(data.map(b => ({
                        name: b.name,
                        logo: b.logoUrl,
                        url: `/products?brand=${b.slug}`
                    })));
                } else {
                    setBrands(PARTNERS);
                }
            } catch (error) {
                console.error("Failed to fetch brands", error);
                setBrands(PARTNERS);
            }
        };
        fetchBrandsData();
    }, []);

    // Double the items for seamless infinite scroll
    const displayBrands = [...brands, ...brands];

    return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 overflow-hidden">
            <div className="w-full bg-sky-100 rounded-2xl p-6 md:p-8 marquee-container">
                <div className="flex animate-marquee-ltr gap-8 md:gap-16 items-center">
                    {displayBrands.map((partner, index) => (
                        <div key={index} className='transition ease-in-out hover:-translate-y-1 hover:scale-110 shrink-0 min-w-[120px] md:min-w-[150px] flex flex-col items-center justify-center text-center'>
                            <a href={partner.url} target='_blank' rel="noopener noreferrer" className='cursor-pointer flex flex-col items-center'>
                                {partner.logo ? (
                                    <img 
                                        className="rounded-xl p-1 max-h-12 md:max-h-16 w-auto object-contain" 
                                        src={partner.logo} 
                                        alt={partner.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement?.querySelector('.brand-name-fallback')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <span className={`brand-name-fallback font-bold text-gray-600 ${partner.logo ? 'hidden' : ''}`}>
                                    {partner.name}
                                </span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Partner