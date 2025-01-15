import React from 'react';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoAnalysisSegment = ({ segment }) => {
    const { start_time_seconds, end_time_seconds, analysis } = segment;
    const content = analysis?.choices?.[0]?.message?.content;

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {formatTime(start_time_seconds)} - {formatTime(end_time_seconds)}
                </span>
                <span className="text-xs text-gray-500">
                    Duration: {(end_time_seconds - start_time_seconds).toFixed(1)}s
                </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">
                {content}
            </p>
        </div>
    );
};

export default VideoAnalysisSegment; 