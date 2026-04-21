# Claude Code Expert Skill

Use this skill whenever working with Claude Code CLI, MCP servers, configuration, troubleshooting, or optimization.

## Installation & Setup

### System Requirements
- **OS**: macOS 13.0+, Windows 10 1809+, Ubuntu 20.04+
- **Hardware**: 4 GB RAM minimum (16 GB+ recommended)
- **Node.js**: Not required for native installer
- **Account**: Claude Pro/Max/Team/Enterprise or API Console

### Installation (Recommended - Native Installer)
```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# Verification
claude --version
claude doctor
```

### Authentication
Three methods (in precedence order):
1. **ANTHROPIC_API_KEY** environment variable (overrides all)
2. **OAuth** via browser (recommended for subscriptions)
3. **Third-party providers** (Bedrock/Vertex)

Run `claude` and follow prompts to authenticate.

## Core Configuration

### Configuration Hierarchy (highest priority wins)
1. **Managed/Policy** settings
2. **Project local** (`.claude/settings.local.json`)
3. **Project shared** (`.claude/settings.json`)
4. **User local** (`~/.claude/settings.local.json`)
5. **User global** (`~/.claude/settings.json`)
6. Plugin defaults

### Key Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| `~/.claude/settings.json` | User home | Personal global settings |
| `.claude/settings.json` | Project root | Team-shared config (commit to VCS) |
| `.claude/settings.local.json` | Project root | Personal overrides (auto-gitignored) |
| `CLAUDE.md` | Project root | Project context/instructions |
| `~/.claude/CLAUDE.md` | User home | Global instructions |
| `.mcp.json` | Project root | Project MCP servers |
| `~/.claude.json` | User home | User MCP servers |
| `.claudeignore` | Project root | File exclusion patterns |

### Essential Environment Variables

```bash
ANTHROPIC_API_KEY          # API key (overrides subscription)
ANTHROPIC_MODEL            # Override default model
CLAUDE_CODE_EFFORT_LEVEL   # low/medium/high/max/auto
DISABLE_AUTOUPDATER=1      # Disable auto-updates
API_TIMEOUT_MS=600000      # API timeout (default 10min)
BASH_DEFAULT_TIMEOUT_MS    # Bash command timeout
HTTP_PROXY / HTTPS_PROXY   # Proxy configuration
NODE_EXTRA_CA_CERTS        # Corporate CA certificate path
```

## CLAUDE.md - Project Memory

The single most impactful configuration. Loaded automatically at every session start.

### Example CLAUDE.md
```markdown
# Project: My Web App

## Commands
- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm test` — Run Jest tests

## Architecture
- Next.js 15 with App Router
- PostgreSQL with Drizzle ORM
- TypeScript strict mode

## Conventions
- Use named exports, not default exports
- Prefer `interface` over `type` for object shapes
- Use `async/await`, never raw `.then()` chains

## Rules
- DO NOT modify files in `prisma/migrations/` directly
- Always run `pnpm lint` before considering task complete
```

### Best Practices
- Start with no CLAUDE.md, add rules only when repeating instructions
- Keep concise (every token is reprocessed each message)
- Use `/init` to auto-generate initial version
- Add entries in-session by typing `#` followed by note

## MCP Server Integration

MCP servers extend Claude Code's capabilities.

### Adding MCP Servers

```bash
# HTTP transport (remote servers)
claude mcp add --transport http github https://api.githubcopilot.com/mcp
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Stdio transport (local processes)
claude mcp add --transport stdio filesystem \
  -- npx -y @modelcontextprotocol/server-filesystem /home/user/projects

# With environment variables
claude mcp add --transport stdio db \
  -- npx -y @bytebase/dbhub --dsn "postgresql://user:pass@localhost:5432/db"
```

### JSON Configuration (.mcp.json)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": { "NODE_ENV": "production" }
    },
    "my-api": {
      "type": "http",
      "url": "https://mcp.example.com/v1",
      "headers": { "Authorization": "Bearer ${MY_API_TOKEN}" }
    }
  }
}
```

### Popular MCP Servers
- **Code**: GitHub, GitLab
- **Databases**: PostgreSQL, Supabase, MongoDB, MySQL
- **Monitoring**: Sentry
- **Project Management**: Jira, Asana, Trello
- **Browser**: Playwright, Puppeteer
- **Search**: Brave Search, Perplexity
- **Productivity**: Notion, Airtable
- **Cloud**: AWS, Cloudflare, DigitalOcean
- **Docs**: Context7 (version-specific docs)
- **Utility**: Sequential Thinking, Memory, Filesystem

### Management Commands
```bash
claude mcp list                  # List configured servers
claude mcp get github            # Inspect specific server
claude mcp remove github         # Remove server
/mcp                            # In-session management
```

## Settings.json Examples

```json
{
  "model": "sonnet",
  "permissions": {
    "defaultMode": "default",
    "allow": ["Bash(npm run *)", "Bash(git *)", "Read"],
    "deny": ["Bash(rm -rf *)", "Read(./.env)", "Read(./.env.*)"]
  },
  "hooks": {
    "PostToolUse": [
      { 
        "matcher": "Write", 
        "hooks": [{ "type": "command", "command": "npm run lint" }] 
      }
    ]
  }
}
```

### Permission Modes
- `"default"` - Ask before executing
- `"acceptEdits"` - Auto-approve edits only
- `"plan"` - Read-only analysis
- `"dontAsk"` - Auto-approve everything except denied

## IDE Integration

### VS Code Extension
Install from Extensions marketplace: "Claude Code" by Anthropic

**Features:**
- Native graphical chat panel
- Side-by-side diff viewer
- `@`-mention files with line ranges (`@file.ts#5-10`)
- Checkpoint-based undo/rewind
- Diagnostic sharing

