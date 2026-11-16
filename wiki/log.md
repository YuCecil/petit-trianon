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

## [2026-11-16] ingest | 收尾：插圖、真實圖片、三篇擴寫
- 插圖：t-libels、t-secret、t-tuileries、t-theatre、t-mesdames（Gemini，主 session 寫提示詞並逐張檢查）
- 真實圖片 +8：米拉波、巴納夫、格魯克、王后劇場入口、杜樂麗宮（1802）、聯盟節（19 世紀版畫）、阿德萊德夫人、維克多瓦夫人
- 擴寫：t-white-hair（1793 年審判中米什尼的證詞「才開始變灰」、克萊里 1796 年信、朗巴勒遺物清單、Navarini 2010）、t-louis（打獵、「愛喝酒」謠言的來源、塔裡讀的書、Olalde 2014 DNA 研究）、t-louis17（西蒙的多種說法、英國間諜報告）
- 新資料卡：s-2010-navarini-henry-iii-hair、s-2014-olalde-louis-xvi-blood（開放取用）

## [2026-11-16] rule | 手機檢查列為標準流程
- 新增 tools/mobile_check.mjs（Playwright 模擬三種手機＋可選 Lighthouse）；CLAUDE.md 第 9、12 節改寫
- site：註碼按鈕點擊範圍放大到 24px 以上、地圖圓點點擊範圍 28px；手機檢查 0 錯誤 0 提醒
- 新增故事：t-conciergerie、t-madame-royale、t-figaro；擴寫 t-necklace、t-varennes、t-coppola、t-consummation、t-fersen、t-pouf

## [2026-11-16] ingest | 加速批次（分身平行寫作）
- 新增故事：t-joseph、t-clery、t-june20、t-lafayette、t-vermond（後兩篇在額度用完時中斷，主 session 抽查引文後補連結上線）
- 擴寫：t-handover、t-deficit、t-children（公開生產一節；修正陣痛時間為半夜十二點半）
- 修正：t-deficit 一處手鐲流言的頁碼與日期不符，改用 1776 年秋女皇來信
- site：首頁盤子「判定」小字 11.5px→12px；手機檢查 3 種手機 × 56 頁，0 錯誤 0 提醒

## [2026-11-16] rule | 手機檢查改為只測 iPhone 17（WebKit）
- 使用者決定：平常與大改版都只測 iPhone 17；改用 WebKit 核心，比 Chrome 模擬更接近 Safari
- site：WebKit 抓到故事頁可左右滑動 8px（資料卡長外文標題不換行），已修正；段落導覽連結與註碼點擊範圍加大；手機檢查 0 錯誤 0 提醒

## [2026-11-16] ingest | 收尾：人物頁、真實圖片、兩處修正
- 新增：e-mercy（梅西大使）、e-tourzel（圖澤爾夫人）。原本打算各寫一篇故事，但兩人都只有一份資料（Arneth 1874 書信集、Tourzel 1883 回憶錄），不夠開新故事（規則 4.4），改建人物頁；勒布倫的流亡已寫在 t-vigee，不另開。
- 更新：s-1883-tourzel-memoires（標題、作者本名、period、topics 補齊為 18 篇）；s-1874-arneth-mercy-correspondance（entities）；s-2021-michelin-xrf（「八封」與「15 封」不矛盾：15 封塗黑、讀出 8 封）；t-theatre 刪掉已由 t-figaro 回答的缺口。
- 真實圖片（Wikimedia Commons／Paris Musées）：t-conciergerie、t-madame-royale、t-figaro、t-joseph、t-clery、t-june20、t-lafayette 各一張，記入 data/photos.json。t-vermond 找不到合適的公有領域圖。
- 插圖：t-conciergerie、t-madame-royale、t-figaro、t-joseph、t-clery、t-june20、t-lafayette、t-vermond 各一張頁首插圖（Gemini，提示詞見 log 同日；Haiku 操作，主 session 看過）。

