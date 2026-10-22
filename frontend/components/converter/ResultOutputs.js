'use client';

import React from 'react';
import { resultReference } from '../../lib/models/resultReference';

/** Original server outputs use fresh links on click, independently of edits. */
export default function ResultOutputs({ result }) {
  const reference = resultReference(result);
  if (!reference.outputs?.length) return null;
  return (
    <details className="min-w-0 text-[11px] text-[var(--muted)] border border-[var(--border)] rounded-lg p-2">
      <summary className="cursor-pointer">Original output files ({reference.outputs.length})</summary>
      <p className="mt-2 mb-1">These are the original converted files. Use .md or .zip above to export your edits. Server copies are available until automatic deletion.</p>
      <ul className="m-0 pl-4 max-h-32 overflow-y-auto">
        {reference.outputs.map((output, index) => (
          <li key={`${output.name}-${index}`} className="py-1 [overflow-wrap:anywhere]">
            <a
              href={`/api/jobs/${reference.job_id}/download?output=${encodeURIComponent(output.name)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[#2a78d6] dark:text-[#60a5fa] underline"
            >{output.name}</a>
          </li>
        ))}
      </ul>
    </details>
  );
}
