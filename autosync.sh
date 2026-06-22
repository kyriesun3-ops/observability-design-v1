#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  autosync.sh — 原型文件变更自动同步到 GitHub
#
#  用法:
#    ./autosync.sh             前台运行（实时显示同步日志）
#    ./autosync.sh status      查看最近同步记录
#
#  工作机制:
#    1. 双击 autosync-start.command → 打开终端 → 运行本脚本
#    2. 每 10 秒轮询一次 src/、docs/、public/ 及文件变更
#    3. 检测到变更后自动 git add → commit → push
#    4. 推送到 main → 触发 GitHub Actions 部署 Pages
#
#  停止方式:
#    · 关闭终端窗口 或 Ctrl+C
#    · 双击 autosync-stop.command
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="$PROJECT_DIR/.autosync.log"

# 轮询间隔（秒）：每隔多久检查一次文件变更
# 也是"保存后等待多久才提交"的静默时间
POLL_INTERVAL=10

# 监听范围
WATCH_TARGETS="src docs public"
WATCH_FILES="index.html package.json vite.config.js README.md .github"

# ──── 前台监听循环 ───────────────────────────────────────────
watch_loop() {
  # 确保 fswatch 已安装
  if ! command -v fswatch &>/dev/null; then
    echo ""
    echo "  正在安装 fswatch（文件变更监听工具）..."
    if ! command -v brew &>/dev/null; then
      echo "  ❌ 需要 Homebrew。请先安装: https://brew.sh"
      exit 1
    fi
    HOMEBREW_NO_AUTO_UPDATE=1 brew install fswatch 2>&1
    echo "  ✅ fswatch 安装完成"
    echo ""
  fi

  local TITLE="可观测原型 Auto-Sync"
  echo ""
  echo "  ╔═══════════════════════════════════════════════╗"
  echo "  ║     $TITLE    ║"
  echo "  ╚═══════════════════════════════════════════════╝"
  echo ""
  echo "  ● 原型文件变更自动同步"
  echo "    监听: src/  docs/  public/  配置文件"
  echo "    轮询: 每 ${POLL_INTERVAL} 秒"
  echo "    日志:  .autosync.log"
  echo ""
  echo "  ── 在编辑器中保存文件后，变更将在数秒内自动推送 ──"
  echo "  ── 按 Ctrl+C 或关闭此窗口即可停止 ──"
  echo ""

  # 日志标记
  echo "" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== 自动同步启动 =====" >> "$LOG_FILE"

  while true; do
    # poll_monitor: 每隔 POLL_INTERVAL 秒检查一次文件变更
    # 有变更则在检查到后立即退出，无变更则阻塞到下一个轮询周期
    # 这天然提供了一个"保存后等待 POLL_INTERVAL 秒才提交"的静默期
    fswatch -1 -l "$POLL_INTERVAL" -m poll_monitor                                \
      --exclude='\.git/'                                                          \
      --exclude='/node_modules/'                                                  \
      --exclude='/dist/'                                                          \
      --exclude='/修改意见/'                                                      \
      --exclude='\.bak\.'                                                         \
      --exclude='\.autosync\.'                                                    \
      $WATCH_TARGETS $WATCH_FILES 2>/dev/null || true

    # 如果 Git 处于异常状态，跳过本轮
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -f ".git/MERGE_HEAD" ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Git 异常状态（rebase/merge），跳过" >> "$LOG_FILE"
      continue
    fi

    # 检查是否有实际变更
    if git diff --quiet && git diff --cached --quiet && git ls-files --others --exclude-standard --quiet; then
      continue
    fi

    # 暂存所有变更
    git add -A 2>>"$LOG_FILE" || { echo "  ⚠️  git add 失败" >> "$LOG_FILE"; continue; }
    if git diff --cached --quiet; then continue; fi

    # 生成提交信息
    local CHANGED
    CHANGED=$(git diff --cached --name-only)
    local FILE_COUNT
    FILE_COUNT=$(echo "$CHANGED" | wc -l | tr -d ' ')
    local PREVIEW
    PREVIEW=$(echo "$CHANGED" | head -5)
    local COMMIT_MSG
    if [ "$FILE_COUNT" -le 5 ]; then
      COMMIT_MSG="auto-sync: $(date '+%Y-%m-%d %H:%M')\n${PREVIEW}"
    else
      COMMIT_MSG="auto-sync: $(date '+%Y-%m-%d %H:%M')\n${PREVIEW}\n… +$((FILE_COUNT - 5)) more"
    fi

    # 提交
    if git commit -m "$(echo -e "$COMMIT_MSG")" >> "$LOG_FILE" 2>&1; then
      echo "  ✓ $(date '+%H:%M:%S') 提交 ${FILE_COUNT} 个文件"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 提交 ${FILE_COUNT} 个文件" >> "$LOG_FILE"
    else
      continue
    fi

    # 推送
    if git push origin main >> "$LOG_FILE" 2>&1; then
      echo "  ✓ $(date '+%H:%M:%S') 推送到 GitHub → 触发 Pages 部署"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 推送到 GitHub" >> "$LOG_FILE"
    else
      echo "  ⚠️  git push 失败，下次自动重试" | tee -a "$LOG_FILE"
    fi
  done
}

# ──── 入口 ──────────────────────────────────────────────────
case "${1:-live}" in
  live|--live)
    watch_loop
    ;;
  status|--status)
    echo ""
    if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
      echo "  ● 最近同步记录:"
      echo ""
      grep -E "提交|推送到|启动|Error" "$LOG_FILE" | tail -8 | while IFS= read -r line; do
        echo "    $line"
      done
    else
      echo "  ○ 暂无同步记录"
    fi
    echo ""
    ;;
  *)
    echo "用法: $0 {live|status}"
    echo "  live    启动前台监听（默认）"
    echo "  status  查看最近同步记录"
    exit 1
    ;;
esac
