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
