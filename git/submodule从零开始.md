# 从零开始：Git Submodule

## 子模块是什么

父仓库**不**在版本里复制子仓库的完整历史，而是：

- `.gitmodules`：记录子模块的 **URL** 与检出路径
- **某次父仓库提交**：记录子模块目录应对齐的 **固定 commit SHA**

因此「链接」不是自动跟随子模块远程最新，而是**写死在父仓库历史里的一条指针**。只有别人在父仓库里提交了新 SHA 并 push，大家 `pull` 父仓库后才会集体跟到新版本。

---

## 从零把已有仓库挂进父项目

假设已有独立仓库 `lib-a`、`lib-b`，现在要建父仓库 `my-app` 并把它们作为子模块：

```bash
mkdir my-app && cd my-app
git init

git submodule add https://example.com/lib-a.git vendor/lib-a
git submodule add https://example.com/lib-b.git vendor/lib-b

git commit -m "chore: add submodules"
git push -u origin main
```

之后父仓库里会出现 `.gitmodules` 以及 `vendor/lib-a`、`vendor/lib-b` 目录作为「gitlink」（指向具体 SHA）。

`.gitmodules` 是文本配置，每个 `[submodule "…"]` 一段对应一个子模块：`path` 为检出目录，`url` 为远程地址；段名一般与 `path` 一致。上文命令会生成类似：

```ini
[submodule "vendor/lib-a"]
	path = vendor/lib-a
	url = https://example.com/lib-a.git
[submodule "vendor/lib-b"]
	path = vendor/lib-b
	url = https://example.com/lib-b.git
```

**克隆带子模块的父仓库：**

```bash
git clone --recurse-submodules <父仓库 URL>
```

若已克隆但未拉子模块内容：

```bash
git submodule update --init --recursive
```

---

## 日常：对齐父仓库锁定的版本

别人更新了**父仓库里的子模块指针**并已 push 时，在父仓库根目录：

```bash
git pull
git submodule update --init --recursive
```

子模块会检出到**当前父提交所记录的那次 SHA**，与团队一致。

子模块目录若为空，同样先执行：`git submodule update --init --recursive`。

---

## 子模块远程有新代码时

### 只想本机用到最新（不立刻改父仓库指针）

**方式一：** 进入子模块目录

```bash
cd vendor/lib-a
git pull
cd ..
```

**方式二：** 在父仓库根目录（不必手动 `cd` 进子模块）

```bash
git submodule update --remote --recursive
```

### `git submodule update --remote` 做什么、何时用

在**父仓库根目录**执行时，Git 会对每个子模块（以及带 **`--recursive`** 时、子模块里的子模块）大致：`fetch` 其远程，再检出到**该子模块当前所跟踪的远程分支上的最新提交**（具体与 `.gitmodules` / 本地 `submodule.<name>.branch` 等配置有关）。

与**不带 `--remote`** 的 `git submodule update --init --recursive` 对比：

| 对比         | 不带 `--remote`                | 带 `--remote`                                    |
| ------------ | ------------------------------ | ------------------------------------------------ |
| 子模块停在哪 | 父仓库当前提交里**写死的 SHA** | 尽量各仓库**远程跟踪分支的最新**                 |
| 典型场景     | 与团队/CI 对齐锁定版本         | 本机开发想快速试最新子模块，**暂不**改父仓库指针 |

**工作区**会变新，但父仓库里记录的 SHA **尚未**变；要固化进仓库仍需下文 `git add` + `commit`。  
若某个子模块没配好跟踪分支，`--remote` 可能不符合预期，可改用进入该目录 `git pull`。

### 要把「新子模块版本」固定进仓库并让别人对齐

子模块已停在你想要的 commit 后，在**父仓库**：

```bash
git add vendor/lib-a
git commit -m "chore: bump lib-a submodule"
git push
```

**没有**「一条命令不写提交就永久更新远程父仓库里链接」的做法；更新版本库里那条指针，必须经过 **`git add` + `commit`（+ `push`）**。

---

## 常见场景对照

| 目的                                         | 做法                                                                |
| -------------------------------------------- | ------------------------------------------------------------------- |
| 本机与父仓库当前提交锁定的子模块 SHA 一致    | `git submodule update --init --recursive`                           |
| 本机把子模块拉到远程分支最新（指针可先不变） | 子目录 `git pull`，或父目录 `git submodule update --remote`         |
| 远程父仓库上的「子模块链接」也改成新 SHA     | 子模块指到目标 commit → 父仓库 `add` 子模块路径 → `commit` → `push` |

---

## 易混场景：只 push 了子模块、没 push 父仓库

你在别处只改了 **子模块仓库** 并 push，**没有**在父仓库提交新指针，则：

- 父仓库远程保存的仍是**旧 SHA**
- 在新目录 `clone` 父仓库再 `submodule update`，检出的自然是旧提交

本机要新代码：在子模块里 `git pull`，或父目录 `git submodule update --remote vendor/lib-a`。  
若希望以后所有人 clone 父仓库都是新子模块版本：必须在父仓库里再 **单独 commit 一次**（只 bump 子模块指针）。

---

## 协作建议

改子模块并 push 后，尽量**在同一工作区**打开父项目：子模块拉到目标 commit → 父仓库 `add` + `commit` + `push`。这样不会出现「子模块已新版本，父仓库永远指着旧 SHA」的长期分叉。
