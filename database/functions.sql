-- 単語と訳語を原子的に作成する関数
-- 入力は JSON（vocabulary_input は単語本体、meanings_input は訳語の配列）
-- 戻り値は作成された単語1件＋その訳語配列（JSON）
CREATE OR REPLACE FUNCTION insert_vocabulary_with_meanings(
    meanings_input JSONB,
    vocabulary_input JSONB
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
)
AS $$
DECLARE
    v_vocab_id UUID;
    v_user_id UUID;
    v_meaning JSONB;
BEGIN
    -- 認証ユーザー検証（SECURITY DEFINER を使うため自前でチェック）
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: auth.uid() is null';
    END IF;

    v_user_id := (vocabulary_input->>'user_id')::UUID;
    IF v_user_id IS NULL OR v_user_id <> auth.uid() THEN
        RAISE EXCEPTION 'Forbidden: user_id mismatch';
    END IF;

    -- vocabulary を作成
    INSERT INTO vocabulary (
        user_id,
        english_word,
        example_sentence,
        difficulty_level,
        mastery_level
    ) VALUES (
        v_user_id,
        NULLIF(vocabulary_input->>'english_word', '')::VARCHAR,
        NULLIF(vocabulary_input->>'example_sentence', '')::TEXT,
        COALESCE((vocabulary_input->>'difficulty_level')::INTEGER, 1),
        COALESCE((vocabulary_input->>'mastery_level')::INTEGER, 0)
    ) RETURNING id INTO v_vocab_id;

    -- meanings_input が配列なら訳語を挿入
    IF meanings_input IS NOT NULL AND jsonb_typeof(meanings_input) = 'array' THEN
        FOR v_meaning IN SELECT jsonb_array_elements(meanings_input)
        LOOP
            INSERT INTO japanese_meanings (
                vocabulary_id,
                meaning,
                part_of_speech,
                usage_note
            ) VALUES (
                v_vocab_id,
                NULLIF(v_meaning->>'meaning', '')::TEXT,
                NULLIF(v_meaning->>'part_of_speech', '')::VARCHAR,
                NULLIF(v_meaning->>'usage_note', '')::TEXT
            );
        END LOOP;
    END IF;

    -- 作成された単語＋訳語を返す
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
        ) AS japanese_meanings
    FROM vocabulary v
    LEFT JOIN japanese_meanings jm ON v.id = jm.vocabulary_id
    WHERE v.id = v_vocab_id
    GROUP BY v.id, v.user_id, v.english_word, v.example_sentence, v.difficulty_level, v.mastery_level, v.created_at, v.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
         AND study_date >= CURRENT_DATE - p_days * INTERVAL '1 day'
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