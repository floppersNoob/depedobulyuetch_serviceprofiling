import React from 'react';

const Pagination = ({ data, onPageChange }) => {
    if (!data || data.last_page <= 1 || !data.links) return null;

    const handlePageChange = (url) => {
        if (url) {
            const page = new URL(url).searchParams.get('page');
            onPageChange(page);
        }
    };

    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
                Showing {data.from} to {data.to} of {data.total} results
            </div>
            <div className="flex space-x-1">
                {data.links.map((link, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(link.url)}
                        disabled={!link.url}
                        className={`px-3 py-1 rounded text-sm ${
                            link.active
                                ? 'bg-blue-600 text-white'
                                : link.url
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Pagination;
