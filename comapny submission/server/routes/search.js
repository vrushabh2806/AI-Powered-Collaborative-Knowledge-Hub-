const express = require('express');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const GeminiService = require('../utils/gemini');

const router = express.Router();

// Text search
router.get('/text', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const query = {
      isActive: true,
      $text: { $search: q }
    };

    const documents = await Document.find(query, { score: { $meta: 'textScore' } })
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query: q
    });
  } catch (error) {
    console.error('Text search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Semantic search using Gemini AI
router.post('/semantic', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get all documents for semantic search
    const allDocuments = await Document.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .limit(50); // Limit for performance

    if (allDocuments.length === 0) {
      return res.json({
        documents: [],
        totalPages: 0,
        currentPage: page,
        total: 0,
        query,
        semanticAnalysis: 'No documents found for semantic search.'
      });
    }

    // Perform semantic search using Gemini
    const semanticAnalysis = await GeminiService.semanticSearch(query, allDocuments);

    // For now, return all documents with semantic analysis
    // In a production app, you might want to implement proper ranking
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documents = allDocuments.slice(startIndex, endIndex);

    res.json({
      documents,
      totalPages: Math.ceil(allDocuments.length / limit),
      currentPage: page,
      total: allDocuments.length,
      query,
      semanticAnalysis
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ message: 'Failed to perform semantic search' });
  }
});

// Tag-based search
router.get('/tags', auth, async (req, res) => {
  try {
    const { tags, page = 1, limit = 10 } = req.query;
    
    if (!tags) {
      return res.status(400).json({ message: 'Tags are required' });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());
    
    const query = {
      isActive: true,
      tags: { $in: tagArray }
    };

    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      tags: tagArray
    });
  } catch (error) {
    console.error('Tag search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all unique tags
router.get('/tags/all', auth, async (req, res) => {
  try {
    const tags = await Document.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
