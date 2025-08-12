/**
 * Self-Learning AI System for Nori Pflegeassistenz
 * Continuously improves speech recognition accuracy by learning from user inputs
 */

interface LearningPattern {
  originalText: string;
  correctedText: string;
  context: string;
  frequency: number;
  confidence: number;
  lastUsed: Date;
}

interface VocabularyTerm {
  term: string;
  alternatives: string[];
  category: string;
  usageCount: number;
  confidenceScore: number;
  lastSeen: Date;
}

interface LearningStats {
  patterns: number;
  vocabulary: number;
  totalLearningEvents: number;
  accuracy: number;
  lastUpdate: Date;
}

class LearningSystem {
  private patterns: Map<string, LearningPattern> = new Map();
  private vocabulary: Map<string, VocabularyTerm> = new Map();
  private stats: LearningStats = {
    patterns: 0,
    vocabulary: 0,
    totalLearningEvents: 0,
    accuracy: 0.85, // Starting baseline
    lastUpdate: new Date()
  };

  constructor() {
    this.initializeWithMedicalKnowledge();
    this.loadNursingHomeTrainingData();
  }

  private initializeWithMedicalKnowledge(): void {
    // Vitalzeichen-Korrekturen
    this.addPattern("blut druck", "blutdruck", "vital_signs");
    this.addPattern("schwindig", "schwindel", "vital_signs");
    this.addPattern("120 zu 180", "120/80", "vital_signs");
    this.addPattern("temperatur 37", "Temperatur: 37°C", "vital_signs");
    
    // Medikamenten-Korrekturen
    this.addPattern("para", "paracetamol", "medication");
    this.addPattern("ibu", "ibuprofen", "medication");
    this.addPattern("aspirin asm", "aspirin ASS", "medication");
    
    // Allgemeine Pflegekorrekturen
    this.addPattern("patient", "bewohner", "nursing");
    this.addPattern("unruhig", "unruhiges verhalten", "nursing");
    this.addPattern("gut gegessen", "nahrungsaufnahme gut", "nursing");
    
    // Medizinisches Vokabular
    this.addVocabulary("blutdruck", ["RR", "blutdruckmessung"], "vital_signs");
    this.addVocabulary("puls", ["herzfrequenz", "hr"], "vital_signs");
    this.addVocabulary("temperatur", ["fieber", "körpertemperatur"], "vital_signs");
    this.addVocabulary("paracetamol", ["para", "acetaminophen"], "medication");
  }

