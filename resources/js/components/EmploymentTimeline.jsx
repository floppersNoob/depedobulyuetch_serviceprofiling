import React, { useState } from 'react';

const EmploymentTimeline = ({ serviceRecords }) => {
    const [expandedGroups, setExpandedGroups] = useState({});
    
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

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
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

    // Sort groups by first date (newest first), and records within groups by date (newest first)
    const sortedGroups = Object.values(groupedRecords)
        .map(group => ({
            ...group,
            records: group.records.sort((a, b) => new Date(b.date_from) - new Date(a.date_from))
        }))
        .sort((a, b) => new Date(b.records[0].date_from) - new Date(a.records[0].date_from));

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-900">Employment Timeline</h3>
            </div>
                
            <div className="space-y-3">
                {sortedGroups.map((group, groupIndex) => {
                    const groupKey = `${group.position}-${group.status}`;
                    const isExpanded = expandedGroups[groupKey];
                    const latestRecord = group.records[group.records.length - 1];
                    
                    return (
                        <div key={groupKey} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                            {/* Compact header - always visible */}
                            <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
                                onClick={() => toggleGroup(groupKey)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{group.position}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                                                {group.status || 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {group.records.length} record{group.records.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            {formatDate(latestRecord.date_to) ? formatDate(latestRecord.date_to) + ' - ' : ''}{formatDate(group.records[0].date_from)}
                                        </div>
                                        {/* {latestRecord.salary_histories?.length > 0 && (
                                            <div className="text-xs font-medium text-gray-900">
                                                ₱{latestRecord.salary_histories[0].amount}/{latestRecord.salary_histories[0].rate_unit?.substring(0, 3)}
                                            </div>
                                        )} */}
                                    </div>
                                    <div className="text-gray-400">
                                        <svg 
                                            className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expandable details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <div className="space-y-3">
                                        {group.records.map((record, index) => (
                                            <div key={record.service_id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="text-xs text-gray-500 font-medium">
                                                                {formatDate(record.date_from)}
                                                            </div>
                                                            {!record.date_to && (
                                                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                                                                    PRESENT
                                                                </span>
                                                            )}
                                                            {record.date_to && (
                                                                <span className="text-xs text-gray-500">
                                                                    - {formatDate(record.date_to)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {record.salary_histories?.length > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-blue-50 rounded text-xs font-medium text-blue-800">
                                                                ₱{Number(record.salary_histories[0].amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}/{record.salary_histories[0].rate_unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2">
                                                        {record.office?.department && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {record.office.department}
                                                            </span>
                                                        )}
                                                        {record.separation_record && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-red-50 rounded text-xs text-red-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {record.separation_record.cause}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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
