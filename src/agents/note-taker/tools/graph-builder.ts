/**
 * Graph Builder Tool
 * Builds and maintains knowledge graph of note connections
 */

import { logger } from '../../../utils/logger.js';
import type { Note, NoteCategory } from '../types.js';

/**
 * Graph node representing a note
 */
export interface GraphNode {
  id: string;
  title: string;
  category: NoteCategory;
  tags: string[];
  created: Date;
  modified: Date;
  backlinks: string[];
  outlinks: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Graph edge representing a connection
 */
export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  type: 'wikilink' | 'tag' | 'category' | 'related';
}

/**
 * Knowledge graph structure
 */
export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  lastUpdated: Date;
}

/**
 * GraphBuilder class
 * Manages the knowledge graph structure
 */
export class GraphBuilder {
  private graph: KnowledgeGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: [],
      lastUpdated: new Date(),
    };
  }

  // ==================== Node Operations ====================

  /**
   * Add a node to the graph
   */
  addNode(node: GraphNode): void {
    this.graph.nodes.set(node.id, node);
    this.graph.lastUpdated = new Date();
    
    logger.debug('Node added to graph', { id: node.id, title: node.title });
  }

  /**
   * Update an existing node
   */
  updateNode(id: string, updates: Partial<GraphNode>): void {
    const node = this.graph.nodes.get(id);
    
    if (!node) {
      logger.warn('Cannot update non-existent node', { id });
      return;
    }

    // Merge updates
    this.graph.nodes.set(id, { ...node, ...updates });
    this.graph.lastUpdated = new Date();
    
    logger.debug('Node updated', { id, updates: Object.keys(updates) });
  }

  /**
   * Remove a node and all its edges
   */
  removeNode(id: string): void {
    this.graph.nodes.delete(id);
    
    // Remove all edges connected to this node
    this.graph.edges = this.graph.edges.filter(
      (edge) => edge.from !== id && edge.to !== id
    );
    
    this.graph.lastUpdated = new Date();
    
    logger.debug('Node removed from graph', { id });
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): GraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  /**
   * Check if a node exists
   */
  hasNode(id: string): boolean {
    return this.graph.nodes.has(id);
  }

  /**
   * Get all nodes in the graph
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.graph.nodes.values());
  }

  // ==================== Edge Operations ====================

  /**
   * Add an edge to the graph
   * Prevents duplicate edges (same from, to, type)
   */
  addEdge(edge: GraphEdge): void {
    // Check if edge already exists
    const existing = this.graph.edges.find(
      (e) => e.from === edge.from && e.to === edge.to && e.type === edge.type
    );

    if (existing) {
      // Update weight instead of adding duplicate
      existing.weight += edge.weight;
      logger.debug('Edge weight updated', { 
        from: edge.from, 
        to: edge.to, 
        type: edge.type,
        weight: existing.weight,
      });
    } else {
      this.graph.edges.push(edge);
      logger.debug('Edge added to graph', { 
        from: edge.from, 
        to: edge.to, 
        type: edge.type,
      });
    }

    this.graph.lastUpdated = new Date();
  }

  /**
   * Remove an edge from the graph
   */
  removeEdge(from: string, to: string, type: string): void {
    const initialLength = this.graph.edges.length;
    
    this.graph.edges = this.graph.edges.filter(
      (edge) => !(edge.from === from && edge.to === to && edge.type === type)
    );

    if (this.graph.edges.length < initialLength) {
      this.graph.lastUpdated = new Date();
      logger.debug('Edge removed from graph', { from, to, type });
    }
  }

  /**
   * Get all edges for a node (both outgoing and incoming)
   */
  getEdges(nodeId: string): GraphEdge[] {
    return this.graph.edges.filter(
      (edge) => edge.from === nodeId || edge.to === nodeId
    );
  }

  /**
   * Update edge weight
   */
  updateEdgeWeight(from: string, to: string, type: string, weight: number): void {
    const edge = this.graph.edges.find(
      (e) => e.from === from && e.to === to && e.type === type
    );

    if (edge) {
      edge.weight = weight;
      this.graph.lastUpdated = new Date();
      logger.debug('Edge weight updated', { from, to, type, weight });
    } else {
      logger.warn('Cannot update weight of non-existent edge', { from, to, type });
    }
  }

  /**
   * Get edges by type
   */
  getEdgesByType(type: string): GraphEdge[] {
    return this.graph.edges.filter((edge) => edge.type === type);
  }

  // ==================== Graph Building ====================

  /**
   * Build graph from a note
   * Creates node and extracts all edges
   */
  buildFromNote(note: Note): void {
    const nodeId = note.metadata.filePath || note.frontmatter.title;

    // Create node
    const graphNode: GraphNode = {
      id: nodeId,
      title: note.frontmatter.title,
      category: note.frontmatter.category as NoteCategory,
      tags: note.frontmatter.tags,
      created: new Date(note.frontmatter.created),
      modified: new Date(note.frontmatter.modified),
      backlinks: [],
      outlinks: [],
      metadata: note.metadata as unknown as Record<string, unknown>,
    };

    this.addNode(graphNode);

    // Extract wiki-link edges
    const wikiLinkEdges = this.extractWikiLinkEdges(nodeId, note.content);
    wikiLinkEdges.forEach((edge) => this.addEdge(edge));

    // Extract tag edges (to other notes with shared tags)
    const tagEdges = this.extractTagEdges(nodeId, note.frontmatter.tags);
    tagEdges.forEach((edge) => this.addEdge(edge));

    // Extract category edges (to other notes in same category)
    const categoryEdges = this.extractCategoryEdges(
      nodeId,
      note.frontmatter.category as NoteCategory
    );
    categoryEdges.forEach((edge) => this.addEdge(edge));

    // Update backlinks and outlinks
    this.updateLinksOnNode(nodeId);

    logger.info('Graph built from note', {
      nodeId,
      wikiLinks: wikiLinkEdges.length,
      tagEdges: tagEdges.length,
      categoryEdges: categoryEdges.length,
    });
  }

  /**
   * Extract wiki-link edges from content
   * Finds [[Note Title]] links and creates edges
   */
  extractWikiLinkEdges(nodeId: string, content: string): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    const linkCounts = new Map<string, number>();

    let match;
    while ((match = regex.exec(content)) !== null) {
      const targetTitle = match[1].trim();
      linkCounts.set(targetTitle, (linkCounts.get(targetTitle) || 0) + 1);
    }

    // Create edges with weights based on link count
    for (const [targetTitle, count] of linkCounts.entries()) {
      edges.push({
        from: nodeId,
        to: targetTitle,
        weight: count,
        type: 'wikilink',
      });
    }

    return edges;
  }

  /**
   * Extract tag edges
   * Creates edges to other notes with shared tags
   */
  extractTagEdges(nodeId: string, tags: string[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const node of this.graph.nodes.values()) {
      // Skip self
      if (node.id === nodeId) {
        continue;
      }

      // Find shared tags
      const sharedTags = tags.filter((tag) => node.tags.includes(tag));

      if (sharedTags.length > 0) {
        edges.push({
          from: nodeId,
          to: node.id,
          weight: sharedTags.length,
          type: 'tag',
        });
      }
    }

    return edges;
  }

  /**
   * Extract category edges
   * Creates edges to other notes in the same category
   */
  extractCategoryEdges(nodeId: string, category: NoteCategory): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const node of this.graph.nodes.values()) {
      // Skip self
      if (node.id === nodeId) {
        continue;
      }

      // Link to notes in same category
      if (node.category === category) {
        edges.push({
          from: nodeId,
          to: node.id,
          weight: 1,
          type: 'category',
        });
      }
    }

    return edges;
  }

  /**
   * Update backlinks and outlinks on a node
   */
  private updateLinksOnNode(nodeId: string): void {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return;

    // Find outlinks (edges from this node)
    const outlinks = this.graph.edges
      .filter((e) => e.from === nodeId && e.type === 'wikilink')
      .map((e) => e.to);

    // Find backlinks (edges to this node)
    const backlinks = this.graph.edges
      .filter((e) => e.to === nodeId && e.type === 'wikilink')
      .map((e) => e.from);

    node.outlinks = outlinks;
    node.backlinks = backlinks;
  }

  // ==================== Graph Queries ====================

  /**
   * Get connected notes (all notes with edges to/from this node)
   */
  getConnectedNotes(nodeId: string): GraphNode[] {
    const connected = new Set<string>();

    for (const edge of this.graph.edges) {
      if (edge.from === nodeId) {
        connected.add(edge.to);
      }
      if (edge.to === nodeId) {
        connected.add(edge.from);
      }
    }

    return Array.from(connected)
      .map((id) => this.graph.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  /**
   * Get notes by tag
   */
  getNotesByTag(tag: string): GraphNode[] {
    return Array.from(this.graph.nodes.values()).filter((node) =>
      node.tags.includes(tag)
    );
  }

  /**
   * Get notes by category
   */
  getNotesByCategory(category: NoteCategory): GraphNode[] {
    return Array.from(this.graph.nodes.values()).filter(
      (node) => node.category === category
    );
  }

  /**
   * Get backlinks (notes that link TO this node)
   */
  getBacklinks(nodeId: string): GraphNode[] {
    const backlinks = this.graph.edges
      .filter((edge) => edge.to === nodeId && edge.type === 'wikilink')
      .map((edge) => edge.from);

    return backlinks
      .map((id) => this.graph.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  // ==================== Persistence ====================

  /**
   * Serialize graph to JSON
   */
  toJSON(): string {
    const serializable = {
      nodes: Array.from(this.graph.nodes.entries()),
      edges: this.graph.edges,
      lastUpdated: this.graph.lastUpdated.toISOString(),
    };

    return JSON.stringify(serializable, null, 2);
  }

  /**
   * Deserialize graph from JSON
   */
  static fromJSON(json: string): GraphBuilder {
    const builder = new GraphBuilder();
    const data = JSON.parse(json);

    // Restore nodes
    builder.graph.nodes = new Map(data.nodes);

    // Restore edges
    builder.graph.edges = data.edges;

    // Restore last updated
    builder.graph.lastUpdated = new Date(data.lastUpdated);

    logger.info('Graph loaded from JSON', {
      nodeCount: builder.graph.nodes.size,
      edgeCount: builder.graph.edges.length,
    });

    return builder;
  }
}
