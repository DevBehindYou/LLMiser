import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const md = '# T\n\n<!-- chunk-boundary -->\n## Setup\n\ntext <!-- page 2: text recognition --> more\n';
console.log(renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md)));
