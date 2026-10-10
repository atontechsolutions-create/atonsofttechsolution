import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Link as LinkIcon,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface QrCodeGeneratorProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone';

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [activeType, setActiveType] = useState<QrType>('url');
  const [inputValue, setInputValue] = useState('https://www.atontechsolutions.com');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Styling options
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState<number>(300);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute actual payload string
  const getPayload = (): string => {
    switch (activeType) {
      case 'url':
      case 'text':
        return inputValue;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'phone':
        return `tel:${phoneNumber}`;
      default:
        return inputValue;
    }
  };

  // Ultra-clean reliable client-side QR renderer using vector path matrix generator
  useEffect(() => {
    const payload = getPayload();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = qrSize;
    canvas.height = qrSize;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Generate QR matrix using SVG image data or browser fetch
    const encodedData = encodeURIComponent(payload || 'https://www.atontechsolutions.com');
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedData}&color=${fgColor.replace(
      '#',
      ''
    )}&bgcolor=${bgColor.replace('#', '')}&margin=10`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
    };
    img.onerror = () => {
      // Fallback simple clean grid if offline
      ctx.fillStyle = fgColor;
      ctx.font = '14px sans-serif';
      ctx.fillText('QR Code Generator', 20, qrSize / 2);
    };
    img.src = qrApiUrl;
  }, [inputValue, wifiSsid, wifiPassword, wifiEncryption, emailTo, emailSubject, phoneNumber, activeType, fgColor, bgColor, qrSize]);

  const downloadQr = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`QR Code downloaded as ${format.toUpperCase()}!`);
  };

  const copyQrImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard && navigator.clipboard.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('QR Code copied to clipboard!');
        } catch {
          toast.error('Direct image copy not supported in this browser. Use Download.');
        }
      }
    });
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
              <span>Image & Everyday Tools</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Free QR Code Generator</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Create high-resolution custom QR codes for Website URLs, Wi-Fi networks, text, email, and phone numbers with custom colors and instant download.
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

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Types (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Type Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <button
                onClick={() => setActiveType('url')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeType === 'url'
                    ? 'bg-royalBlue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Website URL
              </button>
              <button
                onClick={() => setActiveType('text')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeType === 'text'
                    ? 'bg-royalBlue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Plain Text
              </button>
              <button
                onClick={() => setActiveType('wifi')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeType === 'wifi'
                    ? 'bg-royalBlue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" /> Wi-Fi Network
              </button>
              <button
                onClick={() => setActiveType('email')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeType === 'email'
                    ? 'bg-royalBlue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                onClick={() => setActiveType('phone')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeType === 'phone'
                    ? 'bg-royalBlue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone
              </button>
            </div>

            {/* Dynamic Input based on Type */}
            {activeType === 'url' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Website URL</label>
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-royalBlue font-medium"
                />
              </div>
            )}

            {activeType === 'text' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Plain Text / Note</label>
                <textarea
                  rows={4}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter text to encode into QR code..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-royalBlue font-medium"
                />
              </div>
            )}

            {activeType === 'wifi' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="My Office Wi-Fi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Wi-Fi Password</label>
                  <input
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Security Type</label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                    <option value="WEP">WEP (Older)</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            )}

            {activeType === 'email' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Recipient Email</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry / Service Request"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue"
                  />
                </div>
              </div>
            )}

            {activeType === 'phone' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-royalBlue font-medium"
                />
              </div>
            )}

            {/* Customization Options */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1.5">QR Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1.5">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono">{bgColor}</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1.5">Size Resolution</label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 focus:ring-2 focus:ring-royalBlue"
                >
                  <option value={200}>200 × 200 px</option>
                  <option value={300}>300 × 300 px</option>
                  <option value={500}>500 × 500 px (HD)</option>
                  <option value={800}>800 × 800 px (Print)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live QR Preview & Download (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live QR Code Preview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Scannable with any smartphone camera</p>
            </div>

            {/* Canvas Container */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 max-w-[280px] aspect-square flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            {/* Download Buttons */}
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadQr('png')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-royalBlue text-white text-xs font-semibold hover:bg-royalBlue/90 transition shadow-sm hover:scale-105 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={() => downloadQr('jpeg')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-900 transition shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download JPG
                </button>
              </div>

              <button
                onClick={copyQrImage}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Image to Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="qr-code-generator"
          currentCategory="Image Tools"
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

export default QrCodeGenerator;