## [2026-11-16] rule | 省 token：規則拆檔、引文自動核對
- CLAUDE.md 第 8、9 節（網站風格、網站程式、插圖、真實圖片、手機檢查）搬到 rules/site.md，CLAUDE.md 只留語氣、用字、出處與圖片語法，並寫明哪些工作要先讀 rules/site.md；4.1 的 frontmatter 範例改成精簡的可填值清單（欄位以 templates/ 為準）。CLAUDE.md 從約 3.3 萬字元減到約 2.3 萬。
- 新增 tools/check_quotes.py：把全文筆記與資料卡的外文引文拿去 raw/ 全文比對（容許 OCR 錯字、長 s、跨頁頁眉；只換一個字的假引文擋得住）。6.4 抽查、haiku-brief、haiku-expand-brief 改成先跑它。第一次全站掃描：2,220 句外文引文，143 句待人工對照（抽看的樣本多為 OCR 太差），16 句出處可能標錯，105 句的資料沒有存全文。
- 使用者同意（「34都做」）。

## [2026-11-16] rule | 不用分身派工
- CLAUDE.md 6.4 新增：不用分身（fork）寫故事或找資料，改派全新的 Haiku 或一般助手並只給簡短說明。
- 「一次對話只做一件事」不寫進規則：更新進度已有全域規定，且會妨礙使用者讓 AI 半夜自己跑。
- 使用者同意（「改」）。

## [2026-11-16] ingest | 補學術研究：瑪麗－泰蕾茲、約瑟夫二世、克萊里、韋爾蒙、梅西
- 新增：s-2026-mensch-reine-morte、s-2013-chatenet-becquet-review、s-1990-boutry-roi-martyr、s-2017-niedziela-joseph-ii-paris、s-2026-varadi-temoins-thesis、s-2010-varadi-verbum-memoires、s-2025-seth-antoine、s-1879-goncourt-marie-antoinette、s-1903-funck-brentano-collier、s-1989-wolf-lameth-mercy、s-1992-wolf-duport-mercy、s-1919-hubert-mercy-dispatches、s-1994-neuhaus-mercy-ndb
- 更新：t-madame-royale（復辟時期的「準王后」、封聖請求）、t-joseph、t-consummation（包莖手術說與陰道痙攣說並陳）、t-clery（離塔、入獄、1800 年偽版、晚年）、t-vermond、t-secret（1792 年立憲派沒有經梅西與維也納密談）、e-mercy；debates.json t-consummation +2
- 發現：Wolf 1989 正文把拉梅特的信印成 1793 年，標題與 Wolf 1992 都是 1792 年，採 1792。Váradi 2010 說克萊里日記「近百年沒再版」，與同作者博士論文列的 1807、1823、1825 年版矛盾，不採用。圖澤爾夫人沒找到學術研究。
- 派工：5 個 Haiku 找資料、1 個 Haiku 用瀏覽器讀 Persée；主 session 抽查 Niedziela、Mensch、Váradi、Seth、Goncourt、Wolf 原文，均相符。

## [2026-11-16] lint | 引文清查
- check_quotes.py 全站 157 句待查，分 4 個 Haiku 逐條對原文：絕大多數是 OCR、斷行或沒存全文；實際修正 5 句、改出處 4 句、標【查無原文】2 句（"deux francs maladroits"、"nous sommes trop jeunes pour régner"），兩句故事頁原本就寫明查不到或是流傳版本，故事頁不用改。

## [2026-11-16] site | 長文閱讀改版（參考新聞媒體）
- Haiku 用背景瀏覽器截圖並量測報導者、端傳媒、BBC、The Guardian、NYT、The Pudding 等 10 篇長文（NHK、Reuters 擋掉）。
- 改：手機頂欄一行＋選單按鈕、捲動時收起頂欄；註號移到句末標點後並不拆行；電腦內文 18px；手機首圖滿版；浮動「目錄」標出目前小節；故事結尾「接著讀」盤子；寬螢幕旁註欄（註釋、圖說）。rules/site.md 同步更新。
- 手機檢查 0 錯誤。使用者另把「3D 互動」列入待做。

