import React from 'react';

const EmploymentTimeline = ({ serviceRecords }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusColor = (statusName) => {
        const statusColors = {
            'Permanent': 'bg-blue-100 text-blue-700 border-blue-200',
            'Perm.': 'bg-blue-100 text-blue-700 border-blue-200',
            'Casual': 'bg-green-100 text-green-700 border-green-200',
            'Contract': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Probationary': 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return statusColors[statusName] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    // Sort records by date (oldest first)
    const sortedRecords = [...serviceRecords].sort((a, b) => 
        new Date(a.date_from) - new Date(b.date_from)
    );

    // Group records by year (sorted descending within each year)
    const recordsByYear = sortedRecords.reduce((acc, record) => {
        const year = new Date(record.date_from).getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(record);
        return acc;
    }, {});

    // Sort records within each year descending (newest first)
    Object.keys(recordsByYear).forEach(year => {
        recordsByYear[year].sort((a, b) => new Date(b.date_from) - new Date(a.date_from));
    });

    // Get unique years sorted descending (newest first)
    const years = Object.keys(recordsByYear).sort((a, b) => b - a);

    if (sortedRecords.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-gray-400 text-sm font-medium">No employment records found</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6">
            {/* Timeline container */}
            <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-[65px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-cyan-400 to-blue-300"></div>
                
                {/* Timeline entries grouped by year */}
                <div className="space-y-6">
                    {years.map((year, yearIndex) => {
                        const yearRecords = recordsByYear[year];
                        const isFirstYear = yearIndex === 0; // First in display (newest)
                        
                        return (
                            <div key={year} className="relative">
                                {/* Year circle (only once per year) */}
                                <div className="flex items-start gap-4 pl-4">
                                    <div className="flex-shrink-0 relative z-10">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-4 ${
                                            isFirstYear
                                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-200 shadow-lg'
                                                : 'bg-white text-blue-600 border-blue-300 shadow-md'
                                        }`}>
                                            {year}
                                        </div>
                                    </div>
                                    
                                    {/* Records for this year */}
                                    <div className="flex-1 pb-2">
                                        <div className="space-y-3">
                                            {yearRecords.map((record) => (
                                                <div key={record.service_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {formatDate(record.date_from)} - {record.date_to ? formatDate(record.date_to) : 'Present'}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-sm font-bold text-gray-800">
                                                            {record.position?.position_name || 'Unknown Position'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                                                            getStatusColor(record.employment_status?.status_name)
                                                        }`}>
                                                            {record.employment_status?.status_name || 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Additional details */}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {record.office?.department && (
                                                            <span className="inline-flex items-center text-xs text-gray-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                {record.office.department}
                                                            </span>
                                                        )}
                                                        {record.office?.branch && (
                                                            <span className="inline-flex items-center text-xs text-gray-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {record.office.branch}
                                                            </span>
                                                        )}
                                                        {record.salary_histories?.length > 0 && (
                                                            <span className="inline-flex items-center text-xs text-gray-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                ₱{Number(record.salary_histories[0].amount).toLocaleString('en-PH', {minimumFractionDigits: 0})}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EmploymentTimeline;
