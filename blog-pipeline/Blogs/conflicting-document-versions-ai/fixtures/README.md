# M12 fixture record (shared with M12-S1, S2, S3)

**Synthetic only.** Two versions of a fictional travel policy (python-docx). Effective dates appear only in the page header and core properties. Truth values in inputs.json.

| File | SHA-256 |
| --- | --- |
| travel-policy.docx | 1975b3a950bbf41810c7140df8cb313439730038b1b6788741c23cd5f31be326 |
| travel-policy (1).docx | 5d12b1f54939ec5ee031fdfa1a82d91d24946c5a4ecff44bbb310857917eb5a5 |

Runs 2026-11-09, local code-level runs of backendN NormalConverter (markitdown 0.1.9), Standard and Clean profiles. Outputs: out-v1-*, out-v2-*.

| Observation | Value |
| --- | --- |
| Effective date (header, properties) in output | Absent in both versions, both profiles ("effective" and "2026" not found) |
| Title | "# Travel Policy (synthetic sample)" in both |
| Standard source note | travel-policy.docx versus travel-policy (1).docx |
| Clean | No source note; versions differ only by 30 versus 14 days and 180 versus 200 USD |
| Similarity of Clean outputs | 0.867 (Python difflib.SequenceMatcher.ratio on full text) |
