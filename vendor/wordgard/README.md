# Wordgard (vendored fork)

`src/` is the source tree of **wordgard 0.5.2**, taken from
`https://code.haverbeke.berlin/wordgard/wordgard` at tag `0.5.2`
(commit `7b4bebd…`, MIT licensed — see `LICENSE`). It is not installed from
npm; `deno.jsonc` maps `wordgard/*` to files here, and the vendored tree
imports itself through those same specifiers.

Vendored rather than depended on so that the editor's interface text lives in
this repository instead of behind a runtime translation layer, and so that
changes to the library itself are possible without waiting on upstream — which
does not accept pull requests.

## Local changes

Everything below is the complete difference from the 0.5.2 tag. Re-vendoring
means re-applying exactly these, then re-running `deno task check`.

1. **Relative imports carry `.ts`.** Upstream resolves `./foo` through the
   bundler; Deno requires the extension. Applied mechanically across the tree
   (210 imports); no other edit in any of those files.

2. **`src/doc/index.ts`** — `export {Shape, Elt, Attributes}` split into value
   exports (`Elt`, `Attributes`) and `export type {Shape}`. Deno type-checks
   with `isolatedModules`, which cannot tell a re-exported type from a value.

3. **`src/state/state.ts`** — `const enum Prec` moved above `GardState.prec`,
   which uses it at module-evaluation time. `tsc` inlines const enum members so
   order never mattered there; the enum is emitted, so it does.

4. **`src/phrases/phrases.ts`** — the four phrase sets translated to Chinese.
   This is the whole interface: bar tooltips, the block-style dropdown, colour
   names, the image and table dialogs. Two upstream oddities fixed in passing:
   `add_col_after` said "Add column before", and `dialog_close` said "close"
   where every other phrase is capitalised.

## Type checking

`deno.jsonc` sets `noImplicitOverride: false` and drops the `deno.window` /
`deno.unstable` libs, both for this tree's sake:

- upstream is compiled by swc and never type-checked, so ~30 overriding
  accessors carry no `override` modifier;
- with Deno's window lib in scope `setTimeout` returns Deno's `Timeout`
  object, which does not assign to the `number` fields the editor stores timer
  handles in.

Neither setting affects the code this project writes.

## Updating

```bash
git clone https://code.haverbeke.berlin/wordgard/wordgard /tmp/wg
cd /tmp/wg && git checkout <tag>
```

Copy `src/` over this one, redo changes 1–4 above, then
`deno task check && deno task test`. Nothing in `src/frontend/` imports
anything this tree does not already map, so a new subpath needs a line in
`deno.jsonc` as well.
