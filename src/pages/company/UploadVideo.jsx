import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoApi } from '../../api/videoApi';
import VideoAnalysisLogs from '../../components/UploadVideo/VideoAnalysisLogs';
import VideoSummary from '../../components/UploadVideo/VideoSummary';
import VideoChatInterface from '../../components/UploadVideo/VideoChatInterface';
import SuspiciousAgentComponent from '../../components/UploadVideo/SuspiciousAgentComponent';
import TamperAgentComponent from '../../components/UploadVideo/TamperAgentComponent';
import { errorToastConfig, successToastConfig } from '../../config/toastConfig';


const LoadingSpinner = ({ size = "small" }) => (
  <svg 
    className={`animate-spin ${size === "small" ? "h-4 w-4" : "h-5 w-5"}`} 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const UploadVideo = () => {
    const queryClient = useQueryClient();
    
    // Form states
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    // Video and UI states
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingSpecializedAnalysis, setIsGeneratingSpecializedAnalysis] = useState(false);

    // React Query mutations
    const uploadMutation = useMutation({
        mutationFn: (formData) => videoApi.uploadVideo(formData),
        onSuccess: (data) => {
            setUploadedVideo(data);
            toast.success('Video uploaded successfully!', successToastConfig);
            setTitle('');
            setDescription('');
            setFile(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error uploading video', errorToastConfig);
        }
    });

    const analysisMutation = useMutation({
        mutationFn: async (videoId) => {
            // Start with initial analysis
            const analysis = await videoApi.analyzeVideo(videoId);
            
            // Update UI with initial analysis
            setUploadedVideo(prev => ({
                ...prev,
                analysis_result: analysis
            }));

            // Generate summary first
            setIsGeneratingSummary(true);
            const [summary, customerBehavior] = await Promise.all([
                videoApi.generateSummary(videoId),
                videoApi.getAgentAnalysis(videoId, 'customer_behaviour')
            ]);
            
            // Process summary and behavior data
            const processedSummary = summary || null;
            const processedBehavior = customerBehavior || null;
            
            setUploadedVideo(prev => ({
                ...prev,
                summary_result: processedSummary,
                customer_behaviour: processedBehavior
            }));
            setIsGeneratingSummary(false);

            // Then start specialized analysis
            setIsGeneratingSpecializedAnalysis(true);
            const [suspicious, tamper] = await Promise.allSettled([
                videoApi.getAgentAnalysis(videoId, 'suspicious'),
                videoApi.getAgentAnalysis(videoId, 'tamper')
            ]);

            setIsGeneratingSpecializedAnalysis(false);
            
            return {
                suspicious_evaluation: suspicious.status === 'fulfilled' ? suspicious.value : null,
                tamper_evaluation: tamper.status === 'fulfilled' ? tamper.value : null,
                customer_behaviour: processedBehavior
            };
        },
        onSuccess: (data) => {
            setUploadedVideo(prev => ({
                ...prev,
                agents: {
                    suspicious: data.suspicious_evaluation,
                    tamper: data.tamper_evaluation
                },
                customer_behaviour: data.customer_behaviour
            }));
            toast.success('Analysis completed successfully!', successToastConfig);
        },
        onError: (error) => {
            toast.error('Error during analysis', errorToastConfig);
            setIsGeneratingSummary(false);
            setIsGeneratingSpecializedAnalysis(false);
        }
    });

    const chatMutation = useMutation({
        mutationFn: (videoId) => videoApi.initializeChat(videoId),
        onSuccess: (data) => {
            setThreadId(data.thread_id);
            setIsChatOpen(true);
        },
        onError: () => {
            toast.error('Failed to initialize chat', errorToastConfig);
        }
    });

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title.trim()) {
            toast.error('Please provide both a title and a video file', errorToastConfig);
            return;
        }

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        uploadMutation.mutate(formData);
    };

    return (
        <div className={`transition-all duration-300 ${isChatOpen ? 'mr-[400px]' : ''}`}>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Video Analyzer</h1>

                {/* Upload Form */}
                <form onSubmit={handleUpload} className="max-w-4xl mx-auto space-y-6 mb-8">
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={uploadMutation.isPending}
                    />

                    <textarea
                        placeholder="Video Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
                        disabled={uploadMutation.isPending}
                    />

                    <div className="flex items-center justify-between">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                                     hover:file:bg-blue-100"
                            disabled={uploadMutation.isPending}
                        />

                        <button
                            type="submit"
                            disabled={uploadMutation.isPending || !file}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                                     flex items-center gap-2"
                        >
                            {uploadMutation.isPending && <LoadingSpinner />}
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                        </button>
                    </div>
                </form>

                {/* Video and Analysis Section */}
                {uploadedVideo && (
                    <div className="space-y-8">
                        <video
                            controls
                            className="w-full rounded-lg shadow-lg"
                            src={uploadedVideo.video_url}
                        />

                        <div className="flex gap-4">
                            {!uploadedVideo.analysis_result && (
                                <button
                                    onClick={() => analysisMutation.mutate(uploadedVideo.id)}
                                    disabled={analysisMutation.isPending}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                                             disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                                             flex items-center gap-2"
                                >
                                    {analysisMutation.isPending && <LoadingSpinner />}
                                    {analysisMutation.isPending ? 'Analyzing...' : 'Analyze Video'}
                                </button>
                            )}

                            {uploadedVideo.analysis_result && (
                                <button
                                    onClick={() => chatMutation.mutate(uploadedVideo.id)}
                                    disabled={chatMutation.isPending || isChatOpen}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 
                                             disabled:bg-gray-400 disabled:cursor-not-allowed
                                             transition-colors flex items-center gap-2"
                                >
                                    {chatMutation.isPending ? (
                                        <>
                                            <LoadingSpinner />
                                            Initializing Chat...
                                        </>
                                    ) : isChatOpen ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Chat Active
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Chat About Analysis
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Analysis Results */}
                        {uploadedVideo.analysis_result && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="h-[600px] overflow-auto rounded-lg">
                                        <VideoAnalysisLogs analysisResult={uploadedVideo.analysis_result} />
                                    </div>
                                    <div className="h-[600px] overflow-auto rounded-lg space-y-4">
                                        {isGeneratingSummary && (
                                            <div className="bg-gray-50 rounded-lg shadow-lg p-4 mb-4">
                                                <h2 className="text-xl font-bold mb-4">Analysis in Progress</h2>
                                                <p className="text-gray-500 flex items-center gap-2">
                                                    Generating summary and behavior analysis
                                                    <LoadingSpinner />
                                                </p>
                                            </div>
                                        )}
                                        {uploadedVideo.summary_result && (
                                            <VideoSummary 
                                                title="Video Summary"
                                                summaryResult={uploadedVideo.summary_result}
                                            />
                                        )}
                                        {uploadedVideo.customer_behaviour && (
                                            <VideoSummary 
                                                title="Customer Behavior Analysis"
                                                summaryResult={uploadedVideo.customer_behaviour}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {isGeneratingSpecializedAnalysis && !uploadedVideo.agents && (
                                        <div className="bg-gray-50 rounded-lg shadow-lg p-4">
                                            <p className="text-gray-500 flex items-center gap-2">
                                                Running specialized analysis
                                                <LoadingSpinner />
                                            </p>
                                        </div>
                                    )}
                                    
                                    {uploadedVideo.agents?.suspicious && (
                                        <SuspiciousAgentComponent suspiciousEvaluation={uploadedVideo.agents.suspicious} />
                                    )}
                                    {uploadedVideo.agents?.tamper && (
                                        <TamperAgentComponent tamperEvaluation={uploadedVideo.agents.tamper} />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Chat Interface */}
            <VideoChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                threadId={threadId}
                videoId={uploadedVideo?.id}
            />
        </div>
    );
};

export default UploadVideo;