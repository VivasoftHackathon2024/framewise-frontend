import React from 'react';
import VideoAnalysisSegment from './VideoAnalysisSegment';

const VideoAnalysisLogs = ({ analysisResult }) => {
    if (!analysisResult) {
        return (
            <div className="bg-gray-50 rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-bold mb-4">Analysis Logs</h2>
                <p className="text-gray-500 italic">No analysis data available yet.</p>
            </div>
        );
    }

    // Ensure analysisResult is an array
    const segments = Array.isArray(analysisResult) ? analysisResult : [analysisResult];

    return (
        <div className="bg-gray-50 rounded-lg shadow-lg p-4 h-full">
            <h2 className="text-xl font-bold mb-4">Video Analysis</h2>
            
            <div className="space-y-4 overflow-auto">
                {segments.map((segment, index) => (
                    <VideoAnalysisSegment 
                        key={index} 
                        segment={segment}
                    />
                ))}
            </div>
        </div>
    );
};

export default VideoAnalysisLogs;
