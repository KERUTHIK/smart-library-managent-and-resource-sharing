import { IAIProvider, ExtractedMetadata, ChatResponse } from "./AIProvider.js";
import { HeuristicAIProvider } from "./HeuristicAIProvider.js";

export class GeminiProvider implements IAIProvider {
  name = "Google Gemini AI";
  private fallback = new HeuristicAIProvider();

  constructor(private apiKey: string, private model: string = "gemini-1.5-flash") {}

  async extractMetadataFromText(text: string, fileName?: string): Promise<ExtractedMetadata> {
    if (!this.apiKey) {
      return this.fallback.extractMetadataFromText(text, fileName);
    }

    try {
      const prompt = `You are a library cataloging specialist. Analyze the following extracted text from the beginning of an academic textbook PDF and return ONLY a valid JSON object with the metadata fields.
Text excerpt:
${text.slice(0, 4000)}

JSON format:
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "publisher": "string",
  "edition": "string",
  "publicationYear": 2022,
  "category": "string",
  "subject": "string",
  "language": "English",
  "description": "2-3 sentences summary",
  "keywords": ["keyword1", "keyword2"]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!res.ok) {
        console.warn("Gemini API error, falling back to heuristic extraction:", res.statusText);
        return this.fallback.extractMetadataFromText(text, fileName);
      }

      const data = (await res.json()) as any;
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) return this.fallback.extractMetadataFromText(text, fileName);

      return JSON.parse(jsonText);
    } catch (err) {
      console.warn("Gemini execution failed, using heuristic extraction fallback:", err);
      return this.fallback.extractMetadataFromText(text, fileName);
    }
  }

  async chat(message: string, history?: { role: string; content: string }[], bookContext?: string): Promise<ChatResponse> {
    if (!this.apiKey) {
      return this.fallback.chat(message, history, bookContext);
    }

    try {
      const prompt = `You are LibSync AI, an academic library study assistant.
${bookContext ? `Grounded in context: ${bookContext}` : "Grounded in the institution's academic library textbooks."}
User question: ${message}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = (await res.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) return this.fallback.chat(message, history, bookContext);

      return {
        content,
        sources: [{ title: bookContext || "Course Syllabus Text", chapter: "Recommended Reading" }],
      };
    } catch {
      return this.fallback.chat(message, history, bookContext);
    }
  }

  async askBook(question: string, bookTitle: string, bookContent: string): Promise<ChatResponse> {
    if (!this.apiKey) {
      return this.fallback.askBook(question, bookTitle, bookContent);
    }

    try {
      const prompt = `You are an AI assistant helping a student with the book "${bookTitle}".
Reference text from the book:
${bookContent.slice(0, 6000)}

Student question: ${question}

Answer using ONLY the provided text excerpt. Include chapter/section references where applicable.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = (await res.json()) as any;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) return this.fallback.askBook(question, bookTitle, bookContent);

      return {
        content,
        sources: [{ title: bookTitle, chapter: "Chapter Context", page: 1 }],
      };
    } catch {
      return this.fallback.askBook(question, bookTitle, bookContent);
    }
  }
}
