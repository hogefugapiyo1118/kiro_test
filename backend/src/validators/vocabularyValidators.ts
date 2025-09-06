import { Vocabulary, JapaneseMeaning, StudySession, DailyStats } from '../types/index.js';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  constructor(
    public isValid: boolean,
    public errors: ValidationError[] = []
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static failure(errors: ValidationError[]): ValidationResult {
    return new ValidationResult(false, errors);
  }

  addError(field: string, message: string): void {
    this.errors.push({ field, message });
    this.isValid = false;
  }
}

export class VocabularyValidator {
  static validateEnglishWord(word: string): ValidationResult {
    const result = new ValidationResult(true);

    if (!word || typeof word !== 'string') {
      result.addError('english_word', 'English word is required');
      return result;
    }

    const trimmedWord = word.trim();
    if (trimmedWord.length === 0) {
      result.addError('english_word', 'English word cannot be empty');
    } else if (trimmedWord.length > 255) {
      result.addError('english_word', 'English word must be 255 characters or less');
    } else if (!/^[a-zA-Z0-9\s\-_']+$/.test(trimmedWord)) {
      result.addError('english_word', 'English word can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes');
    }

    return result;
  }

  static validateExampleSentence(sentence?: string): ValidationResult {
    const result = new ValidationResult(true);

    if (sentence !== undefined && sentence !== null) {
      if (typeof sentence !== 'string') {
        result.addError('example_sentence', 'Example sentence must be a string');
      } else if (sentence.trim().length > 1000) {
        result.addError('example_sentence', 'Example sentence must be 1000 characters or less');
      }
    }

    return result;
  }

  static validateDifficultyLevel(level: number): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof level !== 'number' || !Number.isInteger(level)) {
      result.addError('difficulty_level', 'Difficulty level must be an integer');
    } else if (level < 1 || level > 5) {
      result.addError('difficulty_level', 'Difficulty level must be between 1 and 5');
    }

    return result;
  }

  static validateMasteryLevel(level: number): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof level !== 'number' || !Number.isInteger(level)) {
      result.addError('mastery_level', 'Mastery level must be an integer');
    } else if (![0, 1, 2].includes(level)) {
      result.addError('mastery_level', 'Mastery level must be 0 (not learned), 1 (learning), or 2 (mastered)');
    }

    return result;
  }

  static validateVocabulary(vocabulary: Partial<Vocabulary>): ValidationResult {
    const result = new ValidationResult(true);

    // Validate required fields
    if (!vocabulary.english_word) {
      result.addError('english_word', 'English word is required');
    } else {
      const wordValidation = this.validateEnglishWord(vocabulary.english_word);
      if (!wordValidation.isValid) {
        result.errors.push(...wordValidation.errors);
        result.isValid = false;
      }
    }

    // Validate optional fields
    if (vocabulary.example_sentence !== undefined) {
      const sentenceValidation = this.validateExampleSentence(vocabulary.example_sentence);
      if (!sentenceValidation.isValid) {
        result.errors.push(...sentenceValidation.errors);
        result.isValid = false;
      }
    }

    if (vocabulary.difficulty_level !== undefined) {
      const difficultyValidation = this.validateDifficultyLevel(vocabulary.difficulty_level);
      if (!difficultyValidation.isValid) {
        result.errors.push(...difficultyValidation.errors);
        result.isValid = false;
      }
    }

    if (vocabulary.mastery_level !== undefined) {
      const masteryValidation = this.validateMasteryLevel(vocabulary.mastery_level);
      if (!masteryValidation.isValid) {
        result.errors.push(...masteryValidation.errors);
        result.isValid = false;
      }
    }

    return result;
  }
}

export class JapaneseMeaningValidator {
  static validateMeaning(meaning: string): ValidationResult {
    const result = new ValidationResult(true);

    if (!meaning || typeof meaning !== 'string') {
      result.addError('meaning', 'Japanese meaning is required');
      return result;
    }

    const trimmedMeaning = meaning.trim();
    if (trimmedMeaning.length === 0) {
      result.addError('meaning', 'Japanese meaning cannot be empty');
    } else if (trimmedMeaning.length > 500) {
      result.addError('meaning', 'Japanese meaning must be 500 characters or less');
    }

    return result;
  }

