import { SupabaseClient } from '@supabase/supabase-js';
import { Vocabulary, JapaneseMeaning, VocabularyWithMeanings } from '../types/index';

export class VocabularyRepository {
  constructor(private supabase: SupabaseClient) { }

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
    // Try RPC (atomic) first
    const { data, error } = await this.supabase.rpc('insert_vocabulary_with_meanings', {
      meanings_input: meanings,
      vocabulary_input: vocabulary
    });

    if (!error && data && data.length > 0) {
      return data[0] as VocabularyWithMeanings;
    }

    // Fallback if RPC not found or failed (graceful degradation)
    if (error) {
      console.warn('[VocabularyRepository.create] RPC fallback due to:', error.message);
    }

    // Insert vocabulary
    const { data: vocabRow, error: vocabErr } = await this.supabase
      .from('vocabulary')
      .insert({
        user_id: vocabulary.user_id,
        english_word: vocabulary.english_word,
        example_sentence: vocabulary.example_sentence,
        difficulty_level: vocabulary.difficulty_level,
        mastery_level: vocabulary.mastery_level
      })
      .select()
      .single();

    if (vocabErr || !vocabRow) {
      throw new Error(`Failed to create vocabulary: ${vocabErr?.message}`);
    }

    let meaningsData: any[] = [];
    if (meanings.length > 0) {
      const insertMeanings = meanings.map(m => ({
        vocabulary_id: vocabRow.id,
        meaning: m.meaning,
        part_of_speech: (m as any).part_of_speech,
        usage_note: (m as any).usage_note
      }));
      const { data: jmRows, error: jmErr } = await this.supabase
        .from('japanese_meanings')
        .insert(insertMeanings)
        .select();
      if (jmErr) {
        throw new Error(`Failed to create meanings: ${jmErr.message}`);
      }
      meaningsData = jmRows || [];
    }

    return {
      ...vocabRow,
      japanese_meanings: meaningsData
    } as VocabularyWithMeanings;
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

  async search(userId: string, query: string, masteryLevel?: number, difficultyLevel?: number, sortBy: string = 'created_at', sortOrder: string = 'desc'): Promise<VocabularyWithMeanings[]> {
    // ベースのクエリビルダー（select とユーザー/熟練度のフィルタまで）
    const baseSelect = () => {
      let qb = this.supabase
        .from('vocabulary')
        .select(`
          *,
          japanese_meanings (*)
        `)
        .eq('user_id', userId);

      if (masteryLevel !== undefined) {
        qb = qb.eq('mastery_level', masteryLevel);
      }

      if (difficultyLevel !== undefined) {
        qb = qb.eq('difficulty_level', difficultyLevel);
      }

      return qb;
    };

    // クエリ未指定時はそのまま返す
    if (!query) {
      const { data, error } = await baseSelect().order(sortBy, { ascending: sortOrder === 'asc' });
      if (error) {
        throw new Error(`Failed to search vocabulary: ${error.message}`);
      }
      return data || [];
    }

    // LIKE 用のワイルドカードをエスケープし、部分一致にする
    const escapeForILike = (input: string) => input.replace(/[\\%_]/g, (m) => `\\${m}`);
    const pattern = `%${escapeForILike(query)}%`;

    // 2 クエリ（english_word / japanese_meanings.meaning）で OR 条件を再現し、結果をマージ
    const englishPromise = baseSelect().ilike('english_word', pattern);
    
    // 日本語意味から vocabulary_id を取得（フィルタリング条件も適用）
    let meaningIdsQuery = this.supabase
      .from('japanese_meanings')
      .select('vocabulary_id')
      .ilike('meaning', pattern);

    // 日本語意味検索でも vocabulary テーブルの条件を適用するため、
    // vocabulary_id を取得してから vocabulary テーブルでフィルタリング
    const meaningIdsPromise = meaningIdsQuery;

    const [englishRes, meaningIdsRes] = await Promise.all([englishPromise, meaningIdsPromise]);

    if (englishRes.error) {
      throw new Error(`Failed to search vocabulary (english_word): ${englishRes.error.message}`);
    }
    if (meaningIdsRes.error) {
      throw new Error(`Failed to search vocabulary (japanese_meanings ids): ${meaningIdsRes.error.message}`);
    }

    const vocabIdSet = new Set<string>((meaningIdsRes.data || []).map((r: any) => r.vocabulary_id));
    let meaningSideData: VocabularyWithMeanings[] = [];
    if (vocabIdSet.size > 0) {
      const { data: vocabByIds, error: vocabByIdsError } = await baseSelect().in('id', Array.from(vocabIdSet));
      if (vocabByIdsError) {
        throw new Error(`Failed to search vocabulary (by meaning): ${vocabByIdsError.message}`);
      }
      meaningSideData = (vocabByIds || []) as unknown as VocabularyWithMeanings[];
    }

    const combined = [...(englishRes.data || []), ...meaningSideData];
    // id で重複排除
    const uniqueMap = new Map<string, VocabularyWithMeanings>();
    for (const item of combined) {
      if (!uniqueMap.has((item as any).id)) {
        uniqueMap.set((item as any).id, item as VocabularyWithMeanings);
      }
    }
    const unique = Array.from(uniqueMap.values());

    // ソート処理
    unique.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'english_word':
          aValue = a.english_word.toLowerCase();
          bValue = b.english_word.toLowerCase();
          break;
        case 'mastery_level':
          aValue = a.mastery_level;
          bValue = b.mastery_level;
          break;
        case 'difficulty_level':
          aValue = a.difficulty_level;
          bValue = b.difficulty_level;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return unique;
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