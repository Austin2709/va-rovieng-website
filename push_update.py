#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Set up git executable
git_executable = r'C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe'

# Change to repo directory
repo_path = r'C:\Web VA ROVIENG CO\va-rovieng-website'
os.chdir(repo_path)

print('=' * 60)
print('GITHUB REPOSITORY PUSH')
print('=' * 60)
print(f'\nRepository: {repo_path}')

# Check current status
print('\n[*] Checking repository status...')
result = subprocess.run([git_executable, 'status', '--short'], capture_output=True, text=True)
if result.stdout:
    print('Modified files:')
    print(result.stdout)
else:
    print('No changes detected.')

# Add all changes
print('[+] Adding changes...')
result = subprocess.run([git_executable, 'add', '.'], capture_output=True, text=True)
if result.returncode != 0:
    print(f'Error adding changes: {result.stderr}')
    sys.exit(1)

# Commit changes
print('[+] Creating commit...')
commit_msg = 'Fix: Remove white bars from certifications section - make full width\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'
result = subprocess.run([git_executable, 'commit', '-m', commit_msg], capture_output=True, text=True)
if 'nothing to commit' in result.stdout:
    print('No changes to commit')
elif result.returncode == 0:
    print(f'Commit created: {result.stdout}')
else:
    print(f'Commit output: {result.stdout}')
    if result.stderr:
        print(f'Error: {result.stderr}')

# Push to GitHub
print('\n[+] Pushing to GitHub...')
print('[INFO] This may open authentication dialogs...')

# Try with environment variable GIT_TRACE=1 for debugging
env = os.environ.copy()
env['GIT_TERMINAL_PROMPT'] = '1'

result = subprocess.run([git_executable, 'push'], capture_output=True, text=True, env=env)
print(result.stdout)
if result.stderr:
    print(f'Info: {result.stderr}')

if result.returncode == 0 or 'Everything up-to-date' in result.stdout:
    print('\n' + '=' * 60)
    print('[SUCCESS] Changes pushed to GitHub!')
    print('=' * 60)
else:
    print('\n[WARNING] Push may have issues - checking status...')
    # Check if already pushed despite the error
    result2 = subprocess.run([git_executable, 'log', '--oneline', '-1'], capture_output=True, text=True)
    print(f'Latest commit: {result2.stdout}')
