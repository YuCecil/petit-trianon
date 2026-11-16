"""引文自動核對：把全文筆記和資料卡裡的外文原文引文，拿去 raw/ 的全文檔逐句比對。

用法：
  python3 tools/check_quotes.py                       # 檢查全部 raw/notes/*.md 和 wiki/sources/*.md
  python3 tools/check_quotes.py raw/notes/expand-t-mercy.md wiki/sources/s-1883-tourzel-memoires.md

找得到的不列出；找不到的列出「檔案:行號」和引文，讓人去對頁碼。
比對前會忽略大小寫、重音以外的標點差異、換行斷字、OCR 常見的空白問題；引文裡的「...」會切成幾段分別比對。
只比對外文（法、英、德文）引文；中文譯文不比對。只用 Python 標準函式庫。
結束碼：有找不到的引文時是 1。
"""
import re
import subprocess
import sys
from difflib import SequenceMatcher
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIRS = ["raw/letters", "raw/papers", "raw/books"]


def norm(t):
    t = unicodedata.normalize("NFKC", t).lower()
    t = t.replace("­", "")                      # 軟連字號
    t = re.sub(r"-\s*\n\s*", "", t)                  # 換行斷字
    t = re.sub(r"[’‘`´]", "'", t)
    t = re.sub(r"[“”«»„\"]", " ", t)
    t = re.sub(r"[^\w']+", " ", t)                   # 其他標點一律當空白
    t = re.sub(r"\b11\b", "il", t)                   # OCR 常把 Il 讀成 11
    t = t.replace("ſ", "s").replace("f", "s")        # 18 世紀的長 s（ſ）常被 OCR 讀成 f，比對時當作同一個字
    return re.sub(r"\s+", " ", t).strip()


_cache = {}


def read_any(path):
    if path.suffix == ".pdf":
        try:
            return subprocess.run(["pdftotext", "-q", str(path), "-"], capture_output=True, text=True, timeout=120).stdout
        except (OSError, subprocess.SubprocessError):
            return ""
    t = path.read_text(encoding="utf-8", errors="ignore")
    if path.suffix in (".html", ".xml"):
        t = re.sub(r"<[^>]+>", " ", t)
    return t


def raw_text(path):
    if path not in _cache:
        t = norm(read_any(path))
        _cache[path] = (t, t.split())
    return _cache[path][0]


def fuzzy_in(piece, path):
    """OCR 錯字容錯：找引文裡最長的字出現的位置，比對附近一段文字的相似度。"""
    raw_text(path)
    toks = _cache[path][1]
    words = piece.split()
    # 用最長的三個字輪流當定位點（其中一個被 OCR 讀錯也還找得到）
    keys = sorted(set(words), key=len, reverse=True)[:3]
    spots = []
    for key in keys:
        k = words.index(key)
        spots += [(i, k) for i, w in enumerate(toks) if w == key][:300]
    for i, k in spots:
        win = " ".join(toks[max(0, i - k - 8): i - k + len(words) + 8])
        m = SequenceMatcher(None, piece, win, autojunk=False)
        # 只算連續 3 個字元以上的相符片段，避免零散字母湊數
        if sum(b.size for b in m.get_matching_blocks() if b.size >= 3) < len(piece) * 0.88:
            continue
        # 再逐字檢查：引文裡每個 4 個字母以上的字，附近都要有一個很像的字（擋掉「只換一個字」的假引文）
        wt = win.split()
        if all(any(SequenceMatcher(None, w, t).ratio() >= 0.75 for t in wt) for w in words if len(w) >= 4):
            return True
    return False


def found(p, f):
    return p in raw_text(f) or fuzzy_in(p, f)


def raw_files():
    fs = []
    for d in RAW_DIRS:
        p = ROOT / d
        if p.is_dir():
            fs += sorted(x for x in p.iterdir() if x.suffix in (".txt", ".md", ".pdf", ".html", ".xml"))
    return fs


QUOTE_RE = re.compile(r'"([^"]{8,})"|“([^”]{8,})”|«([^»]{8,})»|「([^」]{8,})」')


def latin(s):
    letters = [c for c in s if c.isalpha()]
    return letters and sum(c < "ɐ" for c in letters) / len(letters) > 0.8


def quotes_in(line):
    out = []
    for m in QUOTE_RE.finditer(line):
        q = next(g for g in m.groups() if g)
        if latin(q):
            out.append(q)
    return out


def pieces(q):
    # 「...」或「[…]」切開；太短的片段（少於 3 個字）不比對
    parts = re.split(r"\.\s?\.\s?\.|…|\[[^\]]*\]", q)
    return [norm(p) for p in parts if len(norm(p).split()) >= 3]


def candidates(line, header_ids, allf):
    explicit = re.findall(r"s-\d{4}[a-z0-9-]*", line)
    ids = explicit or header_ids
    pick = [f for f in allf if any(f.name.startswith(i.rstrip("-")) for i in ids)]
    return pick, bool(explicit)


def check(path, allf):
    lines = path.read_text(encoding="utf-8").splitlines()
    header_ids = re.findall(r"s-\d{4}-[a-z0-9-]+", "\n".join(lines[:12]))
    if path.parent.name == "sources":
        header_ids = [path.stem]
    total, missing, elsewhere, nofile = 0, [], [], []
    for n, line in enumerate(lines, 1):
        if path.parent.name == "sources" and "原文" not in line:
            continue
        for q in quotes_in(line):
            ps = pieces(q)
            if not ps:
                continue
            total += 1
            cand, explicit = candidates(line, header_ids, allf)
            if cand and all(any(found(p, f) for f in cand) for p in ps):
                continue
            # 先用完全比對找其他檔（快），找不到再容錯
            other = [f.name for f in allf if all(p in raw_text(f) for p in ps)] or \
                [f.name for f in allf if all(found(p, f) for p in ps)]
            if other and not explicit:
                continue  # 這一行沒寫明是哪份資料，在別的檔找到就算數
            if not cand and not other:
                nofile.append((n, q))  # 這份資料沒有存全文（例如只在資料庫線上讀過），無法比對
                continue
            (elsewhere if other else missing).append((n, q, other[:2]))
    return total, missing, elsewhere, nofile


def main():
    allf = raw_files()
    if not allf:
        print("找不到 raw/ 的全文檔（從 GitHub 複製下來的環境沒有 raw/），無法核對。")
        return 0
    targets = [Path(a) if Path(a).is_absolute() else ROOT / a for a in sys.argv[1:]] or \
        sorted((ROOT / "raw/notes").glob("*.md")) + sorted((ROOT / "wiki/sources").glob("*.md"))
    T = M = E = N = 0
    for t in targets:
        total, missing, elsewhere, nofile = check(t, allf)
        T += total; M += len(missing); E += len(elsewhere); N += len(nofile)
        rel = t.relative_to(ROOT) if t.is_relative_to(ROOT) else t
        for n, q, _ in missing:
            print(f"✗ {rel}:{n} 找不到：{q[:90]}")
        for n, q, other in elsewhere:
            print(f"△ {rel}:{n} 不在標示的資料裡，但在 {'、'.join(other)} 找到：{q[:70]}")
    print(f"\n引文核對：{len(targets)} 個檔、{T} 句外文引文；找不到 {M}、出處可能標錯 {E}、沒有全文檔可比對 {N}")
    print("（找不到的可能是 OCR 錯字、譯本差異，或真的抄錯；請對原文頁碼後修正或刪除。）" if M else "")
    return 1 if M else 0


if __name__ == "__main__":
    sys.exit(main())
