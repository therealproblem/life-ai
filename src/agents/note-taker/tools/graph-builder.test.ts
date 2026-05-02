/**
 * Tests for graph-builder tool
 * Following TDD - tests written before implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  GraphBuilder,
  type GraphNode,
  type GraphEdge,
} from './graph-builder.js';
import { NoteCategory } from '../types.js';

describe('graph-builder', () => {
  let builder: GraphBuilder;

  beforeEach(() => {
    builder = new GraphBuilder();
  });

  describe('Node Operations', () => {
    it('should add node to graph', () => {
      const node: GraphNode = {
        id: 'note-1',
        title: 'Trading Psychology',
        category: NoteCategory.Trading,
        tags: ['trading', 'psychology'],
        created: new Date('2026-05-03'),
        modified: new Date('2026-05-03'),
        backlinks: [],
        outlinks: [],
      };

      builder.addNode(node);

      expect(builder.hasNode('note-1')).toBe(true);
      expect(builder.getNode('note-1')).toEqual(node);
    });

    it('should update existing node', () => {
      const node: GraphNode = {
        id: 'note-1',
        title: 'Original Title',
        category: NoteCategory.Ideas,
        tags: ['test'],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      builder.addNode(node);
      builder.updateNode('note-1', { 
        title: 'Updated Title',
        tags: ['test', 'updated'],
      });

      const updated = builder.getNode('note-1');
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.tags).toEqual(['test', 'updated']);
    });

    it('should remove node from graph', () => {
      const node: GraphNode = {
        id: 'note-1',
        title: 'Test',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      builder.addNode(node);
      expect(builder.hasNode('note-1')).toBe(true);

      builder.removeNode('note-1');
      expect(builder.hasNode('note-1')).toBe(false);
    });

    it('should get node by ID', () => {
      const node: GraphNode = {
        id: 'note-1',
        title: 'Test',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      builder.addNode(node);

      const retrieved = builder.getNode('note-1');
      expect(retrieved).toEqual(node);
      expect(builder.getNode('nonexistent')).toBeUndefined();
    });

    it('should check if node exists', () => {
      const node: GraphNode = {
        id: 'note-1',
        title: 'Test',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      expect(builder.hasNode('note-1')).toBe(false);
      builder.addNode(node);
      expect(builder.hasNode('note-1')).toBe(true);
    });

    it('should list all nodes', () => {
      const node1: GraphNode = {
        id: 'note-1',
        title: 'Note 1',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      const node2: GraphNode = {
        id: 'note-2',
        title: 'Note 2',
        category: NoteCategory.Trading,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      };

      builder.addNode(node1);
      builder.addNode(node2);

      const allNodes = builder.getAllNodes();
      expect(allNodes).toHaveLength(2);
      expect(allNodes.map(n => n.id)).toContain('note-1');
      expect(allNodes.map(n => n.id)).toContain('note-2');
    });
  });

  describe('Edge Operations', () => {
    beforeEach(() => {
      // Add some nodes for edge tests
      builder.addNode({
        id: 'note-1',
        title: 'Note 1',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      builder.addNode({
        id: 'note-2',
        title: 'Note 2',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });
    });

    it('should add edge between nodes', () => {
      const edge: GraphEdge = {
        from: 'note-1',
        to: 'note-2',
        weight: 1,
        type: 'wikilink',
      };

      builder.addEdge(edge);

      const edges = builder.getEdges('note-1');
      expect(edges).toHaveLength(1);
      expect(edges[0]).toEqual(edge);
    });

    it('should remove edge', () => {
      const edge: GraphEdge = {
        from: 'note-1',
        to: 'note-2',
        weight: 1,
        type: 'wikilink',
      };

      builder.addEdge(edge);
      expect(builder.getEdges('note-1')).toHaveLength(1);

      builder.removeEdge('note-1', 'note-2', 'wikilink');
      expect(builder.getEdges('note-1')).toHaveLength(0);
    });

    it('should get edges for node', () => {
      builder.addNode({
        id: 'note-3',
        title: 'Note 3',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });
      builder.addEdge({ from: 'note-1', to: 'note-3', weight: 1, type: 'tag' });

      const edges = builder.getEdges('note-1');
      expect(edges).toHaveLength(2);
    });

    it('should update edge weight', () => {
      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });

      builder.updateEdgeWeight('note-1', 'note-2', 'wikilink', 5);

      const edges = builder.getEdges('note-1');
      expect(edges[0].weight).toBe(5);
    });

    it('should get edges by type', () => {
      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });
      builder.addEdge({ from: 'note-2', to: 'note-1', weight: 1, type: 'tag' });

      const wikilinks = builder.getEdgesByType('wikilink');
      const tags = builder.getEdgesByType('tag');

      expect(wikilinks).toHaveLength(1);
      expect(tags).toHaveLength(1);
      expect(wikilinks[0].type).toBe('wikilink');
      expect(tags[0].type).toBe('tag');
    });

    it('should prevent duplicate edges', () => {
      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });
      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });

      const edges = builder.getEdges('note-1');
      // Should only have one edge (or increment weight instead of duplicating)
      expect(edges).toHaveLength(1);
    });
  });

  describe('Graph Building', () => {
    it('should build graph from note', () => {
      const note = {
        frontmatter: {
          title: 'Trading Psychology',
          tags: ['trading', 'psychology'],
          category: NoteCategory.Trading,
          created: '2026-05-03',
          modified: '2026-05-03',
        },
        content: 'Content with [[Risk Management]] link.',
        metadata: {
          timestamp: new Date(),
          wordCount: 10,
          hasLinks: true,
          confidence: 'high' as const,
          filePath: 'trading/psychology.md',
        },
      };

      builder.buildFromNote(note);

      // Should create node
      expect(builder.hasNode('trading/psychology.md')).toBe(true);

      const node = builder.getNode('trading/psychology.md');
      expect(node?.title).toBe('Trading Psychology');
      expect(node?.tags).toEqual(['trading', 'psychology']);
    });

    it('should extract wiki-link edges', () => {
      const content = 'This discusses [[Trading]] and [[Psychology]] and [[Risk Management]].';
      const edges = builder.extractWikiLinkEdges('note-1', content);

      expect(edges).toHaveLength(3);
      expect(edges.map(e => e.to)).toContain('Trading');
      expect(edges.map(e => e.to)).toContain('Psychology');
      expect(edges.map(e => e.to)).toContain('Risk Management');
      expect(edges.every(e => e.type === 'wikilink')).toBe(true);
    });

    it('should extract tag edges', () => {
      // Add nodes with same tags
      builder.addNode({
        id: 'note-1',
        title: 'Note 1',
        category: NoteCategory.Trading,
        tags: ['trading', 'psychology'],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      builder.addNode({
        id: 'note-2',
        title: 'Note 2',
        category: NoteCategory.Trading,
        tags: ['trading', 'risk'],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      const edges = builder.extractTagEdges('note-1', ['trading', 'psychology']);

      // Should create edge to note-2 (shares 'trading' tag)
      const tradingEdge = edges.find(e => e.to === 'note-2');
      expect(tradingEdge).toBeDefined();
      expect(tradingEdge?.type).toBe('tag');
    });

    it('should extract category edges', () => {
      builder.addNode({
        id: 'note-1',
        title: 'Trading Note 1',
        category: NoteCategory.Trading,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      builder.addNode({
        id: 'note-2',
        title: 'Trading Note 2',
        category: NoteCategory.Trading,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      const edges = builder.extractCategoryEdges('note-1', NoteCategory.Trading);

      // Should link to other trading notes
      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.type === 'category')).toBe(true);
    });

    it('should calculate edge weights', () => {
      // Multiple links to same note should increase weight
      const content = '[[Trading]] is important. See [[Trading]] for more. Also [[Trading]].';
      const edges = builder.extractWikiLinkEdges('note-1', content);

      // Should have one edge with weight 3 (or 3 edges that get merged)
      const tradingEdges = edges.filter(e => e.to === 'Trading');
      if (tradingEdges.length === 1) {
        expect(tradingEdges[0].weight).toBe(3);
      } else {
        // If separate edges, total weight should be 3
        const totalWeight = tradingEdges.reduce((sum, e) => sum + e.weight, 0);
        expect(totalWeight).toBe(3);
      }
    });
  });

  describe('Graph Queries', () => {
    beforeEach(() => {
      // Set up graph with connected nodes
      builder.addNode({
        id: 'note-1',
        title: 'Trading Psychology',
        category: NoteCategory.Trading,
        tags: ['trading', 'psychology'],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: ['note-2'],
      });

      builder.addNode({
        id: 'note-2',
        title: 'Risk Management',
        category: NoteCategory.Trading,
        tags: ['trading', 'risk'],
        created: new Date(),
        modified: new Date(),
        backlinks: ['note-1'],
        outlinks: [],
      });

      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });
    });

    it('should find connected notes', () => {
      const connected = builder.getConnectedNotes('note-1');

      expect(connected).toHaveLength(1);
      expect(connected[0].id).toBe('note-2');
    });

    it('should find notes by tag', () => {
      const tradingNotes = builder.getNotesByTag('trading');

      expect(tradingNotes).toHaveLength(2);
      expect(tradingNotes.map(n => n.id)).toContain('note-1');
      expect(tradingNotes.map(n => n.id)).toContain('note-2');
    });

    it('should find notes by category', () => {
      builder.addNode({
        id: 'note-3',
        title: 'Learning Note',
        category: NoteCategory.Learning,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      const tradingNotes = builder.getNotesByCategory(NoteCategory.Trading);
      const learningNotes = builder.getNotesByCategory(NoteCategory.Learning);

      expect(tradingNotes).toHaveLength(2);
      expect(learningNotes).toHaveLength(1);
    });

    it('should calculate backlinks', () => {
      const backlinks = builder.getBacklinks('note-2');

      // note-1 links to note-2
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0].id).toBe('note-1');
    });
  });

  describe('Graph Persistence', () => {
    it('should serialize graph to JSON', () => {
      builder.addNode({
        id: 'note-1',
        title: 'Test',
        category: NoteCategory.Ideas,
        tags: ['test'],
        created: new Date('2026-05-03'),
        modified: new Date('2026-05-03'),
        backlinks: [],
        outlinks: [],
      });

      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });

      const json = builder.toJSON();

      expect(json).toContain('note-1');
      expect(json).toContain('Test');
      expect(typeof json).toBe('string');
      // Should be valid JSON
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should deserialize graph from JSON', () => {
      builder.addNode({
        id: 'note-1',
        title: 'Test',
        category: NoteCategory.Ideas,
        tags: ['test'],
        created: new Date('2026-05-03'),
        modified: new Date('2026-05-03'),
        backlinks: [],
        outlinks: [],
      });

      const json = builder.toJSON();
      const restored = GraphBuilder.fromJSON(json);

      expect(restored.hasNode('note-1')).toBe(true);
      expect(restored.getNode('note-1')?.title).toBe('Test');
    });

    it('should handle empty graph', () => {
      const emptyBuilder = new GraphBuilder();

      expect(emptyBuilder.getAllNodes()).toHaveLength(0);

      const json = emptyBuilder.toJSON();
      const restored = GraphBuilder.fromJSON(json);

      expect(restored.getAllNodes()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references', () => {
      builder.addNode({
        id: 'note-1',
        title: 'Note 1',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: ['note-2'],
        outlinks: ['note-2'],
      });

      builder.addNode({
        id: 'note-2',
        title: 'Note 2',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: ['note-1'],
        outlinks: ['note-1'],
      });

      builder.addEdge({ from: 'note-1', to: 'note-2', weight: 1, type: 'wikilink' });
      builder.addEdge({ from: 'note-2', to: 'note-1', weight: 1, type: 'wikilink' });

      // Should handle without infinite loops
      const connected1 = builder.getConnectedNotes('note-1');
      const connected2 = builder.getConnectedNotes('note-2');

      expect(connected1).toHaveLength(1);
      expect(connected2).toHaveLength(1);
    });

    it('should handle orphaned nodes', () => {
      builder.addNode({
        id: 'orphan',
        title: 'Orphan Note',
        category: NoteCategory.Ideas,
        tags: [],
        created: new Date(),
        modified: new Date(),
        backlinks: [],
        outlinks: [],
      });

      const connected = builder.getConnectedNotes('orphan');
      expect(connected).toHaveLength(0);

      // Orphan should still be in graph
      expect(builder.hasNode('orphan')).toBe(true);
    });
  });
});
