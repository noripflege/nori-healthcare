// Automatische Datumsformatierung für das gesamte System
// Unterstützt deutsche Datumsformate (Tag.Monat.Jahr)

export const formatDateGerman = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  return dateObj.toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  });
};

export const formatDateTimeGerman = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  return dateObj.toLocaleString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const parseDateGerman = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Unterstütze verschiedene deutsche Datumsformate
  const cleanDate = dateString.trim();
  
  // Format: TT.MM.JJJJ oder TT/MM/JJJJ oder TT-MM-JJJJ
  const germanDatePattern = /^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/;
  const match = cleanDate.match(germanDatePattern);
  
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Validierung
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const date = new Date(year, month - 1, day);
      // Zusätzliche Validierung um ungültige Daten wie 31.02 zu verhindern
      if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
        return date;
      }
    }
  }
  
  // Fallback: versuche normales Date-Parsing
  const fallbackDate = new Date(cleanDate);
  return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

export const formatDateInput = (value: string): string => {
  // Entferne alle Zeichen außer Zahlen
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
  }
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
};

export const validateGermanDate = (dateString: string): boolean => {
  return parseDateGerman(dateString) !== null;
};

export const getCurrentDateGerman = (): string => {
  return formatDateGerman(new Date());
};

export const getAgeFromBirthDate = (birthDateString: string): number | null => {
  const birthDate = parseDateGerman(birthDateString);
  if (!birthDate) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};