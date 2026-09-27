#!/bin/sh
# Собирает демо-версию и публикует её в ветку gh-pages (GitHub Pages).
# DEPLOY_NOTE — необязательный второй абзац сообщения коммита.
set -e
cd "$(dirname "$0")/.."

REPO_URL=$(git remote get-url origin)

GH_PAGES=1 PUBLIC_DEMO=1 npx astro build

GIT_AUTH="-c credential.helper= -c credential.helper=!gh auth git-credential"

cd dist
touch .nojekyll # иначе GitHub Pages (Jekyll) не отдаст папку _astro
rm -rf .git
git init -q -b gh-pages
git remote add origin "$REPO_URL"
# Берём последнюю версию ветки gh-pages: тогда git отправит только изменённые файлы, а не весь сайт заново
if git $GIT_AUTH fetch -q --depth 1 origin gh-pages 2>/dev/null; then
  git reset -q --soft FETCH_HEAD
fi
git add -A
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')" ${DEPLOY_NOTE:+-m "$DEPLOY_NOTE"}
git $GIT_AUTH push -q origin gh-pages || git $GIT_AUTH push -q -f origin gh-pages
rm -rf .git

echo "Готово: https://winigov.github.io/park-auto/"
