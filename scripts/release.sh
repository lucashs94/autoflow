#!/usr/bin/env bash
set -euo pipefail

# ─── Release Script ──────────────────────────────────────────────────
# Updates package.json version, commits, creates an annotated tag,
# and pushes to origin — triggering the CD release workflow.
#
# Usage:
#   ./scripts/release.sh <patch|minor|major>
#   ./scripts/release.sh 1.2.3
# ─────────────────────────────────────────────────────────────────────

CURRENT_VERSION=$(node -p "require('./package.json').version")

if [ $# -eq 0 ]; then
  echo "Current version: $CURRENT_VERSION"
  echo ""
  echo "Usage: $0 <patch|minor|major|X.Y.Z>"
  echo ""
  echo "Examples:"
  echo "  $0 patch   # $CURRENT_VERSION → next patch"
  echo "  $0 minor   # $CURRENT_VERSION → next minor"
  echo "  $0 major   # $CURRENT_VERSION → next major"
  echo "  $0 1.2.3   # $CURRENT_VERSION → 1.2.3"
  exit 1
fi

# ─── Ensure clean working tree ──────────────────────────────────────
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree is not clean. Commit or stash your changes first."
  exit 1
fi

# ─── Calculate next version ─────────────────────────────────────────
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case "$1" in
  patch) NEXT_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
  minor) NEXT_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
  major) NEXT_VERSION="$((MAJOR + 1)).0.0" ;;
  *)
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      NEXT_VERSION="$1"
    else
      echo "Error: invalid argument '$1'. Use patch, minor, major, or X.Y.Z"
      exit 1
    fi
    ;;
esac

if [ "$NEXT_VERSION" = "$CURRENT_VERSION" ]; then
  echo "Error: version $NEXT_VERSION is already the current version."
  exit 1
fi

TAG="v$NEXT_VERSION"

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: tag $TAG already exists."
  exit 1
fi

echo "Releasing: $CURRENT_VERSION → $NEXT_VERSION ($TAG)"
echo ""

# ─── Bump version in package.json ───────────────────────────────────
# Use npm version to update package.json without creating a git tag
npm version "$NEXT_VERSION" --no-git-tag-version --allow-same-version >/dev/null

# ─── Commit, tag, and push ──────────────────────────────────────────
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore: bump version to $NEXT_VERSION for next release"
git tag -a "$TAG" -m "Release version $NEXT_VERSION"

echo ""
echo "Created commit and tag $TAG locally."
read -rp "Push to origin and trigger release? [y/N] " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  git push origin HEAD
  git push origin "$TAG"
  echo ""
  echo "Pushed! Release workflow will start shortly."
  echo "Track it at: $(git remote get-url origin | sed 's/\.git$//' | sed 's|git@github.com:|https://github.com/|')/actions"
else
  echo ""
  echo "Not pushed. When ready, run:"
  echo "  git push origin HEAD && git push origin $TAG"
fi
