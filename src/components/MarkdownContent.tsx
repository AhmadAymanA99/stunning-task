'use client';

import { useMemo } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = useMemo(() => {
    if (!content) return '';
    
    // Simple markdown to HTML conversion for common elements
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
      // Paragraphs
      .replace(/^(?!<[hulp]|<pre|<ul)(.+)$/gim, '<p>$1</p>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }, [content]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}