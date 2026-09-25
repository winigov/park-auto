#!/bin/sh
# Собирает демо-версию и публикует её в ветку gh-pages (GitHub Pages).
# DEPLOY_NOTE — необязательный второй абзац сообщения коммита.
set -e
cd "$(dirname "$0")/.."

REPO_URL=$(git remote get-url origin)

GH_PAGES=1 PUBLIC_DEMO=1 npx astro build

cd dist
touch .nojekyll # иначе GitHub Pages (Jekyll) не отдаст папку _astro
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')" ${DEPLOY_NOTE:+-m "$DEPLOY_NOTE"}
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -q -f "$REPO_URL" gh-pages
rm -rf .git

echo "Готово: https://winigov.github.io/park-auto/"
