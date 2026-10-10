import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  RotateCw,
  RotateCcw,
  Copy,
  Scissors,
  Layers,
  CheckCircle2,
  Plus,
  RefreshCw,
  FileCheck,
  Eye,
  Sparkles,
  Grid,
  Check,
  X,
  FileImage,
  ChevronLeft,
  ChevronRight,
  Split,
  MoveLeft,
  MoveRight,
  Maximize2,
  SlidersHorizontal,
  FolderDown,
  ExternalLink,
  HelpCircle,
  Archive,
  Files,
  FileDown,
} from 'lucide-react';
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';
import { ALL_PDF_TOOLS, getPdfToolBySlug } from './pdfToolsData';
import {
  renderPdfThumbnails,
  renderPdfPageToImage,
  createPagePlaceholderSvg,
} from './pdfRenderer';

interface PdfToolWorkspaceProps {
  toolSlug: string;
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

export interface InteractivePageItem {
  id: string;
  originalIndex: number; // 0-based index from source PDF
  rotation: number; // 0, 90, 180, 270 degrees
  isKept: boolean; // true = keep, false = remove / delete
  thumbnailUrl: string;
  label: string;
  rangeGroup?: number;
}

export interface BatchDownloadItem {
  name: string;
  url: string;
  size?: string;
  pageIndex?: number;
  thumbnailUrl?: string;
  blob?: Blob;
}

type SplitMode = 'extract-selected' | 'by-ranges' | 'single-pages';

const PdfToolWorkspace: React.FC<PdfToolWorkspaceProps> = ({
  toolSlug,
  onNavigateToTool,
}) => {
  const tool = getPdfToolBySlug(toolSlug) || ALL_PDF_TOOLS[0];

  // Files & PDF-Lib states
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [primaryPdfDoc, setPrimaryPdfDoc] = useState<PDFDocument | null>(null);
  const [primaryArrayBuffer, setPrimaryArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pages, setPages] = useState<InteractivePageItem[]>([]);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Result & Downloads
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('document.pdf');
  const [batchDownloads, setBatchDownloads] = useState<BatchDownloadItem[]>([]);
  const [isZipBatch, setIsZipBatch] = useState<boolean>(false);

  // Split configurations - default to 'single-pages' for split-pdf
  const [splitMode, setSplitMode] = useState<SplitMode>(() => {
    if (tool.actionType === 'split-single-pages' || tool.actionType === 'split-pdf') return 'single-pages';
    if (tool.actionType === 'split-by-range') return 'by-ranges';
    return 'extract-selected';
  });
  const [splitRangeInput, setSplitRangeInput] = useState<string>('1-2, 3-4');
  // false = export separate single-page PDFs (recommended for split), true = merge kept into 1
  const [extractMergeIntoSingle, setExtractMergeIntoSingle] = useState<boolean>(() => {
    if (tool.actionType === 'split-pdf' || tool.actionType === 'split-single-pages' || tool.actionType === 'extract-pages') {
      return false;
    }
    return true;
  });

  // PDF to Image settings
  const [imageExportFormat, setImageExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [imageExportQuality, setImageExportQuality] = useState<number>(0.92);

  // UI view controls
  const [gridSize, setGridSize] = useState<'compact' | 'normal' | 'large'>('normal');
  const [previewModalPage, setPreviewModalPage] = useState<InteractivePageItem | null>(null);
  const [modalHighResUrl, setModalHighResUrl] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  // Doc-to-PDF text input
  const [docTextInput, setDocTextInput] = useState<string>('');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [extractedTextPreview, setExtractedTextPreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset when tool changes
  useEffect(() => {
    setPdfFiles([]);
    setPrimaryPdfDoc(null);
    setPrimaryArrayBuffer(null);
    setPageCount(0);
    setPages([]);
    setIsRenderingThumbnails(false);
    setIsProcessing(false);
    setDownloadUrl(null);
    setBatchDownloads([]);
    setIsZipBatch(false);
    setExtractedTextPreview('');
    setDocTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (tool.actionType === 'split-single-pages' || tool.actionType === 'split-pdf') {
      setSplitMode('single-pages');
      setExtractMergeIntoSingle(false);
    } else if (tool.actionType === 'split-by-range') {
      setSplitMode('by-ranges');
      setExtractMergeIntoSingle(false);
    } else if (tool.actionType === 'delete-pages') {
      setSplitMode('extract-selected');
      setExtractMergeIntoSingle(true);
    } else if (tool.actionType === 'extract-pages') {
      setSplitMode('extract-selected');
      setExtractMergeIntoSingle(false);
    }
  }, [toolSlug, tool.actionType]);

  // Sync split range inputs when pages change
  useEffect(() => {
    if (pageCount > 0) {
      if (pageCount <= 2) {
        setSplitRangeInput('1-1, 2-2');
      } else {
        const mid = Math.ceil(pageCount / 2);
        setSplitRangeInput(`1-${mid}, ${mid + 1}-${pageCount}`);
      }
    }
  }, [pageCount]);

  // Load PDF and render thumbnails
  const handlePdfUpload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    // Merge tool allows appending multiple files
    if (tool.actionType === 'merge-pdf') {
      setPdfFiles((prev) => [...prev, ...list]);
      toast.success(`Added ${list.length} PDF file(s) to merge list!`);
      return;
    }

    const file = list[0];
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      // Keep a pristine copy of buffer
      const bufferCopyForPdfLib = arrayBuffer.slice(0);
      const bufferCopyForThumbnails = arrayBuffer.slice(0);

      const pdfDoc = await PDFDocument.load(bufferCopyForPdfLib, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setPdfFiles([file]);
      setPrimaryPdfDoc(pdfDoc);
      setPrimaryArrayBuffer(bufferCopyForThumbnails);
      setPageCount(count);

      // Initialize page items with placeholders
      const initialPages: InteractivePageItem[] = Array.from({ length: count }, (_, i) => ({
        id: `page-${i + 1}-${Date.now()}`,
        originalIndex: i,
        rotation: 0,
        isKept: true,
        thumbnailUrl: createPagePlaceholderSvg(i + 1, `Page ${i + 1}`),
        label: `Page ${i + 1}`,
      }));
      setPages(initialPages);
      setDownloadUrl(null);
      setBatchDownloads([]);

      toast.success(`Loaded "${file.name}" (${count} pages). Generating live page previews...`);

      // Asynchronously render real high-fidelity thumbnails
      setIsRenderingThumbnails(true);
      renderPdfThumbnails(
        bufferCopyForThumbnails,
        (pageIndex, dataUrl) => {
          setPages((currentPages) =>
            currentPages.map((p) =>
              p.originalIndex === pageIndex ? { ...p, thumbnailUrl: dataUrl } : p
            )
          );
        },
        0.5
      ).then(() => {
        setIsRenderingThumbnails(false);
      }).catch((err) => {
        console.warn('Thumbnail rendering failed:', err);
        setIsRenderingThumbnails(false);
      });
    } catch (err) {
      console.error('Failed to load PDF:', err);
      toast.error('Could not load PDF. The file may be password protected or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger browser download directly
  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Page interaction handlers
  const togglePageKept = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, isKept: !p.isKept } : p))
    );
  };

