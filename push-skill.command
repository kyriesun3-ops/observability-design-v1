#!/bin/bash
cd "$(dirname "$0")/prototype-auto-sync.skill" || exit 1

echo ""
echo "  Pushing prototype-auto-sync.skill to GitHub..."
echo "  Repo: git@github.com:kyriesun3-ops/codex-skill.git"
echo ""

git push -u origin main 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "  ✅ Push successful!"
  echo ""
  echo "  Another computer can now install the skill with:"
  echo "    git clone git@github.com:kyriesun3-ops/codex-skill.git"
  echo "    bash codex-skill/scripts/install-skill.sh"
else
  echo ""
  echo "  ❌ Push failed. Check the error above."
  echo "     Press Cmd+Q to close this window and tell Codex."
fi

echo ""
echo "  ── Press any key to close ──"
read -n 1
