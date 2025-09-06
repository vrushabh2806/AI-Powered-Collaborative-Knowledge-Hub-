const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { auth, adminAuth } = require('../middleware/auth');
const GeminiService = require('../utils/gemini');

const router = express.Router();

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const query = { isActive: true };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

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
      total
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create document
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags = [] } = req.body;

    // Generate summary and tags using Gemini AI
    let summary = '';
    let aiTags = [];
    
    try {
      summary = await GeminiService.generateSummary(content);
      aiTags = await GeminiService.generateTags(content);
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      // Continue without AI features if they fail
    }

    const document = new Document({
      title,
      content,
      tags: [...tags, ...aiTags],
      summary,
      createdBy: req.user._id
    });

    await document.save();
    await document.populate('createdBy', 'name email');

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.put('/:id', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findById(req.params.id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, tags = [] } = req.body;

    // Save current version to versions array
    document.versions.push({
      title: document.title,
      content: document.content,
      tags: document.tags,
      summary: document.summary,
      editedBy: document.lastEditedBy || document.createdBy,
      editedAt: document.updatedAt
    });

    // Update document
    document.title = title;
    document.content = content;
    document.tags = tags;
    document.lastEditedBy = req.user._id;

    // Generate new summary and tags using Gemini AI
    try {
      document.summary = await GeminiService.generateSummary(content);
      const aiTags = await GeminiService.generateTags(content);
      document.tags = [...tags, ...aiTags];
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      // Keep existing summary if AI fails
    }

    await document.save();
    await document.populate('createdBy', 'name email');
    await document.populate('lastEditedBy', 'name email');

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && document.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate summary with Gemini
router.post('/:id/summarize', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const summary = await GeminiService.generateSummary(document.content);
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// Generate tags with Gemini
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const aiTags = await GeminiService.generateTags(document.content);
    document.tags = [...document.tags, ...aiTags];
    await document.save();

    res.json({ tags: document.tags });
  } catch (error) {
    console.error('Generate tags error:', error);
    res.status(500).json({ message: 'Failed to generate tags' });
  }
});

// Get document versions
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('versions.editedBy', 'name email');
    
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ versions: document.versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/activity/recent', auth, async (req, res) => {
  try {
    const recentDocuments = await Document.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt createdBy lastEditedBy');

    res.json({ recentDocuments });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
