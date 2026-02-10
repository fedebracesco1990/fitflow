import { TDocumentDefinitions } from 'pdfmake/interfaces';

export interface PdfKitDocument {
  on(event: 'data', callback: (chunk: Buffer) => void): void;
  on(event: 'end', callback: () => void): void;
  on(event: 'error', callback: (error: Error) => void): void;
  end(): void;
}

export interface FontDefinition {
  normal: Buffer | string;
  bold: Buffer | string;
  italics: Buffer | string;
  bolditalics: Buffer | string;
}

export interface FontDictionary {
  [fontName: string]: FontDefinition;
}

export interface PdfPrinterConstructor {
  new (fonts: FontDictionary): PdfPrinterInstance;
}

export interface PdfPrinterInstance {
  createPdfKitDocument(docDefinition: TDocumentDefinitions): PdfKitDocument;
}

declare const PdfPrinter: PdfPrinterConstructor;
export default PdfPrinter;
