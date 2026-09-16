// src/components/Mermaid.tsx
import React, { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    htmlLabels: false, // Root-level: enforces vector SVG text for graph and flowchart
    fontFamily: 'JetBrains Mono, monospace',
    flowchart: {
        htmlLabels: false,
        curve: 'basis',
        useMaxWidth: true,
    },
    theme: 'base',
    themeVariables: {
        darkMode: true,
        background: 'transparent',
        mainBkg: '#1e1e24',
        nodeBorder: '#6366f1',
        primaryColor: '#1e1e24',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#6366f1',
        lineColor: '#94a3b8',
        secondaryColor: '#1e1e24',
        tertiaryColor: '#1e1e24',
        clusterBkg: '#0f172a',
        clusterBorder: '#334155',
        titleColor: '#ffffff',
        edgeLabelBackground: '#0f172a',
        nodeTextColor: '#ffffff',
    },
});

interface Props {
    chart: string;
}

export const Mermaid: React.FC<Props> = ({ chart }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const uniqueId = useId().replace(/:/g, '');

    useEffect(() => {
        let isMounted = true;

        const renderChart = async () => {
            try {
                setError(null);
                const { svg } = await mermaid.render(`mermaid-${uniqueId}`, chart);
                if (isMounted) {
                    setSvg(svg);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Failed to render Mermaid diagram');
                }
            }
        };

        renderChart();

        return () => {
            isMounted = false;
        };
    }, [chart, uniqueId]);

    if (error) {
        return (
            <div className="my-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-xs font-mono text-red-400">
                <p className="font-semibold mb-1">Mermaid Syntax Error</p>
                <pre className="text-[11px] text-red-300/80 whitespace-pre-wrap">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            className="mermaid-wrapper my-5 flex justify-center items-center rounded-xl border border-zinc-800 bg-[#121316] p-6 shadow-sm overflow-x-auto print:my-3 print:border-zinc-300 print:bg-white print:p-2 print:overflow-visible print:block"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};