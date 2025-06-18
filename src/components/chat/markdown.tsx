import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error: CodeBlock is a custom component for code rendering, not a standard react-markdown code renderer
  code: ({ inline, className, children, ...props }) => {
    if (inline) {
      // Ensure children is a string and add responsive classes
      const codeString = Array.isArray(children) ? children.join("") : (children as string);
      return (
        <code className="px-1 py-0.5 rounded bg-muted text-sm font-mono text-foreground/90 break-words whitespace-pre-wrap max-w-full" {...props}>
          {codeString}
        </code>
      );
    }
    // @ts-expect-error: CodeBlock is a custom component for code rendering, not a standard react-markdown code renderer
    return <div className="overflow-x-auto max-w-full"><CodeBlock className={className} {...props}>{children}</CodeBlock></div>;
  },
  pre: ({ children , ...props}) => <pre className="overflow-x-auto max-w-full" {...props}>{children}</pre>,

  // Lists with proper styling
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside ml-6 my-4 space-y-1 break-words max-w-full" {...props}>
      {children}
    </ol>
  ),
  
  ul: ({ children, ...props }) => {
    // If the previous node is a sources block, style this list as sources
    return (
      <ul className="my-6 ml-6 list-outside list-disc [&>li]:mt-2 break-words max-w-full" {...props}>
        {children}
      </ul>
    );
  },
  
  li: ({ children, ...props }) => (
    <li className="leading-relaxed break-words max-w-full" {...props}>
      {children}
    </li>
  ),

  // Typography with consistent theming
  p: ({ children, ...props }) => {
    // Highlight the sources block
    if (Array.isArray(children) && typeof children[0] === "string" && children[0].startsWith("Sources:")) {
      return (
        <div className="my-4 p-3 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-r-lg break-words max-w-full">
          <span className="font-bold text-blue-700 dark:text-blue-200 mr-2">🔎 Sources:</span>
          {children[0].replace("Sources:", "").trim()}
        </div>
      );
    }
    // Always render children as-is for normal paragraphs
    return (
      <p className="leading-relaxed my-4 text-foreground break-words max-w-full" {...props}>
        {children}
      </p>
    );
  },

  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground break-words max-w-full" {...props}>
      {children}
    </strong>
  ),

  em: ({ children, ...props }) => (
    <em className="italic text-foreground break-words max-w-full" {...props}>
      {children}
    </em>
  ),

  // Links with proper theming
  a: ({ children, ...props }) => (
    // @ts-expect-error: Next.js Link requires special handling for href
    <Link
      className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors break-words max-w-full"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </Link>
  ),

  // Headings with consistent spacing and theming
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2 break-words max-w-full" {...props}>
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground break-words max-w-full" {...props}>
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground break-words max-w-full" {...props}>
      {children}
    </h3>
  ),

  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground break-words max-w-full" {...props}>
      {children}
    </h4>
  ),

  h5: ({ children, ...props }) => (
    <h5 className="text-base font-semibold mt-4 mb-2 text-foreground break-words max-w-full" {...props}>
      {children}
    </h5>
  ),

  h6: ({ children, ...props }) => (
    <h6 className="text-sm font-semibold mt-4 mb-2 text-muted-foreground break-words max-w-full" {...props}>
      {children}
    </h6>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote 
      className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-3 rounded-r-lg break-words max-w-full" 
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto max-w-full">
      <table className="w-full border-collapse border border-border rounded-lg break-words max-w-full" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead className="bg-muted/50 break-words max-w-full" {...props}>
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

  // Horizontal rule
  hr: ({ ...props }) => (
    <hr className="my-6 border-t border-border" {...props} />
  ),
};

const remarkPlugins = [remarkGfm];

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