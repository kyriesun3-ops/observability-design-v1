#!/bin/bash
# 双击此文件 → 停止原型文件自动同步
cd "$(dirname "$0")" || exit 1

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║     停止自动同步    ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

# 停止 LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.observability.autosync.plist 2>/dev/null && \
  echo "  ✅ LaunchAgent 已停止" || true

# 杀死前台/后台运行中的 autosync.sh 进程
pkill -f "autosync\.sh (live|launchd)" 2>/dev/null && \
  echo "  ✅ 前台同步进程已终止" || \
  echo "  ℹ️  未找到前台同步进程"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== 用户手动停止 =====" >> .autosync.log 2>/dev/null || true

echo ""
echo "  ── 按回车键关闭此窗口 ──"
read -r
