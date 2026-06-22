#!/bin/bash
# 双击此文件 → 在终端中启动原型文件自动同步
cd "$(dirname "$0")" || exit 1

# 直接在前台运行 autosync.sh（终端窗口会实时显示同步日志）
# 按 Ctrl+C 或关闭窗口即可停止
exec "$(dirname "$0")/autosync.sh" live
