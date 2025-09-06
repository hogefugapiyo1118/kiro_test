import { SupabaseClient } from '@supabase/supabase-js';
import { Vocabulary, JapaneseMeaning, VocabularyWithMeanings } from '../types/index.js';

export class VocabularyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<VocabularyWithMeanings[]> {
    const { data, error } = await this.supabase
      .from('vocabulary')
      .select(`
        *,
        japanese_meanings (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch vocabulary: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string, userId: string): Promise<VocabularyWithMeanings | null> {
    const { data, error } = await this.supabase
      .from('vocabulary')
      .select(`
        *,
        japanese_meanings (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch vocabulary: ${error.message}`);
    }

    return data;
  }

  async create(vocabulary: Omit<Vocabulary, 'id' | 'created_at' | 'updated_at'>, meanings: Omit<JapaneseMeaning, 'id' | 'vocabulary_id' | 'created_at'>[]): Promise<VocabularyWithMeanings> {
    // Use a transaction via a Postgres function to ensure atomicity
    const { data, error } = await this.supabase.rpc('insert_vocabulary_with_meanings', {
      vocabulary_input: vocabulary,
      meanings_input: meanings
    });

    if (error) {
      throw new Error(`Failed to create vocabulary and meanings: ${error.message}`);
    }

    // The function should return the vocabulary and its meanings
    return data as VocabularyWithMeanings;
  }

  async update(id: string, userId: string, vocabulary: Partial<Omit<Vocabulary, 'id' | 'user_id' | 'created_at' | 'updated_at'>>, meanings?: Omit<JapaneseMeaning, 'id' | 'vocabulary_id' | 'created_at'>[]): Promise<VocabularyWithMeanings> {
    // Update vocabulary
    const { data: vocabData, error: vocabError } = await this.supabase
      .from('vocabulary')
      .update(vocabulary)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (vocabError) {
      throw new Error(`Failed to update vocabulary: ${vocabError.message}`);
    }

    // If meanings are provided, replace all existing meanings
    if (meanings !== undefined) {
      // Delete existing meanings
      await this.supabase
        .from('japanese_meanings')
        .delete()
        .eq('vocabulary_id', id);

      // Insert new meanings
      if (meanings.length > 0) {
        const meaningsWithVocabId = meanings.map(meaning => ({
          ...meaning,
          vocabulary_id: id
        }));

        const { data: meaningsData, error: meaningsError } = await this.supabase
          .from('japanese_meanings')
          .insert(meaningsWithVocabId)
          .select();

        if (meaningsError) {
          throw new Error(`Failed to update meanings: ${meaningsError.message}`);
        }

        return {
          ...vocabData,
          japanese_meanings: meaningsData
        };
      }
    }

    // Fetch current meanings if not updating them
    const { data: currentMeanings } = await this.supabase
      .from('japanese_meanings')
      .select('*')
      .eq('vocabulary_id', id);

    return {
      ...vocabData,
      japanese_meanings: currentMeanings || []
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('vocabulary')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete vocabulary: ${error.message}`);
    }
  }

  async search(userId: string, query: string, masteryLevel?: number): Promise<VocabularyWithMeanings[]> {
    let queryBuilder = this.supabase
      .from('vocabulary')
      .select(`
        *,
        japanese_meanings (*)
      `)
      .eq('user_id', userId);

    if (masteryLevel !== undefined) {
      queryBuilder = queryBuilder.eq('mastery_level', masteryLevel);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`english_word.ilike.%${query}%,japanese_meanings.meaning.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search vocabulary: ${error.message}`);
    }

    return data || [];
  }

  async getRandomForStudy(userId: string, limit: number = 10): Promise<VocabularyWithMeanings[]> {
    // Prioritize words with lower mastery levels
    const { data, error } = await this.supabase
      .rpc('get_random_vocabulary_for_study', {
        p_user_id: userId,
        p_limit: limit
      });

    if (error) {
      // Fallback to simple random selection if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await this.supabase
        .from('vocabulary')
        .select(`
          *,
          japanese_meanings (*)
        `)
        .eq('user_id', userId)
        .order('mastery_level', { ascending: true })
        .limit(limit);

      if (fallbackError) {
        throw new Error(`Failed to get vocabulary for study: ${fallbackError.message}`);
      }

      return fallbackData || [];
    }

    return data || [];
  }
}