export interface LanguageMapping {
    languages: Language[];
}

export interface Language {
    code: string;
    name: string;
    file: string;
    default: boolean;
}