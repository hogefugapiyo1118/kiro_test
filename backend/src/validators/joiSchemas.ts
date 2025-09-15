import Joi from 'joi';

// Common validation patterns
const uuidSchema = Joi.string().uuid({ version: 'uuidv4' });
const dateSchema = Joi.date().iso();
const positiveIntegerSchema = Joi.number().integer().min(0);

// Vocabulary validation schemas
export const vocabularySchemas = {
  // Create vocabulary request
  create: Joi.object({
    english_word: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .pattern(/^[a-zA-Z0-9\s\-_.\']+$/)
      .required()
      .messages({
        'string.empty': '英単語は必須です',
        'string.min': '英単語を入力してください',
        'string.max': '英単語は255文字以内で入力してください',
        'string.pattern.base': '英単語には英数字、スペース、ハイフン、アンダースコア、ピリオド、アポストロフィのみ使用できます',
        'any.required': '英単語は必須です'
      }),
    
    example_sentence: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': '例文は1000文字以内で入力してください'
      }),
    
    difficulty_level: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .default(1)
      .messages({
        'number.base': '難易度は数値で入力してください',
        'number.integer': '難易度は整数で入力してください',
        'number.min': '難易度は1以上で入力してください',
        'number.max': '難易度は5以下で入力してください'
      }),
    
    mastery_level: Joi.number()
      .integer()
      .valid(0, 1, 2)
      .default(0)
      .messages({
        'number.base': '習得レベルは数値で入力してください',
        'any.only': '習得レベルは0（未学習）、1（学習中）、2（習得済み）のいずれかを選択してください'
      }),
    
    japanese_meanings: Joi.array()
      .items(
        Joi.object({
          meaning: Joi.string()
            .trim()
            .min(1)
            .max(500)
            .required()
            .messages({
              'string.empty': '日本語訳は必須です',
              'string.min': '日本語訳を入力してください',
              'string.max': '日本語訳は500文字以内で入力してください',
              'any.required': '日本語訳は必須です'
            }),
          
          part_of_speech: Joi.string()
            .trim()
            .max(50)
            .allow('')
            .optional()
            .messages({
              'string.max': '品詞は50文字以内で入力してください'
            }),
          
          usage_note: Joi.string()
            .trim()
            .max(1000)
            .allow('')
            .optional()
            .messages({
              'string.max': '使用上の注意は1000文字以内で入力してください'
            })
        })
      )
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': '日本語訳を少なくとも1つ入力してください',
        'array.max': '日本語訳は最大10個まで入力できます',
        'any.required': '日本語訳は必須です'
      })
  }),

  // Update vocabulary request
  update: Joi.object({
    english_word: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .pattern(/^[a-zA-Z0-9\s\-_.\']+$/)
      .optional()
      .messages({
        'string.empty': '英単語は必須です',
        'string.min': '英単語を入力してください',
        'string.max': '英単語は255文字以内で入力してください',
        'string.pattern.base': '英単語には英数字、スペース、ハイフン、アンダースコア、ピリオド、アポストロフィのみ使用できます'
      }),
    
    example_sentence: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': '例文は1000文字以内で入力してください'
      }),
    
    difficulty_level: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.base': '難易度は数値で入力してください',
        'number.integer': '難易度は整数で入力してください',
        'number.min': '難易度は1以上で入力してください',
        'number.max': '難易度は5以下で入力してください'
      }),
    
    mastery_level: Joi.number()
      .integer()
      .valid(0, 1, 2)
      .optional()
      .messages({
        'number.base': '習得レベルは数値で入力してください',
        'any.only': '習得レベルは0（未学習）、1（学習中）、2（習得済み）のいずれかを選択してください'
      }),
    
    japanese_meanings: Joi.array()
      .items(
        Joi.object({
          id: uuidSchema.optional(),
          meaning: Joi.string()
            .trim()
            .min(1)
            .max(500)
            .required()
            .messages({
              'string.empty': '日本語訳は必須です',
              'string.min': '日本語訳を入力してください',
              'string.max': '日本語訳は500文字以内で入力してください',
              'any.required': '日本語訳は必須です'
            }),
          
          part_of_speech: Joi.string()
            .trim()
            .max(50)
            .allow('')
            .optional()
            .messages({
              'string.max': '品詞は50文字以内で入力してください'
            }),
          
          usage_note: Joi.string()
            .trim()
            .max(1000)
            .allow('')
            .optional()
            .messages({
              'string.max': '使用上の注意は1000文字以内で入力してください'
            })
        })
      )
      .min(1)
      .max(10)
      .optional()
      .messages({
        'array.min': '日本語訳を少なくとも1つ入力してください',
        'array.max': '日本語訳は最大10個まで入力できます'
      })
  }).min(1).messages({
    'object.min': '更新する項目を少なくとも1つ指定してください'
  }),

  // Query parameters for vocabulary search
  query: Joi.object({
    query: Joi.string()
      .trim()
      .max(255)
      .optional()
      .messages({
        'string.max': '検索クエリは255文字以内で入力してください'
      }),
    
    mastery_level: Joi.number()
      .integer()
      .valid(0, 1, 2)
      .optional()
      .messages({
        'number.base': '習得レベルは数値で入力してください',
        'any.only': '習得レベルは0、1、2のいずれかを選択してください'
      }),
    
    difficulty_level: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.base': '難易度は数値で入力してください',
        'number.integer': '難易度は整数で入力してください',
        'number.min': '難易度は1以上で入力してください',
        'number.max': '難易度は5以下で入力してください'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': '取得件数は数値で入力してください',
        'number.integer': '取得件数は整数で入力してください',
        'number.min': '取得件数は1以上で入力してください',
        'number.max': '取得件数は100以下で入力してください'
      }),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'オフセットは数値で入力してください',
        'number.integer': 'オフセットは整数で入力してください',
        'number.min': 'オフセットは0以上で入力してください'
      }),
    
    sort_by: Joi.string()
      .valid('created_at', 'updated_at', 'english_word', 'difficulty_level', 'mastery_level')
      .default('created_at')
      .messages({
        'any.only': 'ソート項目は created_at, updated_at, english_word, difficulty_level, mastery_level のいずれかを選択してください'
      }),
    
    sort_order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'ソート順は asc または desc を選択してください'
      })
  })
};

