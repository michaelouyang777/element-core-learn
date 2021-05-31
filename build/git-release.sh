#!/usr/bin/env sh
# 切换至dev分支
git checkout dev

# 检测本地和暂存区是否还有未提交的文件
if test -n "$(git status --porcelain)"; then
  echo 'Unclean working tree. Commit or stash changes first.' >&2;
  exit 128;
fi

# 检测本地分支是否有误
if ! git fetch --quiet 2>/dev/null; then
  echo 'There was a problem fetching your branch. Run `git fetch` to see more...' >&2;
  exit 128;
fi

# 检测本地分支是否落后远程分支
if test "0" != "$(git rev-list --count --left-only @'{u}'...HEAD)"; then
  echo 'Remote history differ. Please pull changes.' >&2;
  exit 128;
fi

# 通过以上检查，表示代码无冲突
echo 'No conflicts.' >&2;
