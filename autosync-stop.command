#!/bin/bash
# 双击此文件 → 停止自动同步
#
# 工作原理:
#   找到正在运行的 fswatch（属于 autosync 监听进程）并终止
#   适用于通过 autosync-start.command 启动的前台同步

cd "$(dirname "$0")" || exit 1

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║     停止自动同步    ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

# 尝试通过 pkill 终止 autosync 相关的进程
# macOS 下 pkill 需外部命令
if command -v pkill &>/dev/null; then
  # 杀死 autosync.sh 的监听进程（不含自身）
  pkill -f "fswatch.*src.*docs.*public" 2>/dev/null && echo "  ✅ 同步进程已终止" || \
    echo "  ℹ️  未找到运行中的同步进程"
else
  echo "  ℹ️  请直接关闭运行同步的终端窗口，或按 Ctrl+C"
fi

# 写入日志标记
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== 用户手动停止 =====" >> .autosync.log 2>/dev/null || true

echo ""
echo "  ── 按回车键关闭此窗口 ──"
read -r
