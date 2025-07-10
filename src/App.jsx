import React, { useState, useRef } from "react";
import { X, Video, Square } from "lucide-react";

const App = () => {
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    education: "",
    experienceLevel: "",
    jobCategory: "",
    introduction: "",
    videoFile: null,
  });

  const [wordCount, setWordCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const chunksRef = useRef([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "introduction") {
      setWordCount(
        value
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      setFormData((prev) => ({
        ...prev,
        videoFile: {
          blob: file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: url,
          duration: "Unknown",
          quality: "Original",
        },
      }));
    }
  };

  const handleRecordVideo = async () => {
    if (!isRecording) {
      try {
        // Start recording with 720p quality
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            sampleRate: 44100,
            channelCount: 2,
            volume: 1.0,
          },
        });

        setStream(mediaStream);

        // Show preview
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Use higher quality settings for recording
        const options = {
          mimeType: "video/webm;codecs=vp9,opus",
          videoBitsPerSecond: 2500000, // 2.5 Mbps for good 720p quality
          audioBitsPerSecond: 128000, // 128 kbps for good audio quality
        };

        // Fallback for browsers that don't support vp9
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = "video/webm;codecs=vp8,opus";
        }

        // Final fallback
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = "video/webm";
        }

        const recorder = new MediaRecorder(mediaStream, options);
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);

          // Save video file in form data hook
          setFormData((prev) => ({
            ...prev,
            videoFile: {
              blob: blob,
              name: `video_${Date.now()}.webm`,
              size: blob.size,
              type: blob.type,
              url: url,
              duration: "15s",
              quality: "720p",
            },
          }));

          console.log("Video recorded successfully:", {
            size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
            type: blob.type,
            quality: "720p",
          });

          // Stop all tracks
          mediaStream.getTracks().forEach((track) => track.stop());
          setStream(null);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);

        // Auto-stop after 15 seconds
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
            setIsRecording(false);
          }
        }, 15000);
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert(
          "Unable to access camera. Please check permissions and ensure your device has a camera."
        );
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Log the complete form data including video file details
    console.log("Form submitted with data:", {
      ...formData,
      videoFile: formData.videoFile
        ? {
            name: formData.videoFile.name,
            size: `${(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB`,
            type: formData.videoFile.type,
            quality: formData.videoFile.quality,
            duration: formData.videoFile.duration,
          }
        : null,
    });

    // Here you can access the video file from formData.videoFile.blob
    // You can upload it to your server or process it as needed
    if (formData.videoFile) {
      console.log("Video file ready for upload:", formData.videoFile.blob);
      // Example: Upload to server
      // uploadVideoToServer(formData.videoFile.blob);
    }
  };

  const handleClose = () => {
    // Clean up video stream if recording
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    console.log("Form closed");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-blue-600">
              COMPLETE YOUR APPLICATION
            </h2>
            {/* <p className="text-sm text-gray-600">
              Welcome, Jaahid Hassan! Please complete your hiring form.
            </p> */}
            <p className="text-sm text-blue-500 cursor-pointer hover:underline">
              ← Back to login
            </p>
          </div>
          {/* <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button> */}
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* LzyCrazyID */}
          {/* <div className="mb-4">
            <p className="text-sm text-gray-700">
              <strong>Your LzyCrazyID:</strong> lxxxxxxxxx005
            </p>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter your country"
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education *
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="Your highest education"
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Select --</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Category *
              </label>
              <select
                name="jobCategory"
                value={formData.jobCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Select --</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Introduction (Max 50 Words) *
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleInputChange}
              placeholder="Tell us about yourself in 50 words or less..."
              rows={1}
              className="w-full px-3 py-1 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              Word count: {wordCount}/50
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              15s Video Introduction *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {isRecording || recordedVideoUrl ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted={isRecording}
                    controls={!isRecording && recordedVideoUrl}
                    src={recordedVideoUrl}
                    className="w-full max-w-xs mx-auto rounded-lg"
                  />
                  {isRecording && (
                    <div className="text-red-500 font-medium">
                      Recording... (15s max)
                    </div>
                  )}
                  {recordedVideoUrl && !isRecording && (
                    <div className="mt-2 text-sm text-green-600">
                      Video recorded successfully!
                      {formData.videoFile && (
                        <span className="block text-gray-500">
                          Size:{" "}
                          {(formData.videoFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB | Quality: {formData.videoFile.quality}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* <Video size={48} className="mx-auto text-gray-400" /> */}
                  {/* <p className="text-sm text-gray-500">
                    Record a 15-second video introduction
                  </p> */}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleRecordVideo}
                  className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 mx-auto ${
                    isRecording
                      ? "bg-red-500 text-gray-700 hover:bg-red-600"
                      : "bg-blue-500 text-gray-700 hover:bg-blue-600"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square size={16} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Video size={16} />
                      {recordedVideoUrl ? "Record Again" : "Record Video"}
                    </>
                  )}
                </button>

                {!isRecording && (
                  <div className="text-sm text-gray-500">
                    <p>Or upload a video file</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gray-400 text-gray-700 py-3 px-4 rounded-md font-medium "
            >
              SUBMIT APPLICATION
            </button>
          </div>
        </div>

        <div className="p-4 border-t text-center text-sm text-gray-500">
          ©LzyCrazy Pvt Ltd. All right reserved.
        </div>
      </div>
    </div>
  );
};

export default App;
