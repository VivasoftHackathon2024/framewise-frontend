import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { videoApi } from "../../api/videoApi";
import VideoAnalysisLogs from "../../components/UploadVideo/VideoAnalysisLogs";
import VideoSummary from "../../components/UploadVideo/VideoSummary";
import VideoChatInterface from "../../components/UploadVideo/VideoChatInterface";
import { errorToastConfig } from "../../config/toastConfig";
import Spinner from "../../components/Spinner";
import SuspiciousAgentComponent from '../../components/UploadVideo/SuspiciousAgentComponent';
import TamperAgentComponent from '../../components/UploadVideo/TamperAgentComponent';

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

const VideoLogs = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);

  // Parse video data when selecting a video
  const handleVideoSelect = (video) => {
    console.log('Video data:', video);
    try {
      const parsedVideo = {
        ...video,
        summary_result:video.summary_result.slice(13, -2),
        customer_behaviour_result: video.customer_behaviour.slice(24, -2),
        suspicious_evaluation: typeof video.suspicious_evaluation === 'string' ? 
          JSON.parse(video.suspicious_evaluation) : video.suspicious_evaluation,
        tamper_evaluation: typeof video.tamper_evaluation === 'string' ? 
          JSON.parse(video.tamper_evaluation) : video.tamper_evaluation,
      };
      console.log('Parsed video:', parsedVideo);
      setSelectedVideo(parsedVideo);
    } catch (error) {
      console.error('Error parsing video data:', error);
      console.log('Raw video data:', video);
      // Provide default values when parsing fails
      setSelectedVideo({
        ...video,
        summary_result: video.summary_result || '',
        customer_behaviour_result: video.customer_behaviour || '',
        suspicious_evaluation: null,
        tamper_evaluation: null
      });
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
    <div
      className={`transition-all duration-300 ${
        isChatOpen ? "mr-[400px]" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Video Logs</h1>

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {videos?.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleVideoSelect(video)}
            >
              <video
                className="w-full h-48 object-cover"
                src={video.video_url}
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {video.description}
                </p>
                <p className="text-gray-500 text-xs">
                  Uploaded on {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Video Analysis */}
        {selectedVideo && (
          <div className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <video
                controls
                className="w-full rounded-lg shadow-lg"
                src={selectedVideo.video_url}
              />
            </div>

            <div className="flex gap-4">
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

            {selectedVideo.analysis_result && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-[600px] overflow-auto rounded-lg">
                    <VideoAnalysisLogs
                      analysisResult={selectedVideo.analysis_result}
                    />
                  </div>
                  <div className="h-[600px] overflow-auto rounded-lg space-y-4">
                    {selectedVideo.summary_result && (
                      <VideoSummary
                        title="Video Summary"
                        summaryResult={selectedVideo.summary_result}
                      />
                    )}
                    {selectedVideo.customer_behaviour_result && (
                      <VideoSummary
                        title="Customer Behavior Analysis"
                        summaryResult={selectedVideo.customer_behaviour_result}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedVideo.suspicious_evaluation && (
                    <SuspiciousAgentComponent 
                      suspiciousEvaluation={selectedVideo.suspicious_evaluation} 
                    />
                  )}
                  {selectedVideo.tamper_evaluation && (
                    <TamperAgentComponent 
                      tamperEvaluation={selectedVideo.tamper_evaluation} 
                    />
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
        videoId={selectedVideo?.id}
      />
    </div>
  );
};

export default VideoLogs;
