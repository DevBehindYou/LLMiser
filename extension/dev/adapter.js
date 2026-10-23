import { captureDocument } from '../src/capture.js';
import { draftRecord } from '../src/model.js';

// Included only in .preview, never dist. The fixture stays on localhost and
// exercises the same extractor against actual browser DOM, without Chrome APIs.
export async function capture(options) {
  const frame=parent.document.getElementById('page');
  return captureDocument(frame.contentDocument,{...options,selection:frame.contentWindow.getSelection()});
}
export const loadDraft=async()=>draftRecord(JSON.parse(sessionStorage.getItem('preview-draft')||'null'));
export const saveDraft=async draft=>sessionStorage.setItem('preview-draft',JSON.stringify(draftRecord(draft)));
export const clearDraft=async()=>sessionStorage.removeItem('preview-draft');
export const copy=text=>navigator.clipboard.writeText(text);
export { download } from '../src/download.js';
export const authorizeUploads=async()=>true;
export const convertUpload=async(file,_profile,{onProgress}={})=>{
  onProgress?.('Preview fixture — no file upload');
  return {markdown:`# Preview: ${file.name}\n\nSynthetic conversion result. No file was sent to a server.\n`,title:file.name,mode:'file',warnings:['Development preview: file conversion is simulated.']};
};
export const detectAI=async()=>null;
export const paste=async()=>{throw new Error('AI composer integration must be tested in Chrome.');};
