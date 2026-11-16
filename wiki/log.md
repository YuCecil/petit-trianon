# 工作紀錄

## [2026-11-15] rule | 建立專案
- 新增：CLAUDE.md、tools、templates、指令（/ingest、/new-topic、/ask、/wiki-lint、/illustrate）、網站骨架
- 決定：網站風格選「小特里亞儂」瓷器風（樣張 3）；吉祥物是王后的小狗；插圖一律用 Gemini（Claude in Chrome 操作、提示詞由主 session 寫）
- 下一步：第一批 10 個故事（蛋糕、赤字夫人、鑽石項鍊、一夜白頭、圓房、王后農莊、襯衣裙肖像、費爾森、瓦雷納、電影哪些是真的）

## [2026-11-15] ingest | 第一批 10 個故事
- 新增：t-cake、t-necklace、t-fersen、t-white-hair、t-chemise、t-hameau、t-varennes、t-coppola、t-consummation、t-deficit；資料卡 31 張（11 個 Haiku 平行蒐集，主 session 抽查）
- 更新：overview、timeline（+28）、places（+8）、debates（+3）
- 抽查：Campion-Vincent（Karr 1843、盧梭 1765）、Vizetelly（判決、p. 373、項鍊價格 pp. 110–111）、Campan（白髮 第 2 冊 pp. 150–151）、凡爾賽宮官網（「沒有扮演農夫」原句）都對得上原文
- 發現：Haiku 的 Necker 卡金額 OCR 不清；「兩個笨手笨腳的人」原信未找到；多數現代研究需台大資料庫
- 例外：第一批為了讓使用者先看到成品，部分故事低於 /new-topic 門檻（資料 4 份、學術研究 1 份），缺口已寫在各故事「還不知道的事」
- rule：lint 的引文長度改成外文以單字數計（40 字）、中文以字數計

## [2026-11-15] art | 吉祥物王后的小狗
- 新增：mascot.png、mascot-about.png、mascot-404.png（Gemini 生成，主 session 寫提示詞、檢查、去背）

## [2026-11-15] ingest | 擴寫第一批故事（第一輪）
- 更新：t-necklace、t-fersen、t-hameau、t-chemise、t-varennes 擴寫為 8–11 段，大量取自康龐、梅西通信、費爾森日記、圖澤爾、維傑．勒布倫原文（主 session 逐條抽查原文）
- 發現：費爾森日記寫邦迪、圖澤爾寫克萊；康龐說王后「看人擠牛奶」（第 1 冊 p. 298）；卡爾 1841 年 11 月號《黃蜂》已把「布里歐」安到王后頭上（早於研究者說的 1843）
- 待做：t-cake、t-deficit、t-white-hair、t-consummation、t-coppola 的擴寫材料已在 raw/notes/expand-*.md，尚未寫進故事頁；需替卡爾 1841 建資料卡

## [2026-11-16] ingest | 擴寫第一批（第二輪）與第二批 9 個故事
- 擴寫：t-cake（論文後半、卡爾 1841、梅西 1770 麵包降價）、t-deficit（梅西密報的債務與賭局、White 1989 全文、Colwill 1989）、t-white-hair（Nahm 2013 全文、圖澤爾 1792）、t-consummation（梅西通信、1774 手術傳言，新增判定）、t-coppola（康龐的更衣、用餐、公開生產）
- 新增故事：t-mops、t-pouf、t-dubarry、t-october-days、t-lamballe、t-temple、t-handover、t-polignac、t-bertin
- 新資料卡：s-1841-karr-guepes、s-1989-white-solution（台大資料庫全文）、s-1995-sargent-macroeconomic（部分）、s-1989-colwill-citoyenne（台大資料庫全文）、s-1798-clery-journal、s-1852-marie-therese-temple
- 網站：報導者式註釋（上標、原地展開、文末收合）、長文段落導覽、閱讀進度線、真實圖片 27 張（data/photos.json）、插圖 +8
- rule：CLAUDE.md 故事 8–14 段、註釋（8.4）、真實圖片（8.5）、使用者不自己下載論文
- 發現：吉祥物的 Mops 在梅西 1770 年 8 月的報告裡真的出現過；朗巴勒的頭被舉到聖殿塔窗前有克萊里的目擊紀錄

## [2026-11-16] ingest | 第四批、第五批與短篇擴寫
- 新增故事：t-august10、t-children、t-elisabeth、t-coronation、t-reburial、t-louis17（第四批）；t-libels、t-secret、t-tuileries、t-theatre、t-mesdames（第五批）
- 擴寫：t-reburial（1815 年官方挖掘紀錄，重寫）、t-bertin、t-chemise、t-hameau、t-mops、t-polignac、t-children
- 新資料卡：s-2006-kaiser-nursery、s-1992-price-vies-privees（台大 JSTOR 全文）、s-2024-kesterton-artificial-flowers、s-2024-nordin-hameau、s-2025-masson-theatre-reine（開放取用）、s-1907-lenotre-last-days-marie-antoinette、s-1851-mirabeau-lamarck、s-1822-weber-memoires-v2
- 更新：timeline +15、places +4、photos +3；插圖 t-coronation、t-reburial
- 修正：康龐第 1 冊 OCR 頁眉「298」實為 p. 228，t-hameau、t-chemise、t-theatre 頁碼已改；t-chemise 原本把兩段不同記載併成一句，已拆開
- 發現：「靠吊襪帶認出王后」出自 1825 年馬尼安神父的聲明，官方紀錄不是這樣認的；「這一吻救了君主制」只見於韋伯的二手傳聞，康龐筆下真正吻王后手的是巴納夫
- 缺插圖：t-libels、t-secret、t-tuileries、t-theatre、t-mesdames（t-libels 提示詞已寫好）
