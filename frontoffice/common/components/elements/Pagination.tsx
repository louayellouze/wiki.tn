import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    isLoading = false 
}) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i);
    
    // Logic to show a limited window of pages if totalPages is large
    let shownPages = pages;
    if (totalPages > 7) {
        if (currentPage <= 3) {
            shownPages = [...pages.slice(0, 5), -1, totalPages - 1];
        } else if (currentPage >= totalPages - 4) {
            shownPages = [0, -1, ...pages.slice(totalPages - 5)];
        } else {
            shownPages = [0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1];
        }
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-12 py-4">
            <button
                disabled={currentPage === 0 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-cyan-50 hover:border-cyan-200 disabled:opacity-50 disabled:hover:bg-white transition-all group"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-cyan-600" />
            </button>

            <div className="flex items-center gap-1.5">
                {shownPages.map((page, index) => (
                    page === -1 ? (
                        <span key={`dots-${index}`} className="px-2 text-gray-400 font-bold">...</span>
                    ) : (
                        <button
                            key={page}
                            disabled={isLoading}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border ${
                                currentPage === page
                                    ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-200'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600'
                            }`}
                        >
                            {page + 1}
                        </button>
                    )
                ))}
            </div>

            <button
                disabled={currentPage === totalPages - 1 || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-cyan-50 hover:border-cyan-200 disabled:opacity-50 disabled:hover:bg-white transition-all group"
            >
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-600" />
            </button>
        </div>
    );
};

export default Pagination;
