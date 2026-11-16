---
description: 新故事：針對一個題目自己找資料、讀全文，建立一個完整的新故事頁
argument-hint: "<主題，例如：王后的熱巧克力>"
---

# /new-topic — 新增一個故事

主題：$ARGUMENTS

全部照 CLAUDE.md 的規則做；以下是順序與「做完」的標準。

## 1. 先了解現況
- 讀 `CLAUDE.md`（全部）、`wiki/index.md`、`wiki/overview.md`。
- 確認還沒有這個故事；重疊很多就改成擴充既有故事，並告訴使用者原因（CLAUDE.md 4.4）。
- 決定 `id`、`category`（八選一，判準見 4.4）、時期；這個題目有沒有「流傳的說法」要拆解（有就要填 `myth`／`verdict`）。

## 2. 找資料（門檻：至少 4 份資料，至少 2 份讀到全文或完整章節，至少 1 份學術研究）
- 依 CLAUDE.md 6.1「全文去哪裡找」：先公開資源（Gallica、Internet Archive、HathiTrust、OpenEdition、Persée、HAL…），再台大資料庫。
- 需要台大 VPN 時，**先告訴使用者，等使用者連好再開始**，並遵守 6.5（小量、慢速、驗證碼交給使用者）。
- 照 6.4 派 Haiku 平行蒐集：每個只負責 2–4 份資料或一個子題；需要瀏覽器的一次只派一個。派工 prompt 裡寫清楚資料卡格式、頁碼寫法、可信度判準、「不可編造」。

## 3. 每份資料
歸檔到 `raw/` → 全文筆記 `raw/notes/<id>.md`（附頁碼）→ 資料卡 `wiki/sources/<id>.md`。主 session **抽查**每個 Haiku 至少一張資料卡（6.4）。

## 4. 寫故事頁（主 session 自己寫）
- 照 `templates/topic.md`，標題用「主標：副標」。
- 有 `myth` 就寫「迷思與史料」，判定照 4.4 的標準。
- 「故事是這樣的」4–6 段、每段 3–5 句，有人、有場景、有細節，每段附出處。引用回憶錄要寫出誰說的、什麼時候寫的。
- 「研究者怎麼看」：看法不同時各方並陳；有明確分歧就加 `data/debates.json`。
- 「還不知道的事」列出缺口。

## 5. 頁首插圖（選做，見 `rules/site.md` 8.2 與 `/illustrate`）
沒有圖也算完成；回報時寫「缺插圖」並附上主 session 寫好的提示詞。

## 6. 接上整個網站
- `data/timeline.json` 至少 3 個事件；有地點加 `places.json`；有數字加 `stats.json`。
- 在至少 2 個相關的既有頁面加上 `[[新故事 id]]`；更新 `wiki/overview.md`。
- 兩頁以上會提到的人物、地點建實體頁。

## 7. 檢查與記錄
- `python3 tools/build.py && python3 tools/lint.py`，錯誤修到 0。
- `wiki/log.md` 加一筆；更新 `進度.txt`。

## 做完的標準
新故事出現在首頁的盤子目錄、時間軸有它的事件、lint 0 錯誤、每一句事實都有出處。最後用白話回報：讀了哪些資料（全文幾份）、故事寫了什麼、迷思判定是什麼、還缺什麼。
