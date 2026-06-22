#!/bin/bash
#
#  autosync.sh — 原型文件变更自动同步到 GitHub
#  (sleep 轮询版：无外部依赖，兼容 macOS LaunchAgent / nohup 后台运行)
#
#  用法:
#    ./autosync.sh                前台运行（实时显示同步日志）
#    ./autosync.sh status         查看最近同步记录
#    ./autosync.sh install-agent  安装 LaunchAgent（开机自启）
#    ./autosync.sh uninstall-agent  卸载 LaunchAgent
#
#  工作机制:
#    1. 每 POLL_INTERVAL 秒检查一次文件变更
#    2. 检测到变更后自动 git add → commit → push
#    3. 推送到 main → 触发 GitHub Actions 部署 Pages
#
#  启动方式：
#    · LaunchAgent（推荐）：登录后自动启动，详见 install-agent 命令
#    · 双击 autosync-start.command：打开终端前台运行
#
#  停止方式:
#    · LaunchAgent 版：launchctl unload ~/Library/LaunchAgents/com.observability.autosync.plist
#    · 关闭终端窗口 或 Ctrl+C

set -uo pipefail   # 注意：不用 -e，后台运行时的 nice 警告不应终止脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="$PROJECT_DIR/.autosync.log"

# 轮询间隔（秒）
POLL_INTERVAL=10

# ──── 前台监听循环 ───────────────────────────────────────────
watch_loop() {
  local TITLE="可观测原型 Auto-Sync"

  echo ""
  echo "  ╔═══════════════════════════════════════════════╗"
  echo "  ║     $TITLE    ║"
  echo "  ╚═══════════════════════════════════════════════╝"
  echo ""
  echo "  ● 原型文件变更自动同步"
  echo "    监听: 全仓库（排除 node_modules/ dist/ .git/ 等）"
  echo "    轮询: 每 ${POLL_INTERVAL} 秒"
  echo "    日志:  .autosync.log"
  echo ""
  echo "  ── 在编辑器中保存文件后，变更将在数秒内自动推送 ──"
  echo "  ── 按 Ctrl+C 或 launchctl unload 停止 ──"
  echo ""

  echo "" >> "$LOG_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== 自动同步启动 =====" >> "$LOG_FILE"

  while true; do
    sleep "$POLL_INTERVAL"
    poll_once
  done
}

# ──── 单次轮询 ──────────────────────────────────────────
poll_once() {
    # Git 异常状态检查
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -f ".git/MERGE_HEAD" ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Git 异常（rebase/merge），跳过" >> "$LOG_FILE"
      return 0
    fi

    # 检查是否有变更（排除 .autosync.log 等）
    if git diff --quiet && git diff --cached --quiet && git ls-files --others --exclude-standard --quiet; then
      return 0
    fi

    # add
    git add -A 2>>"$LOG_FILE" || { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  git add 失败" >> "$LOG_FILE"; return 0; }
    if git diff --cached --quiet; then return 0; fi

    # 提交
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

    if git commit -m "$(echo -e "$COMMIT_MSG")" >> "$LOG_FILE" 2>&1; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 提交 ${FILE_COUNT} 个文件" >> "$LOG_FILE"
    else
      return 0
    fi

    # push
    if git push origin main >> "$LOG_FILE" 2>&1; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 推送到 GitHub" >> "$LOG_FILE"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  git push 失败，下次自动重试" >> "$LOG_FILE"
    fi
}

# ──── 状态查看 ──────────────────────────────────────────
show_status() {
  echo ""
  if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
    echo "  ● 最近同步记录:"
    echo ""
    grep -E "=====|提交|推送到|启动|Error|异常|失败" "$LOG_FILE" | tail -8 | while IFS= read -r line; do
      echo "    $line"
    done
  else
    echo "  ○ 暂无同步记录"
  fi
  # 检查 LaunchAgent 是否已加载
  if launchctl list com.observability.autosync &>/dev/null 2>&1; then
    echo ""
    echo "  ● LaunchAgent: 已加载（登录后自动运行）"
  else
    echo ""
    echo "  ○ LaunchAgent: 未加载"
  fi
  echo ""
}

# ──── 安装/卸载 LaunchAgent ────────────────────────────
PLIST_NAME="com.observability.autosync.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

install_launchd_agent() {
  mkdir -p "$HOME/Library/LaunchAgents"

  cat > "$PLIST_DEST" << PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.observability.autosync</string>
    <key>ProgramArguments</key>
    <array>
        <string>${PROJECT_DIR}/autosync.sh</string>
        <string>launchd</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>${LOG_FILE}</string>
    <key>StandardOutPath</key>
    <string>${LOG_FILE}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    <key>ThrottleInterval</key>
    <integer>10</integer>
</dict>
</plist>
PLIST_EOF

  chmod 644 "$PLIST_DEST"
  launchctl load "$PLIST_DEST" 2>&1
  echo ""
  echo "  ✅ LaunchAgent 已安装并加载"
  echo "     守护进程名: com.observability.autosync"
  echo "     每次登录后自动启动"
  echo "     如需手动停止: launchctl unload $PLIST_DEST"
  echo ""
}

uninstall_launchd_agent() {
  if [ -f "$PLIST_DEST" ]; then
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    rm -f "$PLIST_DEST"
    echo "  ✅ LaunchAgent 已卸载"
  else
    echo "  ○ LaunchAgent 尚未安装"
  fi
}

# ──── 入口 ──────────────────────────────────────────────────
case "${1:-live}" in
  live|--live)
    watch_loop
    ;;
  launchd|--launchd)
    # launchd 模式: stdout/stderr 由 plist 重定向到日志文件
    watch_loop
    ;;
  status|--status)
    show_status
    ;;
  install-agent)
    install_launchd_agent
    ;;
  uninstall-agent)
    uninstall_launchd_agent
    ;;
  *)
    echo "用法: $0 {live|launchd|status|install-agent|uninstall-agent}"
    echo "  live          前台运行（默认）"
    echo "  launchd       LaunchAgent 模式"
    echo "  status        查看最近同步记录"
    echo "  install-agent 安装 LaunchAgent（开机自启）"
    echo "  uninstall-agent  卸载 LaunchAgent"
    exit 1
    ;;
esac
