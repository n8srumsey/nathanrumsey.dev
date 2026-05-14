#!/usr/bin/env python3
"""
PreToolUse safety hook for the Bash tool.

Blocks two categories:
  external    — commands that affect systems outside this local repo
  destructive — commands that permanently delete or overwrite data

To bypass in a genuine emergency, run the command directly in your terminal.
"""

import json
import re
import sys


def deny(reason: str) -> None:
    """Reject the tool call and surface the reason to Claude."""
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": f"[safety-hook] {reason}",
        }
    }))
    sys.exit(0)


try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)  # malformed input — don't block

cmd = data.get("tool_input", {}).get("command", "")
if not cmd:
    sys.exit(0)


# ── EXTERNAL IMPACT ───────────────────────────────────────────────────────────
# Commands that write to or modify systems outside this local repository.

# git push --force / -f / --force-with-lease / --force-if-includes
if re.search(r"\bgit\s+push\b", cmd) and re.search(
    r"(--force\b|--force-with-lease\b|--force-if-includes\b|\s-[a-zA-Z]*f)",
    cmd,
):
    deny("force push is blocked — never force-push; rebase or reset locally instead")

# Package registry publish
if re.search(r"\b(npm|yarn|pnpm)\s+publish\b", cmd):
    deny("package registry publish is blocked — publish manually")

# Cloudflare / Wrangler deploy or publish
if re.search(r"\bwrangler\s+(deploy|publish|pages\s+deploy)\b", cmd):
    deny("wrangler deploy is blocked — deploy manually or trigger via CI")

# Remote SSH or SCP
if re.search(r"\b(ssh|scp)\s+\S*@\S+", cmd):
    deny("remote SSH/SCP is blocked")

# GitHub CLI mutations that change remote repository state
# gh pr create is allowed (used by the /pr skill)
if re.search(
    r"\bgh\s+(pr\s+(merge|close)|issue\s+(create|close)|release\s+create|repo\s+delete)\b",
    cmd,
):
    deny("gh remote-state mutations are blocked — perform GitHub actions manually")

# Block gh commands that include Claude Code self-promotion
if re.search(r"\bgh\b", cmd) and re.search(
    r"(Generated with \[?Claude|claude\.ai/claude-code|claude-code|Co-Authored-By:\s*Claude)",
    cmd,
    re.IGNORECASE,
):
    deny("Claude Code attribution text is not allowed in gh commands — remove the 'Generated with Claude Code' line from the PR body")

# curl / wget POSTing data to a non-local host
if re.search(r"\b(curl|wget)\b", cmd) and re.search(r"(-X\s*(POST|PUT|DELETE|PATCH)\b|--data\b|-d\s)", cmd):
    if not re.search(r"(localhost|127\.0\.0\.1|0\.0\.0\.0)", cmd):
        deny("curl/wget with a data payload to an external host is blocked")

# Piping a remote script into a shell (arbitrary remote code execution)
if re.search(r"\b(curl|wget)\b.*\|\s*(ba|da|z)?sh\b", cmd):
    deny("piping a remote script into a shell is blocked")


# ── DESTRUCTIVE / IRREVERSIBLE ────────────────────────────────────────────────
# Commands that permanently destroy data with no in-repo recovery path.

# git reset --hard (permanently discards all uncommitted changes)
if re.search(r"\bgit\s+reset\b.*\s--hard\b", cmd):
    deny(
        "git reset --hard permanently discards uncommitted changes — "
        "stash first, or run manually from your terminal if intentional"
    )

# git clean -f / -fd / -fdx (permanently deletes untracked files)
if re.search(r"\bgit\s+clean\b.*-[a-zA-Z]*f", cmd):
    deny("git clean -f permanently deletes untracked files — run manually if intentional")

# git checkout -- . or git restore . (bulk discard of all unstaged changes)
if re.search(r"\bgit\s+(checkout\s+--\s+\.|restore\s+\.)(\s|$)", cmd):
    deny("git checkout -- . / git restore . permanently discards all unstaged changes")

# rm -rf on root, home, parent directory, or well-known system paths
_has_rm_rf = bool(
    re.search(r"\brm\b", cmd)
    and re.search(
        r"-[a-zA-Z]*[rR][a-zA-Z]*[fF]"       # -rf, -Rf, -rfd, etc.
        r"|-[a-zA-Z]*[fF][a-zA-Z]*[rR]"       # -fr, -Fr, etc.
        r"|--recursive.*--force"
        r"|--force.*--recursive",
        cmd,
    )
)
if _has_rm_rf and re.search(
    r"\s(/\s*($|[;&|])"                        # bare /
    r"|~/|~(\s|$)"                             # ~ home dir
    r"|\.\./|\.\.\s|\.\.$"                     # .. parent dir
    r"|\$\{?HOME\}?"                           # $HOME or ${HOME}
    r"|/(etc|usr|var|lib|bin|sbin|boot|sys|proc|dev|home|root)\b)",  # system dirs
    cmd,
):
    deny("rm -rf on a root, home, parent, or system directory is blocked")

# dd writing directly to a block device (can silently wipe disks)
if re.search(r"\bdd\b.*\bof=/dev/", cmd):
    deny("dd targeting a block device is blocked")

# mkfs (formats/overwrites a filesystem partition)
if re.search(r"\bmkfs\b", cmd):
    deny("mkfs is blocked — it formats a filesystem")


sys.exit(0)
