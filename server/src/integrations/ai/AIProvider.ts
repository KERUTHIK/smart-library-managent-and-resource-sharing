export interface ExtractedMetadata {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  category: string;
  subject: string;
  language: string;
  description: string;
  keywords: string[];
}

export interface ChatResponse {
  content: string;
  sources?: {
    title: string;
    chapter?: string;
    page?: number;
    snippet?: string;
  }[];
}

export interface IAIProvider {
  name: string;
  extractMetadataFromText(text: string, fileName?: string): Promise<ExtractedMetadata>;
  chat(message: string, history?: { role: string; content: string }[], bookContext?: string): Promise<ChatResponse>;
  askBook(question: string, bookTitle: string, bookContent: string): Promise<ChatResponse>;
}
