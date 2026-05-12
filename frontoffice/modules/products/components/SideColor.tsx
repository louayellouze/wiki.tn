import React from 'react'

const SideColor = () => {
    return (
        <>
            <div className="flex justify-between mb-3">
                <div className="text-wiki-btn font-semibold">Color</div>
            </div>
            <div className="flex justify-between mb-3">
                <div className="text-wiki-btn/80">0 selected</div>
                <a href="#" className="text-wiki-btn hover:text-wiki text-sm">Reset</a>
            </div>
            <div className="flex justify-between items-center mb-3">
                <div className="flex flex-wrap gap-5 m-auto">
                    <button className="w-4 h-4 bg-amber-500 rounded-full" />
                    <button className="w-4 h-4 bg-red-600 rounded-full" />
                    <button className="w-4 h-4 bg-cyan-800 rounded-full" />
                    <button className="w-4 h-4 bg-neutral-400 rounded-full" />
                    <button className="w-4 h-4 bg-green-900 rounded-full" />
                    <button className="w-4 h-4 bg-blue-800 rounded-full" />
                    <button className="w-4 h-4 bg-purple-800 rounded-full" />
                    <button className="w-4 h-4 bg-rose-700 rounded-full" />
                    <button className="w-4 h-4 bg-lime-400 rounded-full" />
                </div>
            </div>
        </>
    )
}

export default SideColor