// Study session validation schemas
export const studySchemas = {
  // Record study result
  recordResult: Joi.object({
    vocabulary_id: uuidSchema
      .required()
      .messages({
        'string.guid': '単語IDの形式が正しくありません',
        'any.required': '単語IDは必須です'
      }),
    
    is_correct: Joi.boolean()
      .required()
      .messages({
        'boolean.base': '正解/不正解は真偽値で入力してください',
        'any.required': '正解/不正解は必須です'
      }),
    
    response_time: Joi.number()
      .integer()
      .min(0)
      .max(300000) // 5 minutes max
      .optional()
      .messages({
        'number.base': '回答時間は数値で入力してください',
        'number.integer': '回答時間は整数で入力してください',
        'number.min': '回答時間は0以上で入力してください',
        'number.max': '回答時間は5分（300000ミリ秒）以下で入力してください'
      })
  }),

  // Study session query parameters
  sessionQuery: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.base': '取得件数は数値で入力してください',
        'number.integer': '取得件数は整数で入力してください',
        'number.min': '取得件数は1以上で入力してください',
        'number.max': '取得件数は50以下で入力してください'
      }),
    
    mastery_level: Joi.number()
      .integer()
      .valid(0, 1, 2)
      .optional()
      .messages({
        'number.base': '習得レベルは数値で入力してください',
        'any.only': '習得レベルは0、1、2のいずれかを選択してください'
      }),
    
    difficulty_level: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.base': '難易度は数値で入力してください',
        'number.integer': '難易度は整数で入力してください',
        'number.min': '難易度は1以上で入力してください',
        'number.max': '難易度は5以下で入力してください'
      })
  })
};

// Authentication validation schemas
export const authSchemas = {
  // Login request
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'メールアドレスの形式が正しくありません',
        'any.required': 'メールアドレスは必須です'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'パスワードは6文字以上で入力してください',
        'any.required': 'パスワードは必須です'
      })
  }),

  // Register request
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'メールアドレスの形式が正しくありません',
        'any.required': 'メールアドレスは必須です'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'パスワードは8文字以上で入力してください',
        'string.pattern.base': 'パスワードには小文字、大文字、数字をそれぞれ1文字以上含めてください',
        'any.required': 'パスワードは必須です'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'パスワードが一致しません',
        'any.required': 'パスワード確認は必須です'
      })
  })
};

// Common parameter validation schemas
export const commonSchemas = {
  // UUID parameter
  uuidParam: Joi.object({
    id: uuidSchema
      .required()
      .messages({
        'string.guid': 'IDの形式が正しくありません',
        'any.required': 'IDは必須です'
      })
  }),

  // Pagination query
  pagination: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': '取得件数は数値で入力してください',
        'number.integer': '取得件数は整数で入力してください',
        'number.min': '取得件数は1以上で入力してください',
        'number.max': '取得件数は100以下で入力してください'
      }),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'オフセットは数値で入力してください',
        'number.integer': 'オフセットは整数で入力してください',
        'number.min': 'オフセットは0以上で入力してください'
      })
  })
};