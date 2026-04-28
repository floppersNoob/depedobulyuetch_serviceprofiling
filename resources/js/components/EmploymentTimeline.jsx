import React from 'react';

const EmploymentTimeline = ({ serviceRecords }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const getStatusColor = (statusName) => {
        const statusColors = {
            'Permanent': 'bg-blue-100 text-blue-800 border-blue-200',
            'Perm.': 'bg-blue-100 text-blue-800 border-blue-200',
            'Casual': 'bg-green-100 text-green-800 border-green-200',
            'Contract': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Probationary': 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return statusColors[statusName] || 'bg-blue-100 text-blue-800 border-blue-200';
    };

    // Group records by position + status combination
    const groupedRecords = serviceRecords.reduce((groups, record) => {
        const positionName = record.position?.position_name || 'Unknown Position';
        const statusName = record.employment_status?.status_name || 'Unknown Status';
        const key = `${positionName}|${statusName}`;
        
        if (!groups[key]) {
            groups[key] = {
                position: positionName,
                status: statusName,
                records: []
            };
        }
        groups[key].records.push(record);
        return groups;
    }, {});

    // Sort groups by first date, and records within groups by date
    const sortedGroups = Object.values(groupedRecords)
        .map(group => ({
            ...group,
            records: group.records.sort((a, b) => new Date(a.date_from) - new Date(b.date_from))
        }))
        .sort((a, b) => new Date(a.records[0].date_from) - new Date(b.records[0].date_from));

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-8">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-900">Employment Timeline</h3>
            </div>
            
            <div className="space-y-8">
                {sortedGroups.map((group, groupIndex) => (
                    <div key={`${group.position}-${group.status}`} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Group header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{group.position}</h4>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(group.status)} mt-2`}>
                                        {group.status || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
                                {formatDate(group.records[0].date_from)} - {formatDate(group.records[group.records.length - 1].date_to)}
                            </div>
                        </div>

                        {/* Vertical timeline with cards */}
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
                            
                            <div className="space-y-4">
                                {group.records.map((record, index) => (
                                    <div key={record.service_id} className="relative flex items-start">
                                        {/* Timeline indicator */}
                                        <div className="relative z-10 w-4 h-4 bg-white border-4 border-blue-500 rounded-full mr-6 shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl">
                                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                                        </div>
                                        
                                        {/* Vertical detail card */}
                                        <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:border-blue-300">
                                            <div className="flex items-start justify-between">
                                                {/* Left side - Date and Salary */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                                            {formatDate(record.date_from)}
                                                            {record.date_to && ` - ${formatDate(record.date_to)}`}
                                                        </div>
                                                        {record.salary_histories?.length > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                                                <span className="text-xs font-bold text-gray-900">
                                                                    ₱{record.salary_histories[0].amount}/{record.salary_histories[0].rate_unit?.substring(0, 3)}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Department */}
                                                    {record.office?.department && (
                                                        <div className="inline-flex items-center px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                                                            <span className="text-xs text-gray-600 font-medium">
                                                                {record.office.department}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Separation */}
                                                    {record.separation_record && (
                                                        <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-50 rounded-full border border-red-200">
                                                            <span className="text-red-700 text-xs font-semibold">
                                                                {record.separation_record.cause}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Right side - Record number */}
                                                <div className="ml-4">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {sortedGroups.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-gray-400 text-sm font-medium">No employment records found</div>
                </div>
            )}
        </div>
    );
};

export default EmploymentTimeline;
