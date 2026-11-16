#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Direct push using subprocess with proper environment
This script will execute git in a way that allows credential prompting
"""
import subprocess
import os
import sys
import time

GIT = r'C:\Users\MSI\AppData\Local\GitHubDesktop\app-3.6.11\resources\app\git\cmd\git.exe'
REPO = r'C:\Web VA ROVIENG CO\va-rovieng-website'

os.chdir(REPO)

print("=" * 70)
print("PUSHING TO GITHUB - DIRECT SUBPROCESS METHOD")
print("=" * 70)

# Set environment for credential prompting
env = os.environ.copy()
env['GIT_TERMINAL_PROMPT'] = '1'
env['GIT_CREDENTIAL_HELPER'] = 'wincred'

# Configure git
print("\n[*] Configuring git...")
subprocess.run([GIT, 'config', '--local', 'credential.helper', 'wincred'], env=env)
subprocess.run([GIT, 'config', '--local', 'credential.useHttpPath', 'true'], env=env)

# Check status
print("\n[*] Current status:")
result = subprocess.run([GIT, 'status', '--short'], capture_output=True, text=True)
print(result.stdout if result.stdout else "No changes")

# Show commits to push
print("\n[*] Commits to push:")
result = subprocess.run([GIT, 'log', 'origin/main..HEAD', '--oneline'], capture_output=True, text=True)
print(result.stdout if result.stdout else "No new commits")

# Try push with the environment that allows prompting
print("\n[+] Executing push command...")
print("    (This may open a credential prompt window)")
print("-" * 70)

try:
    # Use Popen to allow interactive I/O
    proc = subprocess.Popen(
        [GIT, 'push', 'origin', 'main', '--verbose'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env
    )
    
    # Stream output
    while True:
        line = proc.stdout.readline()
        if not line:
            break
        print(line, end='')
    
    returncode = proc.wait()
    
    print("-" * 70)
    
    if returncode == 0:
        print("\n" + "=" * 70)
        print("[SUCCESS] Changes pushed to GitHub!")
        print("=" * 70)
    else:
        print(f"\nPush returned: {returncode}")
        
        # Double check status
        print("\nVerifying status...")
        result = subprocess.run([GIT, 'status'], capture_output=True, text=True)
        print(result.stdout)
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
