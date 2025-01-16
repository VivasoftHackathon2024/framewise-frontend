import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import authenticatedAxios from '../../config/axiosConfig';
import { SERVER_URL } from '../../data/path';
import { videoApi } from '../../api/videoApi';
import VideoSummary from '../../components/UploadVideo/VideoSummary';
import FireAgentComponent from '../../components/UploadVideo/FireAgentComponent';
import AssaultAgentComponent from '../../components/UploadVideo/AssaultAgentComponent';
import CrimeAgentComponent from '../../components/UploadVideo/CrimeAgentComponent';
import DrugAgentComponent from '../../components/UploadVideo/DrugAgentComponent';
import TheftAgentComponent from '../../components/UploadVideo/TheftAgentComponent';

function StreamVideo() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [streaming, setStreaming] = useState(false);
    const [logs, setLogs] = useState([]);
    const recordingIntervalRef = useRef(null);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [streamId, setStreamId] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingSpecializedAnalysis, setIsGeneratingSpecializedAnalysis] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [lastVideoId, setLastVideoId] = useState(null);

    // Upload video mutation
    const uploadVideoMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await authenticatedAxios.post(`${SERVER_URL}/videos/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        retry: false
    });

    // Analyze video mutation
    const analyzeVideoMutation = useMutation({
        mutationFn: async (videoId) => {
            const response = await authenticatedAxios.post(`${SERVER_URL}/videos/${videoId}/analyze_stream/`);
            return response.data;
        },
        onSuccess: (data) => {
            setLogs(prevLogs => [...prevLogs, data]); // Always update logs regardless of streaming state
        },
        retry: false
    });

    const analyzeStreamMutation = useMutation({
        mutationFn: async (streamId) => {
            setIsAnalyzing(true);
            
            // Generate summary first
            setIsGeneratingSummary(true);
            const summary = await videoApi.generateSummary(lastVideoId);
            
            // Update with initial results
            setAnalysisResults({
                summary_result: summary || null
            });
            setIsGeneratingSummary(false);

            // Then start specialized analysis
            setIsGeneratingSpecializedAnalysis(true);
            const [fire, assault, crime, drug, theft] = await Promise.allSettled([
                videoApi.getAgentAnalysis(lastVideoId, 'fire'),
                videoApi.getAgentAnalysis(lastVideoId, 'assault'),
                videoApi.getAgentAnalysis(lastVideoId, 'crime'),
                videoApi.getAgentAnalysis(lastVideoId, 'drug'),
                videoApi.getAgentAnalysis(lastVideoId, 'theft')
            ]);
            
            setIsGeneratingSpecializedAnalysis(false);
            setIsAnalyzing(false);

            return {
                summary_result: summary || null,
                agents: {
                    fire: fire.status === 'fulfilled' ? fire.value : null,
                    assault: assault.status === 'fulfilled' ? assault.value : null,
                    crime: crime.status === 'fulfilled' ? crime.value : null,
                    drug: drug.status === 'fulfilled' ? drug.value : null,
                    theft: theft.status === 'fulfilled' ? theft.value : null
                }
            };
        },
        onSuccess: (data) => {
            setAnalysisResults(data);
        },
    });

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                const newStreamId = crypto.randomUUID();
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setStreaming(true);
                setStreamId(newStreamId);
                setLogs([]); // Clear logs when starting new stream
                setAnalysisResults(null); // Clear previous analysis
                setLastVideoId(null); // Reset lastVideoId for new stream
                startRecordingCycle(newStreamId);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopStream = () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStreaming(false);
        setCurrentVideoId(null);
        // Keep lastVideoId for analysis
    };

    const startRecordingCycle = (currentStreamId) => {
        recordingIntervalRef.current = setInterval(async () => {
            if (!streamRef.current) return;

            try {
                const videoBlob = await recordVideoChunk();
                await processVideoChunk(videoBlob, currentStreamId);
            } catch (error) {
                console.error('Error in recording cycle:', error);
            }
        }, 10000); // Record every 10 seconds
    };

    const recordVideoChunk = () => {
        return new Promise((resolve, reject) => {
            const mediaRecorder = new MediaRecorder(streamRef.current);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };

            mediaRecorder.onerror = (error) => {
                reject(error);
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 10000);
        });
    };

    const processVideoChunk = async (videoBlob, currentStreamId) => {
        try {
            const formData = new FormData();
            formData.append('video', videoBlob, 'stream.webm');
            formData.append('title', 'stream_title');
            formData.append('description', 'stream_description');
            formData.append('stream_id', currentStreamId);

            // Upload video
            const uploadResult = await uploadVideoMutation.mutateAsync(formData);
            const videoId = uploadResult.id;
            setCurrentVideoId(videoId);
            setLastVideoId(videoId); // Store the last video ID

            // Analyze the uploaded video
            await analyzeVideoMutation.mutateAsync(videoId);

        } catch (error) {
            console.error('Error processing video chunk:', error);
        }
    };

    useEffect(() => {
        return () => {
            stopStream();
        };
    }, []);

    const isLoading = uploadVideoMutation.isPending || analyzeVideoMutation.isPending;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Live Stream</h1>
                <video
                    ref={videoRef}
                    autoPlay
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg mb-4"
                />
                <div className="flex justify-center items-center gap-4">
                    <button
                        className={`px-6 py-2 rounded-md font-semibold text-white transition-colors
                            ${streaming 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-blue-500 hover:bg-blue-600'} 
                            ${!streaming && isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={streaming ? stopStream : startStream}
                        disabled={!streaming && isLoading}
                    >
                        {streaming ? 'Stop Stream' : 'Start Stream'}
                    </button>
                    {isLoading && (
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                </div>
            </div>

            {/* Analysis Logs */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Stream Analysis Logs</h2>
                    {!streaming && logs.length > 0 && (
                        <button
                            onClick={() => analyzeStreamMutation.mutate(streamId)}
                            disabled={isAnalyzing}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                                     flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Stream'
                            )}
                        </button>
                    )}
                </div>

                {/* Logs Display */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    {logs.map((log, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-b-0 py-4">
                            <span className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <p className="mt-2 text-gray-700">
                                {log.analysis?.choices?.[0]?.message?.content || 'No content'}
                            </p>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <p className="text-gray-500 text-center py-8">
                            No analysis logs yet. Start streaming to see analysis results.
                        </p>
                    )}
                </div>
            </div>

            {/* Analysis Results */}
            {(analysisResults || isGeneratingSummary) && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Stream Analysis Results</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[600px] overflow-auto rounded-lg space-y-4">
                            {isGeneratingSummary && (
                                <div className="bg-gray-50 rounded-lg shadow-lg p-4 mb-4">
                                    <h2 className="text-xl font-bold mb-4">Analysis in Progress</h2>
                                    <div className="text-gray-500 flex items-center gap-2">
                                        Generating summary
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </div>
                            )}
                            {analysisResults?.summary_result && (
                                <VideoSummary 
                                    title="Stream Summary"
                                    summaryResult={analysisResults.summary_result}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 mt-4">
                        {isGeneratingSpecializedAnalysis && (
                            <div className="bg-gray-50 rounded-lg shadow-lg p-4">
                                <div className="text-gray-500 flex items-center gap-2">
                                    Running specialized analysis
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            </div>
                        )}
                        
                        {analysisResults?.agents?.fire && (
                            <FireAgentComponent fireEvaluation={analysisResults.agents.fire} />
                        )}
                        {analysisResults?.agents?.assault && (
                            <AssaultAgentComponent assaultEvaluation={analysisResults.agents.assault} />
                        )}
                        {analysisResults?.agents?.crime && (
                            <CrimeAgentComponent crimeEvaluation={analysisResults.agents.crime} />
                        )}
                        {analysisResults?.agents?.drug && (
                            <DrugAgentComponent drugEvaluation={analysisResults.agents.drug} />
                        )}
                        {analysisResults?.agents?.theft && (
                            <TheftAgentComponent theftEvaluation={analysisResults.agents.theft} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StreamVideo;