**Critical Setting:**
Enable `files.autoSave` with 1000ms delay to avoid stale content conflicts.

**Key Shortcuts:**
- `Cmd+Esc` - Quick Launch
- `Cmd+Option+K` - Insert file reference

### JetBrains Plugin (Beta)
Install from IDE → Settings → Plugins → "Claude Code [Beta]"
Requires CLI installed separately.

## Effective Usage Patterns

### Prompting Best Practices

```
❌ "Fix the error in the auth component"
✅ "Fix the TypeScript error in LoginForm.tsx where user might be undefined"

❌ "Make this better"
✅ "Optimize readability in src/auth.js — extract constants, add error handling"
```

- Provide context first, define outcomes precisely
- Use `@file.ts` to reference files directly
- Iterative refinement: get close, diagnose gap, targeted correction

### Context Window Management

**Monitor:** Token percentage at bottom of terminal, `/context` for breakdown

**Strategies:**
- Compact at 70% (don't wait for auto-compact at 95%)
- `/clear` between unrelated tasks
- Offload investigation to subagents
- Batch related work
- Disable unused MCP servers

**Session Recovery Pattern:**
```
Save current state to 'session-notes.md' then /clear
@session-notes.md
Let's continue where we left off
```

### Cost Optimization

Average: ~$13/developer/active day or $150-250/month

**Strategies:**
- Start with Sonnet (80% of tasks)
- Switch to Opus only for complex architecture
- Use `/compact` and `/clear` aggressively
- Prefer CLI tools (`gh`, `aws`) over MCP equivalents

### Slash Commands Reference

- `/clear` - Reset context
- `/compact` - Compress conversation
- `/init` - Create CLAUDE.md
- `/model` - Switch models
- `/cost` - Token usage
- `/context` - Window breakdown
- `/mcp` - Manage servers
- `/agents` - View/create subagents
- `/effort` - Reasoning level
- `Shift+Tab` - Cycle permission modes
- `#` - Add note to CLAUDE.md

## Troubleshooting

### Installation Issues

| Issue | Fix |
|-------|-----|
| `command not found: claude` | Add `~/.local/bin` to PATH; open new terminal |
| TLS/SSL errors | `export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem` |
| Multiple installations conflicting | Check `which -a claude`, keep native install only |

### Authentication Issues

| Issue | Fix |
|-------|-----|
| "Organization disabled" | Old `ANTHROPIC_API_KEY` overriding. Run `unset ANTHROPIC_API_KEY` |
| Unexpected API charges | Check `/status` — API key takes precedence |
| OAuth fails in WSL2 | Use URL printed in terminal for manual auth |
| Token expired | `claude logout` then `claude` to re-authenticate |

### MCP Troubleshooting

- **Connection closed (Windows):** Use `cmd /c` wrapper
- **Server fails:** Run server command manually in terminal to see errors
- **Timeout:** Set `MCP_TIMEOUT=10000 claude`
- **Output too large:** Set `MAX_MCP_OUTPUT_TOKENS=50000`

### Performance Issues

| Issue | Solution |
|-------|----------|
| High CPU/memory | Use `.claudeignore`, `/compact`, smaller model (Haiku) |
| Context exceeded | `/compact` or `/clear` |
| Slow on WSL | Store projects on Linux filesystem (`~/`), not `/mnt/c/` |

## Resources

### Official
- **Docs**: https://code.claude.com/docs/en/overview
- **MCP**: https://code.claude.com/docs/en/mcp
- **Protocol**: https://modelcontextprotocol.io

### Community
- **awesome-claude-code**: https://github.com/hesreallyhim/awesome-claude-code
- **MCP servers**: https://github.com/wong2/awesome-mcp-servers
- **Registries**: mcpservers.org, glama.ai/mcp/servers

### SDKs
- **TypeScript**: `@modelcontextprotocol/sdk`
- **Python**: `pip install mcp`
- **Also**: C#, Java, Go, Kotlin, Rust
