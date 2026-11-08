# M08 research: llmiser-processing-profiles

Researched 2026-11-08. No search observation was needed to establish intent: "LLMiser processing profiles" is a branded product query with no third-party owners to observe, and the task is fully defined by product behavior. Named-engine SERPs and keyword metrics remain unavailable (R05).

## Primary sources (read 2026-11-08)

- GitHub Flavored Markdown Spec, tables extension: "The delimiter row consists of cells whose only content are hyphens (-)" and "The header row must match the delimiter row in the number of cells."
- CommonMark 0.31.2: "The content of a code fence is treated as literal text, not parsed"

## Product truth discrepancy found

`frontend/lib/siteContent.js` FAQ says: "Clean removes the source note and extra blank lines. Compact also removes divider lines." The code applies Compact independently of Clean: Compact keeps the source note, and it removes every "---", not only divider lines. The article describes the code's behavior. Logged for the owner (site copy or code may need changing). Not edited: app copy is out of scope.

## Token estimates

The header shows `tokens_est` from the backend (words x 1.33). The viewer's own counts use characters / 4 (`documentStats.js`). The article calls both "an estimate" and quotes word counts from the fixture only.
