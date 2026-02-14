export interface WiktionaryResponse {
  en: En[];
  af: AF[];
  other: Nl[];
  nl: Nl[];
}

export interface AF {
  partOfSpeech: string;
  language: string;
  definitions: AFDefinition[];
}

export interface AFDefinition {
  definition: string;
  parsedExamples: PurpleParsedExample[];
  examples: string[];
}

export interface PurpleParsedExample {
  example: string;
  translation: string;
}

export interface En {
  partOfSpeech: string;
  language: string;
  definitions: EnDefinition[];
}

export interface EnDefinition {
  definition: string;
  parsedExamples?: FluffyParsedExample[];
  examples?: string[];
}

export interface FluffyParsedExample {
  example: string;
}

export interface Nl {
  partOfSpeech: string;
  language: string;
  definitions: NlDefinition[];
}

export interface NlDefinition {
  definition: string;
}
