import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { vocabularySchemas, commonSchemas } from '../validators/joiSchemas';
import { VocabularyService } from '../services/VocabularyService';
import { supabase } from '../config/database';
import { CreateVocabularyRequest, UpdateVocabularyRequest, VocabularySearchParams } from '../types/index';

const router = express.Router();
const vocabularyService = new VocabularyService(supabase);



// GET /api/vocabulary - Get all vocabulary with search and filtering
router.get('/', 
  authenticateToken, 
  validateQuery(vocabularySchemas.query),
  async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const params = req.query as any;

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
router.get('/:id', 
  authenticateToken, 
  validateParams(commonSchemas.uuidParam),
  async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

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
router.post('/', 
  authenticateToken, 
  validateBody(vocabularySchemas.create),
  async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const validatedData = req.body;

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
router.put('/:id', 
  authenticateToken, 
  validateParams(commonSchemas.uuidParam),
  validateBody(vocabularySchemas.update),
  async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const validatedData = req.body;

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
router.delete('/:id', 
  authenticateToken, 
  validateParams(commonSchemas.uuidParam),
  async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

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