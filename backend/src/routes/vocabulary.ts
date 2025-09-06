import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { VocabularyService } from '../services/VocabularyService';
import { supabase } from '../config/database';
import { CreateVocabularyRequest, UpdateVocabularyRequest, VocabularySearchParams } from '../types/index';
import Joi from 'joi';

const router = express.Router();
const vocabularyService = new VocabularyService(supabase);

// Validation schemas
const createVocabularySchema = Joi.object({
  english_word: Joi.string().trim().min(1).max(255).required(),
  example_sentence: Joi.string().trim().max(1000).optional().allow(''),
  difficulty_level: Joi.number().integer().min(1).max(5).default(1),
  japanese_meanings: Joi.array().items(
    Joi.object({
      meaning: Joi.string().trim().min(1).max(500).required(),
      part_of_speech: Joi.string().trim().max(50).optional().allow(''),
      usage_note: Joi.string().trim().max(500).optional().allow('')
    })
  ).min(1).required()
});

const updateVocabularySchema = Joi.object({
  english_word: Joi.string().trim().min(1).max(255).optional(),
  example_sentence: Joi.string().trim().max(1000).optional().allow(''),
  difficulty_level: Joi.number().integer().min(1).max(5).optional(),
  mastery_level: Joi.number().integer().min(0).max(2).optional(),
  japanese_meanings: Joi.array().items(
    Joi.object({
      meaning: Joi.string().trim().min(1).max(500).required(),
      part_of_speech: Joi.string().trim().max(50).optional().allow(''),
      usage_note: Joi.string().trim().max(500).optional().allow('')
    })
  ).min(1).optional()
});

const searchParamsSchema = Joi.object({
  query: Joi.string().trim().max(255).optional().allow(''),
  mastery_level: Joi.number().integer().min(0).max(2).optional(),
  difficulty_level: Joi.number().integer().min(1).max(5).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  sort_by: Joi.string().valid('created_at', 'english_word', 'mastery_level', 'difficulty_level').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

// GET /api/vocabulary - Get all vocabulary with search and filtering
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { error: validationError, value: params } = searchParamsSchema.validate(req.query);
    if (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.details[0].message
      });
    }

    const searchParams: VocabularySearchParams = {
      query: params.query,
      mastery_level: params.mastery_level,
      difficulty_level: params.difficulty_level,
      limit: params.limit,
      offset: params.offset,
      sort_by: params.sort_by,
      sort_order: params.sort_order
    };

    let vocabulary;
    if (params.query || params.mastery_level !== undefined || params.difficulty_level !== undefined) {
      // Use search functionality for filtering and sorting
      vocabulary = await vocabularyService.searchVocabulary(req.user!.id, searchParams);
    } else {
      // Get all vocabulary and apply sorting
      vocabulary = await vocabularyService.getUserVocabulary(req.user!.id);
      
      // Apply sorting
      vocabulary.sort((a, b) => {
        let aValue, bValue;
        
        switch (params.sort_by) {
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

        if (params.sort_order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    // Apply pagination
    const startIndex = params.offset;
    const endIndex = startIndex + params.limit;
    const paginatedVocabulary = vocabulary.slice(startIndex, endIndex);

    return res.status(200).json({
      data: paginatedVocabulary,
      pagination: {
        total: vocabulary.length,
        limit: params.limit,
        offset: params.offset,
        hasMore: endIndex < vocabulary.length
      }
    });

  } catch (error) {
    console.error('Get vocabulary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vocabulary/:id - Get specific vocabulary
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Vocabulary ID is required' });
    }

    const vocabulary = await vocabularyService.getVocabulary(id, req.user!.id);

    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    return res.status(200).json({ data: vocabulary });

  } catch (error) {
    console.error('Get vocabulary by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vocabulary - Create new vocabulary
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { error: validationError, value: validatedData } = createVocabularySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.details[0].message
      });
    }

    const createRequest: CreateVocabularyRequest = {
      english_word: validatedData.english_word,
      example_sentence: validatedData.example_sentence || undefined,
      difficulty_level: validatedData.difficulty_level,
      japanese_meanings: validatedData.japanese_meanings
    };

    const vocabulary = await vocabularyService.createVocabulary(req.user!.id, createRequest);

    return res.status(201).json({
      message: 'Vocabulary created successfully',
      data: vocabulary
    });

  } catch (error) {
    console.error('Create vocabulary error:', error);
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/vocabulary/:id - Update vocabulary
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Vocabulary ID is required' });
    }

    const { error: validationError, value: validatedData } = updateVocabularySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationError.details[0].message
      });
    }

    // Check if vocabulary exists
    const existingVocabulary = await vocabularyService.getVocabulary(id, req.user!.id);
    if (!existingVocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    const updateRequest: UpdateVocabularyRequest = {
      english_word: validatedData.english_word,
      example_sentence: validatedData.example_sentence,
      difficulty_level: validatedData.difficulty_level,
      mastery_level: validatedData.mastery_level,
      japanese_meanings: validatedData.japanese_meanings
    };

    const vocabulary = await vocabularyService.updateVocabulary(id, req.user!.id, updateRequest);

    return res.status(200).json({
      message: 'Vocabulary updated successfully',
      data: vocabulary
    });

  } catch (error) {
    console.error('Update vocabulary error:', error);
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/vocabulary/:id - Delete vocabulary
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Vocabulary ID is required' });
    }

    // Check if vocabulary exists
    const existingVocabulary = await vocabularyService.getVocabulary(id, req.user!.id);
    if (!existingVocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    await vocabularyService.deleteVocabulary(id, req.user!.id);

    return res.status(200).json({
      message: 'Vocabulary deleted successfully'
    });

  } catch (error) {
    console.error('Delete vocabulary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;