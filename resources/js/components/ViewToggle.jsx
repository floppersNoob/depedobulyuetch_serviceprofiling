import React from 'react';

const ViewToggle = ({ currentView, onViewChange, onPrint }) => {
    return (
        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">View:</span>
            
            {/* Toggle Switch */}
            <div className="flex bg-gray-100 rounded-lg p-1">

                         <button
                            onClick={() => onViewChange('timeline')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentView === 'timeline'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Timeline View</span>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => onViewChange('table')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentView === 'table'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Table View</span>
                            </div>
                        </button>
                    </div>
        </div>
    );
};

export default ViewToggle;
