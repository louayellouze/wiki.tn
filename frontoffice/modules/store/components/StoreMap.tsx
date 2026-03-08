'use client'

import React from 'react'

interface StoreMapProps {
    query: string
    title: string
}

export const StoreMap = ({ query, title }: StoreMapProps) => {
    const encodedQuery = encodeURIComponent(query + ", Tunisia")
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodedQuery}`

    // Fallback URL if API key is not provided (using standard embed URL which is less robust but works)
    const fallbackSrc = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`

    return (
        <div className="w-full h-[500px] md:h-[800px] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100 flex flex-col">
            <iframe
                title={title}
                className="flex-1 w-full h-full"
                style={{ border: 0 }}
                src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? mapSrc : fallbackSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    )
}
