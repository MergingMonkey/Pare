/**
 * Sanitizes error output by replacing sensitive filesystem paths.
 *
 * Default mode (home paths only):
 *   /home/<user>/...  → ~/...
 *   /Users/<user>/... → ~/...
 *   /root/...         → ~/...
 *   C:\Users\<user>\... → ~\... (also spaced names and encoded backslashes)
 *
 * Broad mode (PARE_SANITIZE_ALL_PATHS=true):
 *   Also redacts other absolute paths outside home directories:
 *   /etc/..., /var/..., /opt/..., C:\Program Files\..., etc.
 *   These are replaced with <redacted-path>/basename to preserve
 *   the filename while hiding directory structure.
 */
export function sanitizeErrorOutput(text: string): string {
  // Unix: /home/<username>/rest → ~/rest
  let result = text.replace(/\/home\/[^/\s]+\//g, "~/");

  // macOS: /Users/<username>/rest → ~/rest
  result = result.replace(/\/Users\/[^/\s]+\//g, "~/");

  // Unix: /root/rest → ~/rest
  result = result.replace(/\/root\//g, "~/");

  // Quoted profiles allow filename punctuation, including apostrophes.
  // Recognize quoted-field boundaries instead of limiting the next name character.
  result = result.replace(
    /(["'])[A-Z]:(\\+)Users\2([^\\/:*?"<>|\r\n]+)\2/gi,
    (match, quote: string, separator: string, profile: string) => {
      // Normal Windows components cannot end in a space or period.
      if (/[ .]$/.test(profile)) return match;
      // A quote followed by whitespace, or punctuation leading to another
      // quote, closes a field/expression rather than belonging to the profile.
      if (quote === "'" && /'(?:\s|[,;]\s|[^\p{L}\p{M}\p{N}\\/:*?"<>|'\r\n]+')/u.test(profile)) {
        return match;
      }
      return quote + "~" + separator;
    },
  );

  // Unquoted profiles are either one non-whitespace token or name-like words.
  // Spaced punctuation requires quotes so diagnostic prose is not a username.
  result = result.replace(
    /(?<!["'])[A-Z]:(\\+)Users\1(?:[^\s\\/:*?"<>|]+|[\p{L}\p{M}\p{N}_-]+(?:[ .]+[\p{L}\p{M}\p{N}_-]+)+)\1/giu,
    "~$1",
  );

  // Broad mode: redact remaining absolute paths
  if (process.env.PARE_SANITIZE_ALL_PATHS === "true") {
    // Unix absolute paths not already handled (e.g., /etc/foo/bar → <redacted>/bar)
    result = result.replace(/\/(?:etc|var|opt|usr|tmp|srv|snap|nix)\/[^\s:]+/g, (match) => {
      const basename = match.split("/").pop() ?? "";
      return `<redacted-path>/${basename}`;
    });

    // Windows non-user absolute paths (e.g., C:\Program Files\foo → <redacted>\foo)
    result = result.replace(/[A-Z]:\\(?!Users\\)[^\s:]+/gi, (match) => {
      const basename = match.split("\\").pop() ?? "";
      return `<redacted-path>\\${basename}`;
    });
  }

  return result;
}
