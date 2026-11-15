# 派工說明：替既有故事挖更多材料（給 Haiku agent）

專案：`/Users/yuhongyi/Downloads/凡爾賽拜金女`（瑪麗．安東尼與路易十六的大眾歷史網站）。
目的：現有故事頁太短。你負責 1–2 個故事，替它們**找更多有頁碼的具體細節**（人物、場景、對話、數字、時間），讓主 session 把故事擴寫。你不寫故事頁。

## 先讀
- 你負責的故事頁 `wiki/topics/<id>.md`（看已經寫了什麼、「還不知道的事」缺什麼）。
- `templates/haiku-brief.md`（資料卡格式、id、可信度、不可編造等規則，全部照做）。

## 第一件事：挖已經下載的原典（最重要，在 raw/letters/ 與 raw/books/）
- 康龐夫人回憶錄 `s-1823-campan-memoires-v1/v2/v3.txt`（法文 OCR；第 2 冊有長篇鑽石項鍊、瓦雷納；頁碼看文字中單獨一行的數字或「MÉMOIRES DE MADAME CAMPAN」頁眉旁的數字）
- 梅西大使與瑪麗亞．特蕾莎秘密通信 `s-1874-arneth-mercy-correspondance-v1/v2/v3.txt`（1770–1780，王后日常、花費、賭博、圓房、髮型、小特里亞儂）
- 約瑟夫二世書信 `s-1866-*`、`s-1867-*`；維傑．勒布倫回憶錄 `s-1835-*`；圖澤爾夫人回憶錄 `s-1883-tourzel-memoires-t1.txt`；費爾森文件 `s-1877-klinckowstrom-fersen.txt`；Vizetelly `raw/books/s-1881-vizetelly-diamond-necklace.html`
- 用 `grep -n -i` 找關鍵字（法文、英文都試），再用 `sed -n '起,迄p'` 讀前後文。不要整份讀。
- 這些原典已經有資料卡，**不要新建它們的卡**。

## 第二件事：找 1–3 份新的開放取用學術全文
- OpenEdition Journals、Persée、HAL、Europe PMC（醫學：`https://www.ebi.ac.uk/europepmc/webservices/rest/<PMCID>/fullTextXML` 可以直接抓全文）、大學機構典藏。
- 讀到全文才建資料卡（照 haiku-brief）；全文筆記寫 `raw/notes/<id>.md`。
- 要登入或付費的：**不要下載**，把「完整書目＋可以直接點的網址（JSTOR stable URL、DOI 連結或出版社頁面）」寫進回報，主 session 會試著用台大資料庫讀（使用者不自己下載）。

## 產出：`raw/notes/expand-<故事id>.md`
每條一行，格式：
- 【細節】一句繁體中文說明（具體：誰、何時、何地、說了什麼、多少錢）｜出處：資料卡 id＋頁碼（或冊次＋行號）｜原文（40 字以內）
目標每個故事 **15–25 條**新的、故事頁還沒寫到的細節。標出哪些是當事人單方說法。
也列出：跟故事頁現有說法**矛盾**的地方。

## 回報（繁體中文，簡短）
1. 寫了哪些 expand 筆記、各幾條。
2. 新建的資料卡 id（depth）。
3. 拿不到全文的資料：書目＋網址，一行一份（主 session 會試台大資料庫）。
