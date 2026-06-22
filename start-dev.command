#!/bin/bash
# 一键启动可观测分析原型 (Vite dev server) —— observability_design_v1.0
# 双击运行：进入项目目录，启动 npm run dev 并自动打开浏览器
cd "/Users/kyrie_sun/Documents/claude/Projects/observability_design_v1.0" || exit 1
echo "启动原型开发服务器 (Vite)..."
echo "首次启动若依赖缺失会自动安装，请稍候。"
echo "若浏览器未自动打开，请手动访问 http://localhost:5173"
echo "关闭此窗口或按 Ctrl+C 可停止服务。"
echo "------------------------------------------"
[ -d node_modules ] || npm install
npm run dev -- --open
echo ""
echo "服务已停止。按回车键关闭窗口..."
read -r
