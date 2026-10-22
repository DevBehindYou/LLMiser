// Recent conversion sessions, persisted in the browser's localStorage.
import { resultReference } from './resultReference.js';

const STORAGE_KEY = 'llmiser_recent_sessions_v1';
const LEGACY_STORAGE_KEY = 'markdify_recent_sessions_v1';
export const MAX_SESSIONS = 5;

function getStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    // Access itself can throw when site data is blocked.
    return null;
  }
}

function sessionRecord(item) {
  if (!item || typeof item !== 'object') return null;
  const reference = resultReference(item);
  if (typeof item.content !== 'string' && !reference.job_id) return null;
  const name = typeof item.filename === 'string' ? item.filename : null;
  const original = typeof item.original_name === 'string' ? item.original_name : null;
  return {
    id: typeof item.id === 'string' ? item.id : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: item.timestamp || Date.now(),
    filename: name || `${original || 'document'}.md`,
    original_name: original || name || 'Converted Document',
    content: typeof item.content === 'string' ? item.content : undefined,
    tokens_est: item.tokens_est ?? Math.round((item.content?.length || 0) / 4),
    quality_score: item.quality_score,
    profile: item.profile || 'Standard',
    fileSize: item.fileSize || null,
    ...reference,
  };
}

/**
 * Safely retrieve the last 5 conversion sessions from browser local storage
 */
export function getRecentSessions() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY) || storage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_SESSIONS).map(sessionRecord).filter(Boolean) : [];
  } catch (err) {
    console.warn('Failed to read recent sessions from localStorage:', err);
    return [];
  }
}

/**
 * Save a newly completed conversion session, keeping strictly the last 5.
 * Returns the list as stored. When the storage quota is exceeded the oldest
 * sessions are dropped first. A completed job can fall back to metadata only;
 * if that also cannot fit, the previously stored list is returned unchanged.
 */
export function saveRecentSession(item) {
  const current = getRecentSessions();
  const storage = getStorage();
  if (!storage || !item) return current;
  const newSession = sessionRecord(item);
  if (!newSession) return current;

  // Filter out duplicate by id or identical original_name
  const filtered = current.filter(
    (s) => s.id !== newSession.id && s.original_name !== newSession.original_name
  );

  let candidate = [newSession, ...filtered].slice(0, MAX_SESSIONS);
  while (candidate.length > 0) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return candidate;
    } catch (err) {
      if (candidate.length === 1) {
        if (newSession.job_id && typeof newSession.content === 'string') {
          // Retain retrieval identity even when a large document exceeds quota.
          const { content: _content, ...metadata } = newSession;
          try {
            storage.setItem(STORAGE_KEY, JSON.stringify([metadata]));
            return [metadata];
          } catch { /* Preserve the previous history if even metadata cannot fit. */ }
        }
        console.warn('Session too large to cache in localStorage:', err);
        return current;
      }
      candidate = candidate.slice(0, -1);
    }
  }
  return current;
}

/**
 * Remove a specific session by ID
 */
export function deleteRecentSession(sessionId) {
  const current = getRecentSessions();
  const storage = getStorage();
  if (!storage || !sessionId) return current;
  const updated = current.filter((s) => s.id !== sessionId);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete session from localStorage:', err);
    return current;
  }
}

/**
 * Clear all stored conversion sessions
 */
export function clearAllRecentSessions() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear sessions from localStorage:', err);
  }
  return [];
}

/**
 * Sample session for immediate testing if history is empty
 */
export function generateSampleSession() {
  const sampleContent = `# Biology 101: Cell Structure

> **Source:** \`Biology_101_Lecture_3.pdf\` (4 pages) · sample result

## Key terms

| Term | What it does | Found in |
| :--- | :--- | :--- |
| Nucleus | Holds the cell's DNA | Plant and animal cells |
| Mitochondria | Releases energy from food (ATP) | Plant and animal cells |
| Chloroplast | Turns light into sugar | Plant cells only |
| Cell wall | Gives the cell a rigid shape | Plants, fungi, bacteria |

## Summary

- Every living thing is made of one or more cells.
- Plant cells have a cell wall and chloroplasts. Animal cells don't.
- **Exam tip:** learn what each part does, not only its name.

> Paste this Markdown into your AI chat instead of the PDF: the same notes for far fewer tokens.

## Using the result in code

\`\`\`python
from pathlib import Path

notes = Path("biology_101.md").read_text(encoding="utf-8")
sections = notes.split("\\n## ")  # one chunk per section
print(f"{len(sections)} sections, about {len(notes.split()) * 4 // 3} tokens")
\`\`\`
`;

  return {
    id: `sample_${Date.now()}`,
    timestamp: Date.now(),
    filename: 'Biology_101_Lecture_3.md',
    original_name: 'Biology_101_Lecture_3.pdf',
    content: sampleContent,
    tokens_est: 235,
    quality_score: 98,
    profile: 'Standard',
    fileSize: 145000,
  };
}
