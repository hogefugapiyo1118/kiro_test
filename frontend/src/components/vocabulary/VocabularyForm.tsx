import { useState, useEffect, FC, FormEvent } from 'react'
import type { VocabularyWithMeanings, CreateVocabularyRequest, UpdateVocabularyRequest } from '../../types'

interface VocabularyFormProps {
  vocabulary?: VocabularyWithMeanings
  onSubmit: (data: CreateVocabularyRequest | UpdateVocabularyRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface JapaneseMeaningForm {
  meaning: string
  part_of_speech: string
  usage_note: string
}

interface FormData {
  english_word: string
  example_sentence: string
  difficulty_level: number
  mastery_level: 0 | 1 | 2
  japanese_meanings: JapaneseMeaningForm[]
}

interface FormErrors {
  english_word?: string
  japanese_meanings?: string[]
  general?: string
}

const VocabularyForm: FC<VocabularyFormProps> = ({
  vocabulary,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEditing = !!vocabulary

  const [formData, setFormData] = useState<FormData>({
    english_word: '',
    example_sentence: '',
    difficulty_level: 1,
    mastery_level: 0,
    japanese_meanings: [{ meaning: '', part_of_speech: '', usage_note: '' }]
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Initialize form data when editing
  useEffect(() => {
    if (vocabulary) {
      setFormData({
        english_word: vocabulary.english_word,
        example_sentence: vocabulary.example_sentence || '',
        difficulty_level: vocabulary.difficulty_level,
        mastery_level: vocabulary.mastery_level,
        japanese_meanings: vocabulary.japanese_meanings.length > 0
          ? vocabulary.japanese_meanings.map(meaning => ({
            meaning: meaning.meaning,
            part_of_speech: meaning.part_of_speech || '',
            usage_note: meaning.usage_note || ''
          }))
          : [{ meaning: '', part_of_speech: '', usage_note: '' }]
      })
    }
  }, [vocabulary])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate English word
    if (!formData.english_word.trim()) {
      newErrors.english_word = '英単語は必須です'
    }

    // Validate Japanese meanings
    const meaningErrors: string[] = []
    let hasValidMeaning = false

    formData.japanese_meanings.forEach((meaning, index) => {
      if (!meaning.meaning.trim()) {
        meaningErrors[index] = '日本語訳は必須です'
      } else {
        hasValidMeaning = true
        meaningErrors[index] = ''
      }
    })

    if (!hasValidMeaning) {
      newErrors.general = '少なくとも1つの日本語訳を入力してください'
    }

    newErrors.japanese_meanings = meaningErrors

    setErrors(newErrors)
    // Return true only if there are no required field errors and all japanese_meanings are valid
    return !newErrors.english_word && !newErrors.general && !(newErrors.japanese_meanings?.some(error => !!error));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Filter out empty meanings
      const validMeanings = formData.japanese_meanings
        .filter(meaning => meaning.meaning.trim())
        .map(meaning => ({
          meaning: meaning.meaning.trim(),
          part_of_speech: meaning.part_of_speech.trim() || undefined,
          usage_note: meaning.usage_note.trim() || undefined
        }))

      const submitData = {
        english_word: formData.english_word.trim(),
        example_sentence: formData.example_sentence.trim() || undefined,
        difficulty_level: formData.difficulty_level,
        japanese_meanings: validMeanings
      }

      if (isEditing) {
        await onSubmit({
          ...submitData,
          mastery_level: formData.mastery_level
        })
      } else {
        await onSubmit(submitData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleMeaningChange = (index: number, field: keyof JapaneseMeaningForm, value: string) => {
    const newMeanings = [...formData.japanese_meanings]
    newMeanings[index] = { ...newMeanings[index], [field]: value }
    setFormData(prev => ({ ...prev, japanese_meanings: newMeanings }))

    // Clear related errors
    if (errors.japanese_meanings?.[index]) {
      const newMeaningErrors = [...(errors.japanese_meanings || [])]
      newMeaningErrors[index] = ''
      setErrors(prev => ({ ...prev, japanese_meanings: newMeaningErrors }))
    }
  }

  const addMeaning = () => {
    setFormData(prev => ({
      ...prev,
      japanese_meanings: [...prev.japanese_meanings, { meaning: '', part_of_speech: '', usage_note: '' }]
    }))
  }

  const removeMeaning = (index: number) => {
    if (formData.japanese_meanings.length > 1) {
      const newMeanings = formData.japanese_meanings.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, japanese_meanings: newMeanings }))

      // Remove corresponding error
      if (errors.japanese_meanings) {
        const newMeaningErrors = errors.japanese_meanings.filter((_, i) => i !== index)
        setErrors(prev => ({ ...prev, japanese_meanings: newMeaningErrors }))
      }
    }
  }


  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {isEditing ? '単語を編集' : '新しい単語を追加'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{errors.general}</div>
          </div>
        )}

        {/* English Word */}
        <div>
          <label htmlFor="english-word" className="block text-sm font-medium text-gray-700 mb-1">
            英単語 <span className="text-red-500">*</span>
          </label>
          <input
            id="english-word"
            type="text"
            value={formData.english_word}
            onChange={(e) => handleInputChange('english_word', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.english_word ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="例: apple"
            disabled={loading}
          />
          {errors.english_word && (
            <p className="mt-1 text-sm text-red-600">{errors.english_word}</p>
          )}
        </div>

        {/* Japanese Meanings */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              日本語訳 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addMeaning}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              訳語を追加
            </button>
          </div>

          <div className="space-y-4">
            {formData.japanese_meanings.map((meaning, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    訳語 {index + 1}
                  </span>
                  {formData.japanese_meanings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeaning(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label htmlFor={`meaning-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      日本語訳 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`meaning-${index}`}
                      type="text"
                      value={meaning.meaning}
                      onChange={(e) => handleMeaningChange(index, 'meaning', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.japanese_meanings?.[index] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="例: りんご"
                      disabled={loading}
                    />
                    {errors.japanese_meanings?.[index] && (
                      <p className="mt-1 text-sm text-red-600">{errors.japanese_meanings[index]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`part-of-speech-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      品詞
                    </label>
                    <select
                      id={`part-of-speech-${index}`}
                      value={meaning.part_of_speech}
                      onChange={(e) => handleMeaningChange(index, 'part_of_speech', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">選択してください</option>
                      <option value="名詞">名詞</option>
                      <option value="動詞">動詞</option>
                      <option value="形容詞">形容詞</option>
                      <option value="副詞">副詞</option>
                      <option value="前置詞">前置詞</option>
                      <option value="接続詞">接続詞</option>
                      <option value="感嘆詞">感嘆詞</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label htmlFor={`usage-note-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    使用上の注意
                  </label>
                  <input
                    id={`usage-note-${index}`}
                    type="text"
                    value={meaning.usage_note}
                    onChange={(e) => handleMeaningChange(index, 'usage_note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 可算名詞、複数形で使用"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Sentence */}
        <div>
          <label htmlFor="example-sentence" className="block text-sm font-medium text-gray-700 mb-1">
            例文
          </label>
          <textarea
            id="example-sentence"
            value={formData.example_sentence}
            onChange={(e) => handleInputChange('example_sentence', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: I like to eat apples."
            disabled={loading}
          />
        </div>

        {/* Difficulty Level */}
        <div>
          <label htmlFor="difficulty-level" className="block text-sm font-medium text-gray-700 mb-1">
            難易度
          </label>
          <select
            id="difficulty-level"
            value={formData.difficulty_level}
            onChange={(e) => handleInputChange('difficulty_level', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={1}>初級</option>
            <option value={2}>中級</option>
            <option value={3}>上級</option>
          </select>
        </div>

        {/* Mastery Level (only for editing) */}
        {isEditing && (
          <div>
            <label htmlFor="mastery-level" className="block text-sm font-medium text-gray-700 mb-1">
              学習状態
            </label>
            <select
              id="mastery-level"
              value={formData.mastery_level}
              onChange={(e) => handleInputChange('mastery_level', parseInt(e.target.value) as 0 | 1 | 2)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value={0}>未学習</option>
              <option value={1}>学習中</option>
              <option value={2}>習得済み</option>
            </select>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? '更新中...' : '追加中...'}
              </div>
            ) : (
              isEditing ? '更新' : '追加'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VocabularyForm