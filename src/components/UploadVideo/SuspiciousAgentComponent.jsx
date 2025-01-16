import React, { useState } from 'react';

const SuspiciousAgentComponent = ({ suspiciousEvaluation }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const parsedData = suspiciousEvaluation?.suspicious_evaluation ?
        JSON.parse(suspiciousEvaluation.suspicious_evaluation) : null;

    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'bg-red-600';
            case 'medium':
                return 'bg-amber-500';
            case 'low':
                return 'bg-emerald-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (!parsedData) return null;

    const lastIndex = parsedData.suspicious_incidents.length - 1;
    const lastIncidentSeverity = parsedData.suspicious_incidents[lastIndex].severity;

    return (
        <div className="mb-4 rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Accordion Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50"
            >
                <div className="flex items-center gap-2">
                    {/* Suspicious Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <h2 className="text-lg font-bold">Suspicious Activity Analysis</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getSeverityColor(lastIncidentSeverity)}`}>
                        {lastIncidentSeverity.toUpperCase()}
                    </span>
                </div>
                <svg
                    className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                    <div className="space-y-4">
                        {parsedData.suspicious_incidents.slice(0, lastIndex).map((incident, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity.toUpperCase()}
                                    </span>

                                    {incident.time_interval && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">
                                                {incident.time_interval.start_time_seconds}s - {incident.time_interval.end_time_seconds}s
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {incident.description && (
                                    <div className="flex items-start gap-2 mt-4">
                                        <svg className="w-5 h-5 mt-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-700">
                                            {incident.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuspiciousAgentComponent; 