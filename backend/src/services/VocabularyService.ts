import { SupabaseClient } from '@supabase/supabase-js';
import { VocabularyRepository, StudySessionRepository, DailyStatsRepository } from '../repositories/index';
import { VocabularyValidator, JapaneseMeaningValidator, ValidationResult } from '../validators/index';
import { 
  Vocabulary, 
  VocabularyWithMeanings, 
  CreateVocabularyRequest, 
  UpdateVocabularyRequest,
  VocabularySearchParams 
} from '../types/index.js';

export class VocabularyService {
  private vocabularyRepo: VocabularyRepository;
  private studySessionRepo: StudySessionRepository;
  private dailyStatsRepo: DailyStatsRepository;

  constructor(private supabase: SupabaseClient) {
    this.vocabularyRepo = new VocabularyRepository(supabase);
    this.studySessionRepo = new StudySessionRepository(supabase);
    this.dailyStatsRepo = new DailyStatsRepository(supabase);
  }

  async createVocabulary(userId: string, request: CreateVocabularyRequest): Promise<VocabularyWithMeanings> {
    // Validate vocabulary data
    const vocabularyValidation = VocabularyValidator.validateVocabulary({
      english_word: request.english_word,
      example_sentence: request.example_sentence,
      difficulty_level: request.difficulty_level || 1
    });

    if (!vocabularyValidation.isValid) {
      throw new Error(`Validation failed: ${vocabularyValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Validate Japanese meanings
    const meaningsValidation = JapaneseMeaningValidator.validateJapaneseMeanings(request.japanese_meanings);
    if (!meaningsValidation.isValid) {
      throw new Error(`Validation failed: ${meaningsValidation.errors.map(e => e.message).join(', ')}`);
    }

    const vocabularyData = {
      user_id: userId,
      english_word: request.english_word.trim(),
      example_sentence: request.example_sentence?.trim(),
      difficulty_level: request.difficulty_level || 1,
      mastery_level: 0 as const
    };

    return this.vocabularyRepo.create(vocabularyData, request.japanese_meanings);
  }

  async updateVocabulary(id: string, userId: string, request: UpdateVocabularyRequest): Promise<VocabularyWithMeanings> {
    // Validate vocabulary data
    const vocabularyValidation = VocabularyValidator.validateVocabulary(request);
    if (!vocabularyValidation.isValid) {
      throw new Error(`Validation failed: ${vocabularyValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Validate Japanese meanings if provided
    if (request.japanese_meanings) {
      const meaningsValidation = JapaneseMeaningValidator.validateJapaneseMeanings(request.japanese_meanings);
      if (!meaningsValidation.isValid) {
        throw new Error(`Validation failed: ${meaningsValidation.errors.map(e => e.message).join(', ')}`);
      }
    }

    const updateData: Partial<Vocabulary> = {};
    if (request.english_word) updateData.english_word = request.english_word.trim();
    if (request.example_sentence !== undefined) updateData.example_sentence = request.example_sentence?.trim();
    if (request.difficulty_level !== undefined) updateData.difficulty_level = request.difficulty_level;
    if (request.mastery_level !== undefined) updateData.mastery_level = request.mastery_level;

    return this.vocabularyRepo.update(id, userId, updateData, request.japanese_meanings);
  }

  async getVocabulary(id: string, userId: string): Promise<VocabularyWithMeanings | null> {
    return this.vocabularyRepo.findById(id, userId);
  }

  async getUserVocabulary(userId: string): Promise<VocabularyWithMeanings[]> {
    return this.vocabularyRepo.findByUserId(userId);
  }

  async deleteVocabulary(id: string, userId: string): Promise<void> {
    return this.vocabularyRepo.delete(id, userId);
  }

  async searchVocabulary(userId: string, params: VocabularySearchParams): Promise<VocabularyWithMeanings[]> {
    return this.vocabularyRepo.search(
      userId, 
      params.query || '', 
      params.mastery_level,
      params.difficulty_level,
      params.sort_by || 'created_at',
      params.sort_order || 'desc'
    );
  }

  async getVocabularyForStudy(userId: string, limit: number = 10): Promise<VocabularyWithMeanings[]> {
    return this.vocabularyRepo.getRandomForStudy(userId, limit);
  }

  async updateMasteryLevel(vocabularyId: string, userId: string, masteryLevel: 0 | 1 | 2): Promise<VocabularyWithMeanings> {
    const validation = VocabularyValidator.validateMasteryLevel(masteryLevel);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    return this.vocabularyRepo.update(vocabularyId, userId, { mastery_level: masteryLevel });
  }
}