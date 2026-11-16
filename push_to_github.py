#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import io
import git as git_module

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Set git executable path from GitHub Desktop BEFORE importing Repo
git_executable = r'C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe'
os.environ['GIT_PYTHON_GIT_EXECUTABLE'] = git_executable
os.environ['GIT_PYTHON_REFRESH'] = 'quiet'

# Add to PATH
os.environ['PATH'] = r'C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd' + ';' + os.environ.get('PATH', '')

from git import Repo

# Navigate to your repository
repo_path = r'C:\Web VA ROVIENG CO\va-rovieng-website'
repo = Repo(repo_path)

print('=' * 60)
print('GITHUB REPOSITORY PUSH')
print('=' * 60)
print(f'\nRepository: {repo.working_tree_dir}')
print(f'Current branch: {repo.active_branch.name}')

# Check current status
untracked = len(list(repo.untracked_files))
modified = len(repo.index.diff(None))

# Try to check staged changes, but handle empty repo
try:
    staged = len(repo.index.diff('HEAD'))
except:
    staged = len(repo.index.diff(None))  # For empty repo

print(f'\nRepository Status:')
print(f'  - Untracked files: {untracked}')
print(f'  - Modified files: {modified}')
print(f'  - Files to stage: {staged}')

# Add all changes (respecting .gitignore)
print('\n[+] Adding changes (respecting .gitignore)...')
repo.index.add(['.'])

# Check if there are changes to commit
if len(repo.index.diff(None)) > 0 or untracked > 0:
    # Commit changes
    print('[+] Creating commit...')
    commit = repo.index.commit('Initial website upload - VA ROVIENG CO\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>')
    print(f'  Commit SHA: {commit.hexsha[:8]}')
    print(f'  Message: {commit.message.strip()}')
else:
    print('[+] No changes to commit')

# Push to GitHub
print('\n[+] Pushing to GitHub...')
try:
    push_results = repo.remotes.origin.push()
    for push_info in push_results:
        print(f'  Push status: {push_info.summary}')
    print('\n' + '=' * 60)
    print('[SUCCESS] Website pushed to GitHub!')
    print('=' * 60)
except Exception as e:
    print(f'Error during push: {e}')
    import traceback
    traceback.print_exc()
