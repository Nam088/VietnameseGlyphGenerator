# Thiết kế refactor VietnameseGlyphGenerator

Ngày viết: 2026 08 11

## Bối cảnh

`src/index.ts` hiện tại (khoảng 730 dòng) gói toàn bộ logic vào một class duy nhất (`VietnameseGlyphGenerator`) giữ state instance (`glyphCategories`) chỉ dùng tạm trong một lần gọi. Vấn đề chính không phải là tốc độ (input luôn ngắn) mà là kiến trúc rối và trùng lặp:

1. Sinh kết quả có cấu trúc (`GenerationResultImpl`), chuyển thành chuỗi `"input=output"`, rồi parse ngược chuỗi đó để build object kết quả cuối. Vòng round trip này hoàn toàn dư thừa.
2. `processGlyphByType` (đường batch, nhiều glyph) và `processSingleGlyph` (đường một glyph) là hai bản switch case gần như giống nhau.
3. `addList()` / `deleteList()` / `filterGlyphs()` / `filterRender()` tồn tại chỉ để nhóm và sắp thứ tự output khi có nhiều glyph, dùng field instance làm bộ nhớ tạm.
4. Nhiều comment tự nhận "optimized", "O(1) lookup", "better performance" không phản ánh cải tiến thật, gây hiểu nhầm khi đọc.
5. API công khai lẫn cả bản "modern" (`generateGlyphs` trả object) và "legacy" (`generateGlyphsAsString`, `filterI`, `filterHorn` trả chuỗi thô), cộng thêm hàm `generateGlyph` (hash ngẫu nhiên) không liên quan gì tới dấu tiếng Việt, là tàn dư từ code khởi tạo template.

Package chưa có người dùng phụ thuộc quan trọng nào ngoài phạm vi nội bộ (đang ở bản 0.1.3, semver 0.x), nên được tự do đổi public API. Thứ tự/nhóm dòng trong output nhiều glyph không phải hợp đồng bắt buộc với hệ thống nào khác, nên có thể bỏ.

## Mục tiêu

1. Xoá bỏ hoàn toàn state instance dùng làm biến tạm. Mọi hàm là pure function, chỉ phụ thuộc input truyền vào.
2. Xoá vòng round trip stringify rồi parse ngược khi build kết quả.
3. Gộp hai đường xử lý (single glyph, nhiều glyph) thành một, dựa trên một bảng dữ liệu khai báo cho từng chữ cái gốc, thay cho hai switch case trùng lặp.
4. Tách file theo trách nhiệm rõ ràng để dễ đọc, dễ test, dễ mở rộng thêm chữ cái hoặc nhóm dấu mới sau này.
5. Rút gọn public API xuống một điểm vào duy nhất, bỏ các hàm legacy dư thừa và hàm không liên quan tới miền bài toán.
6. Thiết lập vitest đầy đủ (config riêng, coverage) và bộ test theo từng module.

## Phi mục tiêu

1. Không thay đổi quy tắc sinh dấu tiếng Việt (huyền, sắc, ngã, hỏi, nặng, kết hợp mũ, trăng, móc). Nội dung sinh ra cho mỗi glyph giữ nguyên như hiện tại, chỉ đổi cách nó được lắp ráp.
2. Không giữ nguyên thứ tự/cách nhóm các dòng trong output nhiều glyph (đã xác nhận không quan trọng).
3. Không giữ tương thích ngược với `generateGlyphsAsString`, `filterI`, `filterHorn`, `generateGlyph` (hash). Các hàm này bị bỏ.
4. Không tối ưu hiệu năng theo nghĩa thuật toán (input luôn nhỏ), trọng tâm là cấu trúc và khả năng bảo trì.

## Kiến trúc

Chuyển từ một class giữ state sang tập hàm thuần. Chia nhỏ tối đa theo trách nhiệm, mỗi file một việc, mỗi hàm ngắn và đặt tên rõ nghĩa, không thêm lớp trừu tượng nào không phục vụ mục tiêu ở trên (không tạo abstraction cho tương lai chưa cần tới).

