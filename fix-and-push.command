#!/bin/bash
# 一键修复 git 状态并推送原型到 GitHub（kyriesun3-ops/Observability0.1）
# 背景：仓库之前残留了一次未完成的 git pull --rebase，导致 GitHub Desktop 卡在
#       “rebasing / resolve conflicts”。本脚本只做安全清理，不会丢失任何提交。
set -e
cd "/Users/kyrie_sun/Documents/claude/Projects/observability_design_v1.0" || exit 1

echo "==> 1/4 清理残留的 git 锁文件"
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock 2>/dev/null || true

echo "==> 2/4 退出残留的 rebase 状态（保留当前提交，不回滚）"
git rebase --quit 2>/dev/null || true

echo "==> 3/4 当前状态（应为 On branch main，clean，领先 origin 2 个提交）"
git status
echo "------ 最近提交 ------"
git log --oneline -3

echo "==> 4/4 推送到 GitHub"
git push origin main

echo ""
echo "✅ 推送完成。接下来在浏览器打开仓库 Settings → Pages，"
echo "   把 Source 设为 “GitHub Actions”，Actions 跑完后即可访问："
echo "   https://kyriesun3-ops.github.io/Observability0.1/"
echo ""
echo "按回车键关闭窗口..."
read -r
