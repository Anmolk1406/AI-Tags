# Studio Edit mode

The studio has two modes (toolbar switch, or press **E**):

- **View**: browse flows; the right panel explains the screen (About, how to use it, bappzaar source) and gives the code to use it.
- **Edit**: pick the flow you're working on, then edit it. Left: the flow, its screens and a Figma-style **Layers** tree of the current screen. Right: **Design** (Figma-style properties + pending changes) and **Chat** (your local Claude Code), with a Claude status pill always visible.

Experimental visual editing: select an element on the phone or in Layers, change it, see it live, then write it to the code or hand it to Claude. Hold **⌥** to use the app without leaving Edit mode.

## How it fits together

```
FlowPicker ─▶ flow    LayersPanel (screen frame → layers) ◀─hover/select─▶ EditOverlay (phone)
                                       │ selection
                                       ▼
                     DesignPanel: Design tab (Layout · Appearance · Fill · Typography · Content · Image)  |  Chat tab
                                                          │ live edits on the CSS rule (all elements with that class)
                                                          ▼
                                                     useEditor: pending changes
                                     ┌────────────────────┼─────────────────────┐
                               Apply to code        Copy for Claude         Ask Claude
                                     │                    │                     │
                       scripts/studio-bridge.ts     clipboard prompt   bridge → local `claude -p`
                       (dev server, writes files)                       (your own Claude Code login)
                                     └──────────── Vite HMR reloads the phone ───┘
```

- **Element → source.** In dev, CSS-module classes are named `<local>_<file id>` (`card_4c453c`). The bridge maps the id to the file, so a click lands on `src/flows/pdp/pdp.module.css → .card`. Values are read from that rule, so tokens show as tokens (`s12`, `r16`, `bgSurface`), like Figma variables.
- **Scope.** Edits target the class's own rule, so every element using it changes, like editing a Figma component. Shared files (outside `src/flows/`) are flagged because they change every flow.
- **Writing.** CSS edits go through postcss into the exact rule (shorthands replace their longhands). Copy edits only touch string literals and JSX text in the flow folder, then `src/mocks`. A local image is overwritten in place; a remote image is saved to `public/studio-assets/` and the URL swapped.
- **Layers.** Built from the live DOM: the top screen in the stack (named after the screen) and any open sheet are frames; elements with a stylesheet class, text, images, icons and controls are layers; anonymous wrappers and the prototype runtime's chrome (`src/kit`) fold away. Shared components (`src/components`) show as purple components.
- **Claude status.** The bridge runs `claude auth status`, so the pill shows Connected / Not logged in / Not installed / Local only, with the account and plan in Chat.
- **Sign in / switch account.** Chat's sign-in runs `claude auth login` through the bridge: the CLI opens the browser (the same flow as the terminal) and finishes on its own; its printed fallback link + paste-code field are offered too. Switch account = sign out + sign in. This is the machine's Claude Code login, so it changes the terminal's account too. Pending edits, sessions and memory are untouched.
- **Drafts.** Entering Edit mode shows **+ New draft** first, then your drafts newest → oldest (searchable). A draft = flow + screen + pending visual edits + its own chat (same id). It autosaves to `.studio/drafts/<id>.json` once it has an edit, a chat message or a name; resuming navigates back to its screen and re-applies the edits live (text/images not on screen yet are retried as you navigate). Starting or switching drafts takes the current draft's edits off screen first; nothing is lost.
- **Model.** Picked under the chat input, saved per session, passed as `--model`.
- **Sessions & memory.** Each draft's chat is a session saved in `.studio/sessions/<draft id>.json` (with its Claude conversation id, so follow-ups resume). Every session shares `.studio/memory.md`, which the bridge sends to Claude with each message. Turns that changed files and edits applied from the Design tab append a line to it; anyone can edit it from the 🧠 button. `.studio/` is git-ignored.
- **Claude.** Chat runs the Claude Code CLI already logged in on this machine; follow-ups resume the same session, in this repo, with edit permissions limited to Read/Edit/Write/Glob/Grep. Nothing about Claude runs in the browser.
- **Safety.** The bridge exists only under `npm run dev`, answers only same-origin requests with the `x-noon-studio` header, and refuses paths outside `src/` and `public/studio-assets/`. On a static deploy, Edit mode is preview + copy only.

## Known limits (v1)

- Values set inline in a component (`style={{…}}`) are shown greyed out. Ask Claude to change them.
- Copy that's assembled from parts (template strings, translations) may not match a single string. Ask Claude.
- Lottie and SVG icon swaps, undo per change, and multi-select are not built yet.

## Next steps that scale

1. Per-change undo and a diff preview before Apply.
2. Drag to reorder layers, and show/hide toggles.
3. Auto-layout controls (direction, align, distribute) for flex containers.
4. Token editing: change a token's value once and see every flow update.
5. Sessions: save a set of pending edits as a named experiment to share.
