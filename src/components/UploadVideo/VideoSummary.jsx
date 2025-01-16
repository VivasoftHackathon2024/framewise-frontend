import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const VideoSummary = ({ title, summaryResult, className = '' }) => {
    if (!summaryResult) {
        return null;
    }

    // Handle all possible formats
    let summary = typeof summaryResult === 'object' ? 
        (summaryResult.summary || summaryResult.customer_behaviour || summaryResult) : 
        summaryResult;

    // Only do string replacement if it's a string
    if (typeof summary === 'string') {
        summary = summary.replace(/\\n/g, '\n');
    }

    return (
        <div className={`bg-gray-50 rounded-lg shadow-lg p-4 h-full flex flex-col ${className}`}>
            <h2 className="text-xl font-bold mb-4">
                {title}
            </h2>

            <div className={`
                bg-white 
                shadow-md 
                flex-1 
                p-8 
                overflow-auto
                scrollbar-thin
                scrollbar-track-gray-100
                scrollbar-thumb-gray-400
                hover:scrollbar-thumb-gray-500
                rounded-lg
                prose prose-sm max-w-none
                prose-headings:mt-4 prose-headings:mb-2
                prose-p:my-2
                prose-ul:my-2
                prose-li:my-0
            `}>
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="px-2"
                >
                    {summary}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default VideoSummary;
