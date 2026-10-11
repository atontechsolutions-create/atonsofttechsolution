import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  RefreshCw,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface MicrophoneTesterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const MicrophoneTester: React.FC<MicrophoneTesterProps> = ({ onNavigateToTool }) => {
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeDeviceName, setActiveDeviceName] = useState<string>('');

  // Recording playback test
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const refreshAudioDevices = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        setAudioDevices(mics);
        if (mics.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(mics[0].deviceId);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshAudioDevices();

    // Listen for device connects / disconnects (e.g. plugging in headset)
    if (navigator.mediaDevices && 'ondevicechange' in navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = () => {
        refreshAudioDevices();
      };
    }

    return () => {
      stopMicrophone();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startMicrophone = async (deviceId?: string) => {
    try {
      setErrorMessage('');

      // Check if getUserMedia is supported
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported on this browser or connection is not secure (requires HTTPS or localhost).');
      }

      if (micStreamRef.current) {
        stopMicrophone();
      }

      // First try with explicit deviceId if selected, fallback cleanly if constraint fails
      let stream: MediaStream;
      const primaryConstraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (err: unknown) {
        const e = err as Error;
        // If exact device failed or was unplugged, fallback to general default mic
        if (deviceId && (e.name === 'OverconstrainedError' || e.name === 'NotFoundError')) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } else {
          throw err;
        }
      }

      micStreamRef.current = stream;
      setHasPermission(true);
      setIsListening(true);

      // Track active device label
      const activeTrack = stream.getAudioTracks()[0];
      if (activeTrack) {
        setActiveDeviceName(activeTrack.label || 'Default Microphone');
      }

      // Re-enumerate devices so browser gives us real friendly names now that permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setAudioDevices(mics);
      if (mics.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(mics[0].deviceId);
      }

      // Audio analysis setup with cross-browser compatibility
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      // Crucial: Browsers autoplay policy suspends AudioContext until resumed
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;

        // Ensure AudioContext isn't suspended mid-stream
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getByteTimeDomainData(timeDataArray);

        // Calculate Root-Mean-Square (RMS) for natural, accurate audio level detection
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = (timeDataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Also check frequency average
        let freqSum = 0;
        for (let i = 0; i < bufferLength; i++) {
          freqSum += dataArray[i];
        }
        const freqAverage = freqSum / bufferLength;

        // Combine for a very responsive, realistic 0-100% volume level meter
        const levelFromRms = Math.min(100, Math.round(rms * 220));
        const levelFromFreq = Math.min(100, Math.round((freqAverage / 128) * 100));
        const finalLevel = Math.max(levelFromRms, levelFromFreq);

        setVolumeLevel(finalLevel);
        setPeakLevel((prev) => Math.max(prev, finalLevel));

        // Draw live audio waveform on canvas if present
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#1E5EFF';
            ctx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = timeDataArray[i] / 128.0;
              const y = (v * canvas.height) / 2;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
          }
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      toast.success('Microphone connected successfully! Speak now.');
    } catch (err: unknown) {
      const error = err as Error;
      setIsListening(false);
      setHasPermission(false);
      setVolumeLevel(0);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permission was denied. Click the lock/settings icon in your browser address bar and change Microphone to "Allow", then try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone device was detected. Please plug in or enable your microphone/headset and retry.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setErrorMessage('Microphone is in use by another app (e.g., Zoom, Google Meet, Teams, or Skype). Please close them and test again.');
      } else {
        setErrorMessage(`Unable to access microphone: ${error.message || 'Microphone device could not be started.'}`);
      }
      toast.error('Could not access microphone.');
    }
  };

  const stopMicrophone = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setIsListening(false);
    setVolumeLevel(0);
  };

  // 5-second test recording
  const startRecordingTest = () => {
    if (!micStreamRef.current) {
      toast.error('Please start the microphone first!');
      return;
    }

    try {
      audioChunksRef.current = [];
      
      // Determine optimal audio mimeType supported by the browser
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(micStreamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setIsRecording(false);
        toast.success('Sample recorded! Click Play to verify your voice quality.');
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSecondsLeft(5);

      let countdown = 5;
      timerRef.current = window.setInterval(() => {
        countdown -= 1;
        setRecordSecondsLeft(countdown);
        if (countdown <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch {
      toast.error('Media recording is not supported in this browser.');
    }
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    recordedAudioRef.current = audio;
    setIsPlayingRecorded(true);
    audio.play().catch(() => {
      setIsPlayingRecorded(false);
      toast.error('Failed to play recorded sample.');
    });
    audio.onended = () => setIsPlayingRecorded(false);
    audio.onerror = () => setIsPlayingRecorded(false);
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isListening) {
      startMicrophone(deviceId);
    }
  };

  const resetPeak = () => {
    setPeakLevel(0);
    toast.success('Peak meter reset');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <AdSenseUnit format="horizontal" />

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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Online Microphone Tester</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Test your mic audio input with real-time volume meters, live waveform visualizer, and record a 5-second playback test before job interviews or video calls. 100% private in browser.
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

        {/* Main Testing Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center 2 Cols: Interactive Monitor */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isListening ? 'Microphone Active' : 'Microphone Ready'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isListening
                      ? activeDeviceName || 'Listening for audio input...'
                      : 'Click "Start Mic Test" below to enable audio detection'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isListening ? (
                  <button
                    onClick={() => startMicrophone(selectedDeviceId)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-royalBlue hover:bg-royalBlue/90 text-white font-bold text-sm shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" /> Start Mic Test
                  </button>
                ) : (
                  <button
                    onClick={stopMicrophone}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" /> Stop Test
                  </button>
                )}
              </div>
            </div>

            {/* Error banner if permission denied */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Microphone Access Notice</p>
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{errorMessage}</p>
                  <div className="pt-2">
                    <button
                      onClick={() => startMicrophone(selectedDeviceId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Device Selector */}
            {audioDevices.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Input Device:
                  </label>
                  <button
                    onClick={refreshAudioDevices}
                    className="text-[11px] text-royalBlue dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Devices
                  </button>
                </div>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royalBlue"
                >
                  {audioDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Microphone ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Waveform Canvas */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-royalBlue" /> Live Sound Waveform
                </span>
                <span>{isListening ? 'Capturing audio...' : 'Inactive'}</span>
              </div>
              <div className="w-full h-16 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={60}
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Volume Level Meter Visualizer */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" /> Volume Intensity Meter
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-royalBlue dark:text-sky-400 text-base">{volumeLevel}%</span>
                  <button
                    onClick={resetPeak}
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                  >
                    Reset Peak
                  </button>
                </div>
              </div>

              {/* Segmented bar visualizer */}
              <div className="h-7 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden p-1.5 flex items-center gap-1">
                {Array.from({ length: 32 }).map((_, i) => {
                  const threshold = (i / 32) * 100;
                  const isActive = volumeLevel >= threshold;
                  let color = 'bg-emerald-500';
                  if (i > 20) color = 'bg-amber-500';
                  if (i > 26) color = 'bg-red-500';

                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-sm transition-all duration-75 ${
                        isActive ? `${color} shadow-sm` : 'bg-slate-200 dark:bg-slate-700 opacity-40'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0% (Silence)</span>
                <span className="text-emerald-500 font-semibold">Normal Voice Range</span>
                <span className="text-royalBlue dark:text-sky-400 font-bold">Peak: {peakLevel}%</span>
              </div>
            </div>

            {/* 5-Second Test Recording Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Playback Voice Check (Hear Yourself)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Record a 5-second sample to verify if your voice is clear, muffled, or too quiet.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={startRecordingTest}
                  disabled={!isListening || isRecording}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition cursor-pointer ${
                    isRecording
                      ? 'bg-amber-500 text-white animate-pulse cursor-wait'
                      : !isListening
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {isRecording ? `Recording... (${recordSecondsLeft}s left)` : 'Record 5s Test Sample'}
                </button>

                {recordedAudioUrl && (
                  <button
                    onClick={playRecordedAudio}
                    disabled={isPlayingRecorded}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-royalBlue text-white hover:bg-royalBlue/90 transition shadow-sm cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isPlayingRecorded ? 'Playing Audio...' : 'Play Back Recording'}
                  </button>
                )}

                {recordedAudioUrl && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Sample recorded!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hardware Status & Tips */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Diagnostic Results
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Web Audio API</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Supported</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Permission Granted</span>
                  <span
                    className={`font-semibold ${
                      hasPermission === true
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : hasPermission === false
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {hasPermission === true ? 'Yes' : hasPermission === false ? 'Denied' : 'Pending'}
                  </span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Input Stream</span>
                  <span className={`font-semibold ${isListening ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {isListening ? 'Active (Live)' : 'Idle'}
                  </span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Mics Detected</span>
                  <span className="font-semibold">{audioDevices.length || (isListening ? '1+' : '0')}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Highest Peak Level</span>
                  <span className="font-mono font-bold text-royalBlue dark:text-sky-400">{peakLevel}%</span>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-sm text-amber-800 dark:text-amber-300">
                <HelpCircle className="w-4 h-4" /> Quick Troubleshooting
              </p>
              <ul className="list-disc list-inside space-y-1.5 opacity-90 leading-relaxed">
                <li>If the bar doesn't move when speaking, check your headset physical mute button.</li>
                <li>Ensure browser permission is set to <strong>Allow</strong> in the address bar.</li>
                <li>Make sure Windows or macOS Settings allow your browser to access the microphone.</li>
                <li>Close other apps like Zoom or Teams if they are locking exclusive mic access.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="mic-tester"
          currentCategory="Device Testers"
          onNavigateToTool={onNavigateToTool}
        />

        <AdSenseUnit format="horizontal" />
      </div>
    </div>
  );
};

export default MicrophoneTester;