## [2026-11-16] query | 台大資料庫試查
- ScienceDirect 出現驗證碼，停；JSTOR 只找到約瑟夫二世史學回顧（不相關）；MUSE 上 Hosford 2004、Kaiser 2003 都是杜克大學出版社期刊，台大無權限。

## [2026-11-16] ingest | 黑暗伯爵夫人 DNA 研究（Parson 等 2015）
- 新增：s-2015-parson-dark-countess（台大資料庫，ScienceDirect；書目以 Crossref 核對）
- 更新：t-madame-royale（研究者怎麼看：遺骨 mtDNA 與王室母系不符，替身說站不住）
- 全文因著作權未存 raw，只存書目與結構摘要。

## [2026-11-16] site | 3D 立體地圖試做：小特里亞儂
- 新增 tools/trianon3d.py、data/trianon3d-spots.json（10 個地點，各附故事與出處）、docs/assets/trianon3d.js、docs/assets/trianon3d.json；放進 t-hameau。
- 建築與水域輪廓：OpenStreetMap（2026-11-16 擷取，ODbL），存 raw/maps/。高度為示意。
- rules/site.md 加 3D 地圖規則。手機檢查 0 錯誤。

## [2026-11-16] site | 互動改版：導覽、先猜再揭曉、聖殿塔時間軸
- 使用者覺得只能轉的 3D 地圖很無聊。小特里亞儂改成 7 站導覽（1774–1901），鏡頭依序飛到各站，附出處。
- 新增 docs/assets/play.js：t-deficit「你猜猜看」（White 1989 p. 552；梅西 1777 年 1 月 17 日信），t-temple「一家五口，一個一個被帶走」（克萊里、瑪麗－泰蕾茲、圖澤爾、Feuillet、Lafont d'Aussonne）。
- 修正：3D 地圖劇場說明的出處改為康龐夫人回憶錄 p. 228；乳品室刪除無出處的一句。
- 手機檢查 0 錯誤。

## [2026-11-16] site | 聖殿塔改成 3D 動畫（十二幕）
- 使用者覺得互動精緻度不夠，要求用 three.js 做成動畫。新增 docs/assets/temple3d.js：大塔、小塔依克萊里 1798 年 pp. 20–21、51–53 重建（四層拱頂、中央大柱、四角塔樓、木板隔間、窗外鐵條與遮板）；巴黎用真實座標，塞納河取自 OpenStreetMap（Nominatim，2026-11-16，存 raw/maps/）。
- 十二幕：入塔、9 月 3 日、搬進大塔、12 月 11 日、告別、國王處決、王子被帶走、王后移古監獄、王后處決、伊莉莎白夫人、王子之死、公主出塔。新增王后 10 月 16 日一幕（s-1793-tribunal-proces-criminel-testament）。
- 王子在塔裡被關在哪一間沒找到記載，畫面上是示意，文字標（推論）。
- 手機檢查 0 錯誤。

## [2026-11-16] site | 聖殿塔「最後一晚」three.js 動畫
- 新增：docs/assets/farewell3d.js，放在 t-temple「最後一晚」一節（{{anim:farewell}}），約 1 分 37 秒，可拖進度條
- 依據：克萊里日記 pp. 51–52（房間格局）、109–110（告別經過、座位、對話）；瑪麗－泰蕾茲 p. 65（叮囑弟弟、第二天沒去見）
- 做法：有關節的人偶、卡通分階上色＋墨線、燭光陰影、紙張紋理；不畫臉；房間尺寸、家具、衣服顏色是示意
- app.js：S3D_V 5、style.css／app.js ?v=26；手機檢查 0 錯誤
- 舊的十二幕聖殿塔動畫仍保留，等使用者決定