```
src/
  types.ts                 (type công khai: GlyphOptions, GlyphGenerationResult, Variant)
  options.ts                (normalizeOptions)
  marks/
    toneMarks.ts            (generateBasicToneMarks)
    circumflex.ts            (generateCircumflexCombinations)
    breve.ts                (generateBreveCombinations)
    horn.ts                (generateHornCombinations)
    dStroke.ts                (generateDStroke)
    dotlessI.ts              (generateDotlessI)
  letters/
    markFamilies.ts            (union type tên các nhóm dấu, map tên nhóm sang hàm trong marks/)
    letterTable.ts            (bảng: chữ cái gốc, danh sách nhóm dấu áp dụng)
  parser/
    cleanInput.ts            (gỡ slash đầu/cuối, khoảng trắng, line break, chuẩn hoá slash liên tiếp)
    tokenize.ts              (chuỗi đã sạch, danh sách token base/features)
  result.ts                (GlyphGenerationResult: toString, toJSON, getVariants, getInputPattern, getAllBaseGlyphs, addGlyph)
  generate.ts              (generateGlyphs, điều phối parser, letterTable, marks, result)
  index.ts                (export generateGlyphs và type công khai)
```

Vai trò từng phần:

1. `types.ts`. Chỉ type công khai. Các hằng số danh sách glyph mẫu hiện có (`CHARACTER_STYLES`, `GRAVE_ACCENT_GLYPHS`, `ACUTE_ACCENT_GLYPHS`, `TILDE_GLYPHS`, `HOOK_ABOVE_GLYPHS`, `DOT_BELOW_GLYPHS`, `CIRCUMFLEX_GLYPHS`, `BREVE_GLYPHS`, `HORN_GLYPHS`, `DOTLESS_I_GLYPHS`, `OPENTYPE_FEATURES`, `D_STROKE_GLYPHS`) đã xác nhận không được logic sinh dấu tiêu thụ, chỉ là dữ liệu tham khảo rời. Xoá hết.
2. `options.ts`. Một hàm `normalizeOptions(options)`, giữ nguyên toàn bộ giá trị fallback hiện có (grave, acute, tilde, hook above, dot below, circumflex, breve, horn, dotless i, open type feature, d stroke, và fallback secondary về primary).
3. `marks/*.ts`. Mỗi file một nhóm dấu, một hàm thuần nhận `(baseName, features, options)`, trả `Variant[]` (`{ output: string; input: string }`), build trực tiếp, không qua bước stringify. Sáu file tương ứng sáu nhóm dấu hiện có, không gộp chung một file lớn như bản cũ.
4. `letters/letterTable.ts`. Bảng dữ liệu khai báo, mỗi chữ cái gốc (A, a, E, e, I, i, O, o, U, u, Y, y, D, d, Ohorn, ohorn, Uhorn, uhorn) khai báo danh sách tên nhóm dấu áp dụng. Nguồn sự thật duy nhất, thay cho hai switch case trùng lặp (`processGlyphByType`, `processSingleGlyph`) trong code cũ.
5. `letters/markFamilies.ts`. Map tên nhóm dấu (dùng trong `letterTable.ts`) sang hàm generator tương ứng trong `marks/`. Tách riêng khỏi `letterTable.ts` để bảng dữ liệu chỉ chứa dữ liệu, không chứa import hàm.
6. `parser/cleanInput.ts`. Một hàm làm sạch chuỗi input (bỏ slash đầu/cuối, khoảng trắng, line break, chuẩn hoá nhiều slash liên tiếp thành một).
7. `parser/tokenize.ts`. Một hàm nhận chuỗi đã sạch, trả `{ base: string; features: string }[]`, bỏ qua token không hợp lệ (thiếu dấu chấm, hoặc chấm ở đầu/cuối).
8. `generate.ts`. Hàm điều phối `generateGlyphs(input, options)`: `cleanInput` rồi `tokenize`, với mỗi token tra `letterTable` lấy danh sách nhóm dấu, qua `markFamilies` gọi đúng hàm trong `marks/`, gộp toàn bộ variant vào kết quả theo đúng thứ tự token xuất hiện trong input.
9. `result.ts`. `GlyphGenerationResult` (giữ nguyên các phương thức tiện ích hiện có), build trực tiếp trong lúc generate, không round trip qua string.
10. `index.ts`. Export `generateGlyphs` và type công khai từ `types.ts`.

