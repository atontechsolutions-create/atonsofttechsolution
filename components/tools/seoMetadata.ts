export interface ToolSeoItem {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  h2Heading: string;
  howToSteps: { step: number; title: string; desc: string }[];
  keyFeatures: string[];
  faqs: { question: string; answer: string }[];
}

export const BASE_CANONICAL_URL = 'https://www.atontechsolutions.com';

export const SEO_METADATA_MAP: Record<string, ToolSeoItem> = {
  '/': {
    path: '/',
    title: 'ATON TECH Solutions | Free Online Image, PDF & Device Testing Tools',
    description: 'Free, fast & 100% private online web tools. Photo Resizer, Signature Resizer, Passport Photo Maker, Background Remover, Mic Tester, Keyboard Tester & PDF utilities.',
    keywords: [
      'aton tech solutions',
      'free online tools',
      'photo resizer online',
      'signature resizer 20kb',
      'passport size photo maker',
      'signature background remover',
      'online mic tester',
      'online keyboard tester',
      'webcam tester',
      'internet speed test',
      'image to pdf converter',
      'compress image to 50kb',
      'compress photo to 20kb',
      'jpg to png converter',
      'online signature maker',
      'speaker tester',
      'dead pixel test',
      'exam photo resizer'
    ],
    canonical: `${BASE_CANONICAL_URL}/`,
    h2Heading: 'All-In-One Free Online Productivity & Diagnostic Utilities',
    howToSteps: [
      { step: 1, title: 'Choose Your Tool', desc: 'Select any image, PDF, audio, video, or hardware diagnostic tool from our instant catalog.' },
      { step: 2, title: 'Process In Real-Time', desc: 'All operations process directly inside your browser with maximum speed and zero server uploads.' },
      { step: 3, title: 'Download or View Results', desc: 'Export high-definition images, converted PDFs, or verify your audio/mic diagnostic metrics immediately.' }
    ],
    keyFeatures: [
      '100% Client-Side Privacy: Your files never leave your device',
      'Zero Sign-up or Watermarks: Completely free for personal and commercial usage',
      'Strict Government Exam Presets: Pre-calibrated for SSC, UPSC, IBPS, and state portals',
      'Instant Diagnostic Audio/Video: Millisecond latency with Web Audio & MediaDevices APIs'
    ],
    faqs: [
      {
        question: 'Are my uploaded photos, signatures, and documents stored on your servers?',
        answer: 'No. All conversions, resizing, compression, and audio diagnostics execute 100% locally within your browser using HTML5 Canvas, WebAssembly, and Web Audio API. Your private data never touches any remote server.'
      },
      {
        question: 'Are these tools free for competitive exam and government portal forms?',
        answer: 'Yes! Our photo and signature resizers feature dedicated presets for Indian competitive exams (SSC CGL/CHSL, UPSC Civil Services, IBPS, State PSCs, GATE, and NEET), visa applications, and job portals.'
      },
      {
        question: 'Do I need to install any software or mobile app?',
        answer: 'No installation is needed. All tools run directly in any modern desktop or mobile browser (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge, Brave).'
      }
    ]
  },

  '/tools/signature-resizer': {
    path: '/tools/signature-resizer',
    title: 'Free Signature Resizer Online – Resize to 140x60 px & 20 KB | Aton Tech',
    description: 'Resize signature image to exact dimensions (140x60 px) and file size under 10KB or 20KB for SSC, UPSC, IBPS, and government job applications. Fast and free.',
    keywords: [
      'signature resizer',
      'signature resizer 20kb',
      'signature resizer 10kb',
      'resize signature online',
      'signature 140x60 px',
      'resize signature to 20kb online',
      'ssc signature resizer',
      'upsc signature size',
      'ibps signature resize',
      'signature compressor 20kb',
      'make signature background white',
      'clean signature for form',
      'signature dimensions converter'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/signature-resizer`,
    h2Heading: 'How to Resize Your Signature to 140x60 px and Under 20 KB',
    howToSteps: [
      { step: 1, title: 'Upload Your Signature', desc: 'Take a clear smartphone photo or scan of your handwritten signature on plain white paper and upload it.' },
      { step: 2, title: 'Select Target Size & Dimensions', desc: 'Choose the standard 140x60 px preset (or custom width/height) and select your target file limit (10 KB or 20 KB).' },
      { step: 3, title: 'Auto-Clean & Download', desc: 'Our smart thresholding cleans gray paper shadows, turns the background pure white, and saves your optimized JPG/PNG signature.' }
    ],
    keyFeatures: [
      'Pre-calibrated 140×60 px resolution for Indian recruitment portals',
      'Target file compression ensuring output strictly under 10 KB or 20 KB',
      'Automatic contrast enhancement to make ink lines crisp and dark',
      'Zero loss in signature clarity and 100% private in-browser processing'
    ],
    faqs: [
      {
        question: 'What is the standard signature size for SSC and UPSC forms?',
        answer: 'Most exam portals, including SSC and UPSC, require a signature resolution of 140 × 60 pixels (width × height) in JPG/JPEG format, with a file size strictly between 10 KB and 20 KB.'
      },
      {
        question: 'How do I remove paper shadows and gray background from my signature photo?',
        answer: 'Our tool automatically applies intelligent luminance thresholding that converts uneven paper lighting into crisp, pure white (#FFFFFF) while enhancing the dark blue or black ink.'
      },
      {
        question: 'Will my signature be rejected if it is larger than 20 KB?',
        answer: 'Yes, government application servers automatically reject files exceeding 20 KB. This tool compresses the file iteratively to ensure it stays strictly within the 10 KB – 19 KB safe zone.'
      }
    ]
  },

  '/tools/photo-resizer': {
    path: '/tools/photo-resizer',
    title: 'Free Photo Resizer Online – Resize Image in Pixels, CM & KB | Aton Tech',
    description: 'Resize photos to exact pixel width, height, aspect ratio, and file size in KB. Ideal for passport photos, exam portals, job applications, and social profiles.',
    keywords: [
      'photo resizer',
      'image resizer online',
      'resize photo in pixels',
      'resize photo to 50kb',
      'photo resizer in cm',
      'passport photo resize',
      'photo dimensions converter',
      'crop and resize photo',
      'resize image without losing quality',
      'exam photo resizer 200x230'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/photo-resizer`,
    h2Heading: 'Precision Photo Resizer for Job Applications & Official Portals',
    howToSteps: [
      { step: 1, title: 'Upload Image', desc: 'Upload JPG, PNG, or WebP photo from your computer or smartphone.' },
      { step: 2, title: 'Set Width, Height & Ratio', desc: 'Enter exact pixel dimensions (e.g. 200x230, 350x450, 600x600) or lock original aspect ratio.' },
      { step: 3, title: 'Preview & Export', desc: 'Adjust output quality slider to hit target KB constraints and download your resized photo.' }
    ],
    keyFeatures: [
      'Accurate pixel-by-pixel resizing with bi-cubic smoothing interpolation',
      'Presets for Indian government exams (SSC, UPSC, State PSC, IBPS)',
      'Built-in aspect ratio lock to prevent face distortion or stretching',
      'Instant real-time preview showing estimated export file size'
    ],
    faqs: [
      {
        question: 'How do I resize a photo without making it blurry or stretched?',
        answer: 'Lock the aspect ratio checkbox before modifying either width or height. Our canvas resizer utilizes bicubic interpolation to preserve face features and prevent pixelation.'
      },
      {
        question: 'Can I resize photos to 200x230 pixels for exam registration?',
        answer: 'Yes, simply type 200 into Width and 230 into Height. This matches the exact dimensions mandated by UPSC, SSC, and banking application guidelines.'
      }
    ]
  },

  '/tools/passport-photo-maker': {
    path: '/tools/passport-photo-maker',
    title: 'Free Passport Size Photo Maker Online – 35x45 mm & 2x2 Inch | Aton Tech',
    description: 'Create official passport size photos online for free. Crop to 35x45 mm, 2x2 inch (600x600 px), add white background, and generate 4x6 print sheets.',
    keywords: [
      'passport size photo maker',
      'passport photo maker online',
      'free passport photo online',
      'passport size photo 3.5 x 4.5 cm',
      '2x2 inch passport photo',
      'us passport photo maker',
      'indian passport photo size',
      'passport photo sheet 4x6',
      'make passport size photo on phone',
      'visa photo maker online'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/passport-photo-maker`,
    h2Heading: 'Generate Compliant Passport & Visa Photos in Seconds',
    howToSteps: [
      { step: 1, title: 'Upload Portrait Photo', desc: 'Select a front-facing selfie or portrait taken in even lighting against a plain background.' },
      { step: 2, title: 'Align with Biometric Guides', desc: 'Position face and chin inside our biometric alignment oval overlay matching international standards.' },
      { step: 3, title: 'Download Single Photo or 4x6 Print Grid', desc: 'Export a single compliant passport photo or a printable 4x6 sheet containing 6 to 8 photos.' }
    ],
    keyFeatures: [
      'International standard templates: 35×45 mm (India/UK/Schengen) and 2×2 inch (USA/India Passport Seva)',
      'Biometric face oval guides to guarantee head-to-chin proportions between 70% and 80%',
      'Printable 4×6 inch (10×15 cm) multi-photo grid generator for easy studio printing',
      'Completely free with zero watermarks or signup barriers'
    ],
    faqs: [
      {
        question: 'What are the dimensions for an Indian passport size photo?',
        answer: 'Standard Indian passport photos require 35 mm × 45 mm (3.5 cm × 4.5 cm) or 350 × 450 pixels at 300 DPI, with the face covering 70% to 80% of the image.'
      },
      {
        question: 'Can I print these passport photos at a local print shop or chemist?',
        answer: 'Yes! Download the generated 4x6 inch (10x15 cm) photo sheet containing 6 passport photos and print it at any local pharmacy or photo studio for pennies.'
      }
    ]
  },

  '/tools/signature-background-remover': {
    path: '/tools/signature-background-remover',
    title: 'Signature Background Remover – Make Signature Transparent Online | Aton Tech',
    description: 'Remove background from scanned or photographed signatures instantly. Turn paper background 100% transparent PNG or clean pure white. Free & private.',
    keywords: [
      'signature background remover',
      'transparent signature online',
      'remove background from signature',
      'signature png transparent',
      'make signature background transparent',
      'clean signature background free',
      'remove paper background from signature',
      'digital signature png',
      'signature cut out online'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/signature-background-remover`,
    h2Heading: 'How to Make a Signature Transparent Online (PNG)',
    howToSteps: [
      { step: 1, title: 'Upload Handwritten Signature', desc: 'Upload a picture of your signature signed on plain paper.' },
      { step: 2, title: 'Auto Alpha Channel Isolation', desc: 'Our algorithm separates the blue/black ink strokes from the paper texture automatically.' },
      { step: 3, title: 'Download Transparent PNG', desc: 'Download a clean, transparent PNG signature ready to paste onto Word, PDFs, invoices, or contracts.' }
    ],
    keyFeatures: [
      'Intelligent ink threshold isolation that preserves fine pen penmanship and loops',
      'Export as transparent PNG with zero background artifact residue',
      'Toggle between pure transparent background or pure white background',
      '100% private client-side execution — sensitive legal signatures are never stored'
    ],
    faqs: [
      {
        question: 'Can I paste this transparent signature into Microsoft Word, Google Docs, or PDF files?',
        answer: 'Yes! Because the background is saved as transparent PNG (with alpha channel), you can paste it over any document line without covering underlying text.'
      },
      {
        question: 'Does the tool work with both black ink and blue ink pens?',
        answer: 'Yes, the algorithm detects both ballpoint blue ink and rollerball/gel black ink against white or cream paper backgrounds.'
      }
    ]
  },

  '/tools/mic-tester': {
    path: '/tools/mic-tester',
    title: 'Free Online Microphone Tester – Test Mic & Hear Playback | Aton Tech',
    description: 'Test your microphone online for free. Check mic volume meter, frequency response, live audio waveform, and record a 5-second sample to hear playback.',
    keywords: [
      'mic test',
      'microphone tester',
      'test microphone online',
      'online mic test',
      'mic test with playback',
      'test my mic',
      'microphone volume test',
      'headset mic test',
      'mic not working test',
      'zoom mic test online',
      'discord mic test',
      'check microphone sensitivity'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/mic-tester`,
    h2Heading: 'Test Your Microphone Online with Live Audio Visualizer & Playback',
    howToSteps: [
      { step: 1, title: 'Click "Start Mic Test"', desc: 'Click the button and allow browser microphone permission when prompted.' },
      { step: 2, title: 'Speak into Your Mic', desc: 'Watch the live volume decibel meter and dynamic waveform oscillate in real time as you speak.' },
      { step: 3, title: 'Record & Listen Back', desc: 'Record a 5-second sample to verify if your voice sounds clear, muffled, distorted, or quiet.' }
    ],
    keyFeatures: [
      'Live RMS volume meter and animated 128-band frequency visualizer',
      'Audio device switching: Test external USB mics, built-in laptop mics, and Bluetooth headsets',
      'Instant 5-second voice sample recording and replay with zero server upload',
      'Detailed browser diagnostic report checking Web Audio API and input stream health'
    ],
    faqs: [
      {
        question: 'Why is my microphone not picking up sound?',
        answer: 'Check 3 things: 1) Ensure you clicked "Allow" on your browser permission prompt; 2) Check if your headset cable has a physical mute slider or button; 3) Verify Windows/macOS Settings allows browser microphone access.'
      },
      {
        question: 'Is my voice recorded or stored on your servers?',
        answer: 'Never. All audio streams are processed locally using your browser Web Audio API. When you record a 5-second playback sample, it remains strictly in your device RAM and is never transmitted.'
      }
    ]
  },

  '/tools/keyboard-tester': {
    path: '/tools/keyboard-tester',
    title: 'Free Online Keyboard Tester – Test Every Key & Ghosting | Aton Tech',
    description: 'Test every key on your keyboard online. Interactive full-size, tenkeyless, and 60% layout with mechanical click sounds, key ghosting detection, and history log.',
    keywords: [
      'keyboard tester',
      'test keyboard online',
      'keyboard key test',
      'online keyboard tester',
      'mechanical keyboard tester',
      'key ghosting test',
      'check broken keyboard key',
      'laptop keyboard test',
      'test spacebar key',
      'keyboard latency test'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/keyboard-tester`,
    h2Heading: 'Interactive Keyboard Tester for Laptops & Mechanical Keyboards',
    howToSteps: [
      { step: 1, title: 'Press Any Key', desc: 'Press any key on your physical keyboard to highlight it instantly on the virtual keyboard visualizer.' },
      { step: 2, title: 'Check Key Ghosting', desc: 'Press multiple keys simultaneously (e.g. W+A+S+D+Space) to check if your keyboard registers all keys without ghosting.' },
      { step: 3, title: 'Review Test Status', desc: 'Verify keys tested count, key code parameters, and reset history anytime with one click.' }
    ],
    keyFeatures: [
      'Full 104-Key layout supporting Windows, macOS, and Linux keyboard standards',
      'Mechanical switch audio feedback (optional synthesized audio clicks)',
      'Simultaneous multi-key rollover (N-Key Rollover / Anti-Ghosting) measurement',
      'Special key capture (Function F1-F12, PrtSc, NumPad, Media keys)'
    ],
    faqs: [
      {
        question: 'How do I test if my laptop keyboard key is broken or stuck?',
        answer: 'Press every key systematically. Working keys will turn green on the on-screen diagram. If a key fails to highlight, it indicates physical switch failure, debris under the keycap, or a damaged ribbon cable.'
      },
      {
        question: 'What is keyboard ghosting?',
        answer: 'Ghosting occurs when cheaper membrane keyboards cannot register more than 3 or 4 keys pressed at once. Gaming keyboards with Anti-Ghosting will turn all pressed keys blue simultaneously.'
      }
    ]
  },

  '/tools/webcam-tester': {
    path: '/tools/webcam-tester',
    title: 'Free Online Webcam Tester – Check Camera Resolution & FPS | Aton Tech',
    description: 'Test your webcam and camera online for free. Check live video feed, camera resolution, aspect ratio, frame rate (FPS), and take a test photo snapshot.',
    keywords: [
      'webcam tester',
      'test webcam online',
      'camera test online',
      'check webcam resolution',
      'webcam fps test',
      'laptop camera test',
      'test camera before zoom',
      'external usb webcam test',
      'front camera test online'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/webcam-tester`,
    h2Heading: 'Test Laptop & USB Webcams in Real-Time',
    howToSteps: [
      { step: 1, title: 'Allow Camera Access', desc: 'Click "Start Camera" and allow browser permission when asked.' },
      { step: 2, title: 'Inspect Video Stream', desc: 'View live HD video feed and inspect real-time resolution (720p, 1080p, 4K) and FPS.' },
      { step: 3, title: 'Take Test Snapshot', desc: 'Snap a sample photo to inspect image clarity, exposure, and color fidelity before joining video calls.' }
    ],
    keyFeatures: [
      'Instant camera diagnostic reporting resolution, aspect ratio, and frame rate',
      'Switch between multiple connected webcams (built-in, USB, OBS virtual camera)',
      'Snapshot capture tool with instant local preview',
      'Safe and private: Video stream is never saved or transmitted to remote servers'
    ],
    faqs: [
      {
        question: 'Why does my webcam show a black screen?',
        answer: 'Ensure your laptop physical privacy shutter is open, verify no other background app (such as Zoom, Teams, or OBS) is using the camera exclusively, and check browser permissions.'
      }
    ]
  },

  '/tools/internet-speed-test': {
    path: '/tools/internet-speed-test',
    title: 'Free Internet Speed Test – Check Download, Upload & Ping | Aton Tech',
    description: 'Accurate and fast online internet speed test. Measure download speed, upload speed, latency (ping), and jitter on WiFi, 4G, 5G, and broadband connections.',
    keywords: [
      'internet speed test',
      'wifi speed test',
      'check download speed',
      'upload speed test',
      'ping test',
      'broadband speed test',
      '5g speed test',
      'free speed test online',
      'network latency test',
      'fast speed test'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/internet-speed-test`,
    h2Heading: 'Measure Your Real-World Internet Download & Upload Speeds',
    howToSteps: [
      { step: 1, title: 'Click "Start Speed Test"', desc: 'Initiate the test with a single click. Close background downloads for accurate measurements.' },
      { step: 2, title: 'Measure Ping & Download', desc: 'Watch real-time speed needle calculate latency and multi-stream download bandwidth in Mbps.' },
      { step: 3, title: 'View Summary Metrics', desc: 'Get clean report showing Download Speed (Mbps), Upload Speed (Mbps), and Ping (ms).' }
    ],
    keyFeatures: [
      'Zero ads clutter: Lightweight, fast-loading measurement engine',
      'Measures ping latency, jitter, download Mbps, and upload throughput',
      'Works seamlessly across smartphones, tablets, laptops, and smart TVs',
      'Compatible with all ISPs and broadband providers globally'
    ],
    faqs: [
      {
        question: 'What is considered a good internet speed for video calls and gaming?',
        answer: 'For 1080p Zoom/Teams calls, a download speed of 10-25 Mbps with ping under 50ms is ideal. For online multiplayer gaming, low ping (under 30ms) and low jitter are more critical than raw bandwidth.'
      }
    ]
  },

  '/tools/image-to-pdf': {
    path: '/tools/image-to-pdf',
    title: 'Free Image to PDF Converter – Convert JPG & PNG to PDF | Aton Tech',
    description: 'Convert JPG, PNG, and WebP images to high-quality PDF documents online. Rearrange multiple pages, set page orientation and margins. 100% private.',
    keywords: [
      'image to pdf',
      'jpg to pdf',
      'png to pdf',
      'convert jpg to pdf online',
      'combine images into one pdf',
      'photo to pdf converter free',
      'multiple images to pdf',
      'jpg to pdf converter without watermark',
      'create pdf from photos'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/image-to-pdf`,
    h2Heading: 'Convert & Combine Multiple Images into a Single PDF Document',
    howToSteps: [
      { step: 1, title: 'Upload Images', desc: 'Select or drag and drop JPG, JPEG, PNG, or WebP pictures.' },
      { step: 2, title: 'Arrange Order & Orientation', desc: 'Drag thumbnails to re-order pages, select portrait or landscape, and configure margins.' },
      { step: 3, title: 'Convert & Download PDF', desc: 'Click "Generate PDF" to bundle all pages into a crisp, lightweight PDF file.' }
    ],
    keyFeatures: [
      'Combine unlimited photos into a single organized PDF booklet',
      'Custom page settings: A4, US Letter, fit-to-page, portrait and landscape',
      'Zero quality compression degradation or unwanted watermarks',
      '100% Client-Side generation with zero upload delays'
    ],
    faqs: [
      {
        question: 'Can I combine multiple photos of handwritten notes or receipts into one PDF?',
        answer: 'Yes! Upload all photos, arrange them in your desired sequence by dragging, and click Convert to download a single combined PDF document.'
      }
    ]
  },

  '/tools/image-compressor': {
    path: '/tools/image-compressor',
    title: 'Free Image Compressor Online – Compress JPG & PNG to 20KB, 50KB, 100KB',
    description: 'Compress JPG, PNG, and WebP images online without losing visual quality. Reduce photo file size to exactly under 20 KB, 50 KB, or 100 KB. Free and fast.',
    keywords: [
      'image compressor',
      'compress image online',
      'compress photo to 20kb',
      'compress photo to 50kb',
      'compress photo to 100kb',
      'reduce image size in kb',
      'jpg compressor online',
      'png compressor free',
      'compress image without losing quality',
      'compress photo for govt forms'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/image-compressor`,
    h2Heading: 'Reduce Image File Size in KB with Zero Visible Quality Loss',
    howToSteps: [
      { step: 1, title: 'Select Image', desc: 'Upload any large JPG, PNG, or WebP file.' },
      { step: 2, title: 'Choose Target File Size', desc: 'Use our target KB input or quality slider (presets: 20 KB, 50 KB, 100 KB, 200 KB).' },
      { step: 3, title: 'Download Compressed File', desc: 'Download your optimized file ready for job portals, emails, or websites.' }
    ],
    keyFeatures: [
      'Smart binary search compression algorithm hitting target KB accurately',
      'Preserves image pixel resolution while stripping bloated metadata and EXIF data',
      'Real-time side-by-side comparison of original vs compressed file size and reduction %',
      'Zero server upload: Lightning fast speed and complete data privacy'
    ],
    faqs: [
      {
        question: 'How do I compress a photo to exactly under 50 KB for an online form?',
        answer: 'Upload your photo and select the "50 KB" preset. Our algorithm automatically calculates the optimal compression ratio to ensure your output file stays under 50 KB.'
      }
    ]
  },

  '/tools/speaker-tester': {
    path: '/tools/speaker-tester',
    title: 'Free Online Speaker Tester – Test Stereo Left & Right Audio | Aton Tech',
    description: 'Test your speakers and headphones online. Check stereo separation, Left and Right channel balance, bass subwoofer frequencies, and audio pitch sweep.',
    keywords: [
      'speaker tester',
      'test speakers online',
      'stereo test',
      'left right speaker test',
      'headphone sound test',
      'audio tester online',
      'test audio balance',
      'bass frequency test',
      'subwoofer test online'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/speaker-tester`,
    h2Heading: 'Test Left & Right Stereo Channels and Audio Frequencies',
    howToSteps: [
      { step: 1, title: 'Click Left Channel', desc: 'Play isolated sound strictly in your left ear/speaker to verify proper channel separation.' },
      { step: 2, title: 'Click Right Channel', desc: 'Play isolated audio strictly in your right ear/speaker.' },
      { step: 3, title: 'Test Full Stereo & Frequencies', desc: 'Run full stereo tone sweeps from 20 Hz to 20,000 Hz to check clarity and distortion.' }
    ],
    keyFeatures: [
      'Independent Left / Right stereo channel audio isolation',
      'Frequency sweep generator from 20Hz (deep sub-bass) to 20kHz (high treble)',
      'Pink noise and White noise generators for speaker burn-in and acoustics testing',
      'Instant Web Audio synthesizer with zero audio lag'
    ],
    faqs: [
      {
        question: 'Why is sound coming out of both sides when testing the Left channel?',
        answer: 'Check if your operating system has "Mono Audio" turned on in Accessibility settings. When Mono Audio is enabled, Windows/macOS mixes Left and Right channels into both speakers.'
      }
    ]
  },

  '/tools/dead-pixel-test': {
    path: '/tools/dead-pixel-test',
    title: 'Free Online Dead Pixel Test – Check Screen & Monitor Pixels | Aton Tech',
    description: 'Test your computer monitor, laptop screen, or smartphone display for dead, stuck, or hot pixels. Fullscreen solid color test in Black, White, Red, Green, Blue.',
    keywords: [
      'dead pixel test',
      'screen pixel test',
      'monitor dead pixel test',
      'check dead pixels online',
      'stuck pixel test',
      'laptop screen test',
      'oled burn in test',
      'lcd screen inspection',
      'fullscreen color test'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/dead-pixel-test`,
    h2Heading: 'Find Dead and Stuck Pixels on Any Display Screen',
    howToSteps: [
      { step: 1, title: 'Enter Fullscreen', desc: 'Click "Start Fullscreen Test" to hide all browser toolbars and OS elements.' },
      { step: 2, title: 'Cycle Solid Colors', desc: 'Click the screen or press the Arrow keys to cycle through Black, White, Red, Green, Blue, and Yellow.' },
      { step: 3, title: 'Inspect Screen', desc: 'Look closely for black spots (dead pixels) or pixels stuck on a single solid color (stuck pixels).' }
    ],
    keyFeatures: [
      'True fullscreen browser canvas with zero distractions',
      'Solid primary color cycle: Pure Black, Pure White, Red, Green, Blue, Cyan, Magenta, Yellow',
      'Stuck pixel exerciser mode with rapid color flashing to unstick lazy subpixels',
      'Works on all displays: IPS, OLED, VA, TN, laptops, MacBooks, and mobile screens'
    ],
    faqs: [
      {
        question: 'What is the difference between a dead pixel and a stuck pixel?',
        answer: 'A dead pixel is completely black and receives no electrical power. A stuck pixel is permanently frozen on one color (red, green, or blue). Stuck pixels can often be unstuck using rapid color cycling.'
      }
    ]
  },

  '/tools/online-signature-maker': {
    path: '/tools/online-signature-maker',
    title: 'Free Online Signature Maker – Draw or Type Digital Signature | Aton Tech',
    description: 'Create beautiful digital signatures online. Draw with mouse/touchscreen or type your name in elegant cursive calligraphy fonts. Download transparent PNG.',
    keywords: [
      'online signature maker',
      'create digital signature',
      'signature creator online',
      'draw signature free',
      'type signature fonts',
      'electronic signature generator',
      'e-signature maker transparent png',
      'cursive name generator',
      'handwritten signature online'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/online-signature-maker`,
    h2Heading: 'Draw, Type & Download Transparent Electronic Signatures',
    howToSteps: [
      { step: 1, title: 'Choose Mode: Draw or Type', desc: 'Sign directly on the digital pad using your mouse, stylus, or fingertip, OR type your name to view artistic calligraphy styles.' },
      { step: 2, title: 'Customize Ink & Slant', desc: 'Select ink color (Black, Royal Blue, Navy Blue), adjust stroke thickness, and pick your favorite signature font.' },
      { step: 3, title: 'Download Transparent PNG', desc: 'Export your high-resolution digital signature with transparent background ready for document signing.' }
    ],
    keyFeatures: [
      'Smooth vector-like drawing canvas with natural pressure response simulation',
      '10+ Professional calligraphy and cursive handwriting typography fonts',
      'Transparent background export ready for PDF contracts, invoices, and Word docs',
      '100% free with unlimited signatures and zero sign-in required'
    ],
    faqs: [
      {
        question: 'Is a digital signature created here legally valid?',
        answer: 'Yes, for most business contracts, NDAs, and agreements, an electronic signature (e-signature) placed on a document with the signer\'s intent is legally binding under the ESIGN Act and IT Act.'
      }
    ]
  },

  '/tools/image-dpi-checker': {
    path: '/tools/image-dpi-checker',
    title: 'Free Image DPI Checker – Check 300 DPI & Dimensions Online | Aton Tech',
    description: 'Check image DPI (Dots Per Inch), PPI, pixel dimensions, and print size in centimeters and inches online. Verify 300 DPI for high-quality printing.',
    keywords: [
      'image dpi checker',
      'check image dpi online',
      '300 dpi checker',
      'check image resolution dpi',
      'image ppi checker',
      'photo dpi checker free',
      'print resolution checker',
      'image dimensions checker'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/image-dpi-checker`,
    h2Heading: 'Verify Image DPI & Print Readiness Online',
    howToSteps: [
      { step: 1, title: 'Upload Image', desc: 'Upload any JPEG, PNG, or TIFF file to inspect its embedded EXIF and header resolution.' },
      { step: 2, title: 'Inspect DPI Metadata', desc: 'View exact horizontal and vertical DPI (e.g. 72 DPI, 150 DPI, 300 DPI).' },
      { step: 3, title: 'Calculate Print Dimensions', desc: 'Calculate the maximum recommended physical print dimensions in inches and centimeters.' }
    ],
    keyFeatures: [
      'Instant extraction of EXIF JFIF and TIFF resolution headers',
      'Displays real print dimension calculation in inches and centimeters',
      'Warns if image is below the 300 DPI commercial printing threshold',
      'Supports JPG, PNG, WebP, and TIFF file formats'
    ],
    faqs: [
      {
        question: 'Why is 300 DPI important for printing photos?',
        answer: '300 DPI (dots per inch) is the worldwide industry standard for crisp, high-definition printing without noticeable pixelation. 72 DPI is standard for screen display but appears blurry when printed.'
      }
    ]
  },

  '/tools/qr-code-generator': {
    path: '/tools/qr-code-generator',
    title: 'Free QR Code Generator – Create Custom QR Codes with Colors | Aton Tech',
    description: 'Generate high-resolution custom QR codes online for URLs, WiFi networks, text, contact vCards, and UPI payments. Free, no expiration, SVG and PNG export.',
    keywords: [
      'qr code generator',
      'free qr code generator',
      'create qr code online',
      'qr code with colors',
      'wifi qr code generator',
      'upi qr code generator',
      'custom qr code maker',
      'qr code png download',
      'qr code svg'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/qr-code-generator`,
    h2Heading: 'Create High-Resolution QR Codes with Custom Styling',
    howToSteps: [
      { step: 1, title: 'Enter Link or Text', desc: 'Type your website URL, text message, WiFi credentials, or contact info.' },
      { step: 2, title: 'Customize Colors & Size', desc: 'Choose foreground and background colors and select error correction level.' },
      { step: 3, title: 'Download QR Code', desc: 'Export high-definition PNG or vector SVG file ready for print materials or digital menus.' }
    ],
    keyFeatures: [
      'Static QR codes that never expire and do not redirect through third-party servers',
      'Support for URLs, WiFi auto-connect, email, phone, and vCards',
      'High error correction (level H) ensuring readability even when printed small',
      'Instant download in PNG format'
    ],
    faqs: [
      {
        question: 'Do these QR codes ever expire or have scan limits?',
        answer: 'Never! Our QR codes are 100% static codes containing your exact data directly in the pattern. They will work forever with unlimited scans.'
      }
    ]
  },

  '/tools/word-counter': {
    path: '/tools/word-counter',
    title: 'Free Word Counter Online – Count Words, Characters & Reading Time | Aton Tech',
    description: 'Accurate online word counter and character counter. Calculate words, characters with/without spaces, sentences, paragraphs, and estimated reading time.',
    keywords: [
      'word counter',
      'character counter online',
      'count words online',
      'word count tool',
      'character count with spaces',
      'reading time calculator',
      'essay word counter',
      'sentence counter free'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/word-counter`,
    h2Heading: 'Count Words, Characters, Sentences & Reading Time Online',
    howToSteps: [
      { step: 1, title: 'Type or Paste Text', desc: 'Paste your essay, article, blog post, or tweet into the live editor.' },
      { step: 2, title: 'View Live Metrics', desc: 'Watch real-time calculation of words, characters, sentences, and paragraphs.' },
      { step: 3, title: 'Check Reading & Speaking Times', desc: 'View estimated speech and reading durations based on standard words-per-minute rates.' }
    ],
    keyFeatures: [
      'Real-time count as you type with zero lag',
      'Breakdown of characters with spaces and without spaces',
      'Estimated reading time (200 wpm) and speaking time (130 wpm)',
      'Keyword density and frequency analysis'
    ],
    faqs: [
      {
        question: 'Does the word counter store or log my text?',
        answer: 'No. All calculations happen inside your browser memory. Your text is never transmitted or saved anywhere.'
      }
    ]
  },

  '/tools/password-generator': {
    path: '/tools/password-generator',
    title: 'Free Strong Password Generator – Secure & Random Passwords | Aton Tech',
    description: 'Generate strong, uncrackable, cryptographically secure passwords online. Customize length, uppercase, lowercase, numbers, and special symbols.',
    keywords: [
      'password generator',
      'strong password generator',
      'random password generator',
      'secure password generator online',
      'generate complex password',
      'password maker free',
      'cryptographic random password'
    ],
    canonical: `${BASE_CANONICAL_URL}/tools/password-generator`,
    h2Heading: 'Generate Cryptographically Secure Random Passwords',
    howToSteps: [
      { step: 1, title: 'Select Password Length', desc: 'Choose desired length from 8 to 64 characters (16+ recommended).' },
      { step: 2, title: 'Toggle Character Sets', desc: 'Include or exclude uppercase (A-Z), lowercase (a-z), numbers (0-9), and symbols (!@#$).' },
      { step: 3, title: 'Copy with One Click', desc: 'Click the copy button to transfer your secure password directly to your clipboard.' }
    ],
    keyFeatures: [
      'Powered by window.crypto.getRandomValues for true cryptographic entropy',
      'Real-time password strength meter and entropy calculation in bits',
      'Exclusion options for ambiguous characters (e.g. 0, O, l, 1, I)',
      '100% offline generation — passwords are never sent over the internet'
    ],
    faqs: [
      {
        question: 'Are passwords generated here safe to use for banking and email accounts?',
        answer: 'Yes! Unlike simple pseudo-random functions, this tool uses your browser\'s native Web Cryptography API, generating unpredictable high-entropy strings locally on your machine.'
      }
    ]
  }
};
