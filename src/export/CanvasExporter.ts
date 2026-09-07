// src/export/CanvasExporter.ts

export interface ExportFormat {
  name: string;
  width: number;
  height: number | 'auto';
  description: string;
}

export const CANVAS_PRESETS: ExportFormat[] = [
  { name: 'GitHub README (Desktop)', width: 880, height: 'auto', description: 'Standard desktop README embed' },
  { name: 'GitHub README (Mobile)', width: 400, height: 'auto', description: 'Mobile-optimized README' },
  { name: 'Twitter/X Post', width: 1200, height: 675, description: 'Twitter social media post' },
  { name: 'LinkedIn Post', width: 1080, height: 1080, description: 'LinkedIn square post' },
  { name: 'Instagram Story', width: 1080, height: 1920, description: 'Instagram story format' },
  { name: 'GitHub Social Preview', width: 1280, height: 640, description: 'GitHub repository preview' },
  { name: 'Custom', width: 0, height: 0, description: 'Custom dimensions' },
];

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // For @2x exports
  theme?: string;
}

export class CanvasExporter {
  private svgElement: SVGSVGElement | null = null;

  /**
   * Set the SVG element to export
   */
  setSVG(svgString: string): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    this.svgElement = doc.querySelector('svg');
    
    if (!this.svgElement) {
      throw new Error('Invalid SVG provided');
    }
  }

  /**
   * Calculate final dimensions based on format
   */
  calculateDimensions(format: ExportFormat, contentHeight?: number): { width: number; height: number } {
    if (format.height === 'auto' && contentHeight) {
      return { width: format.width, height: contentHeight };
    }
    return { width: format.width, height: format.height as number };
  }

  /**
   * Scale SVG to fit target dimensions
   */
  scaleSVG(targetWidth: number, targetHeight: number): SVGSVGElement {
    if (!this.svgElement) {
      throw new Error('No SVG element set');
    }

    const clonedSVG = this.svgElement.cloneNode(true) as SVGSVGElement;
    const viewBox = clonedSVG.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, targetWidth, targetHeight];
    
    const scaleX = targetWidth / viewBox[2];
    const scaleY = targetHeight / viewBox[3];
    const scale = Math.min(scaleX, scaleY);

    clonedSVG.setAttribute('width', `${targetWidth}`);
    clonedSVG.setAttribute('height', `${targetHeight}`);
    clonedSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    return clonedSVG;
  }

  /**
   * Export as PNG
   */
  async exportToPNG(options: ExportOptions): Promise<Blob> {
    if (!this.svgElement) {
      throw new Error('No SVG element set');
    }

    const svgData = new XMLSerializer().serializeToString(this.svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const dimensions = this.calculateDimensions(options.format);
    const scale = options.scale || 1;
    
    canvas.width = dimensions.width * scale;
    canvas.height = dimensions.height * scale;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.fillStyle = '#FAFAF9'; // Default background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      };

      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Export as SVG
   */
  exportToSVG(options: ExportOptions): string {
    if (!this.svgElement) {
      throw new Error('No SVG element set');
    }

    const dimensions = this.calculateDimensions(options.format);
    const scaledSVG = this.scaleSVG(dimensions.width, dimensions.height);
    
    return new XMLSerializer().serializeToString(scaledSVG);
  }

  /**
   * Download file with proper filename
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Complete export workflow
   */
  async export(options: ExportOptions, filename: string): Promise<void> {
    if (options.format.name.includes('PNG') || options.format.name === 'Custom') {
      const blob = await this.exportToPNG(options);
      this.downloadFile(blob, `${filename}.png`);
    } else {
      const svgString = this.exportToSVG(options);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      this.downloadFile(blob, `${filename}.svg`);
    }
  }
}

export default CanvasExporter;
