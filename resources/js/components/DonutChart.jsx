import React from 'react';

const DonutChart = ({ data, size = 200, centerText = null }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Handle empty data or zero total
    if (total === 0 || !data || data.length === 0) {
        return (
            <div className="flex items-center justify-center">
                <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
                    <circle cx="100" cy="100" r="80" fill="rgba(200, 200, 200, 0.3)" />
                    <circle cx="100" cy="100" r="55" fill="rgba(255, 255, 255, 0.9)" />
                    <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold text-gray-400"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        0
                    </text>
                </svg>
            </div>
        );
    }

    let currentAngle = 0;

    return (
        <div className="flex items-center justify-center">
            <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
                {data.map((item, index) => {
                    // Skip items with 0 value
                    if (item.value === 0) return null;

                    const percentage = item.value / total;
                    const angle = percentage * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                    const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const pathData = [
                        `M 100 100`,
                        `L ${x1} ${y1}`,
                        `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle += angle;

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill={item.color}
                            className="hover:opacity-80 transition-opacity duration-300"
                            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                        />
                    );
                }).filter(Boolean)}
                {/* Inner circle for donut effect with glassmorphism */}
                <circle cx="100" cy="100" r="55" fill="rgba(255, 255, 255, 0.9)" />
                {/* Center text */}
                {centerText !== null ? (
                    <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold text-gray-800"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {centerText}
                    </text>
                ) : (
                    <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold text-gray-800"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {total}
                    </text>
                )}
            </svg>
        </div>
    );
};

export default DonutChart;
