// src/types.ts

export type ThemeName =
    | 'old-photo'
    | 'desert-sand'
    | 'royal-plum'
    | 'nordic-frost'
    | 'rose-sand'
    | 'slate-olive'
    | 'berry-frost'
    | 'antique-parchment';

export type FontStyle = 'sans-modern' | 'serif-editorial' | 'mono-code';

export interface ContentBlock {
    id: string;
    rawContent: string;
    sourceModel?: string;
    createdAt: string;
}

export interface Chapter {
    id: string;
    title: string;
    description?: string;
    blocks: ContentBlock[];
}

export interface EBook {
    id: string;
    title: string;
    author: string;
    createdAt: string;
    chapters: Chapter[];
}