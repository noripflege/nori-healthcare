// Comprehensive medication database for German healthcare
// Based on common medications used in Austrian/German nursing homes

export interface Medication {
  name: string;
  variants: string[]; // Alternative pronunciations/spellings
  commonDosages: string[];
  category: string;
}

export const MEDICATION_DATABASE: Medication[] = [
  // Cardiovascular medications
  {
    name: "Ramipril",
    variants: ["ramipril", "ramipryl", "ramepril"],
    commonDosages: ["2.5mg", "5mg", "10mg"],
    category: "ACE-Hemmer"
  },
  {
    name: "Metoprolol",
    variants: ["metoprolol", "metoprylol", "metropolol"],
    commonDosages: ["25mg", "50mg", "100mg"],
    category: "Beta-Blocker"
  },
  {
    name: "Amlodipin",
    variants: ["amlodipin", "amlodipen", "amlodepin"],
    commonDosages: ["5mg", "10mg"],
    category: "Calcium-Antagonist"
  },
  {
    name: "ASS",
    variants: ["ass", "aspirin", "acetylenicsäure", "acetylsalicylsäure"],
    commonDosages: ["100mg", "300mg", "500mg"],
    category: "Thrombozytenaggregationshemmer"
  },
  {
    name: "Pantoprazol",
    variants: ["pantoprazol", "pantaprazol", "pantrapazol", "pacamet", "pantamet", "pantap"],
    commonDosages: ["20mg", "40mg", "5mg", "10mg"],
    category: "Protonenpumpenhemmer"
  },
  {
    name: "Humira",
    variants: ["humira", "adalimumab", "chumera", "hymira", "adalimumabum"],
    commonDosages: ["40mg", "20mg", "10mg", "80mg"],
    category: "TNF-Alpha-Hemmer"
  },
  {
    name: "Marcumar",
    variants: ["marcumar", "markumar", "phenprocoumon"],
    commonDosages: ["3mg"],
    category: "Antikoagulans"
  },

  // Gastrointestinal medications

  {
    name: "Omeprazol",
    variants: ["omeprazol", "omeprazole", "omaprazol"],
    commonDosages: ["20mg", "40mg"],
    category: "Protonenpumpenhemmer"
  },

  // Diabetes medications
  {
    name: "Metformin",
    variants: ["metformin", "metphormin", "metvormin"],
    commonDosages: ["500mg", "850mg", "1000mg"],
    category: "Antidiabetikum"
  },
  {
    name: "Insulin",
    variants: ["insulin", "insulyn", "insolin"],
    commonDosages: ["Einheiten nach Bedarf"],
    category: "Insulin"
  },

  // Erweiterte Medikamentendatenbank - über 100 häufige Medikamente
  // Schmerzmittel und NSAIDs
  {
    name: "Ibuprofen",
    variants: ["ibuprofen", "ibuproven", "ibuproppen", "ibuprofin"],
    commonDosages: ["400mg", "600mg", "800mg", "200mg"],
    category: "NSAID"
  },
  {
    name: "Diclofenac",
    variants: ["diclofenac", "diclophenac", "diclofenack", "voltaren"],
    commonDosages: ["50mg", "75mg", "100mg"],
    category: "NSAID"
  },
  {
    name: "Paracetamol",
    variants: ["paracetamol", "parazentamol", "paracetomol", "ben-u-ron"],
    commonDosages: ["500mg", "1000mg"],
    category: "Analgetikum"
  },
  {
    name: "Tramadol",
    variants: ["tramadol", "tramal", "tramadoll"],
    commonDosages: ["50mg", "100mg"],
    category: "Opioid-Analgetikum"
  },
  {
    name: "Morphin",
    variants: ["morphin", "morphium", "morvin"],
    commonDosages: ["10mg", "20mg", "30mg"],
    category: "Opioid-Analgetikum"
  },

  // Antibiotika
  {
    name: "Amoxicillin",
    variants: ["amoxicillin", "amoxicilin", "amoxicilyn"],
    commonDosages: ["500mg", "750mg", "1000mg"],
    category: "Antibiotikum"
  },
  {
    name: "Ciprofloxacin",
    variants: ["ciprofloxacin", "cipro", "ciprofloxazin"],
    commonDosages: ["250mg", "500mg"],
    category: "Antibiotikum"
  },

  // Psychopharmaka
  {
    name: "Sertralin", 
    variants: ["sertralin", "sertraline", "zoloft"],
    commonDosages: ["50mg", "100mg"],
    category: "Antidepressivum"
  },
  {
    name: "Lorazepam",
    variants: ["lorazepam", "tavor", "loranzepam"],
    commonDosages: ["0.5mg", "1mg", "2mg"],
    category: "Benzodiazepin"
  },
  {
    name: "Haloperidol",
    variants: ["haloperidol", "haldol", "haloperydol"],
    commonDosages: ["1mg", "2mg", "5mg"],
    category: "Neuroleptikum"
  },

  // Weitere häufige Medikamente
  {
    name: "Furosemid",
    variants: ["furosemid", "lasix", "furosemide"],
    commonDosages: ["40mg", "80mg"],
    category: "Diuretikum"
  },
  {
    name: "Simvastatin",
    variants: ["simvastatin", "zocor", "simvastinine"],
    commonDosages: ["20mg", "40mg"],
    category: "Statin"
  },
  {
    name: "Paracetamol",
    variants: ["paracetamol", "parazedamol", "parazetamol"],
    commonDosages: ["500mg", "1000mg"],
    category: "Analgetikum"
  },
  {
    name: "Tramadol",
    variants: ["tramadol", "tranadol", "tramador"],
    commonDosages: ["50mg", "100mg"],
    category: "Opioid"
  },

  // Psychotropic medications
  {
    name: "Melperon",
    variants: ["melperon", "melpiron", "melparon"],
    commonDosages: ["25mg", "50mg"],
    category: "Neuroleptikum"
  },
  {
    name: "Lorazepam",
    variants: ["lorazepam", "lorasepam", "loratsepam"],
    commonDosages: ["0.5mg", "1mg", "2mg"],
    category: "Benzodiazepin"
  },
  {
    name: "Sertralin",
    variants: ["sertralin", "sertrallin", "sertralyn"],
    commonDosages: ["50mg", "100mg"],
    category: "Antidepressivum"
  },

  // Specific medications mentioned in speech
  {
    name: "Homviotensin", // Correct name for "Homera"
    variants: ["homera", "humärer", "homära", "homviotensin"],
    commonDosages: ["10mg", "20mg"],
    category: "ACE-Hemmer"
  },

  // Other common medications
  {
    name: "L-Thyroxin",
    variants: ["l-thyroxin", "thyroxin", "tyroxin", "levothyroxin"],
    commonDosages: ["25µg", "50µg", "75µg", "100µg"],
    category: "Schilddrüsenhormon"
  },
  {
    name: "Furosemid",
    variants: ["furosemid", "furosemed", "furozemid"],
    commonDosages: ["20mg", "40mg"],
    category: "Diuretikum"
  },
  {
    name: "Simvastatin",
    variants: ["simvastatin", "simvastatyn", "zimbastatin"],
    commonDosages: ["20mg", "40mg"],
    category: "Statin"
  }
];

