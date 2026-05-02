/**
 * Tests for TF-IDF tool
 * Following TDD - tests written before implementation
 */

import { describe, it, expect } from 'vitest';
import {
  tokenize,
  removeStopWords,
  calculateTermFrequency,
  calculateIdf,
  calculateTfIdf,
  cosineSimilarity,
  findSimilarDocuments,
  type TfIdfVector,
  type SimilarityResult,
} from './tf-idf.js';

describe('tf-idf', () => {
  describe('tokenize', () => {
    it('should tokenize text into words', () => {
      const text = 'Trading psychology affects decision making';
      const tokens = tokenize(text);
      
      expect(tokens).toEqual(['trading', 'psychology', 'affects', 'decision', 'making']);
    });

    it('should convert to lowercase', () => {
      const text = 'Trading PSYCHOLOGY Affects';
      const tokens = tokenize(text);
      
      expect(tokens).toEqual(['trading', 'psychology', 'affects']);
    });

    it('should remove punctuation', () => {
      const text = 'Hello, world! How are you?';
      const tokens = tokenize(text);
      
      expect(tokens).not.toContain(',');
      expect(tokens).not.toContain('!');
      expect(tokens).not.toContain('?');
      expect(tokens).toEqual(['hello', 'world', 'how', 'are', 'you']);
    });

    it('should handle special characters and numbers', () => {
      const text = 'XAUUSD broke $2050 level @ 9am';
      const tokens = tokenize(text);
      
      // Should keep meaningful terms, clean special chars
      expect(tokens).toContain('xauusd');
      expect(tokens).toContain('broke');
      // $2050 stays as one token (preserves currency info)
      expect(tokens).toContain('$2050');
      expect(tokens).toContain('level');
      expect(tokens).toContain('9am');
    });
  });

  describe('removeStopWords', () => {
    it('should remove common stop words', () => {
      const tokens = ['the', 'trading', 'is', 'a', 'good', 'strategy'];
      const filtered = removeStopWords(tokens);
      
      expect(filtered).not.toContain('the');
      expect(filtered).not.toContain('is');
      expect(filtered).not.toContain('a');
      expect(filtered).toContain('trading');
      expect(filtered).toContain('good');
      expect(filtered).toContain('strategy');
    });

    it('should handle empty array', () => {
      const tokens: string[] = [];
      const filtered = removeStopWords(tokens);
      
      expect(filtered).toEqual([]);
    });

    it('should handle array with only stop words', () => {
      const tokens = ['the', 'a', 'an', 'is', 'are'];
      const filtered = removeStopWords(tokens);
      
      expect(filtered.length).toBeLessThan(tokens.length);
    });
  });

  describe('calculateTermFrequency', () => {
    it('should calculate term frequency', () => {
      const tokens = ['trading', 'psychology', 'trading', 'strategy', 'trading'];
      const tf = calculateTermFrequency(tokens);
      
      expect(tf.get('trading')).toBe(3);
      expect(tf.get('psychology')).toBe(1);
      expect(tf.get('strategy')).toBe(1);
    });

    it('should handle empty document', () => {
      const tokens: string[] = [];
      const tf = calculateTermFrequency(tokens);
      
      expect(tf.size).toBe(0);
    });

    it('should handle single term document', () => {
      const tokens = ['trading'];
      const tf = calculateTermFrequency(tokens);
      
      expect(tf.get('trading')).toBe(1);
      expect(tf.size).toBe(1);
    });
  });

  describe('calculateIdf', () => {
    it('should calculate inverse document frequency', () => {
      const documents = [
        ['trading', 'strategy', 'risk'],
        ['trading', 'psychology', 'emotions'],
        ['risk', 'management', 'position'],
      ];
      
      const idf = calculateIdf(documents);
      
      // 'trading' appears in 2/3 documents
      expect(idf.get('trading')).toBeLessThan(idf.get('psychology'));
      
      // 'psychology' appears in 1/3 documents (more rare)
      expect(idf.get('psychology')).toBeGreaterThan(0);
      
      // Terms in all documents should have lower IDF
      // Terms in fewer documents should have higher IDF
    });

    it('should handle single document corpus', () => {
      const documents = [['trading', 'psychology']];
      const idf = calculateIdf(documents);
      
      // All terms appear in 100% of documents
      expect(idf.get('trading')).toBeDefined();
      expect(idf.get('psychology')).toBeDefined();
    });

    it('should handle empty corpus', () => {
      const documents: string[][] = [];
      const idf = calculateIdf(documents);
      
      expect(idf.size).toBe(0);
    });
  });

  describe('calculateTfIdf', () => {
    it('should calculate TF-IDF scores', () => {
      const tokens = ['trading', 'psychology', 'trading'];
      const idf = new Map([
        ['trading', 0.5],
        ['psychology', 1.5],
      ]);
      
      const tfidf = calculateTfIdf(tokens, idf);
      
      // 'trading' appears 2 times with IDF 0.5
      expect(tfidf['trading']).toBeGreaterThan(0);
      
      // 'psychology' appears 1 time with higher IDF
      expect(tfidf['psychology']).toBeGreaterThan(0);
      
      // Rare term should have higher score even with lower frequency
      expect(tfidf['psychology']).toBeGreaterThan(tfidf['trading']);
    });

    it('should handle empty document', () => {
      const tokens: string[] = [];
      const idf = new Map([['trading', 1.0]]);
      
      const tfidf = calculateTfIdf(tokens, idf);
      
      expect(Object.keys(tfidf).length).toBe(0);
    });

    it('should normalize by document length', () => {
      const tokens = ['trading', 'psychology'];
      const idf = new Map([
        ['trading', 1.0],
        ['psychology', 1.0],
      ]);
      
      const tfidf = calculateTfIdf(tokens, idf);
      
      // Scores should be normalized (not just raw counts)
      expect(tfidf['trading']).toBeLessThanOrEqual(1);
      expect(tfidf['psychology']).toBeLessThanOrEqual(1);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate similarity between identical documents', () => {
      // Use properly normalized vectors (as calculateTfIdf produces)
      // For identical documents, full workflow test:
      const tokens = ['trading', 'psychology', 'risk'];
      const idf = new Map([
        ['trading', 1.0],
        ['psychology', 1.0],
        ['risk', 1.0],
      ]);
      
      const vectorA = calculateTfIdf(tokens, idf);
      const vectorB = calculateTfIdf(tokens, idf);
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      
      // Identical vectors should have similarity of 1.0
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should calculate similarity between completely different documents', () => {
      const vectorA: TfIdfVector = { trading: 0.5, psychology: 0.3 };
      const vectorB: TfIdfVector = { programming: 0.5, javascript: 0.3 };
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      
      // No overlapping terms should have similarity of 0.0
      expect(similarity).toBe(0);
    });

    it('should calculate similarity between partially similar documents', () => {
      const vectorA: TfIdfVector = { trading: 0.5, psychology: 0.3, risk: 0.2 };
      const vectorB: TfIdfVector = { trading: 0.4, risk: 0.3, management: 0.3 };
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      
      // Partial overlap should be between 0 and 1
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should handle zero vectors', () => {
      const vectorA: TfIdfVector = {};
      const vectorB: TfIdfVector = { trading: 0.5 };
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      
      // Empty vector should return 0
      expect(similarity).toBe(0);
    });
  });

  describe('findSimilarDocuments', () => {
    const corpus = [
      'Trading psychology affects decision making and emotional control',
      'Risk management is crucial for trading success',
      'JavaScript programming and web development',
      'Learning Japanese kanji characters',
      'Trading strategies for XAUUSD gold market',
    ];

    it('should find most similar document', () => {
      const query = 'Trading psychology and emotions';
      const results = findSimilarDocuments(query, corpus, 0, 1);
      
      expect(results).toHaveLength(1);
      expect(results[0].document).toContain('Trading psychology');
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should find top N similar documents', () => {
      const query = 'Trading risk management strategy';
      const results = findSimilarDocuments(query, corpus, 0, 3);
      
      expect(results).toHaveLength(3);
      // Should be sorted by similarity (highest first)
      expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity);
      expect(results[1].similarity).toBeGreaterThanOrEqual(results[2].similarity);
      
      // Top results should be trading-related
      expect(results[0].document).toMatch(/trading|risk/i);
    });

    it('should filter by minimum similarity threshold', () => {
      const query = 'Trading psychology';
      const results = findSimilarDocuments(query, corpus, 0.3, 10);
      
      // All results should be above threshold
      results.forEach((result) => {
        expect(result.similarity).toBeGreaterThanOrEqual(0.3);
      });
      
      // Should not include completely unrelated documents
      const hasJavascript = results.some((r) => r.document.includes('JavaScript'));
      const hasJapanese = results.some((r) => r.document.includes('Japanese'));
      expect(hasJavascript).toBe(false);
      expect(hasJapanese).toBe(false);
    });

    it('should handle corpus with no similar documents', () => {
      const query = 'Quantum physics and relativity';
      const results = findSimilarDocuments(query, corpus, 0.5, 10);
      
      // Might return empty or very low similarity results
      results.forEach((result) => {
        expect(result.similarity).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should handle very short documents', () => {
      const query = 'Trading';
      const results = findSimilarDocuments(query, corpus, 0, 3);
      
      expect(results.length).toBeGreaterThan(0);
      // Should still find trading-related documents
      expect(results[0].document).toMatch(/trading/i);
    });

    it('should handle very long documents', () => {
      // Create a long query
      const longQuery = Array(1000).fill('trading psychology risk management').join(' ');
      
      const startTime = Date.now();
      const results = findSimilarDocuments(longQuery, corpus, 0, 3);
      const duration = Date.now() - startTime;
      
      expect(results.length).toBeGreaterThan(0);
      // Should complete in reasonable time (< 100ms for this size)
      expect(duration).toBeLessThan(100);
    });
  });
});
