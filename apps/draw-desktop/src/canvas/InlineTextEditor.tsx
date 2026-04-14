/**
 * InlineTextEditor — overlay-based text editing for canvas.
 *
 * Workflow:
 * - Text tool click creates text node with default "Text" content
 * - Double-click on text node opens inline edit overlay
 * - Escape or blur closes editing
 *
 * Architecture:
 * - HTML textarea overlay positioned over SVG text
 * - Uses getBoundingClientRect for accurate positioning
 */

import { FC, useEffect, useRef, useState } from 'react';
import type { TextSceneNode } from '@rashamon/types';
import { updateTextContent } from '../store/documentStore.js';

interface InlineTextEditorProps {
  node: TextSceneNode | null;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onDone: () => void;
}

export const InlineTextEditor: FC<InlineTextEditorProps> = ({ node, svgRef, onDone }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (node) {
      setText(node.content);
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  }, [node?.id]);

  if (!node || !svgRef.current) return null;

  const svg = svgRef.current;
  const svgRect = svg.getBoundingClientRect();

  // Get the SVG's viewBox to compute scale
  const viewBox = svg.viewBox.baseVal;
  const scaleX = svgRect.width / viewBox.width;
  const scaleY = svgRect.height / viewBox.height;

  // Text position in screen coordinates
  const x = svgRect.left + node.transform.x * scaleX;
  const y = svgRect.top + node.transform.y * scaleY;
  const fontSize = node.fontSize * scaleX;
  const minWidth = Math.max(80, node.content.length * fontSize * 0.6);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: x - 2,
    top: y - fontSize * 0.2,
    minWidth,
    fontSize,
    fontFamily: node.fontFamily,
    color: node.fill,
    backgroundColor: 'rgba(20, 20, 35, 0.95)',
    border: '1px solid #6c7bff',
    borderRadius: '3px',
    padding: '2px 4px',
    outline: 'none',
    resize: 'both',
    overflow: 'hidden',
    zIndex: 1000,
    lineHeight: 1.2,
    minHeight: fontSize * 1.5,
  };

  return (
    <textarea
      ref={textareaRef}
      style={style}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        updateTextContent(node.id, e.target.value);
      }}
      onBlur={() => onDone()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onDone();
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onDone();
        }
      }}
    />
  );
};