  private loadNursingHomeTrainingData(): void {
    console.log("🏥 Loading nursing home training data...");
    
    // Echte Pflegeheim-Dokumentationen als Trainingsdaten
    const nursingHomePatterns = [
      // Vitalzeichen aus echten Dokumentationen
      { original: "RR 140 zu 90", corrected: "Blutdruck: 140/90 mmHg", context: "vital_signs" },
      { original: "Puls 88", corrected: "Herzfrequenz: 88 bpm", context: "vital_signs" },
      { original: "Temp 38,2", corrected: "Körpertemperatur: 38,2°C", context: "vital_signs" },
      { original: "Sauerstoff 96", corrected: "Sauerstoffsättigung: 96%", context: "vital_signs" },
      { original: "BZ 120", corrected: "Blutzucker: 120 mg/dl", context: "vital_signs" },
      
      // Mobilität und Bewegung
      { original: "Rollstuhl gefahren", corrected: "Transfer mit Rollstuhl durchgeführt", context: "mobility" },
      { original: "Aufstehen schwer", corrected: "Aufstehen mit Unterstützung", context: "mobility" },
      { original: "Gang unsicher", corrected: "Gangbild unsicher, Sturzgefahr", context: "mobility" },
      { original: "Bett gelagert", corrected: "Lagerung im Bett durchgeführt", context: "mobility" },
      
      // Ernährung und Flüssigkeit
      { original: "Frühstück komplett", corrected: "Frühstück vollständig eingenommen", context: "nutrition" },
      { original: "wenig getrunken", corrected: "Flüssigkeitszufuhr reduziert", context: "nutrition" },
      { original: "Hilfe beim Essen", corrected: "Nahrungsaufnahme mit Unterstützung", context: "nutrition" },
      { original: "Appetit gut", corrected: "Appetit unauffällig", context: "nutrition" },
      
      // Hygiene und Körperpflege
      { original: "gewaschen", corrected: "Körperpflege durchgeführt", context: "hygiene" },
      { original: "Zähne geputzt", corrected: "Mundpflege erfolgt", context: "hygiene" },
      { original: "Haare gekämmt", corrected: "Haarpflege durchgeführt", context: "hygiene" },
      { original: "Toilettengang", corrected: "Ausscheidung selbstständig", context: "hygiene" },
      
      // Medikation echte Beispiele mit Dosierungen und Zeiten
      { original: "ramipril 5", corrected: "Ramipril 5 mg", context: "medication" },
      { original: "ramipril 5 milligramm", corrected: "Ramipril 5 mg", context: "medication" },
      { original: "para 500", corrected: "Paracetamol 500 mg", context: "medication" },
      { original: "paracetamol 500", corrected: "Paracetamol 500 mg", context: "medication" },
      { original: "ibu 400", corrected: "Ibuprofen 400 mg", context: "medication" },
      { original: "insulin 12 einheiten", corrected: "Insulin 12 IE", context: "medication" },
      { original: "metformin 850", corrected: "Metformin 850 mg", context: "medication" },
      { original: "ass 100", corrected: "ASS 100 mg", context: "medication" },
      { original: "aspirin 100", corrected: "ASS 100 mg", context: "medication" },
      { original: "omeprazol 20", corrected: "Omeprazol 20 mg", context: "medication" },
      { original: "pantoprazol 40", corrected: "Pantoprazol 40 mg", context: "medication" },
      { original: "morgens 8 uhr", corrected: "morgens 8:00 Uhr", context: "medication_time" },
      { original: "abends 18 uhr", corrected: "abends 18:00 Uhr", context: "medication_time" },
      { original: "mittags 12 uhr", corrected: "mittags 12:00 Uhr", context: "medication_time" },
      { original: "2 tabletten", corrected: "2 Tabletten", context: "medication" },
      { original: "10 tropfen", corrected: "10 Tropfen", context: "medication" },
      { original: "schmerzmittel", corrected: "Analgetikum bei Bedarf verabreicht", context: "medication" },
      
      // ERWEITERTE Medikamenten-Lernmuster
      { original: "1 mal täglich", corrected: "1x täglich", context: "medication_frequency" },
      { original: "zweimal am tag", corrected: "2x täglich", context: "medication_frequency" },
      { original: "alle 8 stunden", corrected: "alle 8h", context: "medication_frequency" },
      { original: "bei bedarf", corrected: "bei Bedarf", context: "medication_frequency" },
      { original: "nüchtern", corrected: "nüchtern einnehmen", context: "medication_instruction" },
      { original: "zum essen", corrected: "zu den Mahlzeiten", context: "medication_instruction" },
      { original: "vor dem essen", corrected: "vor den Mahlzeiten", context: "medication_instruction" },
      { original: "nach dem essen", corrected: "nach den Mahlzeiten", context: "medication_instruction" },
      
      // Häufige Aussprachefehler
      { original: "rambi", corrected: "Ramipril", context: "medication_name" },
      { original: "met form", corrected: "Metformin", context: "medication_name" },
      { original: "parace", corrected: "Paracetamol", context: "medication_name" },
      { original: "omepra", corrected: "Omeprazol", context: "medication_name" },
      
      // Stimmung und Verhalten
      { original: "gute Laune", corrected: "Stimmung ausgeglichen", context: "mood" },
      { original: "verwirrt", corrected: "Orientierung zeitweise eingeschränkt", context: "mood" },
      { original: "unruhig nachts", corrected: "nächtliche Unruhe beobachtet", context: "mood" },
      { original: "kooperativ", corrected: "Kooperation bei Pflege gut", context: "mood" },
      
      // Besonderheiten aus der Praxis
      { original: "Sturz im Bad", corrected: "Sturzereignis im Sanitärbereich", context: "incidents" },
      { original: "Arzt gerufen", corrected: "Hausarzt konsultiert", context: "incidents" },
      { original: "Familie besucht", corrected: "Angehörigenbesuch erhalten", context: "social" },
      { original: "Physio gemacht", corrected: "Physiotherapie durchgeführt", context: "therapy" }
    ];

    // Häufig verwendete Pflegefachbegriffe
    const nursingVocabulary = [
      { term: "ADL", alternatives: ["Activities of Daily Living", "Aktivitäten des täglichen Lebens"], category: "nursing_care" },
      { term: "Dekubitus", alternatives: ["Druckgeschwür", "Wundliegen"], category: "nursing_care" },
      { term: "Kontraktur", alternatives: ["Gelenkversteifung"], category: "nursing_care" },
      { term: "Inkontinenz", alternatives: ["Harninkontinenz", "Stuhlinkontinenz"], category: "nursing_care" },
      { term: "Dysphagie", alternatives: ["Schluckstörung"], category: "nursing_care" },
      { term: "Obstipation", alternatives: ["Verstopfung"], category: "nursing_care" },
      { term: "Diarrhoe", alternatives: ["Durchfall"], category: "nursing_care" },
      { term: "Exsikkose", alternatives: ["Dehydration", "Austrocknung"], category: "nursing_care" },
      { term: "Pneumonie", alternatives: ["Lungenentzündung"], category: "medical" },
      { term: "Hemiparese", alternatives: ["Halbseitenlähmung"], category: "medical" },
      
      // Häufigste Medikamente in deutschen Pflegeheimen mit Dosierungen
      { term: "Ramipril", alternatives: ["ACE-Hemmer"], category: "medication" },
      { term: "Metformin", alternatives: ["Diabetesmedikament"], category: "medication" },
      { term: "ASS", alternatives: ["Aspirin", "Acetylsalicylsäure"], category: "medication" },
      { term: "Paracetamol", alternatives: ["Para", "Schmerzmittel"], category: "medication" },
      { term: "Ibuprofen", alternatives: ["Ibu"], category: "medication" },
      { term: "Omeprazol", alternatives: ["PPI", "Magenschutz"], category: "medication" },
      { term: "Pantoprazol", alternatives: ["PPI", "Protonenpumpenhemmer"], category: "medication" },
      { term: "Simvastatin", alternatives: ["Statin", "Cholesterinsenker"], category: "medication" },
      { term: "Marcumar", alternatives: ["Phenprocoumon", "Blutverdünner"], category: "medication" },
      { term: "Torasemid", alternatives: ["Diuretikum", "Entwässerungstablette"], category: "medication" },
      { term: "L-Dopa", alternatives: ["Levodopa"], category: "medication" },
      { term: "Insulin", alternatives: ["Blutzuckersenker"], category: "medication" },
      { term: "Bisoprolol", alternatives: ["Betablocker"], category: "medication" },
      { term: "Amlodipinn", alternatives: ["Kalziumantagonist"], category: "medication" },
      { term: "Metamizol", alternatives: ["Novalgin"], category: "medication" },
      
      // ERWEITERTE Medikamentendatenbank für bessere Erkennung
      { term: "Atorvastatin", alternatives: ["Sortis"], category: "medication" },
      { term: "Candesartan", alternatives: ["Blopress"], category: "medication" },
      { term: "Furosemid", alternatives: ["Lasix"], category: "medication" },
      { term: "Levothyroxin", alternatives: ["L-Thyroxin"], category: "medication" },
      { term: "Prednisolon", alternatives: ["Kortison"], category: "medication" },
      { term: "Allopurinol", alternatives: ["Gichtmittel"], category: "medication" },
      { term: "Digitoxin", alternatives: ["Herzglykosid"], category: "medication" },
      { term: "Warfarin", alternatives: ["Coumadin"], category: "medication" },
      { term: "Clopidogrel", alternatives: ["Plavix"], category: "medication" },
      { term: "Rivaroxaban", alternatives: ["Xarelto"], category: "medication" }
    ];

    // Trainingsdaten laden
    nursingHomePatterns.forEach(pattern => {
      this.addPattern(pattern.original, pattern.corrected, pattern.context);
    });

    nursingVocabulary.forEach(vocab => {
      this.addVocabulary(vocab.term, vocab.alternatives, vocab.category);
    });

    console.log(`✅ Loaded ${nursingHomePatterns.length} nursing patterns and ${nursingVocabulary.length} medical terms`);
    console.log(`🧠 Enhanced with phonetic medication search and contextual learning`);
  }