## [2026-11-16] site | 拿掉所有動畫與互動，回到加動畫之前
- 使用者決定三個動畫都先不要：小特里亞儂 3D 導覽、赤字夫人先猜再揭曉、聖殿塔動畫（十二幕與最後一晚）
- 故事頁 t-hameau、t-deficit、t-temple，app.js、style.css、rules/site.md 還原到 5f657d5；保留 wiki.json 每次向伺服器確認更新的修正
- 移除：farewell3d.js、temple3d.js、trianon3d.js、trianon3d.json、play.js、tools/trianon3d.py、data/trianon3d-spots.json（git 歷史可找回，最後一版在 76edc25）
- style.css／app.js ?v=27；手機檢查 0 錯誤

## [2026-11-16] ingest | 夜間擴寫第一批：種痘、熱氣球、作戰計畫、聯盟節、巴加泰勒、梅斯梅爾
- 新增故事：t-inoculation（查無實據）、t-balloon（半真半假）、t-war-plans（確有其事）、t-federation、t-bagatelle（半真半假）、t-mesmer（半真半假）
- 新增問答：q-where-did-the-furniture-go（凡爾賽大拍賣；資料不足開故事，改成問答）
- 擴寫：t-handover（婚禮儀式、煙火慘劇 132／133 死、王太子捐月俸）、t-execution（卡巴尼斯的斷頭台筆記）、t-lamballe／t-elisabeth／t-white-hair（杜莎夫人回憶錄，標明是晚年自述）、t-libels（普羅旺斯伯爵是否幕後黑手：只有研究者的「可能」）、t-tuileries 連到 t-federation、t-hameau 加兩筆待讀研究
- 新資料卡約 30 張（Haiku 起草，主 session 用 check_quotes 與原文逐段抽查）；timeline +14
- 發現：種痘「王后說服國王」被梅西與女皇的信直接否定；作戰計畫有 1792 年 3 月 20 日的密碼信為證；康龐夫人說煙火後捐出「一整年收入」，當時紀錄是每月 2000 埃居；巴加泰勒「打賭」只見於八卦刊物，梅西沒提；王后自己的信說她為梅斯梅爾「糾纏」過約瑟夫二世
- 修正：Haiku 誤覆蓋的 raw/notes/s-1862-sanson-sept-generations.md 已從對話紀錄還原，新內容附在後面
- 缺插圖：上述 6 篇新故事

## [2026-11-17] art | 八篇新故事的頁首插圖
- t-inoculation、t-balloon、t-war-plans、t-federation、t-bagatelle、t-mesmer、t-potato、t-perfume（Gemini，提示詞由主 session 寫，Haiku 操作，主 session 逐張看過）
- t-mesmer 第一版的木桶畫得太高（報告說只有一尺到一尺半），重畫後採用第二版；兩版原圖都留在 raw/images/

## [2026-11-17] ingest | 夜間擴寫第二批：馬鈴薯、香水、束腰與騎馬、國王日記、莫札特與作曲問答
- 新增：t-potato（查無實據）、t-perfume（查無實據）、t-corset（半真半假，併入太子妃學騎馬）、t-diary（半真半假）、q-mozart-proposal、q-did-she-compose
- 新增資料卡：s-1873-nicolardot-journal-louis-xvi、s-2020-pinoteau-chasses-louis-xvi、s-2026-zanetti-amazones、s-1871-weckerlin-c-est-mon-ami、s-1890-weckerlin-nouveau-musiciana、s-1839-anon-chateau-saint-cloud 等
- 更新：t-deficit（聖克盧購買日期 1785-02-15；「六百萬」查無出處）、t-varennes（舒瓦瑟爾自己撤走驃騎兵，不是萊奧納爾）、t-louis（連到 t-diary；拉佩魯茲之問查無出處）、t-theatre（連到作曲問答）、timeline（+1 騎馬）
- 發現：1789-07-14 的「rien」確實存在，但編者說它只表示沒打獵；〈C'est mon ami〉的王后作曲說，最早有年份的出處是 1871 年樂譜；女皇反對女兒騎馬的理由是皮膚、身材與生育，梅西報告她用女用馬鞍。

## [2026-11-17] art | 束腰、國王日記插圖
- 新增：docs/assets/img/t-corset.jpg、t-diary.jpg（Gemini 生成，原圖在 raw/images/）
