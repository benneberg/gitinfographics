import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Search,
  Clock,
  Download,
  Upload,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ProjectStorage, Project, GenerationRecord } from '../storage/ProjectStorage';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storage: ProjectStorage;
  currentProjectId?: string;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  storage,
  currentProjectId,
  onSelectProject,
  onCreateProject
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedHistoryProject, setSelectedHistoryProject] = useState<Project | null>(null);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);

  const refreshList = () => {
    if (searchQuery.trim()) {
      setProjects(storage.searchProjects(searchQuery.trim()));
    } else {
      setProjects(storage.getAllProjects());
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName('');
    refreshList();
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.duplicateProject(id);
    refreshList();
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      storage.deleteProject(id);
      refreshList();
      if (selectedHistoryProject?.id === id) {
        setSelectedHistoryProject(null);
      }
    }
  };

  const handleExport = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const json = storage.exportProject(id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-project.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    const imported = storage.importProject(importJson.trim());
    if (imported) {
      setImportJson('');
      setShowImport(false);
      refreshList();
      onSelectProject(imported);
      onClose();
    } else {
      alert('Invalid project JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = storage.importProject(content);
        if (imported) {
          refreshList();
          onSelectProject(imported);
          onClose();
        } else {
          alert('Failed to parse project file');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="projects-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-stone-200/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="projects-modal-title" className="text-sm font-semibold text-stone-900">
                Project Management
              </h2>
              <p className="text-xs text-stone-500">Save, duplicate, import &amp; switch between repositories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close projects modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar: Create & Search */}
        <div className="p-4 border-b border-stone-200/80 bg-white flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name or content..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition-colors"
            />
          </div>

          <form onSubmit={handleCreate} className="flex gap-1.5">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name..."
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white w-40"
            />
            <button
              type="submit"
              disabled={!newProjectName.trim()}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

        {/* Optional Import Section */}
        {showImport && (
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800">Import Project JSON</span>
              <label className="cursor-pointer text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-md px-2 py-1 shadow-2xs">
                Browse file (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <form onSubmit={handleImportSubmit} className="flex flex-col gap-2">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste exported project JSON here..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importJson.trim()}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-md text-xs font-medium"
                >
                  Import Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Project List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {projects.length === 0 ? (
            <div className="text-center py-10 text-stone-400 flex flex-col items-center gap-2">
              <FolderOpen className="w-8 h-8 stroke-1" />
              <p className="text-xs">No saved projects found. Create one above to get started!</p>
            </div>
          ) : (
            projects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200/80 text-stone-900'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs truncate">{p.name}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] flex items-center gap-3 ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                      <span>Source: {p.source.type}</span>
                      <span>•</span>
                      <span>Format: {p.settings.format?.name || 'Desktop'}</span>
                      <span>•</span>
                      <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(p.id, e)}
                      title="Duplicate project"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCurrent
                          ? 'text-stone-300 hover:text-white hover:bg-white/10'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExport(p.id, p.name, e)}
                      title="Export project JSON"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCurrent
                          ? 'text-stone-300 hover:text-white hover:bg-white/10'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(p.id, p.name, e)}
                      title="Delete project"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCurrent
                          ? 'text-rose-300 hover:text-rose-100 hover:bg-white/10'
                          : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-between text-xs text-stone-500">
          <span>{projects.length} project{projects.length === 1 ? '' : 's'} in LocalStorage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
