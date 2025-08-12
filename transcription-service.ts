import { createClient } from '@deepgram/sdk';
import { AssemblyAI } from 'assemblyai';
import fs from 'fs';
import { learningSystem } from './learning-system';

export interface TranscriptionResult {
  text: string;
  provider: 'deepgram' | 'assemblyai';
  language?: string;
  confidence?: number;
}

export class TranscriptionService {
  private deepgramClient: any;
  private assemblyaiClient: any;

  constructor() {
    // Initialize Deepgram if API key is available
    if (process.env.DEEPGRAM_API_KEY) {
      this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
    }

    // Initialize AssemblyAI if API key is available
    if (process.env.ASSEMBLYAI_API_KEY) {
      this.assemblyaiClient = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY
      });
    }
  }

  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    // Try Deepgram first
    if (this.deepgramClient) {
      try {
        console.log('Starting Deepgram transcription...');
        return await this.transcribeWithDeepgram(audioFilePath);
      } catch (error: any) {
        console.error('Deepgram transcription failed:', error.message);
        console.log('Deepgram API Key Status:', process.env.DEEPGRAM_API_KEY ? 'Present' : 'Missing');
      }
    }

    // Fallback to AssemblyAI
    if (this.assemblyaiClient) {
      try {
        console.log('Fallback to AssemblyAI transcription...');
        return await this.transcribeWithAssemblyAI(audioFilePath);
      } catch (error: any) {
        console.error('AssemblyAI transcription failed:', error.message);
        console.log('AssemblyAI API Key Status:', process.env.ASSEMBLYAI_API_KEY ? 'Present' : 'Missing');
      }
    }

    // No service available or all failed
    if (!this.deepgramClient && !this.assemblyaiClient) {
      throw new Error('Spracherkennung nicht verfügbar. Bitte kontaktieren Sie den Support.');
    } else {
      throw new Error('Spracherkennung fehlgeschlagen. Bitte Audio-Qualität prüfen und erneut versuchen.');
    }
  }

  private async transcribeWithDeepgram(audioFilePath: string): Promise<TranscriptionResult> {
    const audioBuffer = fs.readFileSync(audioFilePath);
    
    const response = await this.deepgramClient.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'multi', // Enable multilingual detection
        smart_format: true,
        punctuate: true,
        diarize: false,
        utterances: false,
        detect_language: true,
      }
    );

    if (!response.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      throw new Error('Keine Transkription von Deepgram erhalten');
    }

    const transcript = response.result.results.channels[0].alternatives[0].transcript;
    const confidence = response.result.results.channels[0].alternatives[0].confidence || 0;
    const detectedLanguage = response.result.results.channels[0].detected_language || 'de';
    
    console.log(`Deepgram transcription: "${transcript}" (confidence: ${confidence}, language: ${detectedLanguage})`);

    // Translate to German if needed
    let finalText = transcript;
    if (detectedLanguage !== 'de' && detectedLanguage !== 'de-DE') {
      finalText = await this.translateToGerman(transcript, detectedLanguage);
      console.log(`Translated to German: "${finalText}"`);
    }

    // Apply learned corrections before returning
    const improvedText = await learningSystem.applyLearnedCorrections(finalText);

    // Learn from any improvements made
    if (finalText !== improvedText) {
      await learningSystem.learnFromTranscription(finalText, improvedText, 'transcription');
    }

    return {
      text: improvedText,
      provider: 'deepgram',
      language: detectedLanguage,
      confidence: confidence
    };
  }

  private async transcribeWithAssemblyAI(audioFilePath: string): Promise<TranscriptionResult> {
    // Upload file to AssemblyAI
    const audioUrl = await this.assemblyaiClient.files.upload(audioFilePath);
    
    // Configure transcription with German language
    const config = {
      audio_url: audioUrl,
      language_code: 'de',
      punctuate: true,
      format_text: true,
      speaker_labels: false,
    };

    // Start transcription
    const transcript = await this.assemblyaiClient.transcripts.transcribe(config);
    
    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI Fehler: ${transcript.error}`);
    }

    if (!transcript.text) {
      throw new Error('Keine Transkription von AssemblyAI erhalten');
    }

    console.log(`AssemblyAI transcription: "${transcript.text}" (confidence: ${transcript.confidence || 0})`);

    // Apply learned corrections before returning
    const improvedText = await learningSystem.applyLearnedCorrections(transcript.text);

    // Learn from any improvements made
    if (transcript.text !== improvedText) {
      await learningSystem.learnFromTranscription(transcript.text, improvedText, 'transcription');
    }

    return {
      text: improvedText,
      provider: 'assemblyai',
      language: 'de',
      confidence: transcript.confidence || 0
    };
  }

  getAvailableServices(): string[] {
    const services = [];
    if (this.deepgramClient) services.push('Deepgram');
    if (this.assemblyaiClient) services.push('AssemblyAI');
    return services;
  }

  isAnyServiceAvailable(): boolean {
    return !!(this.deepgramClient || this.assemblyaiClient);
  }

  private async translateToGerman(text: string, sourceLanguage: string): Promise<string> {
    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          source_lang: this.mapLanguageToDeepL(sourceLanguage),
          target_lang: 'DE',
        }),
      });

      if (!response.ok) {
        console.warn('DeepL translation failed, using original text');
        return text;
      }

      const data = await response.json();
      return data.translations[0]?.text || text;
    } catch (error) {
      console.warn('Translation error, using original text:', error);
      return text;
    }
  }

  private mapLanguageToDeepL(language: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'EN',
      'en-US': 'EN-US',
      'en-GB': 'EN-GB',
      'fr': 'FR',
      'es': 'ES',
      'it': 'IT',
      'pl': 'PL',
      'nl': 'NL',
      'pt': 'PT',
      'ru': 'RU',
      'ja': 'JA',
      'zh': 'ZH',
      'ko': 'KO',
      'ar': 'AR',
      'tr': 'TR',
    };
    return languageMap[language] || 'AUTO';
  }
}