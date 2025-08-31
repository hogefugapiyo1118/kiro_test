-- 英単語学習アプリ データベーススキーマ
-- Supabase PostgreSQL用

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- 単語テーブル
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    english_word VARCHAR(255) NOT NULL,
    example_sentence TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 日本語訳テーブル (複数訳語対応)
CREATE TABLE IF NOT EXISTS japanese_meanings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE NOT NULL,
    meaning TEXT NOT NULL,
    part_of_speech VARCHAR(50), -- 品詞 (名詞、動詞、形容詞など)
    usage_note TEXT, -- 使用上の注意
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学習履歴テーブル
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- ミリ秒
    studied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 学習統計テーブル
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    study_date DATE NOT NULL,
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- 秒
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, study_date)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_english_word ON vocabulary(english_word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_level ON vocabulary(mastery_level);
CREATE INDEX IF NOT EXISTS idx_japanese_meanings_vocabulary_id ON japanese_meanings(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_vocabulary_id ON study_sessions(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, studied_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, study_date);

-- Row Level Security (RLS) ポリシー設定

-- vocabulary テーブルのRLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vocabulary" ON vocabulary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON vocabulary
    FOR DELETE USING (auth.uid() = user_id);

-- japanese_meanings テーブルのRLS
ALTER TABLE japanese_meanings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meanings of their vocabulary" ON japanese_meanings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vocabulary 
            WHERE vocabulary.id = japanese_meanings.vocabulary_id 
            AND vocabulary.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert meanings for their vocabulary" ON japanese_meanings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM vocabulary 
            WHERE vocabulary.id = japanese_meanings.vocabulary_id 
            AND vocabulary.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meanings of their vocabulary" ON japanese_meanings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vocabulary 
            WHERE vocabulary.id = japanese_meanings.vocabulary_id 
            AND vocabulary.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meanings of their vocabulary" ON japanese_meanings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM vocabulary 
            WHERE vocabulary.id = japanese_meanings.vocabulary_id 
            AND vocabulary.user_id = auth.uid()
        )
    );

-- study_sessions テーブルのRLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- daily_stats テーブルのRLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily stats" ON daily_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats" ON daily_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON daily_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily stats" ON daily_stats
    FOR DELETE USING (auth.uid() = user_id);

-- 更新日時自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- vocabulary テーブルに更新日時トリガーを追加
CREATE TRIGGER update_vocabulary_updated_at 
    BEFORE UPDATE ON vocabulary 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ挿入用関数（開発・テスト用）
CREATE OR REPLACE FUNCTION insert_sample_vocabulary(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_vocab_id UUID;
BEGIN
    -- サンプル単語1: apple
    INSERT INTO vocabulary (user_id, english_word, example_sentence, difficulty_level, mastery_level)
    VALUES (p_user_id, 'apple', 'I eat an apple every day.', 1, 0)
    RETURNING id INTO v_vocab_id;
    
    INSERT INTO japanese_meanings (vocabulary_id, meaning, part_of_speech)
    VALUES (v_vocab_id, 'りんご', '名詞');
    
    -- サンプル単語2: beautiful
    INSERT INTO vocabulary (user_id, english_word, example_sentence, difficulty_level, mastery_level)
    VALUES (p_user_id, 'beautiful', 'She is a beautiful woman.', 2, 0)
    RETURNING id INTO v_vocab_id;
    
    INSERT INTO japanese_meanings (vocabulary_id, meaning, part_of_speech)
    VALUES (v_vocab_id, '美しい', '形容詞');
    
    -- サンプル単語3: study
    INSERT INTO vocabulary (user_id, english_word, example_sentence, difficulty_level, mastery_level)
    VALUES (p_user_id, 'study', 'I study English every day.', 1, 1)
    RETURNING id INTO v_vocab_id;
    
    INSERT INTO japanese_meanings (vocabulary_id, meaning, part_of_speech)
    VALUES (v_vocab_id, '勉強する', '動詞');
    INSERT INTO japanese_meanings (vocabulary_id, meaning, part_of_speech)
    VALUES (v_vocab_id, '研究', '名詞');
END;
$$ LANGUAGE plpgsql;