  static validatePartOfSpeech(partOfSpeech?: string): ValidationResult {
    const result = new ValidationResult(true);

    if (partOfSpeech !== undefined && partOfSpeech !== null) {
      if (typeof partOfSpeech !== 'string') {
        result.addError('part_of_speech', 'Part of speech must be a string');
      } else if (partOfSpeech.trim().length > 50) {
        result.addError('part_of_speech', 'Part of speech must be 50 characters or less');
      }
    }

    return result;
  }

  static validateUsageNote(usageNote?: string): ValidationResult {
    const result = new ValidationResult(true);

    if (usageNote !== undefined && usageNote !== null) {
      if (typeof usageNote !== 'string') {
        result.addError('usage_note', 'Usage note must be a string');
      } else if (usageNote.trim().length > 1000) {
        result.addError('usage_note', 'Usage note must be 1000 characters or less');
      }
    }

    return result;
  }

  static validateJapaneseMeaning(meaning: Partial<JapaneseMeaning>): ValidationResult {
    const result = new ValidationResult(true);

    // Validate required fields
    if (!meaning.meaning) {
      result.addError('meaning', 'Japanese meaning is required');
    } else {
      const meaningValidation = this.validateMeaning(meaning.meaning);
      if (!meaningValidation.isValid) {
        result.errors.push(...meaningValidation.errors);
        result.isValid = false;
      }
    }

    // Validate optional fields
    if (meaning.part_of_speech !== undefined) {
      const posValidation = this.validatePartOfSpeech(meaning.part_of_speech);
      if (!posValidation.isValid) {
        result.errors.push(...posValidation.errors);
        result.isValid = false;
      }
    }

    if (meaning.usage_note !== undefined) {
      const noteValidation = this.validateUsageNote(meaning.usage_note);
      if (!noteValidation.isValid) {
        result.errors.push(...noteValidation.errors);
        result.isValid = false;
      }
    }

    return result;
  }

  static validateJapaneseMeanings(meanings: Partial<JapaneseMeaning>[]): ValidationResult {
    const result = new ValidationResult(true);

    if (!Array.isArray(meanings)) {
      result.addError('japanese_meanings', 'Japanese meanings must be an array');
      return result;
    }

    if (meanings.length === 0) {
      result.addError('japanese_meanings', 'At least one Japanese meaning is required');
      return result;
    }

    if (meanings.length > 10) {
      result.addError('japanese_meanings', 'Maximum 10 Japanese meanings allowed');
    }

    meanings.forEach((meaning, index) => {
      const meaningValidation = this.validateJapaneseMeaning(meaning);
      if (!meaningValidation.isValid) {
        meaningValidation.errors.forEach(error => {
          result.addError(`japanese_meanings[${index}].${error.field}`, error.message);
        });
        result.isValid = false;
      }
    });

    return result;
  }
}

export class StudySessionValidator {
  static validateIsCorrect(isCorrect: boolean): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof isCorrect !== 'boolean') {
      result.addError('is_correct', 'is_correct must be a boolean value');
    }

    return result;
  }

  static validateResponseTime(responseTime?: number): ValidationResult {
    const result = new ValidationResult(true);

    if (responseTime !== undefined && responseTime !== null) {
      if (typeof responseTime !== 'number' || !Number.isInteger(responseTime)) {
        result.addError('response_time', 'Response time must be an integer (milliseconds)');
      } else if (responseTime < 0) {
        result.addError('response_time', 'Response time cannot be negative');
      } else if (responseTime > 300000) { // 5 minutes max
        result.addError('response_time', 'Response time cannot exceed 5 minutes (300000ms)');
      }
    }

    return result;
  }

  static validateStudySession(session: Partial<StudySession>): ValidationResult {
    const result = new ValidationResult(true);

    // Validate required fields
    if (session.is_correct === undefined || session.is_correct === null) {
      result.addError('is_correct', 'is_correct is required');
    } else {
      const correctValidation = this.validateIsCorrect(session.is_correct);
      if (!correctValidation.isValid) {
        result.errors.push(...correctValidation.errors);
        result.isValid = false;
      }
    }

    // Validate optional fields
    if (session.response_time !== undefined) {
      const timeValidation = this.validateResponseTime(session.response_time);
      if (!timeValidation.isValid) {
        result.errors.push(...timeValidation.errors);
        result.isValid = false;
      }
    }

    return result;
  }
}

