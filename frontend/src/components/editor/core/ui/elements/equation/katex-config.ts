export const DEFAULT_KATEX_OPTIONS = {
  displayMode: true,
  errorColor: "#cc0000",
  fleqn: false,
  leqno: false,
  macros: { "\\f": "#1f(#2)" }, // Note: Backslashes need to be escaped in JS strings
  output: "htmlAndMathml",
  strict: "warn",
  throwOnError: false,
  trust: false,
} as const;
