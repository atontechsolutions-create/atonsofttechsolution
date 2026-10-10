/**
 * converterData.ts
 * Complete database and metadata for all 56 format-to-format directional image converters,
 * plus special converters (HEIC, SVG, Base64).
 */

export interface ImageFormatSpec {
  id: string;
  name: string;
  shortName: string;
  ext: string;
  mimeType: string;
  colorDepth: string;
  compression: string;
  transparency: boolean;
  animation: boolean;
  bestFor: string;
  description: string;
}

export interface ConverterPairInfo {
  slug: string;
  fromFormat: string;
  toFormat: string;
  title: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  whyConvert: string;
  features: string[];
  howToSteps: { step: number; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

export const SUPPORTED_FORMATS: Record<string, ImageFormatSpec> = {
  jpg: {
    id: 'jpg',
    name: 'JPG / JPEG',
    shortName: 'JPG',
    ext: 'jpg',
    mimeType: 'image/jpeg',
    colorDepth: '24-bit RGB (16.7M colors)',
    compression: 'Lossy (Discrete Cosine Transform)',
    transparency: false,
    animation: false,
    bestFor: 'Photographs, government exam portal uploads, digital camera pictures, email attachments',
    description:
      'JPEG is the most widely compatible image standard worldwide. It balances file size and image fidelity with variable quality compression.',
  },
  png: {
    id: 'png',
    name: 'PNG (Portable Network Graphics)',
    shortName: 'PNG',
    ext: 'png',
    mimeType: 'image/png',
    colorDepth: '32-bit RGBA with 8-bit Alpha Channel',
    compression: 'Lossless (Deflate algorithm)',
    transparency: true,
    animation: false,
    bestFor: 'Logos, digital signatures, diagrams, icons, screenshots, and graphics requiring transparent backgrounds',
    description:
      'PNG is the lossless standard for graphics, UI design, and crisp line art where sharp edges and full alpha transparency must be preserved.',
  },
  webp: {
    id: 'webp',
    name: 'WebP (Next-Gen Google Format)',
    shortName: 'WebP',
    ext: 'webp',
    mimeType: 'image/webp',
    colorDepth: '32-bit RGBA with Alpha',
    compression: 'Lossy & Lossless (VP8 / VP8L)',
    transparency: true,
    animation: true,
    bestFor: 'Modern websites, web apps, e-commerce stores, SEO Core Web Vitals optimization',
    description:
      'Developed by Google, WebP delivers 25% to 34% smaller file sizes than comparable JPEG or PNG files without visible quality degradation.',
  },
  gif: {
    id: 'gif',
    name: 'GIF (Graphics Interchange Format)',
    shortName: 'GIF',
    ext: 'gif',
    mimeType: 'image/gif',
    colorDepth: '8-bit Indexed Color (256 colors maximum)',
    compression: 'Lossless LZW',
    transparency: true,
    animation: true,
    bestFor: 'Short animations, memes, retro graphic badges, simple logos with solid colors',
    description:
      'GIF is a legacy bitmap image format using 256-color palettes, universally recognized across messaging apps and web forums.',
  },
  bmp: {
    id: 'bmp',
    name: 'BMP (Windows Bitmap)',
    shortName: 'BMP',
    ext: 'bmp',
    mimeType: 'image/bmp',
    colorDepth: '24-bit uncompressed RGB',
    compression: 'Uncompressed raster bitmap',
    transparency: false,
    animation: false,
    bestFor: 'Embedded devices, legacy Windows software, CAD plotting, raw pixel analysis',
    description:
      'BMP stores raw pixel values in an uncompressed raster matrix, ensuring perfect pixel fidelity without any compression artifacts.',
  },
  tiff: {
    id: 'tiff',
    name: 'TIFF (Tagged Image File Format)',
    shortName: 'TIFF',
    ext: 'tiff',
    mimeType: 'image/tiff',
    colorDepth: '24-bit / 32-bit / Deep Color RGBA',
    compression: 'Uncompressed / LZW lossless',
    transparency: true,
    animation: false,
    bestFor: 'Professional commercial printing, archival document scanning, medical imaging, desktop publishing',
    description:
      'TIFF is the gold standard for high-end digital publishing and archival preservation where absolute zero pixel loss is mandatory.',
  },
  ico: {
    id: 'ico',
    name: 'ICO (Microsoft Icon / Favicon)',
    shortName: 'ICO',
    ext: 'ico',
    mimeType: 'image/x-icon',
    colorDepth: '32-bit RGBA with transparency',
    compression: 'PNG / Bitmap container',
    transparency: true,
    animation: false,
    bestFor: 'Website favicon.ico, Windows desktop application icons, browser bookmarks',
    description:
      'ICO is an icon container file format capable of embedding multi-resolution square icons for web browsers and operating systems.',
  },
  avif: {
    id: 'avif',
    name: 'AVIF (AV1 Image File Format)',
    shortName: 'AVIF',
    ext: 'avif',
    mimeType: 'image/avif',
    colorDepth: '10-bit / 12-bit HDR Color',
    compression: 'Next-gen AV1 Video Keyframe Compression',
    transparency: true,
    animation: true,
    bestFor: 'Cutting-edge web speed, HDR photography, ultra-low bandwidth delivery',
    description:
      'AVIF offers superior compression efficiency over JPEG and WebP, cutting image payload sizes in half while maintaining high fidelity.',
  },
  heic: {
    id: 'heic',
    name: 'HEIC / HEIF (Apple High-Efficiency Image)',
    shortName: 'HEIC',
    ext: 'heic',
    mimeType: 'image/heic',
    colorDepth: '10-bit / 16-bit High Dynamic Range',
    compression: 'HEVC / H.265 Keyframe Compression',
    transparency: true,
    animation: true,
    bestFor: 'iPhone and iPad Live Photos, high efficiency mobile camera capture',
    description:
      'Apple standard camera format providing high dynamic range color in half the storage size of JPEG, though incompatible with many non-Apple platforms.',
  },
  svg: {
    id: 'svg',
    name: 'SVG (Scalable Vector Graphics)',
    shortName: 'SVG',
    ext: 'svg',
    mimeType: 'image/svg+xml',
    colorDepth: 'Infinite Vector Precision (XML paths)',
    compression: 'Text/XML (Gzip compressible)',
    transparency: true,
    animation: true,
    bestFor: 'Scalable logos, website icons, UI components, responsive typography',
    description:
      'SVG defines shapes, paths, and colors mathematically via XML, allowing infinite scaling to billboard sizes without pixelation.',
  },
  base64: {
    id: 'base64',
    name: 'Base64 Data URI',
    shortName: 'Base64',
    ext: 'txt',
    mimeType: 'text/plain',
    colorDepth: 'ASCII Encoded Binary Stream',
    compression: 'Raw binary Base64 text encoding',
    transparency: true,
    animation: false,
    bestFor: 'Inline CSS backgrounds, HTML image embedding without external HTTP requests, JSON payloads, emails',
    description:
      'Base64 converts binary image data into an ASCII string representation that can be directly pasted inside HTML, CSS, or JSON without hosting files.',
  },
  image: {
    id: 'image',
    name: 'Any Image Format',
    shortName: 'Image',
    ext: 'png',
    mimeType: 'image/*',
    colorDepth: 'Universal',
    compression: 'Auto',
    transparency: true,
    animation: true,
    bestFor: 'Universal image files (PNG, WEBP, GIF, BMP, TIFF, HEIC, SVG)',
    description: 'Convert any image format into your chosen output format.',
  },
};

/**
 * The 8 standard primary formats generating the 56 directional pairs:
 */
export const CORE_8_FORMATS = ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'avif'];

/**
 * Builds specific, high-value technical reason for converting From -> To
 */
function generateTechnicalReason(fromKey: string, toKey: string): string {
  const from = SUPPORTED_FORMATS[fromKey] || { name: fromKey.toUpperCase() };
  const to = SUPPORTED_FORMATS[toKey] || { name: toKey.toUpperCase() };

  if (toKey === 'png') {
    return `Converting ${from.name} to PNG transforms your image into a lossless format that preserves razor-sharp edges and supports transparent backgrounds. This makes it ideal for logos, digital signatures, graphics, and print assets where compression artifacts must be eliminated.`;
  }
  if (toKey === 'jpg') {
    return `Converting ${from.name} to JPG significantly reduces file size (often by 70% to 85%) while maintaining high visual quality. This ensures maximum compatibility with online application forms, job portals, exam registration systems, and email clients that reject larger uncompressed files.`;
  }
  if (toKey === 'webp') {
    return `Converting ${from.name} to modern WebP provides 25%–35% smaller file sizes than JPG or PNG at identical perceptual quality. This accelerates website loading times, boosts Google Core Web Vitals, and lowers bandwidth consumption without losing alpha transparency.`;
  }
  if (toKey === 'ico') {
    return `Converting ${from.name} to ICO creates a dedicated multi-resolution icon file essential for website favicons (favicon.ico) and Windows desktop shortcuts. ICO files ensure your logo renders cleanly in browser tabs and operating system taskbars.`;
  }
  if (toKey === 'bmp') {
    return `Converting ${from.name} to Windows Bitmap (BMP) uncompresses the image into a raw raster pixel matrix. This format is required by legacy desktop software, specialized printing drivers, embedded microcontrollers, and CAD systems.`;
  }
  if (toKey === 'tiff') {
    return `Converting ${from.name} to TIFF produces a high-fidelity Tagged Image File Format preferred by commercial print shops, desktop publishing workflows, and archival scanning systems that demand uncompressed color precision.`;
  }
  if (toKey === 'avif') {
    return `Converting ${from.name} to AVIF utilizes state-of-the-art AV1 video compression to achieve dramatic file size savings (up to 50% smaller than JPEG and 20% smaller than WebP) with advanced 10-bit color depth support.`;
  }
  if (toKey === 'gif') {
    return `Converting ${from.name} to GIF formats the image into an 8-bit 256-color palette file that is universally recognized across messaging apps, retro computer setups, and social media boards.`;
  }

  return `Converting ${from.name} to ${to.name} optimizes your image for specific platform requirements, ensuring seamless compatibility and optimal file performance.`;
}

/**
 * Generates custom converter details for any slug.
 */
export function getConverterPairInfo(slug: string): ConverterPairInfo {
  // Check if it's a standard directional slug: e.g. "jpg-to-png"
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (match) {
    const fromKey = match[1];
    const toKey = match[2];

    const from = SUPPORTED_FORMATS[fromKey] || {
      id: fromKey,
      name: fromKey.toUpperCase(),
      shortName: fromKey.toUpperCase(),
      ext: fromKey,
      mimeType: `image/${fromKey}`,
      colorDepth: 'Standard',
      compression: 'Standard',
      transparency: false,
      animation: false,
      bestFor: 'General usage',
      description: `${fromKey.toUpperCase()} format`,
    };

    const to = SUPPORTED_FORMATS[toKey] || {
      id: toKey,
      name: toKey.toUpperCase(),
      shortName: toKey.toUpperCase(),
      ext: toKey,
      mimeType: `image/${toKey}`,
      colorDepth: 'Standard',
      compression: 'Standard',
      transparency: false,
      animation: false,
      bestFor: 'General usage',
      description: `${toKey.toUpperCase()} format`,
    };

    const title = `${from.shortName} to ${to.shortName} Converter`;
    const h1 = `Free Online ${from.shortName} to ${to.shortName} Converter`;
    const tagline = `Convert ${from.shortName} files to ${to.shortName} in your browser with zero data upload and 100% privacy.`;
    const metaTitle = `Convert ${from.shortName} to ${to.shortName} Online Free – High Quality & Fast`;
    const metaDescription = `Easily convert ${from.name} to ${to.name} online for free. Enjoy instant client-side conversion, customizable quality settings, and fast downloads with zero server uploads.`;

    const whyConvert = generateTechnicalReason(fromKey, toKey);

    return {
      slug,
      fromFormat: fromKey,
      toFormat: toKey,
      title,
      h1,
      tagline,
      metaTitle,
      metaDescription,
      whyConvert,
      features: [
        `100% Client-side conversion: Your ${from.shortName} photos are never sent to external servers.`,
        `Preserves high-resolution dimensions and color accuracy during ${to.shortName} generation.`,
        `Interactive options for quality tuning, transparent background fills, and preview comparisons.`,
        `Fast, unlimited, and completely free to use without registration or watermarks.`,
      ],
      howToSteps: [
        {
          step: 1,
          title: `Upload your ${from.shortName} file`,
          desc: `Drag and drop your ${from.name} file into the converter box or click to select from your device.`,
        },
        {
          step: 2,
          title: `Fine-tune output settings`,
          desc: `Review the live preview, choose your quality or transparency fill options, and inspect dimensions.`,
        },
        {
          step: 3,
          title: `Download your new ${to.shortName}`,
          desc: `Click 'Download Converted Image' to save the generated .${to.ext} file directly to your computer or phone.`,
        },
      ],
      faqs: [
        {
          question: `Will converting ${from.shortName} to ${to.shortName} reduce image quality?`,
          answer: `Our converter applies high-precision 2D canvas interpolation. When converting to lossless formats like PNG, quality is 100% preserved. When converting to compressed formats like JPG or WebP, you can customize the quality slider up to 100% for pristine clarity.`,
        },
        {
          question: `Is it safe to convert private photos here?`,
          answer: `Yes, absolutely. All processing runs directly in your web browser using HTML5 Canvas and WebAssembly. Your images never leave your computer or touch our servers.`,
        },
        {
          question: `Can I convert multiple ${from.shortName} images?`,
          answer: `Yes! There are no daily conversion limits. Once your first download is complete, click 'Replace' or drop another image to convert as many as you need.`,
        },
        {
          question: `What is the main difference between ${from.shortName} and ${to.shortName}?`,
          answer: `${from.shortName} is typically optimized for ${from.bestFor}, while ${to.shortName} excels at ${to.bestFor}. Converting gives you the exact strengths of ${to.shortName}.`,
        },
      ],
    };
  }

  // Fallback for general converter root
  return {
    slug: 'image-converter',
    fromFormat: 'png',
    toFormat: 'jpg',
    title: 'Free Online Image Converter',
    h1: 'All-in-One Online Image Converter',
    tagline: 'Convert between JPG, PNG, WebP, GIF, BMP, TIFF, ICO, and AVIF instantly in your browser.',
    metaTitle: 'Free Online Image Converter – Convert JPG, PNG, WebP, BMP, TIFF & ICO',
    metaDescription: 'Convert between any image format online for free. Support for JPG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF, and Base64 with instant client-side processing.',
    whyConvert: 'Online platforms, mobile apps, and government forms each require specific image formats. Our universal image converter lets you seamlessly switch formats without uploading files to remote servers.',
    features: [
      'Supports 8 major image formats and 56 directional format conversion pairs.',
      '100% private in-browser conversion with zero server uploads.',
      'Real-time output preview, file size calculation, and quality tuning.',
      'Free, unlimited conversions with no watermarks and no registration required.',
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload your image',
        desc: 'Drag & drop any image file (JPG, PNG, WebP, GIF, BMP, TIFF, SVG) into the drop zone.',
      },
      {
        step: 2,
        title: 'Select target format',
        desc: 'Choose from JPG, PNG, WebP, GIF, BMP, TIFF, ICO, or AVIF with one click.',
      },
      {
        step: 3,
        title: 'Download converted image',
        desc: 'Save your optimized, format-converted image instantly to your device.',
      },
    ],
    faqs: [
      {
        question: 'Which image formats are supported?',
        answer: 'We support all popular formats including JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF, SVG, and Base64 Data URLs.',
      },
      {
        question: 'Are my images stored on your servers?',
        answer: 'No. Conversions happen purely on your device using client-side Web APIs. We never store, inspect, or transfer your files.',
      },
    ],
  };
}

