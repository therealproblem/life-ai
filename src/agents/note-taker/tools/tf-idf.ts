/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) Tool
 * Calculates text similarity between documents for intelligent auto-linking
 */

import { logger } from '../../../utils/logger.js';

/**
 * TF-IDF vector representation of a document
 */
export interface TfIdfVector {
  [term: string]: number;
}

/**
 * Similarity result with document and score
 */
export interface SimilarityResult {
  document: string;
  similarity: number;
}

/**
 * Common English stop words to filter out
 * These are too common to be meaningful for similarity
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'you', 'your', 'have', 'had', 'this',
  'but', 'not', 'or', 'can', 'all', 'we', 'if', 'do', 'when', 'which',
  'there', 'their', 'they', 'what', 'so', 'up', 'out', 'about', 'who',
  'would', 'could', 'been', 'than', 'them', 'some', 'into', 'more',
]);

/**
 * Tokenize text into words
 * Converts to lowercase, removes punctuation, splits on whitespace
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // Replace punctuation (except @ for emails, $ for currency) with spaces
    .replace(/[^\w\s@$]/g, ' ')
    // Split on whitespace
    .split(/\s+/)
    // Filter out empty strings
    .filter((token) => token.length > 0);
}

/**
 * Remove common stop words from token array
 * Filters out words that are too common to be meaningful
 */
export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

/**
 * Calculate term frequency for a document
 * Returns count of each term in the document
 */
export function calculateTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  return tf;
}

/**
 * Calculate inverse document frequency across a corpus
 * Measures how rare a term is across all documents
 * 
 * IDF = log(total documents / documents containing term)
 */
export function calculateIdf(documents: string[][]): Map<string, number> {
  if (documents.length === 0) {
    return new Map();
  }
  
  const idf = new Map<string, number>();
  const totalDocs = documents.length;
  
  // Count how many documents contain each term
  const docFrequency = new Map<string, number>();
  
  for (const doc of documents) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }
  
  // Calculate IDF for each term
  for (const [term, docCount] of docFrequency.entries()) {
    // Add 1 to avoid division by zero and log(0)
    idf.set(term, Math.log((totalDocs + 1) / (docCount + 1)));
  }
  
  return idf;
}

/**
 * Calculate TF-IDF vector for a document
 * Combines term frequency with inverse document frequency
 * Normalizes by document length (L2 normalization)
 */
export function calculateTfIdf(
  tokens: string[],
  idf: Map<string, number>
): TfIdfVector {
  if (tokens.length === 0) {
    return {};
  }
  
  const tf = calculateTermFrequency(tokens);
  const tfidf: TfIdfVector = {};
  
  // Calculate raw TF-IDF scores
  for (const [term, frequency] of tf.entries()) {
    const idfScore = idf.get(term) || 0;
    tfidf[term] = frequency * idfScore;
  }
  
  // L2 normalization (divide by vector magnitude)
  const magnitude = Math.sqrt(
    Object.values(tfidf).reduce((sum, val) => sum + val * val, 0)
  );
  
  if (magnitude > 0) {
    for (const term in tfidf) {
      tfidf[term] = tfidf[term] / magnitude;
    }
  }
  
  return tfidf;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * Returns value between 0 (completely different) and 1 (identical)
 * 
 * Cosine similarity = dot product / (magnitude A × magnitude B)
 * With normalized vectors, this simplifies to just the dot product
 */
export function cosineSimilarity(
  vectorA: TfIdfVector,
  vectorB: TfIdfVector
): number {
  const termsA = Object.keys(vectorA);
  const termsB = Object.keys(vectorB);
  
  // Handle empty vectors
  if (termsA.length === 0 || termsB.length === 0) {
    return 0;
  }
  
  // Calculate dot product
  let dotProduct = 0;
  
  for (const term of termsA) {
    if (term in vectorB) {
      dotProduct += vectorA[term] * vectorB[term];
    }
  }
  
  // Vectors are already L2-normalized in calculateTfIdf
  // So cosine similarity is just the dot product
  return dotProduct;
}

/**
 * Find similar documents from a corpus
 * Returns documents ranked by similarity to the query
 * 
 * @param query - The query text to compare
 * @param documents - Array of document texts to search
 * @param threshold - Minimum similarity score (0-1, default 0)
 * @param topN - Maximum number of results to return (default all)
 * @returns Array of documents with similarity scores, sorted by similarity
 */
export function findSimilarDocuments(
  query: string,
  documents: string[],
  threshold: number = 0,
  topN: number = documents.length
): SimilarityResult[] {
  if (documents.length === 0) {
    return [];
  }
  
  logger.debug('Finding similar documents', {
    queryLength: query.length,
    corpusSize: documents.length,
    threshold,
    topN,
  });
  
  // Preprocess query
  const queryTokens = removeStopWords(tokenize(query));
  
  // Preprocess all documents
  const docTokens = documents.map((doc) => removeStopWords(tokenize(doc)));
  
  // Calculate IDF across entire corpus (including query)
  const allTokens = [queryTokens, ...docTokens];
  const idf = calculateIdf(allTokens);
  
  // Calculate TF-IDF vector for query
  const queryVector = calculateTfIdf(queryTokens, idf);
  
  // Calculate similarity with each document
  const results: SimilarityResult[] = [];
  
  for (let i = 0; i < documents.length; i++) {
    const docVector = calculateTfIdf(docTokens[i], idf);
    const similarity = cosineSimilarity(queryVector, docVector);
    
    // Only include if above threshold
    if (similarity >= threshold) {
      results.push({
        document: documents[i],
        similarity,
      });
    }
  }
  
  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  
  // Return top N results
  const topResults = results.slice(0, topN);
  
  logger.debug('Similar documents found', {
    totalMatches: results.length,
    returnedCount: topResults.length,
    topSimilarity: topResults[0]?.similarity,
  });
  
  return topResults;
}
