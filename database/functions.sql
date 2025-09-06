-- 学習用ランダム単語取得関数
-- 習得レベルの低い単語を優先的に選択する
CREATE OR REPLACE FUNCTION get_random_vocabulary_for_study(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    english_word VARCHAR(255),
    example_sentence TEXT,
    difficulty_level INTEGER,
    mastery_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    japanese_meanings JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.user_id,
        v.english_word,
        v.example_sentence,
        v.difficulty_level,
        v.mastery_level,
        v.created_at,
        v.updated_at,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', jm.id,
                    'vocabulary_id', jm.vocabulary_id,
                    'meaning', jm.meaning,
                    'part_of_speech', jm.part_of_speech,
                    'usage_note', jm.usage_note,
                    'created_at', jm.created_at
                )
            ) FILTER (WHERE jm.id IS NOT NULL),
            '[]'::json
        ) as japanese_meanings
    FROM vocabulary v
    LEFT JOIN japanese_meanings jm ON v.id = jm.vocabulary_id
    WHERE v.user_id = p_user_id
    GROUP BY v.id, v.user_id, v.english_word, v.example_sentence, v.difficulty_level, v.mastery_level, v.created_at, v.updated_at
    ORDER BY 
        -- 習得レベルが低いものを優先（0: 未学習, 1: 学習中, 2: 習得済み）
        v.mastery_level ASC,
        -- 同じ習得レベル内ではランダム
        RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 学習統計集計関数
CREATE OR REPLACE FUNCTION get_user_study_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_vocabulary INTEGER,
    mastered_vocabulary INTEGER,
    learning_vocabulary INTEGER,
    not_learned_vocabulary INTEGER,
    recent_study_days INTEGER,
    total_words_studied INTEGER,
    total_correct_answers INTEGER,
    average_accuracy DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- 総単語数
        (SELECT COUNT(*)::INTEGER FROM vocabulary WHERE user_id = p_user_id),
        -- 習得済み単語数
        (SELECT COUNT(*)::INTEGER FROM vocabulary WHERE user_id = p_user_id AND mastery_level = 2),
        -- 学習中単語数
        (SELECT COUNT(*)::INTEGER FROM vocabulary WHERE user_id = p_user_id AND mastery_level = 1),
        -- 未学習単語数
        (SELECT COUNT(*)::INTEGER FROM vocabulary WHERE user_id = p_user_id AND mastery_level = 0),
        -- 最近の学習日数
        (SELECT COUNT(DISTINCT study_date)::INTEGER 
         FROM daily_stats 
         WHERE user_id = p_user_id 
         AND study_date >= CURRENT_DATE - INTERVAL '1 day' * p_days
         AND words_studied > 0),
        -- 総学習単語数
        (SELECT COALESCE(SUM(words_studied), 0)::INTEGER FROM daily_stats WHERE user_id = p_user_id),
        -- 総正解数
        (SELECT COALESCE(SUM(correct_answers), 0)::INTEGER FROM daily_stats WHERE user_id = p_user_id),
        -- 平均正解率
        (SELECT 
            CASE 
                WHEN SUM(words_studied) > 0 
                THEN ROUND((SUM(correct_answers)::DECIMAL / SUM(words_studied)) * 100, 2)
                ELSE 0
            END
         FROM daily_stats WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;