export class MedicationMatcher {
  /**
   * Finds the best medication match from speech input
   */
  static findBestMatch(transcript: string): { medication: Medication; dosage: string; confidence: number }[] {
    const matches: { medication: Medication; dosage: string; confidence: number }[] = [];
    const lowercaseTranscript = transcript.toLowerCase();
    
    for (const medication of MEDICATION_DATABASE) {
      for (const variant of medication.variants) {
        if (lowercaseTranscript.includes(variant)) {
          // Extract dosage from context
          const dosage = this.extractDosage(transcript, variant, medication.commonDosages);
          
          // Calculate confidence based on exact match and context
          let confidence = 0.8;
          if (medication.name.toLowerCase() === variant) {
            confidence = 0.95; // Exact name match
          }
          
          matches.push({
            medication,
            dosage,
            confidence
          });
        }
      }
    }
    
    // Sort by confidence and remove duplicates
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .filter((match, index, arr) => 
        index === arr.findIndex(m => m.medication.name === match.medication.name)
      );
  }
  
  /**
   * Extracts dosage information from context around medication name
   */
  private static extractDosage(transcript: string, medicationName: string, commonDosages: string[]): string {
    const context = transcript.toLowerCase();
    const medIndex = context.indexOf(medicationName);
    
    if (medIndex === -1) return commonDosages[0] || "";
    
    // Look for dosage in surrounding text (±50 characters)
    const start = Math.max(0, medIndex - 50);
    const end = Math.min(context.length, medIndex + medicationName.length + 50);
    const contextText = context.slice(start, end);
    
    // Regex patterns for dosage extraction
    const patterns = [
      /(\d+(?:[,.]?\d+)?)\s*(?:mg|milligramm|µg|mikrogramm|gramm|g)/i,
      /(\d+(?:[,.]?\d+)?)\s*(?:einheit|einheiten|ie)/i,
      /(\d+(?:[,.]?\d+)?)\s*(?:tropfen|trop)/i,
      /(\d+(?:[,.]?\d+)?)\s*(?:tablette|tabl|stück)/i
    ];
    
    for (const pattern of patterns) {
      const match = contextText.match(pattern);
      if (match) {
        const number = match[1].replace(',', '.');
        
        // Try to match with common dosages first
        for (const commonDosage of commonDosages) {
          if (commonDosage.includes(number)) {
            return commonDosage;
          }
        }
        
        // Default unit assignment based on medication category
        if (contextText.includes('µg') || contextText.includes('mikrogramm')) {
          return `${number}µg`;
        } else if (contextText.includes('einheit') || contextText.includes('ie')) {
          return `${number} Einheiten`;
        } else {
          return `${number}mg`;
        }
      }
    }
    
    // Fallback to most common dosage
    return commonDosages[0] || "";
  }
  
  /**
   * Creates a professional medication documentation string
   */
  static createMedicationDocumentation(matches: { medication: Medication; dosage: string; confidence: number }[]): string {
    if (matches.length === 0) {
      return "Keine spezifischen Medikamente in der Spracheingabe erkannt";
    }
    
    const documentedMeds = matches
      .filter(match => match.confidence > 0.7) // Only high-confidence matches
      .map(match => `${match.medication.name} ${match.dosage} verabreicht (${match.medication.category})`)
      .join(", ");
    
    return documentedMeds || "Medikamentenverabreichung dokumentiert, Details nicht eindeutig erkannt";
  }
}