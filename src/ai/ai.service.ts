import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

interface KeyIdea {
  title: string;
  content: string;
}

interface Memory {
  content: string;
  tags: string[];
}

interface AIAnalysisResult {
  keyIdeas: KeyIdea[];
  categories: string[];
  memories: Memory[];
}

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async analyzeTranscript(transcript: string, videoTitle: string): Promise<AIAnalysisResult> {
    // Prepare a truncated transcript if it's too long
    const maxTokens = 15000; // Approximate max tokens for context
    const truncatedTranscript = this.truncateText(transcript, maxTokens);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing video content and extracting the most valuable information. 
            Extract 5 - 15 key ideas from the video transcript and categorize the video content.
            For each key idea, create a concise title (15 words max) and detailed content (15-50 words).
            Also identify 5-10 memorable concepts that would be valuable for the user to review later.
            Format your response as JSON.`,
          },
          {
            role: 'user',
            content: `Analyze this YouTube video transcript.
            Video Title: ${videoTitle}
            
            Transcript: ${truncatedTranscript}
            
            Return JSON with the following structure:
            {
              "keyIdeas": [
                { "title": "Short title", "content": "Detailed explanation" },
                ... (5 - 15 items)
              ],
              "categories": ["category1", "category2", ...],
              "memories": [
                { "content": "Memorable concept", "tags": ["tag1", "tag2"] },
                ... (5-10 items)
              ]
            }`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const result = JSON.parse(response.choices[0].message.content) as AIAnalysisResult;
      return result;
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
  }

  private truncateText(text: string, maxTokens: number): string {
    // Simple approximation: 1 token ~= 4 chars
    const approximateMaxChars = maxTokens * 4;

    if (text.length <= approximateMaxChars) {
      return text;
    }

    return text.substring(0, approximateMaxChars) + '...';
  }
}
