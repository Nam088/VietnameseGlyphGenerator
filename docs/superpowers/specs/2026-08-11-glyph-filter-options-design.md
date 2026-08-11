# Thiết kế bổ sung: lọc chữ gốc, lọc output, và tìm candidate từ input lộn xộn

Ngày viết: 2026 08 11

## Bối cảnh

Sau khi refactor xong (xem `2026-08-11-glyph-generator-refactor-design.md`), cần thêm hai khả năng mới cho `generateGlyphs` và một hàm mới độc lập, để hỗ trợ quy trình chọn lọc glyph trước khi sinh:

1. Có lúc chỉ muốn sinh cho một số chữ gốc nhất định trong input (ví dụ chỉ `A`, `a`, `E`, `e`).
2. Có lúc muốn thu hẹp hơn nữa, chỉ giữ đúng một số dòng output cụ thể (ví dụ với `U.ss01`/`u.ss01` chỉ muốn có `Uhorn.ss01`/`uhorn.ss01`, bỏ hết `Ugrave.ss01`, `Uacute.ss01`...; với `i.ss01` chỉ muốn có `dotlessi.ss01`, bỏ hết `igrave.ss01`, `iacute.ss01`...).
3. Có lúc input là một chuỗi lộn xộn (dán từ danh sách glyph name của font, ngăn nhau bằng `/`), cần một hàm quét ra những token thật sự là chữ gốc tiếng Việt hợp lệ (có hoặc không có `.feature`), để hiển thị cho người dùng chọn tiếp trước khi gọi `generateGlyphs`.

## Mục tiêu

1. Thêm `onlyLetters?: string[]` vào `GlyphOptions`: nếu có giá trị, `generateGlyphs` chỉ xử lý token có chữ gốc nằm trong danh sách này, bỏ qua token khác dù chữ đó có trong `letterTable`.
2. Thêm `onlyOutputs?: string[]` vào `GlyphOptions`: nếu có giá trị, chỉ giữ lại dòng biến thể có tên output nằm trong danh sách này, áp dụng sau khi đã sinh (không quan tâm family nào sinh ra dòng đó). Hai field này độc lập, dùng riêng hoặc kết hợp đều được.
3. Thêm hàm mới `findGlyphCandidates(input: string): string[]`: nhận input dạng chuỗi ngăn nhau bằng `/` (giống format của `generateGlyphs`), trả về danh sách token được nhận diện là chữ gốc hợp lệ, dạng trần (`A`, `Uhorn`) hoặc có feature (`A.ss01`), loại bỏ token không khớp chữ gốc nào trong `letterTable` (ví dụ `Anvjnavj`, `xyz`), loại trùng, giữ thứ tự xuất hiện.

## Phi mục tiêu

1. `findGlyphCandidates` không tự sinh glyph cho token trần (không có `.feature`); nó chỉ để hiển thị/tham khảo. Người dùng tự chọn xong rồi tự nối lại bằng `/` và gọi `generateGlyphs` như thường.
2. Không hỗ trợ chọn theo family (nhóm dấu) như một field option riêng; `onlyOutputs` đã đủ linh hoạt để đạt hiệu quả tương đương ở mức chi tiết hơn (chọn đúng từng dòng output).
3. Không đổi hành vi hiện có khi không set `onlyLetters`/`onlyOutputs` (mặc định `undefined`, sinh như bình thường).

## Thiết kế

### `onlyLetters` và `onlyOutputs`

Thêm hai field optional vào `GlyphOptions` (`src/types.ts`). Không cần đưa vào `NormalizedGlyphOptions` vì các hàm trong `marks/*.ts` không cần đọc hai field này, chỉ `generate.ts` cần đọc trực tiếp từ `options` gốc.

Trong `generate.ts`, vòng lặp hiện tại:

```ts
for (const { base, features } of tokenize(cleanInput(input))) {
  const families = letterTable[base];
  if (!families) continue;

  const baseGlyph = `${base}.${features}`;
  for (const family of families) {
    for (const variant of markGenerators[family](base, features, normalizedOptions)) {
      result.addGlyph(baseGlyph, variant.output, variant.input);
    }
  }
}
```

Thêm hai điều kiện lọc:

```ts
for (const { base, features } of tokenize(cleanInput(input))) {
  const families = letterTable[base];
  if (!families) continue;
  if (options.onlyLetters && !options.onlyLetters.includes(base)) continue;

  const baseGlyph = `${base}.${features}`;
  for (const family of families) {
    for (const variant of markGenerators[family](base, features, normalizedOptions)) {
      if (options.onlyOutputs && !options.onlyOutputs.includes(variant.output)) continue;
      result.addGlyph(baseGlyph, variant.output, variant.input);
    }
  }
}
```

Ví dụ hành vi:

```ts
generateGlyphs('A.ss01/O.ss01', { onlyLetters: ['A'] });
// getAllBaseGlyphs() => ['A.ss01'], bỏ hoàn toàn O.ss01

generateGlyphs('U.ss01/u.ss01', { onlyOutputs: ['Uhorn.ss01', 'uhorn.ss01'] });
// chỉ có 2 dòng: Uhorn.ss01 = U.ss01+horn, uhorn.ss01 = u.ss01+horn

generateGlyphs('i.ss01', { onlyOutputs: ['dotlessi.ss01'] });
// chỉ có 1 dòng: dotlessi.ss01 = i.ss01
```

### `findGlyphCandidates`

File mới `src/candidates.ts`, tách riêng khỏi `generate.ts` vì đây là một quy trình khác (lọc để hiển thị, không sinh glyph).

```ts
import { cleanInput } from './parser/cleanInput';
import { letterTable } from './letters/letterTable';

export function findGlyphCandidates(input: string): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const part of cleanInput(input).split('/')) {
    if (part.length === 0 || seen.has(part) || !isRecognizedToken(part)) continue;
    seen.add(part);
    candidates.push(part);
  }

  return candidates;
}

function isRecognizedToken(part: string): boolean {
  const pieces = part.split('.');
  if (pieces.length === 1) return letterTable[pieces[0]] !== undefined;
  if (pieces.length === 2) return letterTable[pieces[0]] !== undefined && pieces[1].length > 0;
  return false;
}
```

`isRecognizedToken` chấp nhận hai dạng: chữ gốc trần (`pieces.length === 1`, phải là key hợp lệ trong `letterTable`) hoặc chữ gốc kèm feature (`pieces.length === 2`, phần đầu là key hợp lệ, phần sau không rỗng). Token có 0 hoặc từ 2 dấu chấm trở lên đều bị loại, giống nguyên tắc đã dùng ở `tokenize()`.

Ví dụ hành vi:

```ts
findGlyphCandidates('A/Anvjnavj/A.ss01/E/E.ss02/xyz/Uhorn');
// => ['A', 'A.ss01', 'E', 'E.ss02', 'Uhorn']

findGlyphCandidates('A/A/A.ss01');
// => ['A', 'A.ss01'] (loại trùng)
```

## Public API sau khi thêm

`index.ts` export thêm `findGlyphCandidates` bên cạnh `generateGlyphs`, `GlyphOptions`, `GlyphGenerationResult` đã có.

## Kế hoạch phiên bản

Đây là thêm tính năng mới (field optional, hàm export mới), không đổi hành vi cũ khi không dùng field mới, nên bump minor: 0.2.0 lên 0.3.0.
