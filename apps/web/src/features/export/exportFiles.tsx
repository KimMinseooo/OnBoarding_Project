import { renderToStaticMarkup } from 'react-dom/server';
import type { Assignment } from '@obp/shared';
import { initialSelection, renderMockup } from '../../renderer/frame';
import { exportBaseName, toMarkdown } from './markdown';

// 내보낼 파일 내용 만들기 — 화면 코드와 분리해 버튼을 누를 때만 불러옵니다(첫 화면 크기 절약)

export function buildExport(a: Assignment, date = new Date()) {
  const base = exportBaseName(a);
  const { svg, pins } = renderMockup(a, initialSelection(a.layout), () => {}, true);
  const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n${renderToStaticMarkup(<>{svg}</>)}\n`;
  const imageFile = `${base}.svg`;
  return {
    markdown: { name: `${base}.md`, text: toMarkdown(a, pins, { imageFile, date }), type: 'text/markdown;charset=utf-8' },
    svg: { name: imageFile, text: svgText, type: 'image/svg+xml;charset=utf-8' },
  };
}

export function download(file: { name: string; text: string; type: string }) {
  const url = URL.createObjectURL(new Blob([file.text], { type: file.type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
