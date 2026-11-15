# 小特里亞儂：瑪麗．安東尼與路易十六

網站：https://yucecil.github.io/petit-trianon/

把關於瑪麗．安東尼與路易十六的研究、傳記、書信與回憶錄，整理成好讀的故事，並把「流傳的說法」和「史料怎麼說」分開講。採用 Karpathy 的 LLM Wiki 模式：人找資料、提問，AI 閱讀、提煉、交叉引用。規則全部寫在 [CLAUDE.md](CLAUDE.md)。

## 怎麼繼續做

在這個資料夾打開 Claude Code：

| 指令 | 做什麼 |
|---|---|
| `/new-topic 王后的熱巧克力` | 自己找資料、讀全文，新增一個故事 |
| `/ingest` | 把 PDF 丟進 `inbox/`，讀完併進網站 |
| `/ask 問題` | 用網站裡的資料回答 |
| `/illustrate t-xxx` | 用 Gemini 替故事畫插圖 |
| `/wiki-lint` | 健檢，列出下一批要找的資料 |

## 本機預覽

```bash
python3 tools/lint.py && python3 tools/build.py
python3 -m http.server -d docs 8000
```

原始資料（`raw/`）有著作權，不上傳。
