 import React from 'react'

const Features = () => {
    return (
        <div className="w-full bg-wiki-light/10 py-8 md:py-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                    {/* Free delivery */}
                    <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-wiki rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="32" height="32" className="md:w-10 md:h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25 3.33334H6.66667C5.78261 3.33334 4.93477 3.68453 4.30965 4.30965C3.68453 4.93477 3.33334 5.78261 3.33334 6.66668V28.3333C3.33334 29.2174 3.68453 30.0652 4.30965 30.6904C4.93477 31.3155 5.78261 31.6667 6.66667 31.6667H25M25 3.33334V31.6667M25 3.33334H33.3333C34.2174 3.33334 35.0652 3.68453 35.6904 4.30965C36.3155 4.93477 36.6667 5.78261 36.6667 6.66668V28.3333C36.6667 29.2174 36.3155 30.0652 35.6904 30.6904C35.0652 31.3155 34.2174 31.6667 33.3333 31.6667H25M13.3333 13.3333H16.6667M13.3333 20H16.6667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-wiki-btn text-lg md:text-xl lg:text-2xl font-semibold">Free delivery</div>
                            <div className="text-wiki-btn text-sm md:text-base lg:text-lg font-normal">on order above $50.00</div>
                        </div>
                    </div>

                    {/* Best quality */}
                    <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-wiki rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="32" height="32" className="md:w-10 md:h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M31.6667 13.3333L20 25L13.3333 18.3333M36.6667 20C36.6667 29.205 29.205 36.6667 20 36.6667C10.795 36.6667 3.33334 29.205 3.33334 20C3.33334 10.795 10.795 3.33334 20 3.33334C29.205 3.33334 36.6667 10.795 36.6667 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-wiki-btn text-lg md:text-xl lg:text-2xl font-semibold">Best quality</div>
                            <div className="text-wiki-btn text-sm md:text-base lg:text-lg font-normal">best quality in low price</div>
                        </div>
                    </div>

                    {/* 1 year warranty */}
                    <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-wiki rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="32" height="32" className="md:w-10 md:h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 3.33334L6.66667 10L20 16.6667L33.3333 10L20 3.33334Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.66667 30L20 36.6667L33.3333 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.66667 20L20 26.6667L33.3333 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-wiki-btn text-lg md:text-xl lg:text-2xl font-semibold">1 year warranty</div>
                            <div className="text-wiki-btn text-sm md:text-base lg:text-lg font-normal">Available warranty</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Features