/**
 * List of all 56 directional converter routes for the catalog and navigation:
 */
export interface ConverterRouteEntry {
  slug: string;
  name: string;
  from: string;
  to: string;
  desc: string;
  priority?: number;
}

export const ALL_56_CONVERTER_ROUTES: ConverterRouteEntry[] = [
  // 1 to 7: JPG to ...
  { slug: 'jpg-to-png', name: '1. JPG to PNG', from: 'jpg', to: 'png', desc: 'Convert JPG to lossless PNG with transparent alpha support.', priority: 1 },
  { slug: 'jpg-to-webp', name: '2. JPG to WebP', from: 'jpg', to: 'webp', desc: 'Cut file size by 30% for faster website load times.', priority: 2 },
  { slug: 'jpg-to-gif', name: '3. JPG to GIF', from: 'jpg', to: 'gif', desc: 'Convert JPEG photo into 256-color indexed GIF image.' },
  { slug: 'jpg-to-bmp', name: '4. JPG to BMP', from: 'jpg', to: 'bmp', desc: 'Decompress JPEG into raw 24-bit Windows Bitmap.' },
  { slug: 'jpg-to-tiff', name: '5. JPG to TIFF', from: 'jpg', to: 'tiff', desc: 'Convert photo to high-resolution TIFF for commercial printing.' },
  { slug: 'jpg-to-ico', name: '6. JPG to ICO', from: 'jpg', to: 'ico', desc: 'Create favicon.ico for your website from any JPEG logo.' },
  { slug: 'jpg-to-avif', name: '7. JPG to AVIF', from: 'jpg', to: 'avif', desc: 'Next-gen AV1 compression for ultra-lightweight web images.' },

  // 8 to 14: PNG to ...
  { slug: 'png-to-jpg', name: '8. PNG to JPG', from: 'png', to: 'jpg', desc: 'Drastically reduce file size for exam portals and web forms.', priority: 1 },
  { slug: 'png-to-webp', name: '9. PNG to WebP', from: 'png', to: 'webp', desc: 'Lossless & transparent modern WebP conversion.', priority: 2 },
  { slug: 'png-to-gif', name: '10. PNG to GIF', from: 'png', to: 'gif', desc: 'Convert PNG graphics and badges into 8-bit GIF.' },
  { slug: 'png-to-bmp', name: '11. PNG to BMP', from: 'png', to: 'bmp', desc: 'Convert PNG raster into uncompressed Windows Bitmap.' },
  { slug: 'png-to-tiff', name: '12. PNG to TIFF', from: 'png', to: 'tiff', desc: 'Export PNG graphics to 32-bit TIFF with transparency.' },
  { slug: 'png-to-ico', name: '13. PNG to ICO', from: 'png', to: 'ico', desc: 'Turn transparent PNG logos into crisp website favicons.' },
  { slug: 'png-to-avif', name: '14. PNG to AVIF', from: 'png', to: 'avif', desc: 'Cut PNG file sizes by up to 60% with modern AVIF encoding.' },

  // 15 to 21: WebP to ...
  { slug: 'webp-to-jpg', name: '15. WebP to JPG', from: 'webp', to: 'jpg', desc: 'Convert modern WebP back into universal JPEG format.', priority: 1 },
  { slug: 'webp-to-png', name: '16. WebP to PNG', from: 'webp', to: 'png', desc: 'Extract transparent WebP images into standard PNG.', priority: 1 },
  { slug: 'webp-to-gif', name: '17. WebP to GIF', from: 'webp', to: 'gif', desc: 'Convert WebP images into universally compatible GIF.' },
  { slug: 'webp-to-bmp', name: '18. WebP to BMP', from: 'webp', to: 'bmp', desc: 'Convert WebP into raw uncompressed Windows Bitmap.' },
  { slug: 'webp-to-tiff', name: '19. WebP to TIFF', from: 'webp', to: 'tiff', desc: 'Export WebP graphics to high-resolution printing TIFF.' },
  { slug: 'webp-to-ico', name: '20. WebP to ICO', from: 'webp', to: 'ico', desc: 'Convert WebP logo into multi-size website favicon.ico.' },
  { slug: 'webp-to-avif', name: '21. WebP to AVIF', from: 'webp', to: 'avif', desc: 'Upgrade WebP images to the ultra-efficient AVIF format.' },

  // 22 to 28: GIF to ...
  { slug: 'gif-to-jpg', name: '22. GIF to JPG', from: 'gif', to: 'jpg', desc: 'Convert GIF frames into high-compatibility JPEG photos.' },
  { slug: 'gif-to-png', name: '23. GIF to PNG', from: 'gif', to: 'png', desc: 'Upgrade 8-bit GIF graphics to crisp 32-bit transparent PNG.' },
  { slug: 'gif-to-webp', name: '24. GIF to WebP', from: 'gif', to: 'webp', desc: 'Convert GIF to modern WebP with smaller file size.' },
  { slug: 'gif-to-bmp', name: '25. GIF to BMP', from: 'gif', to: 'bmp', desc: 'Export GIF frame to uncompressed Windows Bitmap format.' },
  { slug: 'gif-to-tiff', name: '26. GIF to TIFF', from: 'gif', to: 'tiff', desc: 'Convert GIF artwork into high-fidelity TIFF format.' },
  { slug: 'gif-to-ico', name: '27. GIF to ICO', from: 'gif', to: 'ico', desc: 'Convert GIF graphic into Windows and favicon icon.' },
  { slug: 'gif-to-avif', name: '28. GIF to AVIF', from: 'gif', to: 'avif', desc: 'Convert GIF into high-efficiency AVIF image.' },

  // 29 to 35: BMP to ...
  { slug: 'bmp-to-jpg', name: '29. BMP to JPG', from: 'bmp', to: 'jpg', desc: 'Compress huge uncompressed BMP files into lightweight JPEG.' },
  { slug: 'bmp-to-png', name: '30. BMP to PNG', from: 'bmp', to: 'png', desc: 'Compress BMP without any quality loss into PNG format.' },
  { slug: 'bmp-to-webp', name: '31. BMP to WebP', from: 'bmp', to: 'webp', desc: 'Shrink BMP file size by over 90% using Google WebP.' },
  { slug: 'bmp-to-gif', name: '32. BMP to GIF', from: 'bmp', to: 'gif', desc: 'Convert Windows Bitmap to indexed 256-color GIF.' },
  { slug: 'bmp-to-tiff', name: '33. BMP to TIFF', from: 'bmp', to: 'tiff', desc: 'Convert BMP into archival quality TIFF document.' },
  { slug: 'bmp-to-ico', name: '34. BMP to ICO', from: 'bmp', to: 'ico', desc: 'Generate Windows application and favicon icon from BMP.' },
  { slug: 'bmp-to-avif', name: '35. BMP to AVIF', from: 'bmp', to: 'avif', desc: 'Convert BMP to ultra-compressed next-generation AVIF.' },

  // 36 to 42: TIFF to ...
  { slug: 'tiff-to-jpg', name: '36. TIFF to JPG', from: 'tiff', to: 'jpg', desc: 'Convert heavy scan/print TIFF into lightweight web JPG.' },
  { slug: 'tiff-to-png', name: '37. TIFF to PNG', from: 'tiff', to: 'png', desc: 'Convert TIFF graphics to transparent lossless web PNG.' },
  { slug: 'tiff-to-webp', name: '38. TIFF to WebP', from: 'tiff', to: 'webp', desc: 'Compress high-resolution TIFF images for fast websites.' },
  { slug: 'tiff-to-gif', name: '39. TIFF to GIF', from: 'tiff', to: 'gif', desc: 'Convert TIFF image into 8-bit compact GIF.' },
  { slug: 'tiff-to-bmp', name: '40. TIFF to BMP', from: 'tiff', to: 'bmp', desc: 'Convert TIFF into uncompressed Windows Bitmap array.' },
  { slug: 'tiff-to-ico', name: '41. TIFF to ICO', from: 'tiff', to: 'ico', desc: 'Create favicon.ico directly from high-resolution TIFF.' },
  { slug: 'tiff-to-avif', name: '42. TIFF to AVIF', from: 'tiff', to: 'avif', desc: 'Compress archival TIFF into modern AVIF format.' },

  // 43 to 49: ICO to ...
  { slug: 'ico-to-jpg', name: '43. ICO to JPG', from: 'ico', to: 'jpg', desc: 'Extract favicon or desktop icon into standard JPEG photo.' },
  { slug: 'ico-to-png', name: '44. ICO to PNG', from: 'ico', to: 'png', desc: 'Extract transparent 32-bit PNG from Windows icon file.' },
  { slug: 'ico-to-webp', name: '45. ICO to WebP', from: 'ico', to: 'webp', desc: 'Convert favicon.ico into lightweight modern WebP image.' },
  { slug: 'ico-to-gif', name: '46. ICO to GIF', from: 'ico', to: 'gif', desc: 'Convert icon graphic into 256-color GIF format.' },
  { slug: 'ico-to-bmp', name: '47. ICO to BMP', from: 'ico', to: 'bmp', desc: 'Extract raw Windows Bitmap graphic from ICO container.' },
  { slug: 'ico-to-tiff', name: '48. ICO to TIFF', from: 'ico', to: 'tiff', desc: 'Convert icon to high-resolution TIFF format.' },
  { slug: 'ico-to-avif', name: '49. ICO to AVIF', from: 'ico', to: 'avif', desc: 'Convert icon file into next-generation AVIF format.' },

  // 50 to 56: AVIF to ...
  { slug: 'avif-to-jpg', name: '50. AVIF to JPG', from: 'avif', to: 'jpg', desc: 'Convert modern AVIF into universally compatible JPEG.' },
  { slug: 'avif-to-png', name: '51. AVIF to PNG', from: 'avif', to: 'png', desc: 'Convert AVIF image into lossless transparent PNG.' },
  { slug: 'avif-to-webp', name: '52. AVIF to WebP', from: 'avif', to: 'webp', desc: 'Convert AVIF into widely compatible Google WebP.' },
  { slug: 'avif-to-gif', name: '53. AVIF to GIF', from: 'avif', to: 'gif', desc: 'Convert AVIF into simple 8-bit GIF format.' },
  { slug: 'avif-to-bmp', name: '54. AVIF to BMP', from: 'avif', to: 'bmp', desc: 'Decompress AVIF into uncompressed Windows Bitmap.' },
  { slug: 'avif-to-tiff', name: '55. AVIF to TIFF', from: 'avif', to: 'tiff', desc: 'Export AVIF image to print-ready TIFF specification.' },
  { slug: 'avif-to-ico', name: '56. AVIF to ICO', from: 'avif', to: 'ico', desc: 'Create favicon.ico directly from AVIF graphic asset.' },
];

