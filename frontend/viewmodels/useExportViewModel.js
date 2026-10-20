'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard, downloadMarkdown, downloadMarkdownZip } from '../lib/models/fileExport';
import { snapshotWithPendingEdits } from '../lib/models/editorExport';

const COPIED_MS = 1800;

/** Copy / .md / .zip commands for the active result and the whole batch. */
export function useExportViewModel({ activeResult, results, onNotice }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const latestRef = useRef({ activeResult, results, onNotice });
  latestRef.current = { activeResult, results, onNotice };

  const editorsRef = useRef(new Set());
  const registerEditor = useCallback(takePending => {
    editorsRef.current.add(takePending);
    return () => editorsRef.current.delete(takePending);
  }, []);
  const snapshot = useCallback(() => snapshotWithPendingEdits(latestRef.current, editorsRef.current), []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /** Resolves true when the active Markdown reached the clipboard. */
  const copyActive = useCallback(async () => {
    const content = snapshot().activeResult?.content;
    if (content == null) return false;
    const ok = await copyToClipboard(content);
    if (!ok) {
      latestRef.current.onNotice?.('Clipboard access was blocked by the browser');
      return false;
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPIED_MS);
    return true;
  }, [snapshot]);

  const downloadActive = useCallback(() => {
    downloadMarkdown(snapshot().activeResult);
  }, [snapshot]);

  const downloadAll = useCallback(async () => {
    try {
      await downloadMarkdownZip(snapshot().results);
    } catch (err) {
      console.error('ZIP export failed:', err);
      latestRef.current.onNotice?.('Could not build the ZIP file');
    }
  }, [snapshot]);

  return { copied, copyActive, downloadActive, downloadAll, registerEditor };
}
