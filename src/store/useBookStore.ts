// src/store/useBookStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EBook, Chapter, ContentBlock, ThemeName, FontStyle } from '../types';

const defaultChapter: Chapter = {
    id: 'default-ch-1',
    title: 'Chapter 1: Mathematical Foundations',
    description: 'Derivations, models, and architecture notes.',
    blocks: [],
};

const defaultBook: EBook = {
    id: 'default-book-1',
    title: 'AI Synthesis Binder',
    author: 'Researcher',
    createdAt: new Date().toISOString(),
    chapters: [defaultChapter],
};

interface BookStoreState {
    projects: EBook[];
    activeProjectId: string;
    activeChapterId: string;
    theme: ThemeName;
    fontStyle: FontStyle;
    searchQuery: string;

    // Project Actions
    createProject: (title: string) => void;
    deleteProject: (id: string) => void;
    switchProject: (id: string) => void;
    setBookTitle: (title: string) => void;
    setAuthor: (author: string) => void;

    // Chapter Actions
    setActiveChapter: (chapterId: string) => void;
    addChapter: (title: string) => void;
    deleteChapter: (chapterId: string) => void;
    updateChapterTitle: (chapterId: string, title: string) => void;
    updateChapterDescription: (chapterId: string, description: string) => void;

    // Block Actions
    appendBlockToActiveChapter: (rawContent: string, sourceModel?: string) => void;
    deleteBlock: (chapterId: string, blockId: string) => void;
    updateBlockContent: (chapterId: string, blockId: string, content: string) => void;
    reorderBlocks: (chapterId: string, fromIndex: number, toIndex: number) => void;
    moveBlockToChapter: (sourceChapterId: string, targetChapterId: string, blockId: string) => void;

    // Settings & Search Actions
    setTheme: (theme: ThemeName) => void;
    setFontStyle: (fontStyle: FontStyle) => void;
    setSearchQuery: (query: string) => void;

    // Export & Ingestion Actions
    exportAsJson: () => void;
    importFromJson: (jsonStr: string) => void;
    exportAsMarkdown: () => void;
    importFromMarkdown: (filename: string, content: string) => void;
    openNativeFile: () => Promise<void>;
    copyRichText: () => Promise<void>;
}

