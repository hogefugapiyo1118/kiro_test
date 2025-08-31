export interface Vocabulary {
  id: string;
  user_id: string;
  english_word: string;
  example_sentence?: string;
  difficulty_level: number;
  mastery_level: 0 | 1 | 2;
  created_at: string;
  updated_at: string;
}

export interface JapaneseMeaning {
  id: string;
  vocabulary_id: string;
  meaning: string;
  part_of_speech?: string;
  usage_note?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  vocabulary_id: string;
  is_correct: boolean;
  response_time?: number;
  studied_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  study_date: string;
  words_studied: number;
  correct_answers: number;
  total_study_time: number;
  created_at: string;
}

export interface VocabularyWithMeanings extends Vocabulary {
  japanese_meanings: JapaneseMeaning[];
}