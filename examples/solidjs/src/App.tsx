import { createSignal, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { generateGlyphs, findGlyphCandidates, type GlyphOptions } from 'vgg';

type TextFieldKey =
  | 'graveAccentGlyph' | 'acuteAccentGlyph' | 'tildeGlyph' | 'hookAboveGlyph' | 'dotBelowGlyph'
  | 'circumflexGlyph' | 'breveGlyph' | 'hornGlyphUppercase' | 'hornGlyphLowercase'
  | 'secondaryGraveGlyph' | 'secondaryAcuteGlyph' | 'secondaryTildeGlyph' | 'secondaryHookAboveGlyph'
  | 'dStrokeUppercaseGlyph' | 'dStrokeLowercaseGlyph';

const TEXT_FIELDS: { key: TextFieldKey; label: string; placeholder: string }[] = [
  { key: 'graveAccentGlyph', label: 'Grave (dấu huyền)', placeholder: 'grave' },
  { key: 'acuteAccentGlyph', label: 'Acute (dấu sắc)', placeholder: 'acute' },
  { key: 'tildeGlyph', label: 'Tilde (dấu ngã)', placeholder: 'tilde' },
  { key: 'hookAboveGlyph', label: 'Hook above (dấu hỏi)', placeholder: 'hookabovecomb' },
  { key: 'dotBelowGlyph', label: 'Dot below (dấu nặng)', placeholder: 'dotbelowcomb' },
  { key: 'circumflexGlyph', label: 'Circumflex (dấu mũ)', placeholder: 'circumflex' },
  { key: 'breveGlyph', label: 'Breve (dấu trăng)', placeholder: 'breve' },
  { key: 'hornGlyphUppercase', label: 'Horn hoa (Ơ, Ư)', placeholder: 'horn' },
  { key: 'hornGlyphLowercase', label: 'Horn thường (ơ, ư)', placeholder: 'horn' },
  { key: 'secondaryGraveGlyph', label: 'Secondary grave', placeholder: 'fallback theo grave' },
  { key: 'secondaryAcuteGlyph', label: 'Secondary acute', placeholder: 'fallback theo acute' },
  { key: 'secondaryTildeGlyph', label: 'Secondary tilde', placeholder: 'fallback theo tilde' },
  { key: 'secondaryHookAboveGlyph', label: 'Secondary hook above', placeholder: 'fallback theo hook above' },
  { key: 'dStrokeUppercaseGlyph', label: 'D stroke hoa (Đ)', placeholder: 'hyphen.case' },
  { key: 'dStrokeLowercaseGlyph', label: 'D stroke thường (đ)', placeholder: 'hyphen.case' }
];

const DEFAULT_TEXT_VALUES: Record<TextFieldKey, string> = {
  graveAccentGlyph: 'grave',
  acuteAccentGlyph: 'acute',
  tildeGlyph: 'tilde',
  hookAboveGlyph: 'hookabovecomb',
  dotBelowGlyph: 'dotbelowcomb',
  circumflexGlyph: 'circumflex',
  breveGlyph: 'breve',
  hornGlyphUppercase: 'horn',
  hornGlyphLowercase: 'horn',
  secondaryGraveGlyph: '',
  secondaryAcuteGlyph: '',
  secondaryTildeGlyph: '',
  secondaryHookAboveGlyph: '',
  dStrokeUppercaseGlyph: 'hyphen.case',
  dStrokeLowercaseGlyph: 'hyphen.case'
};

function emptyToUndefined(value: string): string | undefined {
  return value.trim() === '' ? undefined : value.trim();
}

function parseCommaList(value: string): string[] | undefined {
  const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  return items.length > 0 ? items : undefined;
}

export default function App() {
  const [rawInput, setRawInput] = createSignal('A/Anvjnavj/A.ss01/E/E.ss02/O.ss01/U.ss01/u.ss01/i.ss01/xyz');
  const [candidates, setCandidates] = createSignal<string[]>([]);
  const [selected, setSelected] = createSignal<Set<string>>(new Set());

  const [textFields, setTextFields] = createStore<Record<TextFieldKey, string>>({ ...DEFAULT_TEXT_VALUES });
  const [shouldCreateHorn, setShouldCreateHorn] = createSignal(true);
  const [shouldCreateDotlessI, setShouldCreateDotlessI] = createSignal(true);
  const [onlyLetters, setOnlyLetters] = createSignal('');
  const [onlyOutputs, setOnlyOutputs] = createSignal('');

  const [resultText, setResultText] = createSignal('');
  const [resultJson, setResultJson] = createSignal('');

  function scanCandidates() {
    const found = findGlyphCandidates(rawInput());
    setCandidates(found);
    setSelected(new Set(found));
  }

  function toggleSelected(token: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }

  function buildOptions(): GlyphOptions {
    const options: GlyphOptions = { shouldCreateHorn: shouldCreateHorn(), shouldCreateDotlessI: shouldCreateDotlessI() };

    for (const field of TEXT_FIELDS) {
      options[field.key] = emptyToUndefined(textFields[field.key]);
    }

    options.onlyLetters = parseCommaList(onlyLetters());
    options.onlyOutputs = parseCommaList(onlyOutputs());

    return options;
  }

  function runGenerate(input: string) {
    const result = generateGlyphs(input, buildOptions());
    setResultText(result.toString());
    setResultJson(result.toJSON());
  }

  return (
    <div class="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div class="mx-auto max-w-6xl">
        <h1 class="text-2xl font-bold">Vietnamese Glyph Generator - Demo</h1>
        <p class="mt-1 text-sm text-slate-500">
          SolidJS + TypeScript + Tailwind, dùng trực tiếp source trong <code class="rounded bg-slate-200 px-1">src/</code> của thư viện.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section class="space-y-6">
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="font-semibold">1. Input &amp; candidate</h2>
              <textarea
                class="mt-2 h-24 w-full rounded border border-slate-300 p-2 font-mono text-sm"
                value={rawInput()}
                onInput={event => setRawInput(event.currentTarget.value)}
              />
              <div class="mt-2 flex gap-2">
                <button
                  class="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                  onClick={scanCandidates}
                >
                  Quét candidate
                </button>
                <button
                  class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => runGenerate(rawInput())}
                >
                  Generate trực tiếp từ input
                </button>
              </div>

              <div class="mt-3 max-h-56 space-y-1 overflow-y-auto rounded border border-slate-200 p-2">
                <For each={candidates()} fallback={<p class="text-sm text-slate-400">Chưa quét, hoặc không có candidate hợp lệ.</p>}>
                  {token => (
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected().has(token)}
                        onChange={() => toggleSelected(token)}
                      />
                      <span class="font-mono">{token}</span>
                    </label>
                  )}
                </For>
              </div>

              <button
                class="mt-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
                disabled={selected().size === 0}
                onClick={() => runGenerate(Array.from(selected()).join('/'))}
              >
                Generate từ candidate đã chọn ({selected().size})
              </button>
            </div>

            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="font-semibold">2. Options</h2>

              <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <For each={TEXT_FIELDS}>
                  {field => (
                    <label class="text-sm">
                      <span class="block text-slate-600">{field.label}</span>
                      <input
                        class="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                        placeholder={field.placeholder}
                        value={textFields[field.key]}
                        onInput={event => setTextFields(field.key, event.currentTarget.value)}
                      />
                    </label>
                  )}
                </For>
              </div>

              <div class="mt-3 flex gap-4">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={shouldCreateHorn()} onChange={event => setShouldCreateHorn(event.currentTarget.checked)} />
                  shouldCreateHorn
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={shouldCreateDotlessI()} onChange={event => setShouldCreateDotlessI(event.currentTarget.checked)} />
                  shouldCreateDotlessI
                </label>
              </div>

              <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label class="text-sm">
                  <span class="block text-slate-600">onlyLetters (phân tách bởi dấu phẩy)</span>
                  <input
                    class="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                    placeholder="A, a, E, e"
                    value={onlyLetters()}
                    onInput={event => setOnlyLetters(event.currentTarget.value)}
                  />
                </label>
                <label class="text-sm">
                  <span class="block text-slate-600">onlyOutputs (phân tách bởi dấu phẩy)</span>
                  <input
                    class="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                    placeholder="Uhorn.ss01, uhorn.ss01"
                    value={onlyOutputs()}
                    onInput={event => setOnlyOutputs(event.currentTarget.value)}
                  />
                </label>
              </div>
            </div>
          </section>

          <section class="space-y-6">
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="font-semibold">Kết quả (toString)</h2>
              <pre class="mt-2 h-64 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{resultText() || '(chưa generate)'}</pre>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 class="font-semibold">Kết quả (toJSON)</h2>
              <pre class="mt-2 h-64 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{resultJson() || '(chưa generate)'}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
