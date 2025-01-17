import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { videoApi } from "../../api/videoApi";
import VideoAnalysisLogs from "../../components/UploadVideo/VideoAnalysisLogs";
import VideoSummary from "../../components/UploadVideo/VideoSummary";
import VideoChatInterface from "../../components/UploadVideo/VideoChatInterface";
import { errorToastConfig } from "../../config/toastConfig";
import Spinner from "../../components/Spinner";
import FireAgentComponent from "../../components/UploadVideo/FireAgentComponent";
import AssaultAgentComponent from "../../components/UploadVideo/AssaultAgentComponent";
import CrimeAgentComponent from "../../components/UploadVideo/CrimeAgentComponent";
import DrugAgentComponent from "../../components/UploadVideo/DrugAgentComponent";
import TheftAgentComponent from "../../components/UploadVideo/TheftAgentComponent";

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

const StreamAnalysisLogs = ({ analysisTimeline }) => {
  if (!analysisTimeline?.length) return null;

  // Sort timeline by timestamp in ascending order
  const sortedTimeline = [...analysisTimeline].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Stream Analysis Timeline</h2>
      <div className="space-y-6">
        {sortedTimeline.map((entry, index) => (
          <div 
            key={entry.analysis.id}
            className={`border-l-4 ${index === sortedTimeline.length - 1 ? 'border-green-500' : 'border-blue-500'} pl-4 py-2`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              {index === sortedTimeline.length - 1 && (
                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                  Latest
                </span>
              )}
            </div>
            <p className="text-gray-700">
              {entry.analysis.choices[0].message.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoLogs = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [activeTab, setActiveTab] = useState('uploads');

  // Parse video data when selecting a video
  const handleVideoSelect = (video) => {
    try {
      let parsedVideo;
      
      if (video.analysis_timeline) {
        // Stream data - use directly without parsing
        parsedVideo = {
          ...video,
          summary_result: video.summary_result,
          fire_evaluation: video.fire_evaluation,
          assault_evaluation: video.assault_evaluation,
          crime_evaluation: video.crime_evaluation,
          drug_evaluation: video.drug_evaluation,
          theft_evaluation: video.theft_evaluation,
        };
      } else {
        // Video data - parse JSON strings from nested properties
        parsedVideo = {
          ...video,
          summary_result: video.summary_result ? video.summary_result.slice(13, -2) : null,
          fire_evaluation: video.fire_evaluation?.fire_evaluation ? 
            JSON.parse(video.fire_evaluation.fire_evaluation) : null,
          assault_evaluation: video.assault_evaluation?.assault_evaluation ? 
            JSON.parse(video.assault_evaluation.assault_evaluation) : null,
          crime_evaluation: video.crime_evaluation?.crime_evaluation ? 
            JSON.parse(video.crime_evaluation.crime_evaluation) : null,
          drug_evaluation: video.drug_evaluation?.drug_evaluation ? 
            JSON.parse(video.drug_evaluation.drug_evaluation) : null,
          theft_evaluation: video.theft_evaluation?.theft_evaluation ? 
            JSON.parse(video.theft_evaluation.theft_evaluation) : null,
        };
      }
      
      console.log('Parsed video:', parsedVideo);
      setSelectedVideo(parsedVideo);
    } catch (error) {
      console.error('Error parsing video data:', error);
      console.log('Raw video data:', video);
      setSelectedVideo(video);
    }
  };

  // Fetch user's videos
  const { data: videos, isLoading } = useQuery({
    queryKey: ["userVideos", user?.id],
    queryFn: () => videoApi.getUserVideos(user?.id),
    enabled: !!user?.id,
    onError: (error) => {
      toast.error("Failed to fetch videos", errorToastConfig);
    },
    retry: false,
  });

  // Add new query for streams
  const { data: streams, isLoading: isLoadingStreams } = useQuery({
    queryKey: ["userStreams"],
    queryFn: () => videoApi.getUserStreams(),
    enabled: !!user?.id,
    onError: (error) => {
      toast.error("Failed to fetch streams", errorToastConfig);
    },
    retry: false,
  });

  // Chat initialization mutation
  const chatMutation = useMutation({
    mutationFn: (videoId) => videoApi.initializeChat(videoId),
    onSuccess: (data) => {
      setThreadId(data.thread_id);
      setIsChatOpen(true);
    },
    onError: () => {
      toast.error("Failed to initialize chat", errorToastConfig);
    },
  });

  if (isLoading) {
    return (
      <>
        <Spinner />
      </>
    );
  }

  return (
    <div className={`transition-all duration-300 ${isChatOpen ? "mr-[400px]" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Video Logs</h1>

        <div className="flex h-[calc(100vh-12rem)] gap-6">
          {/* Left Sidebar - Video/Stream List */}
          <div className="w-1/3 bg-gray-50 rounded-xl p-4 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
              <button
                onClick={() => setActiveTab('uploads')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${activeTab === 'uploads'
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  }`}
              >
                Uploads
              </button>
              <button
                onClick={() => setActiveTab('streams')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${activeTab === 'streams'
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  }`}
              >
                Streams
              </button>
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto flex-1">
              {activeTab === 'uploads' ? (
                <div className="space-y-4">
                  {videos?.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`bg-white rounded-lg shadow cursor-pointer transition-all
                        ${selectedVideo?.id === video.id 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'}`}
                    >
                      <div className="aspect-video">
                        <video
                          className="w-full h-full object-cover rounded-t-lg"
                          src={video.video_url}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'streams' && (
                    <div className="space-y-4">
                      {isLoadingStreams ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                          <svg
                            className="animate-spin h-8 w-8 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
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
                          <span className="text-gray-600 font-medium">Loading streams...</span>
                        </div>
                      ) : (
                        streams?.streams?.map((stream) => (
                          <div
                            key={stream.stream_id}
                            onClick={() => handleVideoSelect({
                              id: stream.stream_id,
                              title: `Stream ${stream.stream_id}`,
                              analysis_timeline: stream.analysis_timeline,
                              summary_result: stream.latest_summary ? 
                                stream.latest_summary.slice(13, -2) : null,
                              fire_evaluation: stream.latest_fire_evaluation?.fire_evaluation ? 
                                JSON.parse(stream.latest_fire_evaluation.fire_evaluation) : null,
                              assault_evaluation: stream.latest_assault_evaluation?.assault_evaluation ? 
                                JSON.parse(stream.latest_assault_evaluation.assault_evaluation) : null,
                              crime_evaluation: stream.latest_crime_evaluation?.crime_evaluation ? 
                                JSON.parse(stream.latest_crime_evaluation.crime_evaluation) : null,
                              drug_evaluation: stream.latest_drug_evaluation?.drug_evaluation ? 
                                JSON.parse(stream.latest_drug_evaluation.drug_evaluation) : null,
                              theft_evaluation: stream.latest_theft_evaluation?.theft_evaluation ? 
                                JSON.parse(stream.latest_theft_evaluation.theft_evaluation) : null,
                            })}
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all
                              ${selectedVideo?.id === stream.stream_id 
                                ? 'ring-2 ring-blue-500 shadow-lg' 
                                : 'hover:shadow-md'}`}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-900">Stream {stream.id}</h3>
                              {stream.has_alert && (
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                  Alert
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Last Update: {new Date(stream.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area - Analysis Display */}
          <div className="flex-1">
            {selectedVideo ? (
              <div className="space-y-6">
                {/* Video Player (only for uploads) */}
                {selectedVideo.video_url && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full object-contain"
                      src={selectedVideo.video_url}
                    />
                  </div>
                )}

                {/* Chat Button */}
                <div>
                  <button
                    onClick={() => chatMutation.mutate(selectedVideo.id)}
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
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Chat Active
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Chat About Analysis
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis Section */}
                <div className="bg-white rounded-lg shadow-lg">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Analysis</h2>
                  </div>
                  <div className="p-4 max-h-[800px] overflow-y-auto">
                    {selectedVideo.analysis_timeline ? (
                      <StreamAnalysisLogs analysisTimeline={selectedVideo.analysis_timeline} />
                    ) : selectedVideo.analysis_result && (
                      <VideoAnalysisLogs analysisResult={selectedVideo.analysis_result} />
                    )}
                  </div>
                </div>

                {/* Summary Section */}
                {selectedVideo.summary_result && (
                  <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-4 border-b">
                      <h2 className="text-xl font-semibold">Summary</h2>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      <VideoSummary summaryResult={selectedVideo.summary_result} />
                    </div>
                  </div>
                )}

                {/* Evaluations Section */}
                <div className="bg-white rounded-lg shadow-lg">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Evaluations</h2>
                  </div>
                  <div className="p-4 max-h-[800px] overflow-y-auto">
                    <div className="space-y-4">
                      {selectedVideo.analysis_timeline ? (
                        // Stream evaluations - wrap in the expected format
                        <>
                          {selectedVideo.fire_evaluation && (
                            <FireAgentComponent fireEvaluation={{ fire_evaluation: JSON.stringify(selectedVideo.fire_evaluation) }} />
                          )}
                          {selectedVideo.assault_evaluation && (
                            <AssaultAgentComponent assaultEvaluation={{ assault_evaluation: JSON.stringify(selectedVideo.assault_evaluation) }} />
                          )}
                          {selectedVideo.crime_evaluation && (
                            <CrimeAgentComponent crimeEvaluation={{ crime_evaluation: JSON.stringify(selectedVideo.crime_evaluation) }} />
                          )}
                          {selectedVideo.drug_evaluation && (
                            <DrugAgentComponent drugEvaluation={{ drug_evaluation: JSON.stringify(selectedVideo.drug_evaluation) }} />
                          )}
                          {selectedVideo.theft_evaluation && (
                            <TheftAgentComponent theftEvaluation={{ theft_evaluation: JSON.stringify(selectedVideo.theft_evaluation) }} />
                          )}
                        </>
                      ) : (
                        // Video evaluations - same as before
                        <>
                          {selectedVideo.fire_evaluation && (
                            <FireAgentComponent fireEvaluation={{ fire_evaluation: JSON.stringify(selectedVideo.fire_evaluation) }} />
                          )}
                          {selectedVideo.assault_evaluation && (
                            <AssaultAgentComponent assaultEvaluation={{ assault_evaluation: JSON.stringify(selectedVideo.assault_evaluation) }} />
                          )}
                          {selectedVideo.crime_evaluation && (
                            <CrimeAgentComponent crimeEvaluation={{ crime_evaluation: JSON.stringify(selectedVideo.crime_evaluation) }} />
                          )}
                          {selectedVideo.drug_evaluation && (
                            <DrugAgentComponent drugEvaluation={{ drug_evaluation: JSON.stringify(selectedVideo.drug_evaluation) }} />
                          )}
                          {selectedVideo.theft_evaluation && (
                            <TheftAgentComponent theftEvaluation={{ theft_evaluation: JSON.stringify(selectedVideo.theft_evaluation) }} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a video or stream to view analysis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <VideoChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        threadId={threadId}
        videoId={selectedVideo?.id}
      />
    </div>
  );
};

export default VideoLogs;
