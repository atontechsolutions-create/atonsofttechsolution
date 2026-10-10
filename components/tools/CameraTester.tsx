import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Camera,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface CameraTesterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const CameraTester: React.FC<CameraTesterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [isActive, setIsActive] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Video properties
  const [streamResolution, setStreamResolution] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatioStr, setAspectRatioStr] = useState<string>('');
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const cams = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(cams);
        if (cams.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(cams[0].deviceId);
        }
      }).catch(() => {});
    }

    return () => {
      stopCamera();
      if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    };
  }, []);

  const startCamera = async (deviceId?: string) => {
    try {
      setErrorMessage('');
      if (streamRef.current) {
        stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Re-enumerate to get device labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(cams);

      toast.success('Camera activated! Live preview running.');
    } catch (err: unknown) {
      const error = err as Error;
      setIsActive(false);
      setHasPermission(false);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser URL bar.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera or webcam hardware detected on this device.');
      } else {
        setErrorMessage(`Unable to access camera: ${error.message || 'Unknown error'}`);
      }
      toast.error('Could not access camera.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setStreamResolution(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      setStreamResolution({ width: w, height: h });
      if (w > 0 && h > 0) {
        const ratio = (w / h).toFixed(2);
        setAspectRatioStr(ratio === '1.78' ? '16:9 (Widescreen)' : ratio === '1.33' ? '4:3 (Standard)' : `${w}×${h}`);
      }
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !isActive) {
      toast.error('Camera must be active to take a snapshot');
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
        const url = URL.createObjectURL(blob);
        setSnapshotUrl(url);
        toast.success('Snapshot captured successfully!');
      }
    }, 'image/jpeg', 0.95);
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isActive) {
      startCamera(deviceId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Ad Banner */}
      <div className="max-w-5xl mx-auto mb-6">
        <AdSenseUnit format="horizontal" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royalBlue dark:text-sky-400 mb-1">
              <button
                onClick={() => onNavigateToTool?.('/tools')}
                className="hover:underline flex items-center gap-1 text-slate-500 dark:text-slate-400"
              >
                Tools
              </button>
              <span>/</span>
              <span>Device Testers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Camera & Webcam Tester</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Test webcam resolution, frame rate, mirror settings, and capture test photos before Google Meet, Zoom, or online exam interviews.
            </p>
          </div>
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Tool link copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Tool
            </button>
          </div>
        </div>

        {/* Main Testing Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Live Video Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isActive ? <Video className="w-6 h-6 animate-pulse" /> : <VideoOff className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isActive ? 'Camera Running' : 'Camera Disconnected'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isActive ? 'Streaming live video feed directly in browser' : 'Click "Start Camera" to test your webcam'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isActive ? (
                  <button
                    onClick={() => startCamera(selectedDeviceId)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-royalBlue hover:bg-royalBlue/90 text-white font-medium text-sm shadow-sm transition hover:scale-105 active:scale-95"
                  >
                    <Video className="w-4 h-4" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition active:scale-95"
                  >
                    <VideoOff className="w-4 h-4" /> Stop Camera
                  </button>
                )}
              </div>
            </div>

            {/* Error banner if permission denied */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Camera Access Error</p>
                  <p className="text-xs mt-0.5 text-red-700 dark:text-red-400">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Video Viewport Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleLoadedMetadata}
                className={`w-full h-full object-cover transition-transform ${
                  isMirrored ? '-scale-x-100' : 'scale-x-100'
                } ${!isActive ? 'hidden' : 'block'}`}
              />

              {!isActive && (
                <div className="text-center p-6 text-slate-500 space-y-3">
                  <Camera className="w-16 h-16 mx-auto stroke-1 opacity-40" />
                  <p className="text-sm font-medium">Camera preview will appear here</p>
                  <p className="text-xs max-w-xs opacity-75">
                    Your video is processed strictly on your computer and never leaves your browser.
                  </p>
                </div>
              )}

              {/* Viewport Overlay Controls when active */}
              {isActive && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
                    LIVE | {streamResolution ? `${streamResolution.width}×${streamResolution.height}` : 'Detecting...'}
                  </div>

                  <div className="pointer-events-auto flex items-center gap-2">
                    <button
                      onClick={() => setIsMirrored(!isMirrored)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-xs font-medium transition"
                    >
                      {isMirrored ? 'Disable Mirror' : 'Enable Mirror'}
                    </button>
                    <button
                      onClick={takeSnapshot}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition"
                    >
                      <Camera className="w-3.5 h-3.5" /> Take Test Snapshot
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Selector dropdown */}
            {videoDevices.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Select Camera Device:
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royalBlue"
                >
                  {videoDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Test Snapshot Gallery if taken */}
            {snapshotUrl && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Captured Test Snapshot
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <img
                    src={snapshotUrl}
                    alt="Webcam Test Snapshot"
                    className="w-32 h-20 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
                  />
                  <div className="space-y-2">
                    <a
                      href={snapshotUrl}
                      download="webcam-test-snapshot.jpg"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-royalBlue text-white text-xs font-semibold hover:bg-royalBlue/90 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Snapshot (JPEG)
                    </a>
                    <p className="text-xs text-slate-500">Inspect facial sharpness and lighting balance.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Diagnostics & Specs */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Camera Diagnostics
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">WebRTC Video API</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Supported</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Resolution</span>
                  <span className="font-mono font-bold text-royalBlue dark:text-sky-400">
                    {streamResolution ? `${streamResolution.width} × ${streamResolution.height} px` : '—'}
                  </span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Aspect Ratio</span>
                  <span className="font-semibold">{aspectRatioStr || '—'}</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Cameras Detected</span>
                  <span className="font-semibold">{videoDevices.length || (isActive ? '1+' : '0')}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Browser Permission</span>
                  <span
                    className={`font-semibold ${
                      hasPermission === true
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : hasPermission === false
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {hasPermission === true ? 'Granted' : hasPermission === false ? 'Denied' : 'Pending'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-5 text-xs text-sky-900 dark:text-sky-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-sm text-sky-800 dark:text-sky-300">
                <HelpCircle className="w-4 h-4" /> Lighting & Interview Tips
              </p>
              <ul className="list-disc list-inside space-y-1.5 opacity-90">
                <li>Place your primary light source in front of your face, never directly behind you.</li>
                <li>Position the camera lens at eye level to maintain natural eye contact.</li>
                <li>Close other apps (like Zoom or Teams) if camera access appears locked.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="webcam-tester"
          currentCategory="Device Testers"
          onNavigateToTool={onNavigateToTool}
        />

        {/* Bottom Ad Unit */}
        <div className="pt-4">
          <AdSenseUnit format="horizontal" />
        </div>
      </div>
    </div>
  );
};

export default CameraTester;
