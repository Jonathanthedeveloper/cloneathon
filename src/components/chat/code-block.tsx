/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced code-block.tsx with syntax highlighting
'use client';

import { useState } from 'react';
import { Check, Copy, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight, } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  node?: any;
  className?: string;
  children: any;
}

export function CodeBlock({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(false);
  const { theme } = useTheme();

  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[0]
  const code = String(children).replace(/\n$/, '');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${match?.[1] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };


  if (language) {
    return (
      <div className="not-prose my-4 group">
        <div className="flex items-center justify-between bg-secondary border border-border rounded-t-lg px-4 py-1">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {match?.[1]}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWrapped(prev => !prev)}
              className="size-7 p-0"
            >
              {wrapped ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCode}
              className="size-7 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="size-7 p-0"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto max-w-full'>
          <SyntaxHighlighter
            language={match?.[1]}
            style={theme === 'dark' ? oneDark : oneLight}

            customStyle={{
              margin: 0,
              borderRadius: '0 0 0.5rem 0.5rem',
              border: '1px solid hsl(var(--border))',
              borderTop: 'none',
            }}
            wrapLines={wrapped}
            wrapLongLines={wrapped}
            showLineNumbers={true}

            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <code
      className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
      {...props}
    >
      {children}
    </code>
  );
}