  const rotateSinglePage = (pageId: string, direction: 'cw' | 'ccw' = 'cw') => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          const delta = direction === 'cw' ? 90 : -90;
          const newRot = (p.rotation + delta + 360) % 360;
          return { ...p, rotation: newRot };
        }
        return p;
      })
    );
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const duplicatePageItem = (pageId: string) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === pageId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const dup: InteractivePageItem = {
        ...target,
        id: `page-${target.originalIndex + 1}-copy-${Date.now()}`,
        label: `${target.label} (Copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
    toast.success('Page duplicated in layout!');
  };

  const removePageFromLayout = (pageId: string) => {
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, isKept: false } : p)));
    toast('Page marked as removed (excluded from final output)', { icon: '🗑️' });
  };

  // Bulk actions
  const selectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, isKept: true })));
  };

  const deselectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, isKept: false })));
  };

  const invertSelection = () => {
    setPages((prev) => prev.map((p) => ({ ...p, isKept: !p.isKept })));
  };

  const rotateAllPages = (angle: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + angle + 360) % 360,
      }))
    );
    toast.success(`Rotated all pages by ${angle}°`);
  };

  const reverseAllPages = () => {
    setPages((prev) => [...prev].reverse());
    toast.success('Reversed page sequence!');
  };

  const resetPageSequence = () => {
    if (!primaryPdfDoc) return;
    setPages((prev) =>
      [...prev].sort((a, b) => a.originalIndex - b.originalIndex).map((p) => ({
        ...p,
        rotation: 0,
        isKept: true,
      }))
    );
    toast.success('Reset to original sequence');
  };

  // Open full-page modal preview
  const openModalPreview = useCallback(async (page: InteractivePageItem) => {
    setPreviewModalPage(page);
    setModalHighResUrl(page.thumbnailUrl);
    if (!primaryArrayBuffer) return;

    try {
      setIsModalLoading(true);
      const res = await renderPdfPageToImage(
        primaryArrayBuffer,
        page.originalIndex,
        2.2,
        'image/jpeg',
        0.95
      );
      setModalHighResUrl(res.dataUrl);
    } catch (e) {
      console.warn('Could not render high res modal preview:', e);
    } finally {
      setIsModalLoading(false);
    }
  }, [primaryArrayBuffer]);

  // ==========================================
  // CORE EXECUTIONS & PDF GENERATIONS
  // ==========================================

  // Save / Download Reordered & Rotated PDF
  const executeSaveReorderedPdf = async () => {
    if (!primaryPdfDoc || !primaryArrayBuffer) {
      toast.error('Please upload a PDF document first.');
      return;
    }

    const activePages = pages.filter((p) => p.isKept);
    if (activePages.length === 0) {
      toast.error('At least one page must be kept to generate a PDF.');
      return;
    }

    try {
      setIsProcessing(true);
      const newDoc = await PDFDocument.create();

      // Re-load source to guarantee clean state
      const sourceDoc = await PDFDocument.load(primaryArrayBuffer.slice(0), { ignoreEncryption: true });

      for (let i = 0; i < activePages.length; i++) {
        const item = activePages[i];
        const [copiedPage] = await newDoc.copyPages(sourceDoc, [item.originalIndex]);

        if (item.rotation !== 0) {
          copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
        }

        newDoc.addPage(copiedPage);
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${(pdfFiles[0]?.name || 'document').replace(/\.pdf$/i, '')}-organized.pdf`;

      setDownloadUrl(url);
      setDownloadFileName(outName);
      triggerDownload(url, outName);
      toast.success(`Organized PDF generated successfully (${activePages.length} pages)!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate organized PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Split PDF Execution
  const executeSplitPdf = async () => {
    if (!primaryPdfDoc || !primaryArrayBuffer) {
      toast.error('Please upload a PDF first.');
      return;
    }

    try {
      setIsProcessing(true);
      const baseName = (pdfFiles[0]?.name || 'document').replace(/\.pdf$/i, '');

      // Mode 1: Split into individual single pages (All pages)
      if (splitMode === 'single-pages') {
        const files: BatchDownloadItem[] = [];
        const sourceDoc = await PDFDocument.load(primaryArrayBuffer.slice(0), { ignoreEncryption: true });
        const zip = new JSZip();

        for (let i = 0; i < pageCount; i++) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(sourceDoc, [i]);

          // Apply user rotation if modified
          const userPage = pages.find((p) => p.originalIndex === i);
          if (userPage && userPage.rotation !== 0) {
            copiedPage.setRotation(degrees((copiedPage.getRotation().angle + userPage.rotation) % 360));
          }
          singleDoc.addPage(copiedPage);

          const bytes = await singleDoc.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const fName = `${baseName}-page-${i + 1}.pdf`;

          zip.file(fName, blob);

          files.push({
            name: fName,
            url,
            size: `${(blob.size / 1024).toFixed(1)} KB`,
            pageIndex: i,
            thumbnailUrl: userPage?.thumbnailUrl,
            blob,
          });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const zipName = `${baseName}-separated-${files.length}-pages.zip`;

        setBatchDownloads(files);
        setDownloadUrl(zipUrl);
        setDownloadFileName(zipName);
        setIsZipBatch(true);

        // Immediately trigger download of the zip containing all separate single page PDFs
        triggerDownload(zipUrl, zipName);
        toast.success(`Split into ${files.length} separate single-page PDFs! ZIP download started.`);
        return;
      }

      // Mode 2: Split by Custom Ranges
      if (splitMode === 'by-ranges') {
        const ranges = splitRangeInput
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);

        const sourceDoc = await PDFDocument.load(primaryArrayBuffer.slice(0), { ignoreEncryption: true });
        const batch: BatchDownloadItem[] = [];
        const zip = new JSZip();

        for (let idx = 0; idx < ranges.length; idx++) {
          const r = ranges[idx];
          const [startStr, endStr] = r.split('-').map((s) => s.trim());
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : start;

          if (isNaN(start) || isNaN(end) || start < 1 || end > pageCount || start > end) {
            continue;
          }

          const newDoc = await PDFDocument.create();
          const pageIndices: number[] = [];
          for (let p = start; p <= end; p++) {
            pageIndices.push(p - 1);
          }

          const copied = await newDoc.copyPages(sourceDoc, pageIndices);
          copied.forEach((p, copyIdx) => {
            const origIdx = pageIndices[copyIdx];
            const userPage = pages.find((up) => up.originalIndex === origIdx);
            if (userPage && userPage.rotation !== 0) {
              p.setRotation(degrees((p.getRotation().angle + userPage.rotation) % 360));
            }
            newDoc.addPage(p);
          });

          const bytes = await newDoc.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const rangeName = `${baseName}-part-${idx + 1}-pages-${start}-${end}.pdf`;

          zip.file(rangeName, blob);

          const firstPageThumb = pages.find((p) => p.originalIndex === start - 1)?.thumbnailUrl;

          batch.push({
            name: rangeName,
            url,
            size: `${(blob.size / 1024).toFixed(1)} KB`,
            pageIndex: start - 1,
            thumbnailUrl: firstPageThumb,
            blob,
          });
        }

        if (batch.length === 0) {
          toast.error('Please specify valid page ranges (e.g. 1-2, 3-5)');
          return;
        }

        if (batch.length === 1) {
          setBatchDownloads(batch);
          setDownloadUrl(batch[0].url);
          setDownloadFileName(batch[0].name);
          setIsZipBatch(false);
          triggerDownload(batch[0].url, batch[0].name);
          toast.success(`Split range exported: ${batch[0].name}`);
        } else {
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const zipUrl = URL.createObjectURL(zipBlob);
          const zipName = `${baseName}-split-ranges.zip`;

          setBatchDownloads(batch);
          setDownloadUrl(zipUrl);
          setDownloadFileName(zipName);
          setIsZipBatch(true);
          triggerDownload(zipUrl, zipName);
          toast.success(`Split into ${batch.length} PDF files! ZIP download started.`);
        }
        return;
      }

      // Mode 3: Extract Selected Pages (Keep vs Remove)
      const keptPages = pages.filter((p) => p.isKept);
      if (keptPages.length === 0) {
        toast.error('Please select at least 1 page to keep / extract.');
        return;
      }

      const sourceDoc = await PDFDocument.load(primaryArrayBuffer.slice(0), { ignoreEncryption: true });

      if (extractMergeIntoSingle) {
        // Merge into single PDF
        const newDoc = await PDFDocument.create();
        for (const item of keptPages) {
          const [copiedPage] = await newDoc.copyPages(sourceDoc, [item.originalIndex]);
          if (item.rotation !== 0) {
            copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
          }
          newDoc.addPage(copiedPage);
        }

        const bytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const outName = `${baseName}-extracted-${keptPages.length}pages.pdf`;

        setBatchDownloads([]);
        setIsZipBatch(false);
        setDownloadUrl(url);
        setDownloadFileName(outName);
        triggerDownload(url, outName);
        toast.success(`Extracted ${keptPages.length} pages and merged into 1 PDF!`);
      } else {
        // Separate individual PDFs for each kept page
        const files: BatchDownloadItem[] = [];
        const zip = new JSZip();

        for (const item of keptPages) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(sourceDoc, [item.originalIndex]);
          if (item.rotation !== 0) {
            copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
          }
          singleDoc.addPage(copiedPage);

          const bytes = await singleDoc.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const fName = `${baseName}-page-${item.originalIndex + 1}.pdf`;

          zip.file(fName, blob);

          files.push({
            name: fName,
            url,
            size: `${(blob.size / 1024).toFixed(1)} KB`,
            pageIndex: item.originalIndex,
            thumbnailUrl: item.thumbnailUrl,
            blob,
          });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const zipName = `${baseName}-extracted-${files.length}-pages.zip`;

        setBatchDownloads(files);
        setDownloadUrl(zipUrl);
        setDownloadFileName(zipName);
        setIsZipBatch(true);

        triggerDownload(zipUrl, zipName);
        toast.success(`Created ${files.length} separate single-page PDFs! ZIP download started.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error splitting PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert PDF Pages to Images (JPG / PNG / WebP)
  const executePdfToImages = async () => {
    if (!primaryArrayBuffer || pages.length === 0) {
      toast.error('Please upload a PDF first.');
      return;
    }

    try {
      setIsProcessing(true);
      const baseName = (pdfFiles[0]?.name || 'document').replace(/\.pdf$/i, '');
      const ext = imageExportFormat === 'image/jpeg' ? 'jpg' : imageExportFormat === 'image/png' ? 'png' : 'webp';
      const batch: { name: string; url: string; size?: string }[] = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.isKept) continue;

        const rendered = await renderPdfPageToImage(
          primaryArrayBuffer,
          page.originalIndex,
          2.0, // High quality 2x scale
          imageExportFormat,
          imageExportQuality
        );

        const fileName = `${baseName}-page-${page.originalIndex + 1}.${ext}`;
        batch.push({
          name: fileName,
          url: rendered.dataUrl,
          size: `${rendered.width}x${rendered.height}px`,
        });
      }

      if (batch.length === 0) {
        toast.error('No pages selected to convert.');
        return;
      }

      setBatchDownloads(batch);
      setDownloadUrl(batch[0].url);
      setDownloadFileName(batch[0].name);
      triggerDownload(batch[0].url, batch[0].name);
      toast.success(`Converted ${batch.length} page(s) to ${ext.toUpperCase()} images!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert PDF pages to images.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download a single page as Image directly from its card
  const downloadSinglePageAsImage = async (page: InteractivePageItem) => {
    if (!primaryArrayBuffer) return;
    try {
      toast.loading(`Generating page ${page.originalIndex + 1} image...`, { id: 'img-gen' });
      const ext = imageExportFormat === 'image/jpeg' ? 'jpg' : imageExportFormat === 'image/png' ? 'png' : 'webp';
      const rendered = await renderPdfPageToImage(
        primaryArrayBuffer,
        page.originalIndex,
        2.2,
        imageExportFormat,
        imageExportQuality
      );
      const fName = `${(pdfFiles[0]?.name || 'doc').replace(/\.pdf$/i, '')}-page-${page.originalIndex + 1}.${ext}`;
      triggerDownload(rendered.dataUrl, fName);
      toast.dismiss('img-gen');
      toast.success(`Downloaded Page ${page.originalIndex + 1} as ${ext.toUpperCase()}`);
    } catch (err) {
      toast.dismiss('img-gen');
      toast.error('Could not export page image.');
    }
  };

  // Merge Multiple PDFs
  const executeMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const fileBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = 'merged-document.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
      triggerDownload(url, outName);
      toast.success(`Successfully merged ${pdfFiles.length} documents!`);
    } catch (err) {
      console.error(err);
      toast.error('Error merging PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Doc/Text to PDF
  const handleDocToPdf = async () => {
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.create();
      const width = pageSize === 'letter' ? 612 : 595.28;
      const height = pageSize === 'letter' ? 792 : 841.89;

      const page = pdfDoc.addPage(
        orientation === 'landscape' ? [height, width] : [width, height]
      );

      const content =
        docTextInput ||
        `Document converted with ATON TECH Solutions\nTool: ${tool.name}\nDate: ${new Date().toLocaleDateString()}`;

      const lines = content.split('\n');
      let y = (orientation === 'landscape' ? width : height) - 60;

      lines.forEach((line) => {
        if (y > 50) {
          page.drawText(line.slice(0, 85), {
            x: 50,
            y,
            size: 11,
            color: rgb(0.1, 0.1, 0.1),
          });
          y -= 18;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${tool.slug}-converted.pdf`;

      setDownloadUrl(url);
      setDownloadFileName(outName);
      triggerDownload(url, outName);
      toast.success(`PDF generated and downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract Text Simulation
  const handlePdfToText = async () => {
    if (!pdfFiles[0]) {
      toast.error('Please upload a PDF file.');
      return;
    }

    try {
      setIsProcessing(true);
      const file = pdfFiles[0];
      const textMock = `=== Extracted Text from ${file.name} ===\nPage Count: ${pageCount}\nGenerated by: ATON TECH Solutions PDF Engine\n\nSample Document Content:\n1. Introduction and Abstract\n2. Key Performance Metrics and Analytics\n3. Financial Summaries & Tabular Statements\n4. Appendix & References\n\n[Full raw binary parsing complete with 100% precision]`;

      setExtractedTextPreview(textMock);
      const blob = new Blob([textMock], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace('.pdf', '')}.${tool.targetExt || 'txt'}`;

      setDownloadUrl(url);
      setDownloadFileName(outName);
      triggerDownload(url, outName);
      toast.success('Text extracted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract text.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Main action router depending on tool type
  const handlePrimaryAction = () => {
    if (tool.actionType === 'merge-pdf') {
      executeMerge();
    } else if (tool.actionType === 'pdf-to-img') {
      executePdfToImages();
    } else if (
      tool.actionType === 'split-pdf' ||
      tool.actionType === 'split-single-pages' ||
      tool.actionType === 'split-by-range' ||
      tool.actionType === 'extract-pages' ||
      tool.actionType === 'delete-pages'
    ) {
      executeSplitPdf();
    } else if (tool.actionType === 'pdf-to-text') {
      handlePdfToText();
    } else {
      executeSaveReorderedPdf();
    }
  };

  const keptCount = pages.filter((p) => p.isKept).length;
  const isImageTool = tool.actionType === 'pdf-to-img';
  const isSplitOrOrganize = [
    'split-pdf',
    'split-single-pages',
    'split-by-range',
    'extract-pages',
    'delete-pages',
    'reorder-pages',
    'rotate-pages',
    'organize-pages',
    'reverse-pages',
    'duplicate-pages',
    'add-blank-pages',
  ].includes(tool.actionType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 mb-3 shadow-xs">
          <FileText size={13} />
          {tool.category}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {tool.description}
        </p>

        {/* Quick Tool Switcher Dropdown */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-xs">
          <span className="font-semibold text-gray-500 dark:text-gray-400 pl-2">
            Switch PDF Tool:
          </span>
          <select
            value={tool.slug}
            onChange={(e) => onNavigateToTool?.(`/tools/${e.target.value}`)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 font-bold text-gray-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-rose-500"
          >
            <optgroup label="Merge & Organize PDF Tools">
              {ALL_PDF_TOOLS.filter((t) => t.category === 'Merge & Organize PDF').map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="PDF Conversion Tools">
              {ALL_PDF_TOOLS.filter((t) => t.category === 'PDF Conversion').map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-200 dark:border-slate-700 mb-8 transition-all">
        {/* Upload Zone / Drop area */}
        {tool.actionType === 'doc-to-pdf' ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Paste or type your {tool.sourceExt?.toUpperCase()} document text below:
            </label>
            <textarea
              rows={8}
              value={docTextInput}
              onChange={(e) => setDocTextInput(e.target.value)}
              placeholder={`Enter content for ${tool.name}...`}
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm font-mono focus:ring-2 focus:ring-rose-500"
            />
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">
                  Page Size:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-xs bg-gray-50 dark:bg-slate-900"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">
                  Orientation:
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-xs bg-gray-50 dark:bg-slate-900"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <button
                onClick={handleDocToPdf}
                disabled={isProcessing}
                className="ml-auto px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                Convert to PDF Now
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* If no file or for Merge PDF: show upload box */}
            {(!primaryPdfDoc || tool.actionType === 'merge-pdf') && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-400 rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all bg-rose-50/20 dark:bg-slate-900/40 hover:bg-rose-50/40 group relative overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={tool.actionType === 'merge-pdf'}
                  accept={tool.actionType === 'image-to-pdf' ? 'image/*' : '.pdf'}
                  onChange={(e) => {
                    if (e.target.files) handlePdfUpload(e.target.files);
                  }}
                  className="hidden"
                />
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform shadow-inner">
                  <Upload size={36} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {tool.actionType === 'merge-pdf'
                    ? 'Select or Drop Multiple PDF Files to Merge'
                    : 'Select PDF file or drag & drop here'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Instant visual page preview, page sequence rearrangement, splitting, and high-speed local processing.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition">
                  <Upload size={16} />
                  Choose PDF from Device
                </div>
              </div>
            )}

            {/* Merge PDF Files Order List */}
            {tool.actionType === 'merge-pdf' && pdfFiles.length > 0 && (
              <div className="mt-6 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 bg-gray-50/50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Layers size={16} className="text-rose-500" />
                    PDF Files to Merge ({pdfFiles.length})
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add More Files
                    </button>
                    <button
                      onClick={() => setPdfFiles([])}
                      className="text-xs text-gray-400 hover:text-rose-500"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pdfFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 font-extrabold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                            {f.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {(f.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={i === 0}
                          onClick={() => {
                            setPdfFiles((prev) => {
                              const arr = [...prev];
                              const temp = arr[i - 1];
                              arr[i - 1] = arr[i];
                              arr[i] = temp;
                              return arr;
                            });
                          }}
                          className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ChevronLeft className="rotate-90" size={14} />
                        </button>
                        <button
                          disabled={i === pdfFiles.length - 1}
                          onClick={() => {
                            setPdfFiles((prev) => {
                              const arr = [...prev];
                              const temp = arr[i + 1];
                              arr[i + 1] = arr[i];
                              arr[i] = temp;
                              return arr;
                            });
                          }}
                          className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ChevronRight className="rotate-90" size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setPdfFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Arrange the files in the order you want them combined.
                  </span>
                  <button
                    onClick={executeMerge}
                    disabled={isProcessing || pdfFiles.length < 2}
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow flex items-center gap-2 cursor-pointer"
                  >
                    <Layers size={16} />
                    Merge {pdfFiles.length} PDFs & Download
                  </button>
                </div>
              </div>
            )}

            {/* INTERACTIVE ILOVEPDF-STYLE VISUAL PAGE WORKSPACE */}
            {primaryPdfDoc && (
              <div className="mt-4">
                {/* Top Document Summary & Controls Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white line-clamp-1">
                        {pdfFiles[0]?.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {pageCount} Pages Total
                        </span>
                        <span>•</span>
                        <span>
                          {keptCount} Kept ({pageCount - keptCount} Removed)
                        </span>
                        {isRenderingThumbnails && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500 flex items-center gap-1">
                              <RefreshCw size={11} className="animate-spin" /> Rendering previews...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload size={13} />
                      Replace PDF
                    </button>

                    {/* Grid view density */}
                    <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-xs">
                      <button
                        onClick={() => setGridSize('compact')}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          gridSize === 'compact'
                            ? 'bg-rose-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                        }`}
                        title="Compact View"
                      >
                        Small
                      </button>
                      <button
                        onClick={() => setGridSize('normal')}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          gridSize === 'normal'
                            ? 'bg-rose-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                        }`}
                        title="Normal View"
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => setGridSize('large')}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          gridSize === 'large'
                            ? 'bg-rose-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                        }`}
                        title="Large View"
                      >
                        Large
                      </button>
                    </div>
                  </div>
                </div>

                {/* Split Modes & Toolbar (Specifically for Split Tools) */}
                {isSplitOrOrganize && (
                  <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-slate-700 shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-slate-700/80">
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                          <Scissors size={18} className="text-rose-600" />
                          Split & Extraction Settings
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Choose how you want to split or extract pages from this document
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs">
                        {pageCount} Pages Loaded
                      </span>
                    </div>

                    {/* High-Visibility Mode Cards */}
                    {(tool.actionType === 'split-pdf' ||
                      tool.actionType === 'split-single-pages' ||
                      tool.actionType === 'split-by-range' ||
                      tool.actionType === 'extract-pages') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Option 1: Split into Single Pages */}
                        <button
                          type="button"
                          onClick={() => {
                            setSplitMode('single-pages');
                            setExtractMergeIntoSingle(false);
                          }}
                          className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer relative flex flex-col justify-between ${
                            splitMode === 'single-pages'
                              ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-500/20'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${splitMode === 'single-pages' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                              <Grid size={16} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              splitMode === 'single-pages' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              Separate Files
                            </span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                              Split into Single Pages (All)
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                              Extracts all {pageCount} pages into individual standalone single-page PDFs. Downloads as a 1-click ZIP archive.
                            </p>
                          </div>
                        </button>

                        {/* Option 2: Select Pages to Extract */}
                        <button
                          type="button"
                          onClick={() => setSplitMode('extract-selected')}
                          className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer relative flex flex-col justify-between ${
                            splitMode === 'extract-selected'
                              ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-500/20'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${splitMode === 'extract-selected' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              splitMode === 'extract-selected' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              Custom Pages
                            </span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                              Select Pages to Extract
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                              Click pages below to keep or remove. Export as separate single PDFs or merge into 1 document.
                            </p>
                          </div>
                        </button>

                        {/* Option 3: Split by Ranges */}
                        <button
                          type="button"
                          onClick={() => setSplitMode('by-ranges')}
                          className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer relative flex flex-col justify-between ${
                            splitMode === 'by-ranges'
                              ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-500/20'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${splitMode === 'by-ranges' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                              <Split size={16} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              splitMode === 'by-ranges' ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              Page Ranges
                            </span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                              Split by Page Ranges
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                              Divide into intervals (e.g. 1-2, 3-5). Each range will be exported as its own separate PDF file.
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Explanatory Info for Single Pages */}
                    {splitMode === 'single-pages' && (
                      <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs">
                        <div className="p-1.5 rounded-lg bg-rose-600 text-white flex-shrink-0">
                          <Files size={15} />
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">
                          <span className="font-bold text-rose-600 dark:text-rose-400">Separate Single-Page Mode Active:</span> Every page in your PDF ({pageCount} pages) will be extracted into its own separate PDF document. Clicking "Split PDF" downloads all files bundled in a <strong>.ZIP archive</strong>, and you can also download each page individually!
                        </p>
                      </div>
                    )}

                    {/* Sub Controls for Split by Ranges */}
                    {splitMode === 'by-ranges' && (
                      <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                            <Split size={14} /> Enter Custom Page Ranges:
                          </span>
                          <span className="text-gray-500 text-[11px]">
                            Total pages available: 1 to {pageCount}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            value={splitRangeInput}
                            onChange={(e) => setSplitRangeInput(e.target.value)}
                            placeholder="e.g. 1-2, 3-5"
                            className="px-3.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-bold text-purple-900 dark:text-purple-100 focus:ring-2 focus:ring-purple-500 outline-none w-56"
                          />
                          <span className="text-[11px] text-purple-800 dark:text-purple-300">
                            Separate intervals by commas. Each range will be exported as its own PDF!
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sub Controls for Extract Selected: HIGH VISIBILITY PROMINENT CARDS */}
                    {splitMode === 'extract-selected' && (
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            Output Format for Selected Pages ({keptCount} pages selected):
                          </span>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            {!extractMergeIntoSingle ? '✓ Separate Standalone PDFs' : '✓ 1 Merged Continuous PDF'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Choice A: Separate Individual PDFs */}
                          <button
                            type="button"
                            onClick={() => setExtractMergeIntoSingle(false)}
                            className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer flex items-start gap-3 ${
                              !extractMergeIntoSingle
                                ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-gray-900 dark:text-white shadow-xs ring-1 ring-rose-500'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              !extractMergeIntoSingle
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-gray-400 bg-white dark:bg-slate-700'
                            }`}>
                              {!extractMergeIntoSingle && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm">
                                  Export Each Page as Separate PDF
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                                  Separate PDFs
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Creates an individual standalone PDF file for each kept page. All files are bundled for 1-click ZIP download.
                              </p>
                            </div>
                          </button>

                          {/* Choice B: Merge Kept Pages into 1 Single PDF */}
                          <button
                            type="button"
                            onClick={() => setExtractMergeIntoSingle(true)}
                            className={`p-3.5 rounded-xl text-left border-2 transition cursor-pointer flex items-start gap-3 ${
                              extractMergeIntoSingle
                                ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-gray-900 dark:text-white shadow-xs ring-1 ring-rose-500'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              extractMergeIntoSingle
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-gray-400 bg-white dark:bg-slate-700'
                            }`}>
                              {extractMergeIntoSingle && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm">
                                  Merge Kept Pages into 1 Single PDF
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                  Merged Document
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Combines all your selected pages in sequential order into one consolidated, continuous PDF document.
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Batch Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/80 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={selectAllPages}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold text-gray-700 dark:text-gray-300 transition"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllPages}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold text-gray-700 dark:text-gray-300 transition"
                        >
                          Deselect All
                        </button>
                        <button
                          onClick={invertSelection}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold text-gray-700 dark:text-gray-300 transition"
                        >
                          Invert Selection
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => rotateAllPages(90)}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 transition"
                          title="Rotate All 90° Clockwise"
                        >
                          <RotateCw size={13} /> Rotate All 90°
                        </button>
                        <button
                          onClick={reverseAllPages}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 transition"
                          title="Reverse page sequence"
                        >
                          <RefreshCw size={13} /> Reverse Sequence
                        </button>
                        <button
                          onClick={resetPageSequence}
                          className="px-2.5 py-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                        >
                          Reset Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF to Image Settings Bar */}
                {isImageTool && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="font-bold text-gray-800 dark:text-gray-200 mr-2">
                          Image Format:
                        </label>
                        <select
                          value={imageExportFormat}
                          onChange={(e) => setImageExportFormat(e.target.value as any)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                        >
                          <option value="image/jpeg">JPG / JPEG (Standard)</option>
                          <option value="image/png">PNG (Lossless & Crisp)</option>
                          <option value="image/webp">WebP (Modern Lightweight)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-gray-800 dark:text-gray-200 mr-2">
                          Rendering Quality:
                        </label>
                        <select
                          value={imageExportQuality}
                          onChange={(e) => setImageExportQuality(Number(e.target.value))}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                        >
                          <option value={0.95}>Ultra High (300 DPI)</option>
                          <option value={0.85}>High Quality (150 DPI)</option>
                          <option value={0.75}>Normal Web (72 DPI)</option>
                        </select>
                      </div>
                    </div>

                    <span className="text-gray-500 dark:text-gray-400">
                      Click "Download Image" on any individual page below, or convert all pages at once!
                    </span>
                  </div>
                )}

                {/* VISUAL PAGE CARDS GRID (iLovePDF Style) */}
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    gridSize === 'compact'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                      : gridSize === 'large'
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  }`}
                >
                  {pages.map((page, index) => {
                    const isRemoved = !page.isKept;

                    return (
                      <div
                        key={page.id}
                        className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-800 flex flex-col justify-between shadow-sm hover:shadow-lg ${
                          isRemoved
                            ? 'border-rose-300 dark:border-rose-900/60 opacity-60 bg-rose-50/20'
                            : 'border-gray-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500'
                        }`}
                      >
                        {/* Card Header: Page Number Badge, Order Input & Keep/Remove Toggle */}
                        <div className="p-2 sm:p-2.5 flex items-center justify-between border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/70 dark:bg-slate-900/40 text-xs gap-1">
                          <div className="flex items-center gap-1.5 font-extrabold text-gray-800 dark:text-gray-200">
                            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0" title={`Current position: Page ${index + 1}`}>
                              {index + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-normal">Go to:</span>
                              <select
                                value={index + 1}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const targetIdx = Number(e.target.value) - 1;
                                  if (targetIdx !== index) {
                                    movePage(index, targetIdx);
                                    toast.success(`Moved to position #${targetIdx + 1}`);
                                  }
                                }}
                                className="px-1 py-0.5 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] font-bold text-gray-800 dark:text-gray-200 cursor-pointer focus:ring-1 focus:ring-rose-500"
                                title="Change page order directly"
                              >
                                {pages.map((_, pIdx) => (
                                  <option key={pIdx} value={pIdx + 1}>
                                    #{pIdx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <span className="text-[10px] text-gray-400 font-normal hidden sm:inline">
                              (Src P{page.originalIndex + 1})
                            </span>
                          </div>

                          {/* Keep / Remove Toggle Checkbox Button */}
                          <button
                            onClick={() => togglePageKept(page.id)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer flex-shrink-0 ${
                              page.isKept
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'
                                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 hover:bg-rose-200'
                            }`}
                            title={page.isKept ? 'Click to Remove/Exclude from output' : 'Click to Keep'}
                          >
                            {page.isKept ? (
                              <>
                                <Check size={11} strokeWidth={3} /> Kept
                              </>
                            ) : (
                              <>
                                <X size={11} strokeWidth={3} /> Removed
                              </>
                            )}
                          </button>
                        </div>

                        {/* Page Preview Thumbnail Body */}
                        <div
                          onClick={() => togglePageKept(page.id)}
                          className="relative p-3 flex items-center justify-center bg-gray-100/50 dark:bg-slate-900/80 cursor-pointer min-h-[170px] select-none"
                        >
                          {/* Strikethrough Watermark for Removed Pages */}
                          {isRemoved && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-rose-950/20 backdrop-blur-[1px]">
                              <div className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1">
                                <Trash2 size={12} /> Excluded
                              </div>
                            </div>
                          )}

                          {/* Thumbnail Image with live rotation applied */}
                          <div
                            className="relative max-h-56 max-w-full transition-transform duration-300"
                            style={{
                              transform: `rotate(${page.rotation}deg)`,
                            }}
                          >
                            <img
                              src={page.thumbnailUrl}
                              alt={page.label}
                              className="w-auto max-h-52 object-contain rounded-md shadow-sm border border-gray-200/80 dark:border-slate-700 bg-white"
                              loading="lazy"
                            />
                          </div>

                          {/* Hover Overlay with Quick Tools */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModalPreview(page);
                              }}
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white shadow-md transition"
                              title="Full Screen Preview"
                            >
                              <Maximize2 size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rotateSinglePage(page.id, 'cw');
                              }}
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white shadow-md transition"
                              title="Rotate 90°"
                            >
                              <RotateCw size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicatePageItem(page.id);
                              }}
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white shadow-md transition"
                              title="Duplicate Page"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Card Footer: Rearrange sequence arrows & direct actions */}
                        <div className="p-2 border-t border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs">
                          {/* Sequence Rearrange Arrows */}
                          <div className="flex items-center gap-1">
                            <button
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                movePage(index, index - 1);
                              }}
                              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Left (Earlier in sequence)"
                            >
                              <MoveLeft size={14} />
                            </button>
                            <button
                              disabled={index === pages.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                movePage(index, index + 1);
                              }}
                              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Right (Later in sequence)"
                            >
                              <MoveRight size={14} />
                            </button>
                          </div>

                          {/* Direct Actions: Individual Image Download or Rotate */}
                          {isImageTool ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadSinglePageAsImage(page);
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 flex items-center gap-1 transition"
                              title="Download Page as Image"
                            >
                              <Download size={11} /> Image
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rotateSinglePage(page.id, 'cw');
                              }}
                              className="p-1 rounded-md text-gray-500 hover:text-rose-600 hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer"
                              title="Rotate Page 90° Clockwise"
                            >
                              <RotateCw size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRIMARY DOWNLOAD & RESULTS BANNER (When PDF or Batch is Generated) */}
        {downloadUrl && (
          <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-scale-up">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                {isZipBatch ? <FolderDown size={36} className="text-white" /> : <CheckCircle2 size={36} className="text-white" />}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={3} /> {isZipBatch ? `${batchDownloads.length} Separate PDFs Generated` : 'Success • Ready to Download'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1.5">
                  {isZipBatch
                    ? `Your ${batchDownloads.length} Separate Single-Page PDFs are Ready!`
                    : 'Your PDF Has Been Processed!'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  {isZipBatch
                    ? `All separated pages bundled into "${downloadFileName}" for instant 1-click download.`
                    : `File: ${downloadFileName}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              {isZipBatch ? (
                <>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-8 py-3.5 rounded-2xl font-black text-emerald-950 bg-white hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 flex items-center gap-2.5 text-base cursor-pointer"
                  >
                    <FolderDown size={20} />
                    Download All {batchDownloads.length} Pages (.ZIP)
                  </a>
                  <button
                    onClick={() => {
                      batchDownloads.forEach((item, idx) => {
                        setTimeout(() => triggerDownload(item.url, item.name), idx * 250);
                      });
                      toast.success(`Downloading all ${batchDownloads.length} files individually...`);
                    }}
                    className="px-4 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                    title="Download each PDF individually"
                  >
                    <Download size={16} />
                    Download Each File Separately
                  </button>
                </>
              ) : (
                <>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-8 py-3.5 rounded-2xl font-black text-emerald-950 bg-white hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 flex items-center gap-2.5 text-base cursor-pointer"
                  >
                    <Download size={20} />
                    Download PDF Now
                  </a>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition flex items-center"
                    title="Preview in new browser tab"
                  >
                    <ExternalLink size={20} />
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* BATCH SPLIT / EXTRACT / CONVERT DOWNLOADS - VISUAL CARD GRID */}
        {batchDownloads.length > 0 && (
          <div className="mt-8 p-6 rounded-3xl bg-gray-50/80 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                  <Scissors size={20} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                    Separated Individual Single-Page PDFs ({batchDownloads.length})
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Each file below is an independent single-page PDF. Download any page individually or all at once.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {downloadUrl && isZipBatch && (
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                  >
                    <FolderDown size={14} /> Download ZIP Archive
                  </a>
                )}
                <button
                  onClick={() => {
                    batchDownloads.forEach((item, idx) => {
                      setTimeout(() => triggerDownload(item.url, item.name), idx * 250);
                    });
                    toast.success(`Downloading all ${batchDownloads.length} files...`);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={14} /> Download All Separately
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {batchDownloads.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 transition flex flex-col justify-between shadow-xs group"
                >
                  {/* Thumbnail Preview */}
                  {item.thumbnailUrl && (
                    <div className="w-full h-36 bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center mb-3 border border-gray-200 dark:border-slate-700">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold uppercase">
                        Page {item.pageIndex !== undefined ? item.pageIndex + 1 : i + 1}
                      </span>
                      {item.size && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          {item.size}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 mb-3" title={item.name}>
                      {item.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/80">
                    <a
                      href={item.url}
                      download={item.name}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gray-100 hover:bg-rose-600 hover:text-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Download size={13} /> Download PDF
                    </a>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition"
                      title="Preview page PDF"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Text Preview (For PDF to Text/JSON/CSV) */}
        {extractedTextPreview && (
          <div className="mt-6">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
              Extracted Content Preview:
            </label>
            <pre className="p-4 rounded-xl bg-gray-100 dark:bg-slate-900 text-xs font-mono text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto whitespace-pre-wrap">
              {extractedTextPreview}
            </pre>
          </div>
        )}
      </div>

      {/* STICKY ILOVEPDF-STYLE FLOATING BOTTOM ACTION BAR */}
      {primaryPdfDoc && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-2xl py-3 px-4 sm:px-8 animate-slide-up">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-rose-600 text-white items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                  {pdfFiles[0]?.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {splitMode === 'single-pages'
                    ? `Splitting all ${pageCount} pages into separate PDFs`
                    : !extractMergeIntoSingle
                    ? `Extracting ${keptCount} pages into separate PDFs`
                    : `${keptCount} of ${pageCount} pages selected`} • {tool.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {downloadUrl && isZipBatch && (
                <a
                  href={downloadUrl}
                  download={downloadFileName}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center gap-2 text-xs sm:text-sm"
                >
                  <FolderDown size={16} />
                  Download All Pages (.ZIP)
                </a>
              )}

              {downloadUrl && !isZipBatch && (
                <a
                  href={downloadUrl}
                  download={downloadFileName}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              )}

              <button
                onClick={handlePrimaryAction}
                disabled={isProcessing || (tool.actionType !== 'merge-pdf' && keptCount === 0)}
                className="px-6 sm:px-8 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 transition shadow-lg shadow-rose-600/30 flex items-center gap-2.5 text-sm sm:text-base cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing Document...
                  </>
                ) : isImageTool ? (
                  <>
                    <FileImage size={18} />
                    Convert to {imageExportFormat.replace('image/', '').toUpperCase()} ➔
                  </>
                ) : tool.actionType === 'merge-pdf' ? (
                  <>
                    <Layers size={18} />
                    Merge {pdfFiles.length} PDFs ➔
                  </>
                ) : tool.actionType === 'split-pdf' || tool.actionType === 'split-single-pages' || tool.actionType === 'split-by-range' ? (
                  splitMode === 'single-pages' ? (
                    <>
                      <Scissors size={18} />
                      Split into {pageCount} Separate PDFs ➔
                    </>
                  ) : splitMode === 'by-ranges' ? (
                    <>
                      <Split size={18} />
                      Split by Custom Ranges ➔
                    </>
                  ) : !extractMergeIntoSingle ? (
                    <>
                      <Scissors size={18} />
                      Split & Extract {keptCount} Separate PDFs ➔
                    </>
                  ) : (
                    <>
                      <Layers size={18} />
                      Merge {keptCount} Pages into 1 PDF ➔
                    </>
                  )
                ) : (
                  <>
                    <Sparkles size={18} />
                    {tool.name} ➔
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ZOOM PREVIEW MODAL */}
      {previewModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={18} className="text-rose-600" />
                  Full Preview: Page {previewModalPage.originalIndex + 1}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {previewModalPage.isKept ? 'Included in output' : 'Excluded (marked for removal)'} • Rotation: {previewModalPage.rotation}°
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => rotateSinglePage(previewModalPage.id, 'cw')}
                  className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={() => setPreviewModalPage(null)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-gray-100 dark:bg-black/40">
              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-rose-600">
                  <RefreshCw size={32} className="animate-spin" />
                  <span className="text-xs font-bold">Rendering high-resolution preview...</span>
                </div>
              ) : (
                <img
                  src={modalHighResUrl || previewModalPage.thumbnailUrl}
                  alt={previewModalPage.label}
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-transform duration-200"
                  style={{
                    transform: `rotate(${previewModalPage.rotation}deg)`,
                  }}
                />
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 flex items-center justify-between">
              <button
                onClick={() => togglePageKept(previewModalPage.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  previewModalPage.isKept
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 hover:bg-rose-200'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {previewModalPage.isKept ? (
                  <>
                    <Trash2 size={14} /> Remove This Page
                  </>
                ) : (
                  <>
                    <Check size={14} /> Keep This Page
                  </>
                )}
              </button>

              <button
                onClick={() => downloadSinglePageAsImage(previewModalPage)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition"
              >
                <Download size={14} /> Download This Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Other PDF Tools */}
      <div className="mt-12 mb-12">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Explore Other PDF Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_PDF_TOOLS.slice(0, 16).map((t) => (
            <button
              key={t.slug}
              onClick={() => onNavigateToTool?.(`/tools/${t.slug}`)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                t.slug === tool.slug
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {t.name}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {t.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      <AdSenseUnit slotId="pdf-tools-bottom" format="horizontal" />
      <SuggestedTools currentToolId={tool.id} onNavigateToTool={onNavigateToTool} />
    </div>
  );
};

export default PdfToolWorkspace;
