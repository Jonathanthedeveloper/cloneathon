import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  h1: ({ children, ...props }) => <h1 className="text-3xl font-bold text-foreground pb-2 break-words max-w-full" {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 className="text-2xl font-semibold text-foreground break-words max-w-full" {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 className="text-xl font-semibold text-foreground break-words max-w-full" {...props}>{children}</h3>,
  h4: ({ children, ...props }) => <h4 className="text-lg font-semibold text-foreground break-words max-w-full" {...props}>{children}</h4>,
  h5: ({ children, ...props }) => <h5 className="text-base font-semibold text-foreground break-words max-w-full" {...props}>{children}</h5>,
  h6: ({ children, ...props }) => <h6 className="text-sm font-semibold text-muted-foreground break-words max-w-full" {...props}>{children}</h6>,
  code: ({children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
  pre: ({ children , ...props}) => <pre className="overflow-x-auto max-w-full" {...props}>{children}</pre>,
  hr: ({...props }) => <hr className="border-t border-border bg-border" {...props} />,
  ul: ({children, ...props}) => <ul {...props} className='list-disc list-inside ml-4'>{children}</ul>,
  ol: ({children, ...props}) => <ol {...props} className='list-decimal list-inside ml-4'>{children}</ol>,
   // Tables
   table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto max-w-full relative">
      <table className="w-full caption-bottom border-collapse border border-border rounded-lg break-words max-w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted break-words max-w-full" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground break-words max-w-full" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border px-4 py-2 text-foreground break-words max-w-full" {...props}>
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote 
      className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground bg-muted/30 rounded-r-lg break-words max-w-full" 
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    // @ts-expect-error: Next.js Link requires special handling for href
    <Link
      className="text-primary underline underline-offset-4 hover:text-primary/800 transition-colors break-words max-w-full"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </Link>
  ),

}

const remarkPlugins = [remarkGfm, remarkMath];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

// Test markdown cases:
// - Paragraphs
// - Lists
// - Code blocks
// - Headings
// - Blockquotes
// - Tables
// - Horizontal rules