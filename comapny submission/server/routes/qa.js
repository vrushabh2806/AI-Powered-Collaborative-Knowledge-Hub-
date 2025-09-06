const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const GeminiService = require('../utils/gemini');

const router = express.Router();

// Ask a question using Gemini AI with document context
router.post('/ask', auth, [
  body('question').trim().isLength({ min: 1 }).withMessage('Question is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question } = req.body;

    // Get all documents for context
    const documents = await Document.find({ isActive: true })
      .populate('createdBy', 'name email')
      .limit(20); // Limit for performance

    if (documents.length === 0) {
      return res.json({
        answer: 'No documents are available to answer your question. Please create some documents first.',
        sources: [],
        question
      });
    }

    // Get answer from Gemini using document context
    const answer = await GeminiService.answerQuestion(question, documents);

    // Find relevant documents based on question keywords
    const questionKeywords = question.toLowerCase().split(' ');
    const relevantDocuments = documents.filter(doc => {
      const docText = (doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')).toLowerCase();
      return questionKeywords.some(keyword => docText.includes(keyword));
    }).slice(0, 5); // Top 5 most relevant

    res.json({
      answer,
      sources: relevantDocuments.map(doc => ({
        id: doc._id,
        title: doc.title,
        summary: doc.summary,
        tags: doc.tags,
        createdBy: doc.createdBy
      })),
      question
    });
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({ message: 'Failed to process question' });
  }
});

// Get Q&A history for a user (optional feature)
router.get('/history', auth, async (req, res) => {
  try {
    // This would require a separate Q&A history model
    // For now, return empty array
    res.json({ history: [] });
  } catch (error) {
    console.error('Get Q&A history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
