# Local reader profiling

From `frontend`, after `npm ci`:

```sh
node scripts/preview-profile/server.mjs
```

Open `http://127.0.0.1:4318`, keep the tab active, and click **Run profiling matrix**. The server binds only to loopback and serves an allowlist of generated assets. Stop it with Ctrl+C. It loads no environment files, contacts no conversion/storage services, and accepts no uploads or writes. Generated bundles/CSS are ignored under `frontend/.preview-profile/`; browser results remain in the tab until copied by the operator. Do not run concurrent builds/tests while measuring.

The harness bundles the actual `MarkdownViewer`, preview, status bar, lazy parser/highlighter and export snapshot helper using the installed Next compiler/Webpack. React uses production mode; the bundle is intentionally unminified. Tailwind uses the app's actual CSS/configuration. There is no new package, production route, runtime instrumentation or analytics event. The output is a component-level benchmark, not a complete production app or device lab.

Each fixture repeats generated multilingual invoice Markdown with headings, lists, GFM tables and JavaScript code. Sizes are 10,240, 102,400, 262,144 and 1,048,576 UTF-16 code units. Each raw/split mode runs three times with fresh reader mounts. The first formatted run includes lazy module loading; later runs reuse loaded modules. No CPU throttling is applied.

- `commitMs`: synchronous fresh-mount React commit, measured around `flushSync`. Initial `useDeferredValue` has no earlier value to defer to. This is not a typing-latency test.
- `twoFrameMs`: time until two animation-frame callbacks complete after that commit. This includes layout/scheduling; it is not a Paint Timing or INP measurement.
- `settleMs`: waits for lazy preview loading and a 200 ms mutation quiet period, followed by two frames; includes that deliberate quiet period. A 30-second wait cap applies after the synchronous mount; it cannot interrupt a blocked main thread.
- Long tasks: browser `PerformanceObserver` entries overlapping the measurement window, when supported. Durations include each whole task, including any small pre-window work. The first baseline capture used only entries starting inside the window and therefore omitted the already-running mount task; do not compare its long-task totals with the corrected harness.
- Element count: reader DOM elements after settling. `completeRawText` checks exact textarea equality with the entire generated fixture.

Use **Load 60K acceptance document** for interactive checks. Request the full preview, confirm the final Unicode marker renders, edit the raw text, and confirm the preview pauses again. **Switch document with identical text** changes `docId` without remounting the outer reader and must reset the request. **Download current Markdown** uses the actual pending-editor snapshot helper before downloading; compare the file with the latest editor text, including an edit made before its 250 ms parent commit.

The automatic preview threshold is a product guard, not a bound on parser complexity or a promise of smooth rendering. Small dense Markdown, very large native textareas, and an explicitly requested full preview can still block. Preserve full source text and exports when experimenting further; never substitute a truncated fixture for the real output.
