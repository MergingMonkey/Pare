---
"@paretools/shared": patch
---

Redact JSON-escaped Windows home paths in error output while preserving JSON escaping and existing plain-text path handling, including profile names that contain spaces. Quoted paths support filename punctuation; unquoted spaced names use name-like words so shell separators and surrounding diagnostic prose are not consumed. Preserve profile apostrophes before filename punctuation in single-quoted filesystem errors, distinguish adjacent quoted fields and expressions, and reject quoted profile candidates ending in a space or period.