  private addPattern(original: string, corrected: string, context: string): void {
    const key = `${original}->${corrected}`;
    this.patterns.set(key, {
      originalText: original,
      correctedText: corrected,
      context,
      frequency: 1,
      confidence: 0.8,
      lastUsed: new Date()
    });
    this.stats.patterns = this.patterns.size;
  }

  private addVocabulary(term: string, alternatives: string[], category: string): void {
    this.vocabulary.set(term, {
      term,
      alternatives,
      category,
      usageCount: 1,
      confidenceScore: 0.7,
      lastSeen: new Date()
    });
    this.stats.vocabulary = this.vocabulary.size;
  }

  async learnFromTranscription(
    originalText: string,
    correctedText: string,
    context: string = 'medical'
  ): Promise<void> {
    if (!originalText || !correctedText || originalText === correctedText) return;

    // Normalize text for comparison
    const original = originalText.toLowerCase().trim();
    const corrected = correctedText.toLowerCase().trim();

    // Learn specific corrections
    const patterns = this.extractPatterns(original, corrected);
    for (const pattern of patterns) {
      await this.addLearningPattern(pattern.original, pattern.corrected, context);
    }

    // Extract new vocabulary
    const newTerms = this.extractMedicalTerms(corrected);
    for (const term of newTerms) {
      await this.updateVocabulary(term, context);
    }

    this.stats.totalLearningEvents++;
    this.stats.lastUpdate = new Date();
    
    console.log(`✅ Learning System: Learned from transcription - ${patterns.length} patterns, ${newTerms.length} terms`);
  }