/**
 * Special Converters & Utilities:
 */
export const SPECIAL_CONVERTER_ROUTES: ConverterRouteEntry[] = [
  { slug: 'heic-to-jpg', name: 'HEIC to JPG', from: 'heic', to: 'jpg', desc: 'Convert iPhone HEIC photos to universal JPG format.', priority: 1 },
  { slug: 'heic-to-png', name: 'HEIC to PNG', from: 'heic', to: 'png', desc: 'Convert Apple HEIC photos into transparent PNG format.' },
  { slug: 'svg-to-png', name: 'SVG to PNG', from: 'svg', to: 'png', desc: 'Render scalable vector SVG to crisp transparent raster PNG.', priority: 1 },
  { slug: 'svg-to-jpg', name: 'SVG to JPG', from: 'svg', to: 'jpg', desc: 'Rasterize SVG vector illustrations into standard JPEG.' },
  { slug: 'svg-to-webp', name: 'SVG to WebP', from: 'svg', to: 'webp', desc: 'Convert SVG vectors into high-speed modern WebP graphics.' },
  { slug: 'image-to-base64', name: 'Image to Base64', from: 'png', to: 'base64', desc: 'Encode any image into Base64 Data URI for CSS & HTML embedding.', priority: 1 },
  { slug: 'base64-to-image', name: 'Base64 to Image', from: 'base64', to: 'png', desc: 'Decode Base64 Data URI string into downloadable image file.', priority: 1 },
];
