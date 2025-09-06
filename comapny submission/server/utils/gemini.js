const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

class GeminiService {
  static async generateSummary(content) {
    try {
      const prompt = `Please provide a concise summary (2-3 sentences) of the following document content:\n\n${content}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  static async generateTags(content) {
    try {
      const prompt = `Analyze the following document content and generate 3-5 relevant tags. Return only the tags separated by commas, no other text:\n\n${content}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tagsText = response.text().trim();
      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Error generating tags:', error);
      throw new Error('Failed to generate tags');
    }
  }

  static async semanticSearch(query, documents) {
    try {
      const documentContexts = documents.map(doc => 
        `Title: ${doc.title}\nContent: ${doc.content.substring(0, 500)}...\nTags: ${doc.tags.join(', ')}`
      ).join('\n\n---\n\n');

      const prompt = `Based on the following documents, find the most relevant ones for the query: "${query}"\n\nDocuments:\n${documentContexts}\n\nPlease rank the documents by relevance and explain why each document is relevant to the query.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  static async answerQuestion(question, documents) {
    try {
      const documentContexts = documents.map(doc => 
        `Title: ${doc.title}\nContent: ${doc.content}\nTags: ${doc.tags.join(', ')}`
      ).join('\n\n---\n\n');

      const prompt = `Based on the following documents, please answer this question: "${question}"\n\nIf the answer cannot be found in the provided documents, please state that clearly.\n\nDocuments:\n${documentContexts}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error answering question:', error);
      throw new Error('Failed to answer question');
    }
  }
}

module.exports = GeminiService;
