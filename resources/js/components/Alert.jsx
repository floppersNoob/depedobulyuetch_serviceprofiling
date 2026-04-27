import React from 'react';

const Alert = ({ message, type = 'success', onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';

    return (
        <div className={`${bgColor} border px-4 py-3 rounded mb-4 flex justify-between items-center`}>
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="font-bold text-lg">&times;</button>
            )}
        </div>
    );
};

export default Alert;
