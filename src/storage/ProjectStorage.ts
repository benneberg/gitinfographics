// src/storage/ProjectStorage.ts

import type { ExportFormat } from '../export/CanvasExporter';
import type { Theme } from '../renderer/themes/ThemeManager';

export interface GenerationRecord {
  id: string;
  timestamp: number;
  svgContent: string;
  format: ExportFormat;
  themeId: string;
  sourceHash: string;
  metadata: {
    duration: number;
    sectionsCount: number;
    metricsCount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: {
    type: 'github' | 'url' | 'text';
    url?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  settings: {
    format: ExportFormat;
    themeId: string;
    customSettings?: Record<string, any>;
  };
  generations: GenerationRecord[];
}

class MemoryStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, val: string): void {
    this.store[key] = val;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
}

const memoryStore = new MemoryStorage();

function getStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__gig_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {}
  return memoryStore;
}

export class ProjectStorage {
  private static readonly STORAGE_KEY = 'gitinfographics-projects';
  private static readonly MAX_GENERATIONS_PER_PROJECT = 20;

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    const storage = getStorage();
    const data = storage.getItem(ProjectStorage.STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse projects:', error);
      return [];
    }
  }

  /**
   * Save all projects
   */
  private saveProjects(projects: Project[]): void {
    getStorage().setItem(ProjectStorage.STORAGE_KEY, JSON.stringify(projects));
  }

  /**
   * Create a new project
   */
  createProject(name: string, source: Project['source']): Project {
    const projects = this.getAllProjects();
    
    const newProject: Project = {
      id: this.generateId(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source,
      settings: {
        format: { name: 'GitHub README (Desktop)', width: 880, height: 'auto', description: '' },
        themeId: 'scandinavian-light',
      },
      generations: [],
    };

    projects.push(newProject);
    this.saveProjects(projects);
    
    return newProject;
  }

  /**
   * Get a project by ID
   */
  getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find((p) => p.id === id) || null;
  }

  /**
   * Update a project
   */
  updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveProjects(projects);
    return projects[index];
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) return false;

    this.saveProjects(filtered);
    return true;
  }

  /**
   * Duplicate a project
   */
  duplicateProject(id: string): Project | null {
    const project = this.getProject(id);
    if (!project) return null;

    const duplicate: Project = {
      ...project,
      id: this.generateId(),
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      generations: [], // Don't copy generations
    };

    const projects = this.getAllProjects();
    projects.push(duplicate);
    this.saveProjects(projects);

    return duplicate;
  }

  /**
   * Add a generation record to a project
   */
  addGeneration(projectId: string, generation: Omit<GenerationRecord, 'id' | 'timestamp'>): GenerationRecord | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const newGeneration: GenerationRecord = {
      ...generation,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // Add to beginning of array and limit to max
    project.generations.unshift(newGeneration);
    if (project.generations.length > ProjectStorage.MAX_GENERATIONS_PER_PROJECT) {
      project.generations = project.generations.slice(0, ProjectStorage.MAX_GENERATIONS_PER_PROJECT);
    }

    this.updateProject(projectId, { generations: project.generations });
    return newGeneration;
  }

  /**
   * Get generation history for a project
   */
  getGenerations(projectId: string): GenerationRecord[] {
    const project = this.getProject(projectId);
    return project?.generations || [];
  }

  /**
   * Export project as JSON
   */
  exportProject(projectId: string): string | null {
    const project = this.getProject(projectId);
    if (!project) return null;
    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project from JSON
   */
  importProject(json: string): Project | null {
    try {
      const project: Project = JSON.parse(json);
      
      // Validate required fields
      if (!project.id || !project.name || !project.source) {
        throw new Error('Invalid project structure');
      }

      // Generate new ID to avoid conflicts
      project.id = this.generateId();
      project.createdAt = Date.now();
      project.updatedAt = Date.now();

      const projects = this.getAllProjects();
      projects.push(project);
      this.saveProjects(projects);

      return project;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  /**
   * Search projects
   */
  searchProjects(query: string): Project[] {
    const projects = this.getAllProjects();
    const lowerQuery = query.toLowerCase();

    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.source.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all projects (for testing)
   */
  clearAll(): void {
    getStorage().removeItem(ProjectStorage.STORAGE_KEY);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get storage stats
   */
  getStats(): {
    totalProjects: number;
    totalGenerations: number;
    storageUsed: number;
  } {
    const projects = this.getAllProjects();
    const totalGenerations = projects.reduce((acc, p) => acc + p.generations.length, 0);
    
    let storageUsed = 0;
    try {
      const data = getStorage().getItem(ProjectStorage.STORAGE_KEY) || '';
      storageUsed = new Blob([data]).size;
    } catch {}

    return {
      totalProjects: projects.length,
      totalGenerations,
      storageUsed,
    };
  }
}

export default ProjectStorage;
