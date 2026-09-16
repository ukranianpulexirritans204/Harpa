// src/components/MarkdownRenderer.tsx
import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import { Mermaid } from './Mermaid';

interface Props {
    content: string;
}

const extractText = (node: React.ReactNode): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node) && node.props && (node.props as any).children) {
        return extractText((node.props as any).children);
    }
    return '';
};

const CodeBlock = ({ className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const textContent = extractText(children).replace(/\n$/, '');

    if (lang === 'mermaid') {
        return <Mermaid chart={textContent} />;
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error('Failed to copy code block:', err);
        }
    };

    const isInline = !className && !textContent.includes('\n');

    if (isInline) {
        return (
            <code
                className="px-1.5 py-0.5 rounded font-mono text-xs bg-[var(--bg-sidebar)] text-[var(--accent)] border border-[var(--border-subtle)] font-medium"
                {...props}
            >
                {children}
            </code>
        );
    }

    return (
        <div className="code-block-card my-4 rounded-lg border border-[#333333] bg-[#1e1e1e] print:border-zinc-300 print:my-3 print:break-inside-avoid print:static print:overflow-visible">
            {/* Code Header Bar */}
            <div className="no-print flex items-center justify-between px-3.5 py-1.5 bg-[#171717] border-b border-[#2e2e2e] text-[11px] font-mono select-none">
                <span className="uppercase font-semibold tracking-wider text-[var(--accent)]">
                    {lang || 'code'}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#2e2e2e] text-zinc-400 hover:text-zinc-200 transition"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Body */}
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono bg-[#1e1e1e] text-[#d4d4d4] print:overflow-visible print:p-3 print:break-inside-avoid print:static">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

const BaseMarkdownRenderer: React.FC<Props> = ({ content }) => {
    return (
        <div className="markdown-body w-full max-w-none text-[var(--text-primary)] leading-relaxed space-y-3 print:space-y-2">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                    [
                        rehypeKatex,
                        {
                            throwOnError: false, // Prevents canvas crash on incomplete LaTeX
                            errorColor: '#ef4444',
                        },
                    ],
                    rehypeHighlight,
                ]}
                components={{
                    pre: ({ children }) => <>{children}</>,
                    code: CodeBlock,
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold border-b border-[var(--border-subtle)] pb-2 mt-6 mb-3 print:mt-4 print:mb-2 print:text-black">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-bold border-b border-[var(--border-subtle)]/60 pb-1 mt-5 mb-2 print:mt-3 print:mb-1 print:text-black">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mt-4 mb-1.5 print:mt-2 print:text-black">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-xs leading-relaxed opacity-90 my-2 print:my-1 print:text-zinc-800">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-2 text-xs pl-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-2 text-xs pl-2">
                            {children}
                        </ol>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-3 italic opacity-85 text-xs print:border-l-2 print:border-zinc-500 print:text-zinc-800">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <hr className="border-t border-[var(--border-subtle)] my-6 print:my-4 print:border-zinc-300" />
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            loading="lazy"
                            className="max-w-full h-auto rounded-lg border border-[var(--border-subtle)] my-3 print:border-zinc-300"
                        />
                    ),
                    input: ({ type, checked }) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mr-2 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-0 cursor-default"
                                />
                            );
                        }
                        return null;
                    },
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-3 print:overflow-visible">
                            <table className="w-full border-collapse border border-[var(--border-subtle)] text-xs text-left">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-2 font-semibold text-[var(--text-primary)]">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-[var(--border-subtle)] p-2 text-[var(--text-primary)]">
                            {children}
                        </td>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export const MarkdownRenderer = memo(BaseMarkdownRenderer);