## Public API sau refactor

Một hàm duy nhất:

```ts
export function generateGlyphs(input: string, options?: GlyphOptions): GlyphGenerationResult
```

Không cần khởi tạo class vì không còn state nào để giữ. Người dùng muốn chuỗi thô thì gọi `result.toString()`.

Bị bỏ khỏi public API: `VietnameseGlyphGenerator` (class), `generateGlyphsAsString`, `filterI`, `filterHorn`, `generateGlyph` (hash), type `Options` (dùng cho hàm hash bị bỏ), và các hằng số danh sách glyph mẫu trong `types.ts` (không được logic nào tiêu thụ, xem phần Kiến trúc).

`GlyphOptions` giữ nguyên cấu trúc và toàn bộ field như hiện tại.

## Thay đổi hành vi trong phạm vi refactor này

1. Input nhiều glyph (`A.ss01/O.ss01/D.ss01`) không còn được nhóm lại theo feature (ví dụ gộp O với Ohorn) như `filterRender` hiện tại. Kết quả chỉ cần chứa đầy đủ mọi variant cho mọi token, không quan tâm thứ tự dòng khi in ra chuỗi.
2. Dotless i cho `i` được sinh trực tiếp trong `letters.ts`/`marks.ts` như một nhóm dấu bình thường, không còn là nhánh đặc biệt tách riêng như code hiện tại (`shouldCreateDotlessI` vẫn là field điều khiển trong `GlyphOptions`, hành vi bật/tắt giữ nguyên).
3. Horn cho O/U vẫn điều khiển qua `shouldCreateHorn` như hiện tại.

## Thiết lập vitest

1. Thêm `vitest.config.ts` ở root repo: `environment: 'node'`, `include: ['src/**/*.test.ts']`, cấu hình `coverage` dùng provider `v8`, reporter gồm `text` và `html`, đặt threshold tối thiểu 90% cho statements/branches/functions/lines trên các file logic chính (`letters.ts`, `marks.ts`, `parser.ts`, `generate.ts`, `options.ts`).
2. Thêm `@vitest/coverage-v8` vào `devDependencies`.
3. Thêm script trong `package.json`: `test:watch` chạy `vitest`, `test:coverage` chạy `vitest --run --coverage`. Giữ script `test` hiện tại (`vitest --run`) để CI dùng.
4. Mỗi file nguồn có file test cạnh nó cùng tên: `options.test.ts`, `marks/toneMarks.test.ts`, `marks/circumflex.test.ts`, `marks/breve.test.ts`, `marks/horn.test.ts`, `marks/dStroke.test.ts`, `marks/dotlessI.test.ts`, `letters/letterTable.test.ts`, `parser/cleanInput.test.ts`, `parser/tokenize.test.ts`, `generate.test.ts`. Ngoài ra giữ `index.test.ts` làm test đầu cuối (end to end) cho `generateGlyphs`, viết lại theo API mới, bao phủ: mỗi chữ cái gốc sinh đúng nhóm dấu, input rỗng, input một glyph, input nhiều glyph, token không hợp lệ (thiếu dấu chấm, chấm ở đầu/cuối chuỗi), và các flag `shouldCreateHorn`/`shouldCreateDotlessI`.

## Kế hoạch phiên bản

Vì đổi public API, bump minor version (0.1.3 lên 0.2.0) kèm ghi chú breaking change trong changelog/release note, giải thích API mới và lý do bỏ các hàm legacy.

## Rủi ro và cách giảm rủi ro

1. Rủi ro chính là sai lệch quy tắc sinh dấu khi chuyển từ switch case sang bảng dữ liệu khai báo. Giảm rủi ro bằng cách viết test cho từng chữ cái gốc trước khi xoá code cũ, đối chiếu output với bộ test hiện có (`src/index.test.ts`) như tập case tham chiếu trước khi xoá file cũ.
2. Vì bỏ `filterRender`, nội dung output nhiều glyph sẽ khác thứ tự so với hiện tại. Đã xác nhận điều này không phải hợp đồng bắt buộc, nên không cần test giữ nguyên thứ tự dòng, chỉ cần test tập variant đầy đủ và đúng.
