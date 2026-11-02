---
"@paretools/npm": minor
---

Add an optional pnpmReporter: "silent" install input without relaxing package-operand validation or changing lifecycle-script defaults. Silent installs omit output-derived statistics, including added/removed/changed counts, and report unavailable counts in the readable summary. Install count fields are now optional in the output schema; ordinary install calls retain their existing statistics.

Report nonzero install exit codes as tool failures for every supported package manager, including when node_modules already exists or output is empty.

Redact Windows home paths in JSON-encoded error diagnostics as well as plain-text paths.
