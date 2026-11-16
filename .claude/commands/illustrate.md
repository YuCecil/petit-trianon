---
description: 插圖：主 session 寫提示詞，用 Claude in Chrome 操作 Gemini 生成或修改插圖，檢查後放進網站
argument-hint: "<故事id 或 mascot>"
---

# /illustrate — 生成插圖

對象：$ARGUMENTS

照 `rules/site.md` 8.2、8.3 與 `templates/illustration-prompt.md` 做。

1. **讀內容**：讀該故事頁，挑一個有出處、適合畫的場景或物件。吉祥物則讀 `rules/site.md` 8.3 的造型描述。
2. **主 session 親自寫提示詞**（照模板，完整寫出畫風與配色）。
3. **操作 Gemini**：用 Claude in Chrome 開新分頁到 gemini.google.com，貼上提示詞、等生成、下載原圖到 `raw/images/`。可以派一個 Haiku 做這步，但 prompt 要寫明「提示詞原封不動照貼、不可改寫；只在 Gemini 分頁操作；遇到登入、驗證碼或錯誤就停下回報」。一次只派一個。
4. **主 session 檢查**：打開圖看畫風是否一致、有沒有文字、手和臉有沒有崩壞、內容是否符合出處。不行就寫修圖提示詞，回到步驟 3。
5. **放進網站**：縮成 `docs/assets/img/<故事id>.jpg`（寬 1000px、品質 70），故事頁加 `image`、`imageAlt`；吉祥物照 8.3 的檔名，去背成透明 PNG。
6. `python3 tools/build.py && python3 tools/lint.py`；`wiki/log.md` 加一筆 `art`。
