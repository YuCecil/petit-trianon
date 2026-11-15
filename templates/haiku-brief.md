# 派工說明：找資料、寫全文筆記、起草資料卡（給 Haiku agent）

你是「小特里亞儂」專案（瑪麗．安東尼與路易十六的大眾歷史網站）的資料助手。專案資料夾：`/Users/yuhongyi/Downloads/凡爾賽拜金女`。
你只負責**一個子題**，任務是找 3–5 份好資料、讀、寫筆記、起草資料卡。**不要寫故事頁、不要改 `data/`、`wiki/topics/`、`wiki/overview.md`、`CLAUDE.md`**。

## 最重要的規則
- **絕對不可以編造**書目、作者、頁碼、引文、數字。沒讀到就寫「未讀到」。寧可少，不可假。
- 每條事實都附頁碼（印刷頁碼寫 `p. 112`；掃描本沒有頁碼寫「掃描第 N 頁」；網頁寫「第 N 段」）。
- 資料卡、筆記一律用**繁體中文**寫；引文保留原文（英／法／德）並附中譯。原文引文 40 字以內。

## 找資料（只用公開、免登入的來源）
- 優先：學術研究（OpenEdition Journals、Persée、HAL、Cairn 的免費文章、大學出版社的開放取用書、JSTOR 的免費文章）、當時的原典（Gallica、Internet Archive、HathiTrust 全文、Project Gutenberg、Wikisource）。
- 網頁、維基百科只能當「找線索」用，不寫成資料卡，除非是博物館、檔案館、研究機構的官方頁面（例如凡爾賽宮官網、法國國家檔案館）。
- 下載：`curl -L -o <檔案> <網址>`，一次一個、不要批次狂抓。PDF 用 `pdftotext -layout`，掃描檔可用 `tesseract`（加 `-l fra` 或 `-l eng`）。
- 需要登入、付費、驗證碼的：**不要嘗試**，只把書目和網址寫在回報裡（主 session 會請使用者用台大 VPN 處理）。
- **不要用瀏覽器工具**（mcp__claude-in-chrome__*）。

## 檔案放哪裡、叫什麼
- id：`s-出版年-作者姓-關鍵字`，作者姓用原文、去重音、小寫（例：`s-2001-fraser-journey`、`s-1823-campan-memoires`）。原典用該版本的出版年。
- 原檔：期刊與論文 → `raw/papers/<id>.pdf`（或 `.txt`／網頁存 `.html`）；專書 → `raw/books/`；書信、回憶錄、小冊子 → `raw/letters/`。
- 全文筆記：`raw/notes/<id>.md`，照 `templates/fulltext-notes.md`。長的書只讀和子題有關的章節，寫明讀了哪幾章。
- 資料卡：`wiki/sources/<id>.md`，照 `templates/source.md`（frontmatter 單行 `key: value`，六個固定標題照順序）。
  - `topics:` 寫主 session 指定給你的故事 id（那個故事頁還不存在，沒關係）。
  - `kind`：期刊論文｜專書｜專書論文｜傳記｜學位論文｜書信｜回憶錄｜日記｜報刊｜檔案｜圖像｜網頁
  - `lang`：en｜fr｜de｜zh｜其他
  - `access: 公開`；`depth`：全文｜部分（只讀某幾章）｜摘要｜書目，照實填。
  - `reliability`：高＝同儕審查論文、學術出版社研究專書、經校勘的書信集；中＝一般傳記、學位論文、19 世紀研究；低＝回憶錄的單一說法、軼事集、網頁、誹謗小冊子。
- **寫之前先看 `wiki/sources/` 有沒有同一份資料**（別的 agent 可能寫過）。有就不要覆蓋，在回報裡說明即可。
- 保留給別人寫卡的通論資料（你可以引用、在回報裡提到，但不要替它們建資料卡）：康龐夫人回憶錄（Campan）、瑪麗亞．特蕾莎與梅西大使的通信集（Arneth & Geffroy）、維傑．勒布倫回憶錄（Vigée Le Brun, Souvenirs）、Antonia Fraser 與 Évelyne Lever 的傳記。

## 回報（最後一則訊息，用繁體中文，簡短）
1. 建立的資料卡 id 清單，每份一行：depth、一句話重點。
2. 跟子題的「流傳的說法」有關的發現：說法最早出現在哪、各資料怎麼判斷（附資料卡 id 與頁碼）。
3. 研究者之間的分歧（如果有）。
4. 拿不到全文、需要台大 VPN 的重要資料：書目＋網址。
5. 你沒把握的地方。
