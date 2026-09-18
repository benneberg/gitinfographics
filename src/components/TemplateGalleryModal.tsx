import React, { useState, useMemo, useRef } from 'react';
import {
  LayoutTemplate,
  X,
  Search,
  Check,
  Download,
  Upload,
  Plus,
  Trash2,
  Sliders,
  Palette,
  Layers,
  Sparkles,
  Puzzle,
  ExternalLink,
  Shield,
  Tag
} from 'lucide-react';
import { CustomTemplate, TEMPLATE_JSON_SCHEMA } from '../engine/templateSchema';
import { TemplateManager, COMMUNITY_TEMPLATES } from '../engine/templates';
import { PluginRegistry, GitInfoGraphicsPlugin } from '../engine/plugins';
import { THEMES } from '../engine/themes';
import { VisualDensity } from '../engine/types';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: CustomTemplate) => void;
  currentTheme: string;
  currentDensity: VisualDensity;
  currentVariants: Record<string, any>;
  customTitle: string;
  customSubtitle: string;
  showQR: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentTheme,
  currentDensity,
  currentVariants,
  customTitle,
  customSubtitle,
  showQR,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'custom' | 'plugins'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() =>
    TemplateManager.getCustomTemplates()
  );
  const [plugins, setPlugins] = useState<GitInfoGraphicsPlugin[]>(() =>
    PluginRegistry.getPlugins()
  );

  // New template creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateAuthor, setNewTemplateAuthor] = useState('');
  const [newTemplateTags, setNewTemplateTags] = useState('Custom, Web');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCustomTemplates = () => {
    setCustomTemplates(TemplateManager.getCustomTemplates());
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    COMMUNITY_TEMPLATES.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    customTemplates.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [customTemplates]);

  const filteredCommunity = useMemo(() => {
    return COMMUNITY_TEMPLATES.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === 'All' || t.tags.includes(selectedTag);
      return matchSearch && matchTag;
    });
  }, [searchQuery, selectedTag]);

  const filteredCustom = useMemo(() => {
    return customTemplates.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === 'All' || t.tags.includes(selectedTag);
      return matchSearch && matchTag;
    });
  }, [customTemplates, searchQuery, selectedTag]);

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      onShowToast('Please enter a template name', 'error');
      return;
    }

    const tags = newTemplateTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const template: CustomTemplate = {
      id: 'custom-' + Date.now().toString(36),
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || 'Custom user layout preset.',
      author: newTemplateAuthor.trim() || 'User',
      version: '1.0.0',
      tags: tags.length > 0 ? tags : ['Custom'],
      theme: currentTheme,
      density: currentDensity,
      layout: 'desktop',
      sectionVariants: currentVariants,
      customTitle: customTitle || undefined,
      customSubtitle: customSubtitle || undefined,
      showQR
    };

    const res = TemplateManager.saveCustomTemplate(template);
    if (res.success) {
      onShowToast(`Saved template "${template.name}"`, 'success');
      refreshCustomTemplates();
      setShowCreateForm(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
    } else {
      onShowToast(res.error || 'Failed to save template', 'error');
    }
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Delete custom template "${name}"?`)) {
      TemplateManager.deleteCustomTemplate(id);
      refreshCustomTemplates();
      onShowToast(`Deleted template "${name}"`, 'info');
    }
  };

  const handleDownloadTemplate = (template: CustomTemplate) => {
    const json = TemplateManager.exportTemplateToJson(template);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported "${template.name}" JSON schema`, 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = TemplateManager.importTemplateFromJson(content);
      if (res.success && res.template) {
        onShowToast(`Successfully imported "${res.template.name}"!`, 'success');
        refreshCustomTemplates();
        setActiveTab('custom');
      } else {
        onShowToast(res.error || 'Invalid template JSON schema', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleTogglePlugin = (pluginId: string) => {
    const newState = PluginRegistry.togglePlugin(pluginId);
    setPlugins([...PluginRegistry.getPlugins()]);
    onShowToast(`Plugin ${newState ? 'enabled' : 'disabled'}`, 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-2xs">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Template Gallery & Custom Schemas
              </h2>
              <p className="text-xs text-stone-500">
                Curated layouts, shareable JSON templates, and extensible plugins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar & Search */}
        <div className="px-5 py-3 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Community ({COMMUNITY_TEMPLATES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>My Templates ({customTemplates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('plugins')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'plugins'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Plugins ({plugins.length})</span>
            </button>
          </div>

          {activeTab !== 'plugins' && (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              {activeTab === 'custom' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1 shadow-2xs"
                    title="Import template from JSON schema file"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Import</span>
                  </button>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Current</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tag Filters (for template tabs) */}
        {activeTab !== 'plugins' && (
          <div className="px-5 py-2 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto bg-stone-50/40 text-xs">
            <span className="text-stone-400 font-medium text-[11px] mr-1">Tags:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  selectedTag === tag
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Create Custom Template Modal/Drawer */}
          {showCreateForm && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-stone-700" />
                  Save Current Studio Configuration as Template
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="e.g. My Tech Showcase"
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Author / Team
                    </label>
                    <input
                      type="text"
                      value={newTemplateAuthor}
                      onChange={(e) => setNewTemplateAuthor(e.target.value)}
                      placeholder="e.g. Developer Name"
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="Brief description of this layout archetype..."
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTemplateTags}
                    onChange={(e) => setNewTemplateTags(e.target.value)}
                    placeholder="SaaS, Mobile, Benchmark..."
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 shadow-2xs"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 1: Community Curated Templates */}
          {activeTab === 'community' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCommunity.map((template) => {
                const themeObj = THEMES[template.theme] || THEMES['scandi-minimal'];
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-xs bg-white transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-stone-900">
                            {template.name}
                          </span>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                            v{template.version}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-stone-300"
                            style={{ backgroundColor: themeObj.accent }}
                            title={`Primary Theme Color: ${themeObj.name}`}
                          />
                          <span className="text-[11px] font-medium text-stone-500">
                            {themeObj.name}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                        {template.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[10px] bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-medium px-2 py-0.5 rounded-full capitalize">
                          {template.density} density
                        </span>
                        {template.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] bg-stone-50 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-[11px] text-stone-400">
                        By {template.author}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadTemplate(template)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                          title="Download Template JSON Schema"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onApplyTemplate(template);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: My Custom Templates */}
          {activeTab === 'custom' && (
            <div>
              {filteredCustom.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-xl">
                  <LayoutTemplate className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-stone-700 mb-1">
                    No custom templates yet
                  </p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                    Save your active styling, variants, and density as a reusable JSON template or import one from a file.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 shadow-2xs"
                    >
                      Save Current Setup
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-50"
                    >
                      Import .json
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredCustom.map((template) => {
                    const themeObj = THEMES[template.theme] || THEMES['scandi-minimal'];
                    return (
                      <div
                        key={template.id}
                        className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm text-stone-900">
                              {template.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 rounded-full border border-stone-300"
                                style={{ backgroundColor: themeObj.accent }}
                              />
                              <span className="text-[11px] font-medium text-stone-500">
                                {themeObj.name}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                            {template.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-[10px] bg-blue-50 border border-blue-200/80 text-blue-800 font-medium px-2 py-0.5 rounded-full capitalize">
                              {template.density} density
                            </span>
                            {template.tags.map((tg) => (
                              <span
                                key={tg}
                                className="text-[10px] bg-stone-50 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full"
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <button
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete custom template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadTemplate(template)}
                              className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-md transition-colors"
                              title="Download JSON Schema"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                onApplyTemplate(template);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Extensible Plugin Registry */}
          {activeTab === 'plugins' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                <Puzzle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-stone-900">
                    Extensible Plugin Architecture
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Plugins automatically mine specialized telemetry (Docker container sizes, NPM package stats, P99 latency benchmarks, security audits) and enrich infographic sections during compilation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                        <Puzzle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-stone-900">
                            {plugin.name}
                          </span>
                          <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                            v{plugin.version}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {plugin.description}
                        </p>
                        <span className="text-[10px] text-stone-400 mt-1 inline-block">
                          Author: {plugin.author}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePlugin(plugin.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                        plugin.enabled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {plugin.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px]">JSON Schema: Draft-07</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
