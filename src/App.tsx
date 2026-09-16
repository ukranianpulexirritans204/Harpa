// src/App.tsx
import React, { useState, useRef, useMemo } from 'react';
import { useBookStore } from './store/useBookStore';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import type { EBook, Chapter, ThemeName, FontStyle } from './types';
import {
  BookOpen,
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  ClipboardPaste,
  Layers,
  Edit3,
  Check,
  X,
  ClipboardCopy,
  FileText,
  Share2,
  PenLine,
  GripVertical,
  ChevronUp,
  ChevronDown,
  CornerDownRight,
  Search,
  Palette,
  Type,
  FolderPlus,
  AlertCircle
} from 'lucide-react';

const THEME_OPTIONS: { id: ThemeName; label: string; primary: string; accent: string }[] = [
  { id: 'old-photo', label: 'Old Photograph', primary: '#545333', accent: '#D9D7B6' },
  { id: 'desert-sand', label: 'Desert Sand', primary: '#FFF6EB', accent: '#D1A28C' },
  { id: 'royal-plum', label: 'Royal Plum', primary: '#5d0329', accent: '#eb91b6' },
  { id: 'nordic-frost', label: 'Nordic Frost', primary: '#29353C', accent: '#AAC7D8' },
  { id: 'rose-sand', label: 'Rose Sand', primary: '#3b2730', accent: '#cb638e' },
  { id: 'slate-olive', label: 'Slate Olive', primary: '#29353C', accent: '#878672' },
  { id: 'berry-frost', label: 'Berry Frost', primary: '#20272e', accent: '#b24472' },
  { id: 'antique-parchment', label: 'Parchment', primary: '#FDFBD4', accent: '#545333' },
];

const fallbackChapter: Chapter = {
  id: 'default-ch',
  title: 'Chapter 1: Overview',
  blocks: [],
};

const fallbackBook: EBook = {
  id: 'default-book',
  title: 'AI Synthesis Binder',
  author: 'Researcher',
  createdAt: new Date().toISOString(),
  chapters: [fallbackChapter],
};