export const useBookStore = create<BookStoreState>()(
    persist(
        (set, get) => ({
            projects: [defaultBook],
            activeProjectId: defaultBook.id,
            activeChapterId: defaultChapter.id,
            theme: 'nordic-frost',
            fontStyle: 'sans-modern',
            searchQuery: '',

            createProject: (title) => {
                const newProject: EBook = {
                    id: `book-${Date.now()}`,
                    title,
                    author: 'Researcher',
                    createdAt: new Date().toISOString(),
                    chapters: [
                        {
                            id: `ch-${Date.now()}`,
                            title: 'Chapter 1: Overview',
                            description: '',
                            blocks: [],
                        },
                    ],
                };

                set((state) => ({
                    projects: [...state.projects, newProject],
                    activeProjectId: newProject.id,
                    activeChapterId: newProject.chapters[0].id,
                }));
            },

            deleteProject: (id) => {
                const { projects, activeProjectId } = get();
                if (projects.length <= 1) return;

                const remaining = projects.filter((p) => p.id !== id);
                const nextActive = activeProjectId === id ? remaining[0] : null;

                set({
                    projects: remaining,
                    ...(nextActive && {
                        activeProjectId: nextActive.id,
                        activeChapterId: nextActive.chapters[0]?.id || '',
                    }),
                });
            },

            switchProject: (id) => {
                const project = get().projects.find((p) => p.id === id);
                if (!project) return;
                set({
                    activeProjectId: project.id,
                    activeChapterId: project.chapters[0]?.id || '',
                    searchQuery: '',
                });
            },

            setBookTitle: (title) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === state.activeProjectId ? { ...p, title } : p
                    ),
                }));
            },

            setAuthor: (author) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === state.activeProjectId ? { ...p, author } : p
                    ),
                }));
            },

            setActiveChapter: (chapterId) => {
                set({ activeChapterId: chapterId });
            },

            addChapter: (title) => {
                const newChapter: Chapter = {
                    id: `ch-${Date.now()}`,
                    title,
                    description: '',
                    blocks: [],
                };

                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return { ...p, chapters: [...p.chapters, newChapter] };
                    }),
                    activeChapterId: newChapter.id,
                }));
            },

            deleteChapter: (chapterId) => {
                set((state) => {
                    const project = state.projects.find((p) => p.id === state.activeProjectId);
                    if (!project || project.chapters.length <= 1) return state;

                    const updatedChapters = project.chapters.filter((c) => c.id !== chapterId);
                    const nextActive =
                        state.activeChapterId === chapterId
                            ? updatedChapters[0].id
                            : state.activeChapterId;

                    return {
                        projects: state.projects.map((p) =>
                            p.id === state.activeProjectId ? { ...p, chapters: updatedChapters } : p
                        ),
                        activeChapterId: nextActive,
                    };
                });
            },

            updateChapterTitle: (chapterId, title) => {
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) =>
                                c.id === chapterId ? { ...c, title } : c
                            ),
                        };
                    }),
                }));
            },

            updateChapterDescription: (chapterId, description) => {
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) =>
                                c.id === chapterId ? { ...c, description } : c
                            ),
                        };
                    }),
                }));
            },

            appendBlockToActiveChapter: (rawContent, sourceModel = 'Gemini') => {
                const newBlock: ContentBlock = {
                    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    rawContent,
                    sourceModel,
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) => {
                                if (c.id !== state.activeChapterId) return c;
                                return { ...c, blocks: [...c.blocks, newBlock] };
                            }),
                        };
                    }),
                }));
            },

            deleteBlock: (chapterId, blockId) => {
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) => {
                                if (c.id !== chapterId) return c;
                                return {
                                    ...c,
                                    blocks: c.blocks.filter((b) => b.id !== blockId),
                                };
                            }),
                        };
                    }),
                }));
            },

            updateBlockContent: (chapterId, blockId, content) => {
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) => {
                                if (c.id !== chapterId) return c;
                                return {
                                    ...c,
                                    blocks: c.blocks.map((b) =>
                                        b.id === blockId ? { ...b, rawContent: content } : b
                                    ),
                                };
                            }),
                        };
                    }),
                }));
            },

            reorderBlocks: (chapterId, fromIndex, toIndex) => {
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return {
                            ...p,
                            chapters: p.chapters.map((c) => {
                                if (c.id !== chapterId) return c;
                                const nextBlocks = [...c.blocks];
                                const [moved] = nextBlocks.splice(fromIndex, 1);
                                nextBlocks.splice(toIndex, 0, moved);
                                return { ...c, blocks: nextBlocks };
                            }),
                        };
                    }),
                }));
            },

            moveBlockToChapter: (sourceChapterId, targetChapterId, blockId) => {
                set((state) => {
                    const project = state.projects.find((p) => p.id === state.activeProjectId);
                    if (!project) return state;

                    const sourceChapter = project.chapters.find((c) => c.id === sourceChapterId);
                    const blockToMove = sourceChapter?.blocks.find((b) => b.id === blockId);
                    if (!blockToMove) return state;

                    return {
                        projects: state.projects.map((p) => {
                            if (p.id !== state.activeProjectId) return p;
                            return {
                                ...p,
                                chapters: p.chapters.map((c) => {
                                    if (c.id === sourceChapterId) {
                                        return {
                                            ...c,
                                            blocks: c.blocks.filter((b) => b.id !== blockId),
                                        };
                                    }
                                    if (c.id === targetChapterId) {
                                        return {
                                            ...c,
                                            blocks: [...c.blocks, blockToMove],
                                        };
                                    }
                                    return c;
                                }),
                            };
                        }),
                    };
                });
            },

            setTheme: (theme) => set({ theme }),
            setFontStyle: (fontStyle) => set({ fontStyle }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            exportAsJson: () => {
                const { projects, activeProjectId } = get();
                const activeProject = projects.find((p) => p.id === activeProjectId);
                if (!activeProject) return;

                const blob = new Blob([JSON.stringify(activeProject, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activeProject.title.replace(/\s+/g, '_')}_backup.json`;
                a.click();
                URL.revokeObjectURL(url);
            },

            importFromJson: (jsonStr) => {
                try {
                    const parsed = JSON.parse(jsonStr) as EBook;
                    if (!parsed.id || !Array.isArray(parsed.chapters)) {
                        throw new Error('Invalid project structure');
                    }
                    parsed.id = `imported-${Date.now()}`;

                    set((state) => ({
                        projects: [...state.projects, parsed],
                        activeProjectId: parsed.id,
                        activeChapterId: parsed.chapters[0]?.id || '',
                    }));
                } catch (err) {
                    console.error('Failed to parse imported JSON:', err);
                }
            },

            exportAsMarkdown: () => {
                const { projects, activeProjectId } = get();
                const activeProject = projects.find((p) => p.id === activeProjectId);
                if (!activeProject) return;

                let markdown = `# ${activeProject.title}\n*Author: ${activeProject.author}*\n\n---\n\n`;

                activeProject.chapters.forEach((ch, idx) => {
                    markdown += `## Chapter ${idx + 1}: ${ch.title}\n`;
                    if (ch.description) markdown += `*${ch.description}*\n\n`;
                    ch.blocks.forEach((b) => {
                        markdown += `${b.rawContent}\n\n`;
                    });
                    markdown += `---\n\n`;
                });

                const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activeProject.title.replace(/\s+/g, '_')}.md`;
                a.click();
                URL.revokeObjectURL(url);
            },

            importFromMarkdown: (filename, content) => {
                const title = filename.replace(/\.(md|txt)$/i, '');
                const newChapter: Chapter = {
                    id: `ch-${Date.now()}`,
                    title: title || 'Imported Notes',
                    description: `Imported from ${filename}`,
                    blocks: [
                        {
                            id: `block-${Date.now()}`,
                            rawContent: content,
                            sourceModel: 'Paper',
                            createdAt: new Date().toISOString(),
                        },
                    ],
                };

                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== state.activeProjectId) return p;
                        return { ...p, chapters: [...p.chapters, newChapter] };
                    }),
                    activeChapterId: newChapter.id,
                }));
            },

            openNativeFile: async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json,.md,.txt';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    if (file.name.endsWith('.json')) {
                        reader.onload = (event) => {
                            const text = event.target?.result as string;
                            if (text) get().importFromJson(text);
                        };
                        reader.readAsText(file);
                    } else {
                        reader.onload = (event) => {
                            const text = event.target?.result as string;
                            if (text) get().importFromMarkdown(file.name, text);
                        };
                        reader.readAsText(file);
                    }
                };
                input.click();
            },

            copyRichText: async () => {
                const el = document.getElementById('book-export-canvas');
                if (!el) return;

                try {
                    const type = 'text/html';
                    const blob = new Blob([el.innerHTML], { type });
                    const data = [new ClipboardItem({ [type]: blob })];
                    await navigator.clipboard.write(data);
                } catch {
                    await navigator.clipboard.writeText(el.innerText);
                }
            },
        }),
        {
            name: 'harpa-synthesis-binder-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                projects: state.projects,
                activeProjectId: state.activeProjectId,
                activeChapterId: state.activeChapterId,
                theme: state.theme,
                fontStyle: state.fontStyle,
            }),
        }
    )
);