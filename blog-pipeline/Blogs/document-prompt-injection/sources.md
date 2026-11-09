# M11 source ledger

| ID | Source | Type | Checked passage | Used for |
| --- | --- | --- | --- | --- |
| S-OWASP-LLM01 | [OWASP GenAI LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Security guidance | Indirect injection definition (files, websites) | C01 |
| S-OWASP-CS | [OWASP Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) (SRC-OWASP) | Security guidance | Hidden text in documents; invisible Unicode; least privilege at tool boundary; screening limits; review prompt doesn't stop execution | C05, C08, C09 |
| S-GRESHAKE | [arXiv:2302.12173](https://arxiv.org/abs/2302.12173) | Primary research (2023) | "blur the line between data and instructions" | C02 |
| F-M11 | fixtures/ | LOCAL CODE-LEVEL RUN, inert | out-*/ | C03, C04, C06, C07 |