export default function App() {
  const {
    projects = [fallbackBook],
    activeProjectId,
    activeChapterId,
    theme = 'nordic-frost',
    fontStyle = 'sans-modern',
    searchQuery = '',
    createProject,
    deleteProject,
    switchProject,
    setBookTitle,
    setAuthor,
    setActiveChapter,
    addChapter,
    deleteChapter,
    updateChapterTitle,
    updateChapterDescription,
    appendBlockToActiveChapter,
    deleteBlock,
    updateBlockContent,
    reorderBlocks,
    moveBlockToChapter,
    setTheme,
    setFontStyle,
    setSearchQuery,
    exportAsJson,
    importFromJson,
    importFromMarkdown,
    exportAsMarkdown,
    openNativeFile,
    copyRichText,
  } = useBookStore();

  const projectList = projects.length > 0 ? projects : [fallbackBook];
  const currentBook: EBook = projectList.find((p) => p.id === activeProjectId) || projectList[0] || fallbackBook;
  const activeChapter: Chapter = currentBook.chapters.find((c) => c.id === activeChapterId) || currentBook.chapters[0] || fallbackChapter;

  const [pasteInput, setPasteInput] = useState('');
  const [sourceTag, setSourceTag] = useState('Gemini');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'full'>('single');
  const [copiedRich, setCopiedRich] = useState(false);

  // In-place snippet editing
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Drag-and-drop state
  const [draggedRealIndex, setDraggedRealIndex] = useState<number | null>(null);

  // Book metadata edit state
  const [isEditingBookMeta, setIsEditingBookMeta] = useState(false);
  const [tempBookTitle, setTempBookTitle] = useState(currentBook.title);
  const [tempAuthor, setTempAuthor] = useState(currentBook.author);

  // Chapter metadata edit state
  const [isEditingChapterTitle, setIsEditingChapterTitle] = useState(false);
  const [tempChapterTitle, setTempChapterTitle] = useState('');
  const [tempChapterDesc, setTempChapterDesc] = useState('');

  // Delete project modal state
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();
  const matchesSearch = (raw: string) => !query || raw.toLowerCase().includes(query);

  const visibleActiveBlocks = useMemo(() => {
    return activeChapter.blocks
      .map((block, realIndex) => ({ block, realIndex }))
      .filter(({ block }) => matchesSearch(block.rawContent));
  }, [activeChapter.blocks, query]);

  const handleQuickAppend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pasteInput.trim()) return;
    appendBlockToActiveChapter(pasteInput, sourceTag);
    setPasteInput('');
  };

  const handleClipboardIngest = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) appendBlockToActiveChapter(text, sourceTag);
    } catch (err) {
      console.error('Clipboard access error:', err);
    }
  };

  const handleCopyFormatted = async () => {
    await copyRichText();
    setCopiedRich(true);
    setTimeout(() => setCopiedRich(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importFromJson(text);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importFromMarkdown(file.name, text);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const saveBookMeta = () => {
    if (tempBookTitle.trim()) setBookTitle(tempBookTitle.trim());
    if (tempAuthor.trim()) setAuthor(tempAuthor.trim());
    setIsEditingBookMeta(false);
  };

  const startEditingChapter = () => {
    setTempChapterTitle(activeChapter.title);
    setTempChapterDesc(activeChapter.description || '');
    setIsEditingChapterTitle(true);
  };

  const saveChapterMeta = () => {
    if (tempChapterTitle.trim()) {
      updateChapterTitle(activeChapter.id, tempChapterTitle.trim());
      updateChapterDescription(activeChapter.id, tempChapterDesc.trim());
    }
    setIsEditingChapterTitle(false);
  };

  const startEditingSnippet = (id: string, currentText: string) => {
    setEditingBlockId(id);
    setEditContent(currentText);
  };

  const saveSnippetEdit = (chapterId: string, blockId: string) => {
    updateBlockContent(chapterId, blockId, editContent);
    setEditingBlockId(null);
  };

  const handleDragStart = (realIndex: number) => {
    setDraggedRealIndex(realIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetRealIndex: number) => {
    if (draggedRealIndex === null || draggedRealIndex === targetRealIndex) return;
    reorderBlocks(activeChapter.id, draggedRealIndex, targetRealIndex);
    setDraggedRealIndex(null);
  };

  return (
    <div className={`theme-${theme} font-${fontStyle} flex h-screen w-screen print:h-auto print:w-full print:overflow-visible print:block bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden antialiased`}>
      {/* 1. Sidebar */}
      <aside className="no-print w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex flex-col justify-between shrink-0 shadow-lg select-none">
        <div>
          {/* Project Switcher Bar */}
          <div className="p-3 border-b border-[var(--border-subtle)] bg-black/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Project:</span>
              <select
                value={activeProjectId}
                onChange={(e) => switchProject(e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none truncate flex-1"
              >
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => createProject(`Project ${projectList.length + 1}`)}
              className="p-1.5 hover:bg-[var(--border-subtle)] rounded text-[var(--accent)] transition"
              title="Create New Project"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            {projectList.length > 1 && (
              <button
                onClick={() => setProjectToDelete(currentBook.id)}
                className="p-1.5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 rounded transition"
                title="Delete Current Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Editable Book Meta */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            {isEditingBookMeta ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempBookTitle}
                  onChange={(e) => setTempBookTitle(e.target.value)}
                  className="w-full text-xs font-semibold bg-[var(--bg-input)] border border-[var(--border-strong)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none"
                  placeholder="Book Title"
                />
                <input
                  type="text"
                  value={tempAuthor}
                  onChange={(e) => setTempAuthor(e.target.value)}
                  className="w-full text-[11px] bg-[var(--bg-input)] border border-[var(--border-strong)] rounded px-2 py-1 text-[var(--text-muted)] focus:outline-none"
                  placeholder="Author"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button onClick={() => setIsEditingBookMeta(false)} className="text-[var(--text-muted)] hover:opacity-100 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={saveBookMeta} className="text-[var(--accent)] hover:opacity-100 p-1">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempBookTitle(currentBook.title);
                  setTempAuthor(currentBook.author);
                  setIsEditingBookMeta(true);
                }}
                className="group flex items-center justify-between cursor-pointer rounded-lg p-1.5 -m-1.5 hover:bg-black/10 transition"
                title="Click to rename book/author"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-[var(--tag-bg)] text-[var(--accent)] rounded-lg border border-[var(--border-subtle)] shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-semibold text-sm tracking-wide truncate">{currentBook.title}</h1>
                    <p className="text-xs text-[var(--text-muted)] truncate">{currentBook.author} • {currentBook.chapters.length} Ch.</p>
                  </div>
                </div>
                <PenLine className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition shrink-0" />
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes, math, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg pl-8 pr-2.5 py-1.5 placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--border-strong)]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 text-[var(--text-muted)] hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Chapters List */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-360px)]">
            <div className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase px-2 py-1">
              Chapters
            </div>
            {currentBook.chapters.map((ch, idx) => {
              const isActive = ch.id === activeChapter.id && viewMode === 'single';
              const matchCount = query
                ? ch.blocks.filter((b) => matchesSearch(b.rawContent)).length
                : null;

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    setActiveChapter(ch.id);
                    setViewMode('single');
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-xs font-medium transition-all ${isActive
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-primary)]'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2" title={ch.title}>
                    <span className="text-[11px] font-mono opacity-60 shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {matchCount !== null && (
                      <span className="text-[10px] bg-[var(--tag-bg)] text-[var(--accent)] px-1.5 py-0.5 rounded font-mono">
                        {matchCount}
                      </span>
                    )}
                    {currentBook.chapters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChapter(ch.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity"
                        title="Delete chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Toolbar */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 bg-black/10">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newChapterTitle.trim()) return;
            addChapter(newChapterTitle);
            setNewChapterTitle('');
          }} className="flex gap-1.5">
            <input
              type="text"
              placeholder="New Chapter..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="w-full text-xs bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 placeholder:text-[var(--text-muted)]/60 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-[var(--bg-card)] hover:opacity-90 rounded-lg border border-[var(--border-subtle)] transition text-[var(--accent)]"
              title="Add Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.md,.txt"
            className="hidden"
          />

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => window.print()}
              className="col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleCopyFormatted}
              className="flex items-center justify-center gap-1 p-2 bg-[var(--bg-card)] hover:opacity-90 border border-[var(--border-subtle)] rounded-lg text-xs transition"
              title="Copy Rich Text for Docs"
            >
              {copiedRich ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedRich ? 'Done' : 'Docx'}</span>
            </button>
            <button
              onClick={() => exportAsMarkdown()}
              className="flex items-center justify-center gap-1 p-2 bg-[var(--bg-card)] hover:opacity-90 border border-[var(--border-subtle)] rounded-lg text-xs transition"
              title="Export Markdown (.md)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.MD</span>
            </button>
            <button
              onClick={() => exportAsJson()}
              className="flex items-center justify-center gap-1 p-2 bg-[var(--bg-card)] hover:opacity-90 border border-[var(--border-subtle)] rounded-lg text-xs transition"
              title="Backup Raw JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                  openNativeFile();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center justify-center gap-1 p-2 bg-[var(--bg-card)] hover:opacity-90 border border-[var(--border-subtle)] rounded-lg text-xs transition text-[var(--accent)]"
              title="Import .json backup or .md notes"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Workspace Main Pane */}
      <main className="flex-1 flex overflow-hidden print:h-auto print:w-full print:overflow-visible print:block">
        {/* Left Ingestion Pane */}
        <section className="no-print w-1/2 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-base)]">
          <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-sidebar)]/50">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fast Ingestion</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClipboardIngest}
                className="flex items-center gap-1 text-xs bg-[var(--bg-card)] hover:opacity-90 px-2.5 py-1 rounded border border-[var(--border-subtle)] transition"
              >
                <ClipboardCopy className="w-3 h-3 text-[var(--accent)]" />
                <span>Instant Ingest</span>
              </button>

              <select
                value={sourceTag}
                onChange={(e) => setSourceTag(e.target.value)}
                className="text-xs bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-2 py-1 focus:outline-none"
              >
                <option value="Gemini">Gemini</option>
                <option value="Claude">Claude</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="DeepSeek">DeepSeek</option>
                <option value="Paper">Paper / Notes</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleQuickAppend} className="flex-1 flex flex-col p-4 gap-3">
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickAppend();
                }
              }}
              placeholder="Paste raw AI formulas, code, derivations... (Ctrl + Enter to append)"
              className="flex-1 w-full p-3.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-strong)] resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                Appends to: <strong className="text-[var(--text-primary)]">{activeChapter.title}</strong>
              </span>
              <button
                type="submit"
                disabled={!pasteInput.trim()}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Append Entry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </section>

        {/* Right Live Preview Canvas */}
        <section className="flex-1 overflow-y-auto flex flex-col items-center print:h-auto print:w-full print:overflow-visible print:block print:p-0">
          {/* Top Control Bar */}
          <div className="no-print w-full max-w-3xl pt-5 px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] p-1 rounded-lg">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'single' ? 'bg-[var(--bg-card)] font-semibold shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:opacity-100'}`}
              >
                Active Chapter
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'full' ? 'bg-[var(--bg-card)] font-semibold shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:opacity-100'}`}
              >
                Complete Book View
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Typography Mode */}
              <div className="flex items-center gap-1 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] p-1 rounded-lg">
                <Type className="w-3 h-3 text-[var(--text-muted)] ml-1" />
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as FontStyle)}
                  className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none pr-1"
                >
                  <option value="sans-modern" className="text-black">Modern Sans</option>
                  <option value="serif-editorial" className="text-black">Editorial Serif</option>
                  <option value="mono-code" className="text-black">Clean Mono</option>
                </select>
              </div>

              {/* Theme Swatches */}
              <div className="flex items-center gap-1 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] p-1 rounded-lg">
                <Palette className="w-3 h-3 text-[var(--text-muted)] ml-1 mr-1" />
                {THEME_OPTIONS.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`w-4 h-4 rounded-full border transition-all ${theme === th.id ? 'scale-125 border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-black/30 hover:scale-110 opacity-70'
                      }`}
                    style={{ backgroundColor: th.accent }}
                    title={th.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Book Canvas Body */}
          <div id="book-export-canvas" className="w-full max-w-3xl p-8 sm:p-12 print:p-0 print:max-w-none">
            {/* VIEW MODE 1: ACTIVE CHAPTER */}
            {viewMode === 'single' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0">
                <div className="border-b border-[var(--border-subtle)] pb-6 mb-8 print:border-zinc-300">
                  <div className="no-print flex items-center gap-2 text-xs font-mono text-[var(--accent)] uppercase tracking-widest mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Current Section</span>
                  </div>

                  {isEditingChapterTitle ? (
                    <div className="space-y-3 mt-2">
                      <input
                        type="text"
                        value={tempChapterTitle}
                        onChange={(e) => setTempChapterTitle(e.target.value)}
                        className="w-full text-2xl font-bold bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-1.5 focus:outline-none"
                        placeholder="Chapter Title"
                      />
                      <input
                        type="text"
                        value={tempChapterDesc}
                        onChange={(e) => setTempChapterDesc(e.target.value)}
                        className="w-full text-xs text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-1.5 focus:outline-none"
                        placeholder="Optional chapter description..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveChapterMeta}
                          className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-contrast)] rounded text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingChapterTitle(false)}
                          className="px-3 py-1 text-xs text-[var(--text-muted)] hover:opacity-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={startEditingChapter}
                      className="group cursor-pointer rounded-lg -m-2 p-2 hover:bg-black/5 transition"
                      title="Click to edit chapter title and description"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold print:text-black">
                          {activeChapter.title}
                        </h2>
                        <Edit3 className="no-print w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      {activeChapter.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 print:text-zinc-600">
                          {activeChapter.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {activeChapter.blocks.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-[var(--border-subtle)] rounded-xl no-print">
                    <p className="text-xs text-[var(--text-muted)]">No content snippets appended to this chapter yet.</p>
                  </div>
                ) : visibleActiveBlocks.length === 0 && query ? (
                  <div className="text-center py-14 border border-dashed border-[var(--border-subtle)] rounded-xl no-print bg-black/5">
                    <p className="text-xs text-[var(--text-muted)]">
                      No snippets match "<strong className="text-[var(--text-primary)]">{searchQuery}</strong>" in this chapter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {visibleActiveBlocks.map(({ block, realIndex }) => {
                      const isEditing = editingBlockId === block.id;
                      const isFirst = realIndex === 0;
                      const isLast = realIndex === activeChapter.blocks.length - 1;

                      return (
                        <div
                          key={block.id}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(realIndex)}
                          className="entry-card group relative bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl p-5 print:bg-transparent print:border-none print:p-0 print:m-0 transition-colors"
                        >
                          {/* Card Controls Toolbar */}
                          <div className="no-print flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-3 border-b border-[var(--border-subtle)] pb-2 select-none">
                            <div className="flex items-center gap-2">
                              <div
                                draggable={!isEditing && !query}
                                onDragStart={() => handleDragStart(realIndex)}
                                className={`p-0.5 ${query ? 'opacity-20 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:opacity-100'}`}
                                title={query ? 'Reordering disabled during active search' : 'Drag to reorder snippet'}
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              <span className="bg-[var(--tag-bg)] text-[var(--text-primary)] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[10px]">
                                {block.sourceModel || 'AI'}
                              </span>

                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  disabled={isFirst || !!query}
                                  onClick={() => reorderBlocks(activeChapter.id, realIndex, realIndex - 1)}
                                  className="p-0.5 hover:opacity-100 disabled:opacity-20 transition"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast || !!query}
                                  onClick={() => reorderBlocks(activeChapter.id, realIndex, realIndex + 1)}
                                  className="p-0.5 hover:opacity-100 disabled:opacity-20 transition"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {currentBook.chapters.length > 1 && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <CornerDownRight className="w-3 h-3" />
                                  <select
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (e.target.value) moveBlockToChapter(activeChapter.id, e.target.value, block.id);
                                    }}
                                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] rounded px-1.5 py-0.5 focus:outline-none"
                                  >
                                    <option value="" disabled>Move to...</option>
                                    {currentBook.chapters.filter((c) => c.id !== activeChapter.id).map((c) => (
                                      <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {isEditing ? (
                                <>
                                  <button onClick={() => saveSnippetEdit(activeChapter.id, block.id)} className="text-[var(--accent)] hover:opacity-100 p-0.5" title="Save">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingBlockId(null)} className="opacity-70 hover:opacity-100 p-0.5" title="Cancel">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => startEditingSnippet(block.id, block.rawContent)} className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 transition" title="Edit snippet">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => deleteBlock(activeChapter.id, block.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 transition" title="Delete snippet">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Snippet Content */}
                          <div className="chapter-content">
                            {isEditing ? (
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-44 p-3 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg text-xs font-mono focus:outline-none"
                              />
                            ) : (
                              <MarkdownRenderer content={block.rawContent} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: COMPLETE BOOK COMPILATION */}
            {viewMode === 'full' && (
              <div className="space-y-12 print:space-y-0">
                {/* Cover Page */}
                <div className="hidden print:flex flex-col justify-center items-center h-[90vh] print:break-after-page text-center">
                  <div className="border-t-2 border-b-2 border-black py-12 w-full max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight text-black mb-3">{currentBook.title}</h1>
                    <p className="text-sm uppercase tracking-widest text-zinc-600 font-mono">Synthesized Research Reference</p>
                  </div>
                  <div className="mt-16 text-sm text-zinc-600">
                    <p className="font-semibold text-black">{currentBook.author}</p>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">Compiled on {new Date(currentBook.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Table of Contents */}
                <div className="hidden print:block print:break-after-page py-8">
                  <h2 className="text-xl font-bold uppercase tracking-wider border-b-2 border-black pb-3 mb-6">
                    Table of Contents
                  </h2>
                  <div className="space-y-3">
                    {currentBook.chapters.map((ch, idx) => (
                      <div key={ch.id} className="flex items-baseline justify-between border-b border-dotted border-zinc-300 pb-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-zinc-500 font-semibold">
                            Chapter {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="text-sm font-medium text-zinc-900">{ch.title}</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">{ch.blocks.length} sections</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapters Compilation */}
                {currentBook.chapters.map((ch, idx) => {
                  const filteredBlocks = ch.blocks.filter((b) => matchesSearch(b.rawContent));
                  if (query && filteredBlocks.length === 0) return null;

                  return (
                    <div
                      key={ch.id}
                      className="print:break-before-page bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0 mb-8"
                    >
                      <div className="border-b border-[var(--border-subtle)] pb-4 mb-6 print:border-zinc-300">
                        <span className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider">
                          Chapter {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h2 className="text-2xl font-bold mt-1 print:text-black">
                          {ch.title}
                        </h2>
                        {ch.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 print:text-zinc-600">{ch.description}</p>
                        )}
                      </div>

                      <div className="space-y-6">
                        {filteredBlocks.map((block) => (
                          <div key={block.id} className="entry-card chapter-content bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-xl p-5 print:bg-transparent print:border-none print:p-0">
                            <MarkdownRenderer content={block.rawContent} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. Delete Project Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-semibold text-sm">Delete Project?</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-[var(--text-primary)]">"{currentBook.title}"</strong>? This will remove all of its chapters and notes permanently.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:opacity-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (projectToDelete) {
                    deleteProject(projectToDelete);
                    setProjectToDelete(null);
                  }
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}