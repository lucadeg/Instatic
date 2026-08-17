/**
 * Editor store isolation for tests.
 *
 * `useEditorStore.setState(partial)` MERGES. Every test file that seeds the
 * store with a hand-written partial therefore inherits whatever fields it did
 * not mention from whichever file ran before it, and `bun test` walks test files
 * in filesystem order — which differs between macOS and Linux. That is how a
 * leaked `canvasView: 'live'` made `canvasFormControls.test.tsx` fail on CI for
 * weeks while passing on every local run: in live view `CanvasRoot` renders one
 * preview frame with native form-control suppression deliberately off, so the
 * test asserted design-mode behaviour against a preview frame.
 *
 * `resetEditorStore()` restores every field the store started with, so a test
 * only has to name what it actually wants.
 */

import { useEditorStore } from '@site/store/store'

type EditorState = ReturnType<typeof useEditorStore.getState>

/**
 * The store's pristine state.
 *
 * Captured at module load, and this module is imported from the test preload
 * (`src/__tests__/setup.ts`) so the snapshot is taken before any test file has
 * run. Importing it lazily from a test would snapshot whatever the previous file
 * left behind, which is the very bug this exists to prevent.
 */
const PRISTINE_STATE: EditorState = { ...useEditorStore.getState() }

/**
 * Restore the editor store to its initial state, then apply `overrides`.
 *
 * Call this from `beforeEach` in any test that renders editor UI or reads editor
 * state, in place of a hand-written `setState` partial.
 */
export function resetEditorStore(overrides: Partial<EditorState> = {}): void {
  useEditorStore.setState({ ...PRISTINE_STATE, ...overrides })
}
