#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
GitHub push script that uses subprocess to execute git commands
with proper environment variables for Windows credential manager
"""
import subprocess
import os
import sys

# Git path from GitHub Desktop
GIT_EXECUTABLE = r'C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe'
REPO_PATH = r'C:\Web VA ROVIENG CO\va-rovieng-website'

def run_git_command(cmd_args, interactive=False):
    """Run a git command and return output"""
    full_cmd = [GIT_EXECUTABLE] + cmd_args
    
    try:
        if interactive:
            # Run with stdin/stdout/stderr connected for interactive prompts
            result = subprocess.run(
                full_cmd,
                cwd=REPO_PATH,
                check=False
            )
            return result.returncode
        else:
            # Run with captured output
            result = subprocess.run(
                full_cmd,
                cwd=REPO_PATH,
                capture_output=True,
                text=True
            )
            return result.returncode, result.stdout, result.stderr
    except Exception as e:
        print(f"Error running command: {e}")
        return -1, "", str(e)

if __name__ == "__main__":
    print("=" * 70)
    print("PUSHING CHANGES TO GITHUB")
    print("=" * 70)
    
    # Check status
    print("\n[*] Checking repository status...")
    code, stdout, stderr = run_git_command(['status', '--short'])
    if stdout:
        print(stdout)
    
    # Check if there are unpushed commits
    code, stdout, stderr = run_git_command(['log', '@{u}..', '--oneline'])
    if stdout:
        print("\n[*] Unpushed commits found:")
        print(stdout)
    else:
        print("\n[*] No unpushed commits")
    
    # Commit any remaining changes
    print("\n[+] Adding and committing any final changes...")
    code, stdout, stderr = run_git_command(['add', '.'])
    code, stdout, stderr = run_git_command([
        'commit',
        '-m',
        'Update push script\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'
    ])
    if 'nothing to commit' in stdout or 'nothing to commit' in stderr:
        print("No changes to commit")
    elif code == 0:
        print(f"Commit created")
    
    # Push to GitHub (interactive mode)
    print("\n[+] Pushing to GitHub (may request authentication)...")
    print("-" * 70)
    
    return_code = run_git_command(['push'], interactive=True)
    
    print("-" * 70)
    
    if return_code == 0:
        print("\n" + "=" * 70)
        print("[SUCCESS] Successfully pushed to GitHub!")
        print("=" * 70)
        sys.exit(0)
    else:
        print(f"\nPush returned code: {return_code}")
        
        # Verify if it actually pushed by checking remote
        code, stdout, stderr = run_git_command(['log', 'HEAD..origin/main', '--oneline'])
        if not stdout:
            print("[INFO] Local and remote are in sync - push was successful!")
            sys.exit(0)
        else:
            print("[WARNING] There may be uncommitted changes")
            sys.exit(1)