export class DailyStatsValidator {
  static validateWordsStudied(wordsStudied: number): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof wordsStudied !== 'number' || !Number.isInteger(wordsStudied)) {
      result.addError('words_studied', 'Words studied must be an integer');
    } else if (wordsStudied < 0) {
      result.addError('words_studied', 'Words studied cannot be negative');
    } else if (wordsStudied > 10000) {
      result.addError('words_studied', 'Words studied cannot exceed 10000 per day');
    }

    return result;
  }

  static validateCorrectAnswers(correctAnswers: number): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof correctAnswers !== 'number' || !Number.isInteger(correctAnswers)) {
      result.addError('correct_answers', 'Correct answers must be an integer');
    } else if (correctAnswers < 0) {
      result.addError('correct_answers', 'Correct answers cannot be negative');
    }

    return result;
  }

  static validateTotalStudyTime(totalStudyTime: number): ValidationResult {
    const result = new ValidationResult(true);

    if (typeof totalStudyTime !== 'number' || !Number.isInteger(totalStudyTime)) {
      result.addError('total_study_time', 'Total study time must be an integer (seconds)');
    } else if (totalStudyTime < 0) {
      result.addError('total_study_time', 'Total study time cannot be negative');
    } else if (totalStudyTime > 86400) { // 24 hours max
      result.addError('total_study_time', 'Total study time cannot exceed 24 hours (86400 seconds)');
    }

    return result;
  }

  static validateStudyDate(studyDate: string): ValidationResult {
    const result = new ValidationResult(true);

    if (!studyDate || typeof studyDate !== 'string') {
      result.addError('study_date', 'Study date is required');
      return result;
    }

    // Validate YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(studyDate)) {
      result.addError('study_date', 'Study date must be in YYYY-MM-DD format');
      return result;
    }

    const date = new Date(studyDate);
    if (isNaN(date.getTime())) {
      result.addError('study_date', 'Study date must be a valid date');
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (date > today) {
        result.addError('study_date', 'Study date cannot be in the future');
      }
    }

    return result;
  }

  static validateDailyStats(stats: Partial<DailyStats>): ValidationResult {
    const result = new ValidationResult(true);

    // Validate required fields
    if (!stats.study_date) {
      result.addError('study_date', 'Study date is required');
    } else {
      const dateValidation = this.validateStudyDate(stats.study_date);
      if (!dateValidation.isValid) {
        result.errors.push(...dateValidation.errors);
        result.isValid = false;
      }
    }

    if (stats.words_studied === undefined || stats.words_studied === null) {
      result.addError('words_studied', 'Words studied is required');
    } else {
      const wordsValidation = this.validateWordsStudied(stats.words_studied);
      if (!wordsValidation.isValid) {
        result.errors.push(...wordsValidation.errors);
        result.isValid = false;
      }
    }

    if (stats.correct_answers === undefined || stats.correct_answers === null) {
      result.addError('correct_answers', 'Correct answers is required');
    } else {
      const correctValidation = this.validateCorrectAnswers(stats.correct_answers);
      if (!correctValidation.isValid) {
        result.errors.push(...correctValidation.errors);
        result.isValid = false;
      }
    }

    if (stats.total_study_time === undefined || stats.total_study_time === null) {
      result.addError('total_study_time', 'Total study time is required');
    } else {
      const timeValidation = this.validateTotalStudyTime(stats.total_study_time);
      if (!timeValidation.isValid) {
        result.errors.push(...timeValidation.errors);
        result.isValid = false;
      }
    }

    // Cross-field validation
    if (stats.correct_answers !== undefined && stats.words_studied !== undefined) {
      if (stats.correct_answers > stats.words_studied) {
        result.addError('correct_answers', 'Correct answers cannot exceed words studied');
      }
    }

    return result;
  }
}
