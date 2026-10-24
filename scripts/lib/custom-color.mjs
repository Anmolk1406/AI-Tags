// The marker for an explicitly requested colour, shared by token-lint.mjs, hooks/design-guard.mjs and handoff.mjs.
// A line carrying `custom-color — <who asked, why>` keeps a raw colour on purpose; the bare template
// `custom-color — <who asked, why>` (what the docs print) is not a marker, so the reason must not start with `<`.
export const CUSTOM_COLOR = /custom-color\s*[—–:-]+\s*[^\s<`]/;
