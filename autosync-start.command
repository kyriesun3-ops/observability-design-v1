#!/bin/bash
# 双击此文件 → 安装 LaunchAgent（首次）并启动原型文件自动同步
cd "$(dirname "$0")" || exit 1

# 如果 LaunchAgent 未安装，先安装
PLIST="$HOME/Library/LaunchAgents/com.observability.autosync.plist"
if [ ! -f "$PLIST" ] || ! launchctl list com.observability.autosync &>/dev/null 2>&1; then
  echo ""
  echo "  → 首次运行，正在安装 LaunchAgent（开机自启）..."
  "$(dirname "$0")/autosync.sh" install-agent
  echo "  → LaunchAgent 已安装，之后每次登录自动同步"
  echo "  → 此窗口将继续显示实时日志"
  echo ""
fi

# 前台运行（终端窗口会实时显示同步日志）
exec "$(dirname "$0")/autosync.sh" live