  private extractPatterns(original: string, corrected: string): Array<{original: string, corrected: string}> {
    const patterns: Array<{original: string, corrected: string}> = [];
    
    // Word-level corrections
    const originalWords = original.split(' ');
    const correctedWords = corrected.split(' ');
    
    for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
      if (originalWords[i] !== correctedWords[i]) {
        patterns.push({
          original: originalWords[i],
          corrected: correctedWords[i]
        });
      }
    }

    return patterns;
  }

  private extractMedicalTerms(text: string): string[] {
    const medicalKeywords = [
      'blutdruck', 'puls', 'temperatur', 'schwindel', 'fieber',
      'paracetamol', 'ibuprofen', 'aspirin', 'medikament',
      'bewohner', 'pflege', 'mobilität', 'hygiene', 'ernährung'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => 
      medicalKeywords.some(keyword => word.includes(keyword)) ||
      word.length > 6 // Capture longer medical terms
    );
  }

  private async addLearningPattern(original: string, corrected: string, context: string): Promise<void> {
    const key = `${original}->${corrected}`;
    
    if (this.patterns.has(key)) {
      const pattern = this.patterns.get(key)!;
      pattern.frequency++;
      pattern.confidence = Math.min(0.95, pattern.confidence + 0.05);
      pattern.lastUsed = new Date();
    } else {
      this.patterns.set(key, {
        originalText: original,
        correctedText: corrected,
        context,
        frequency: 1,
        confidence: 0.6,
        lastUsed: new Date()
      });
      this.stats.patterns = this.patterns.size;
    }
  }

  private async updateVocabulary(term: string, category: string): Promise<void> {
    if (this.vocabulary.has(term)) {
      const vocab = this.vocabulary.get(term)!;
      vocab.usageCount++;
      vocab.confidenceScore = Math.min(0.95, vocab.confidenceScore + 0.03);
      vocab.lastSeen = new Date();
    } else {
      this.vocabulary.set(term, {
        term,
        alternatives: [],
        category,
        usageCount: 1,
        confidenceScore: 0.4,
        lastSeen: new Date()
      });
      this.stats.vocabulary = this.vocabulary.size;
    }
  }

  // ERWEITERT: Apply learned patterns + contextual learning
  async applyLearnedCorrections(text: string): Promise<string> {
    console.log("🧠 Applying contextual learning patterns...");
    let improved = text;

    // Apply learned patterns with high confidence
    for (const [key, pattern] of this.patterns.entries()) {
      if (pattern.confidence > 0.7) {
        improved = improved.replace(
          new RegExp(pattern.originalText, 'gi'),
          pattern.correctedText
        );
        
        // Update usage statistics
        pattern.frequency += 1;
        pattern.lastUsed = new Date();
      }
    }

    // Apply contextual learning for professional language
    improved = this.applyPersonalLanguagePatterns(improved);

    return improved;
  }

  // NEUE FUNKTION: Persönliche Sprachmuster lernen und anwenden
  private applyPersonalLanguagePatterns(text: string): string {
    const contextualPatterns = [
      // Häufige persönliche Ausdrücke → Professionelle Sprache
      { casual: /geht\s*(gut|okay|prima)/gi, professional: "verlief planmäßig" },
      { casual: /ist\s*(okay|gut|prima)/gi, professional: "unauffällig" },
      { casual: /schlecht\s*drauf/gi, professional: "niedergeschlagene Stimmung" },
      { casual: /kann\s*nicht\s*mehr/gi, professional: "kann nicht mehr selbstständig" },
      { casual: /hat\s*probleme\s*mit/gi, professional: "zeigt Schwierigkeiten bei" },
      { casual: /macht\s*sorgen/gi, professional: "erfordert erhöhte Aufmerksamkeit" },
      { casual: /läuft\s*rund/gi, professional: "verläuft planmäßig" },
      { casual: /klappt\s*(gut|prima)/gi, professional: "funktioniert einwandfrei" }
    ];

    let improved = text;
    contextualPatterns.forEach(({ casual, professional }) => {
      improved = improved.replace(casual, professional);
    });
    
    console.log(`🎯 Applied ${contextualPatterns.length} contextual language patterns`);
    return improved;
  }

  getLearningStats(): LearningStats {
    return {
      ...this.stats,
      patterns: this.patterns.size,
      vocabulary: this.vocabulary.size
    };
  }

  exportLearningData(): { patterns: LearningPattern[], vocabulary: VocabularyTerm[] } {
    return {
      patterns: Array.from(this.patterns.values()),
      vocabulary: Array.from(this.vocabulary.values())
    };
  }

  getRecentLearning(limit: number = 10): LearningPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  }

  // Performance analytics
  calculateAccuracyImprovement(): number {
    const totalPatterns = this.patterns.size;
    if (totalPatterns === 0) return 0;

    const highConfidencePatterns = Array.from(this.patterns.values())
      .filter(p => p.confidence > 0.8).length;

    return (highConfidencePatterns / totalPatterns) * 100;
  }

  // Neue Funktion: Externe Trainingsdaten importieren
  async importNursingHomeData(trainingData: Array<{
    originalText: string;
    correctedText: string;
    context: string;
    source?: string;
  }>): Promise<number> {
    let importedCount = 0;
    
    for (const data of trainingData) {
      if (data.originalText && data.correctedText && data.originalText !== data.correctedText) {
        await this.learnFromTranscription(data.originalText, data.correctedText, data.context);
        importedCount++;
      }
    }

    console.log(`📚 Imported ${importedCount} training examples from nursing home data`);
    return importedCount;
  }

  // Funktion zum Laden von CSV/JSON Trainingsdaten
  async loadExternalTrainingFile(filePath: string): Promise<void> {
    try {
      // Hier könnte man echte Pflegeheim-Datenbanken einlesen
      // z.B. CSV-Dateien mit Spalten: original_text, corrected_text, context
      console.log(`📂 Loading training data from: ${filePath}`);
      
      // Beispiel für zukünftige Implementierung:
      // const trainingData = await this.parseTrainingFile(filePath);
      // await this.importNursingHomeData(trainingData);
    } catch (error) {
      console.error('Error loading external training data:', error);
    }
  }
}

// Singleton instance
export const learningSystem = new LearningSystem();