---
title: "My Development Environment: Windows Terminal, WSL, Ubuntu, and mise"
description: "The terminal, Linux utilities, runtimes, package managers, and coding tools in my Windows and WSL development setup."
tags:
  - Development
draft: false
publishedAt: "2026-11-06"
---

I spend a lot of time in the terminal, so the tools on my machine matter. I want a Linux environment on Windows, a terminal I can configure, and a predictable way to manage development runtimes and command-line tools.

My setup has four pieces:

- **Windows Terminal** is the terminal application.
- **WSL with Ubuntu** gives me a Linux environment on Windows.
- **APT** manages Ubuntu packages and system utilities.
- **mise** manages development runtimes and standalone tools.

These pieces have different jobs. Keeping them separate makes the environment easier to maintain. I don't need to use the same installation method for every tool.

This is a snapshot of my current setup. Some packages come with Ubuntu, others I added. Versions change as I update the machine.
## 1. The Windows side: Windows Terminal

Windows Terminal hosts command-line sessions. It's not the shell itself and doesn't provide the Linux environment. A terminal profile launches a shell or another program, and Windows Terminal gives that session a window, tabs, panes, and settings.

I use it with my Ubuntu WSL distribution. I can open PowerShell for Windows work, Ubuntu for Linux development, or separate tabs for different tasks.

### Tabs and panes

Tabs keep unrelated tasks apart. I might have one tab in a project directory, another running a server, and a third for Git or system commands. Panes let me see two sessions at once, like a server log beside the command that starts or tests it.

Windows Terminal supports profiles. A profile defines the command line, starting directory, icon, tab title, and appearance for a shell. I can give Ubuntu a starting point instead of opening every session in an arbitrary directory.

A few details make a terminal comfortable:

- A readable monospace font with the glyphs needed by the prompt and terminal applications.
- A color scheme with enough contrast to distinguish normal output, errors, and syntax-highlighted text.
- Scrollback history so output doesn't disappear.
- Keyboard shortcuts for creating, switching, resizing, and moving panes.
- A profile that starts the shell I want.

Windows Terminal handles the window and presentation. Ubuntu supplies the Linux programs that run inside.
**Documentation:** [Windows Terminal documentation](https://learn.microsoft.com/en-us/windows/terminal/), [profiles and profile settings](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-general), and [panes](https://learn.microsoft.com/en-us/windows/terminal/panes).

## 2. The Linux side: Ubuntu on WSL

[Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) lets me use a Linux distribution and its command-line tools on Windows. I use Ubuntu.

This gives me a Linux development environment while keeping my Windows desktop workflow. I can use Linux shells, package managers, build tools, and scripts from Windows, and I can still open Windows applications when I need them.

WSL is the environment. Ubuntu is the distribution inside it. Ubuntu provides the filesystem layout, package repositories, system libraries, and familiar Linux userland. WSL connects that environment to Windows.

### Where project files live matters

One practical detail with WSL is project location. Linux files are available to Windows, and Windows drives are mounted inside Linux (usually under `/mnt`, like `/mnt/c`). That interoperability is useful, but both locations don't behave identically for every workload.

Microsoft recommends keeping a project in the Linux filesystem when the tools working on it are Linux tools running inside WSL. A project under `/home/<user>/projects` is generally better for a Linux-based Node, Python, or build-tool workflow than a project under `/mnt/c/Users/...`. If I'm using Windows command-line tools, the Windows filesystem makes more sense.

The rule is simple: keep files on the same side of the boundary as the tools that use them most. Cross-filesystem access is supported but can be slower for workloads that touch many files.

### Basic WSL commands

A few commands help me inspect and manage the distribution from PowerShell:

```powershell
# List installed distributions and their WSL versions
wsl --list --verbose

# Start the Ubuntu distribution
wsl -d Ubuntu

# Shut down WSL instances
wsl --shutdown
```

The distribution name shown by `wsl --list --verbose` is the name to use with `wsl -d`; it may differ if the distribution was installed under a custom name.

**Documentation:** [Microsoft's WSL overview](https://learn.microsoft.com/en-us/windows/wsl/about), [install WSL](https://learn.microsoft.com/en-us/windows/wsl/install), [set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment), and [work across Windows and Linux filesystems](https://learn.microsoft.com/en-us/windows/wsl/filesystems).

## 3. Ubuntu packages: what I installed with APT

APT handles the operating-system side of my setup. I use it for standard Linux utilities, shell packages, editors, libraries, build tools, and programs that fit naturally into Ubuntu's package system.

The package list below comes from:

```bash
apt-mark showmanual
```

That command prints packages APT marks as manually installed. It's not a perfect record of every command I chose to install. Packages that shipped with Ubuntu can be marked manual, and packages pulled in as dependencies are usually marked automatic.

I've grouped the list by purpose and removed packages that come with a standard Ubuntu WSL installation.

### 3.1 Shells and command-line tools

I have **Zsh** installed alongside the default **Bash**. Zsh has a rich completion and customization ecosystem. Bash is widely available and works for interactive use and scripting. **bash-completion** adds programmable completions for many commands.

The package list shows which shells are installed. It doesn't show which one is my login shell. That's determined by the account and shell configuration.

A few tools make terminal navigation and output more pleasant:

| Tool | What it does | Where it helps |
| --- | --- | --- |
| [Starship](https://starship.rs/) (`starship`) | A customizable prompt that works across shells. | Showing useful context such as the current directory, Git state, and runtime information without hard-coding one prompt for every shell. |
| [zoxide](https://github.com/ajeetdsouza/zoxide) (`zoxide`) | Learns frequently used directories and provides a smarter way to jump between them. | Moving between projects without repeatedly typing long paths. |
| [fzf](https://github.com/junegunn/fzf) (`fzf`) | An interactive fuzzy finder that can filter a list of files, history entries, or other text. | Selecting an item from a long list instead of scrolling through it manually. |
| [eza](https://github.com/eza-community/eza) (`eza`) | A modern alternative to `ls`, with options for a more informative directory listing. | Seeing file types, permissions, and directory structure at a glance. |
| [bat](https://github.com/sharkdp/bat) (`bat`) | A `cat`-style file viewer with syntax highlighting and line numbers. | Reading source files and configuration without opening an editor. |
| [fd](https://github.com/sharkdp/fd) (`fd-find`) | A convenient alternative to `find` for locating files and directories. | Finding files by name or extension with a concise command. |
| [ripgrep](https://github.com/BurntSushi/ripgrep) (`ripgrep`, command `rg`) | Searches file contents recursively using regular expressions and respects ignore rules by default. | Finding a symbol, string, or configuration value across a repository. |

On Ubuntu, the package name and executable name aren't always identical. `fd-find` is exposed as `fdfind`, and `bat` may be `batcat` to avoid a naming conflict. A shell alias can provide the shorter command, but I check what's actually installed rather than assume the alias exists.

These commands work without custom aliases:

```bash
# Search source files
rg "TODO|FIXME"

# Find files with a particular extension
fdfind -e ts

# Read a source file with syntax highlighting
batcat package.json

# Show a directory listing
eza -la
```

### 3.2 Monitoring and terminal sessions

A few utilities are useful when I want to keep an eye on the machine or leave a task running:

- **btop** (`btop`) is an interactive resource monitor. It gives me a live view of CPU, memory, processes, and system activity.
- **fastfetch** (`fastfetch`) prints a compact summary of the system and environment. It's useful for quickly checking which machine or distribution I'm in, and for displaying environment information when a shell starts.
- **byobu** (`byobu`) provides a more approachable layer around terminal multiplexers like tmux or screen. It's useful for persistent terminal sessions and multiple windows in a terminal workflow.

Windows Terminal panes and a terminal multiplexer are different. Windows Terminal panes split the application window. A multiplexer manages terminal sessions from inside the shell environment, which can remain useful even when I reconnect to a session in another terminal window.

### 3.3 Editors

I have a few terminal editors available:

- **Neovim** (`neovim`, command `nvim`) is the most feature-rich editor in this group. It's highly configurable and has a large plugin ecosystem.
- **Vim** (`vim`) is a mature modal editor and a familiar fallback on many Linux machines.
- **Nano** (`nano`) is a straightforward editor for quick changes to configuration files.

Having more than one editor installed doesn't mean I use all of them equally. It means I have an editor available in different situations, including when I'm working on a machine with a minimal configuration.

**Documentation:** [Neovim user manual](https://neovim.io/doc/user/) and [GNU nano](https://www.nano-editor.org/).

### 3.4 Git, builds, and source-code utilities

Git is the foundation of my source-control workflow. The surrounding tools make it easier to inspect changes and build software:

- **git** provides version control: commits, branches, diffs, merges, and collaboration through remote repositories.
- **build-essential** pulls in the standard compiler and build dependencies needed for compiling native software on Ubuntu, including tools like GCC and Make.
- **lazygit** is a terminal user interface for Git. It doesn't replace Git; it gives me an interactive way to inspect the working tree, stage changes, review commits, and carry out common Git operations.

The **GitHub CLI** (`gh`) is installed through mise rather than APT. It brings GitHub workflows into the terminal, including viewing issues and pull requests, checking workflow runs, and managing repositories. Git and GitHub CLI do different jobs: Git manages the local repository and its history, while `gh` talks to GitHub's platform.

**Documentation:** [Git documentation](https://git-scm.com/doc), [LazyGit](https://github.com/jesseduffield/lazygit), and [GitHub CLI manual](https://cli.github.com/manual/).

### 3.5 Files, data, networking, and media

These utilities aren't tied to one programming language, but I reach for them when a project or task needs them:

| Tool | Purpose |
| --- | --- |
| `curl` | Makes HTTP requests and transfers data from or to a URL. Useful for testing endpoints, downloading files, and inspecting APIs. |
| `wget` | Downloads files from the command line, including from remote HTTP and FTP servers. |
| `jq` | Reads, filters, and transforms JSON from files or command output. |
| `rsync` | Copies and synchronizes files efficiently, locally or over a remote connection. |
| `rclone` | Works with remote storage services through a common command-line interface. Useful for copying or synchronizing data between local paths and configured cloud remotes. |
| `openssh-client` | Provides SSH client tools like `ssh`, `scp`, and `sftp` for connecting to remote machines and transferring files. |
| `lsof` | Lists open files and the processes using them. Handy when investigating which process has a file or port open. |
| `psmisc` | Supplies process-related utilities like `pstree`, `killall`, and `fuser`. |
| `ffmpeg` | A command-line toolkit for inspecting, converting, recording, and processing audio and video. |

I use `curl` and `wget` for different download and request scenarios, `jq` when JSON becomes difficult to read, and `rsync` or `rclone` when files need to move between locations. `ffmpeg` covers media-processing tasks.

One command worth treating carefully is `rclone sync`. It makes the destination match the source, which can include deleting files from the destination. I use `--dry-run` or an interactive mode while learning a new remote or synchronization rule. `rclone copy` is safer when I want to copy without making the destination identical to the source.

I also have **Google Chrome Stable** (`google-chrome-stable`) installed through APT. It gives me a full browser for manually checking pages, testing layouts, and inspecting browser behavior. That's a different job from the Playwright and Camofox MCP packages described later: Chrome is the browser application, while those packages expose browser automation to compatible clients. Running a Linux desktop browser from WSL depends on GUI application support being available in the Windows/WSL installation.

**Documentation:** [curl](https://curl.se/docs/), [GNU Wget](https://www.gnu.org/software/wget/), [jq](https://jqlang.org/manual/), [rsync](https://rsync.samba.org/documentation.html), [rclone](https://rclone.org/docs/), [OpenSSH](https://www.openssh.com/manual.html), and [FFmpeg](https://ffmpeg.org/documentation.html).

### 3.6 Coreutils: GNU and Rust implementations

My package list includes several similarly named packages: `coreutils`, `gnu-coreutils`, `rust-coreutils`, and `coreutils-from-uutils`. They're related, but they're not four unrelated command-line applications.

GNU Coreutils is the traditional collection of everyday commands like `cat`, `cp`, `ls`, `mv`, `rm`, and `date`. [uutils](https://uutils.org/coreutils/) is a Rust implementation that aims to provide compatible versions of those utilities.

Ubuntu has introduced provider-selection packages in newer releases. On Ubuntu 25.10 and later, `coreutils-from-uutils` selects the uutils implementation for the standard commands, while `rust-coreutils` contains the Rust-based utilities. GNU Coreutils can remain installed as well, and Ubuntu's documentation describes release-specific cases where particular commands continue to use the GNU implementation. The exact split depends on the Ubuntu release.

I shouldn't assume that every command on my system is running the same implementation. When it matters, I can inspect a command directly:

```bash
ls --version
cp --version
```

The package names alone aren't enough to establish which implementation a particular command resolves to. I avoid removing or swapping these packages casually: they provide essential system commands, and Ubuntu documents a specific procedure for changing the provider.

**Documentation:** [Ubuntu's system utility replacement notes](https://ubuntu.com/server/docs/reference/other-tools/sudo-rs/) and [uutils Coreutils](https://uutils.org/coreutils/docs/).

## 4. mise: one place for development tools

APT is responsible for the Ubuntu system. For language runtimes and developer-facing command-line tools, I use [mise](https://mise.jdx.dev/).

mise is a development environment manager. It installs tools, selects which version should be active, and places the selected executables on `PATH`. Its main advantage is that I don't need a separate version manager for every language or a collection of one-off installation scripts for every CLI.

My global mise configuration lives at:

```text
~/.config/mise/config.toml
```

The output of `mise ls` shows the installed tools, the selected versions, where each tool is configured, and the version request that produced the selection. Most of mine are requested as `latest`; Node.js is requested as major version `26`.

### Why use a separate tool manager?

A system package manager and a development tool manager solve different problems. Ubuntu's APT repositories provide packages that fit the operating system. mise lets me choose versions of runtimes and developer tools independently of the Ubuntu release cycle.

That separation is useful when I work across different projects. One project may expect a particular Node.js major version, while another may need a different runtime. mise can read project configuration and select the corresponding tools when I enter a directory. The global configuration provides defaults; a project's own `mise.toml` can describe the versions that project expects.

Some useful commands:

```bash
# Show the tools mise knows about
mise ls

# Show tools configured for the current project
mise ls --current

# Install the versions declared by the configuration
mise install

# Add a tool to the current project's mise.toml
mise use node@26

# Set a global default instead
mise use --global node@26

# Check which tools have newer versions available
mise outdated

# Show the executable selected for a tool
mise which node
```

There's a trade-off to the `latest` version request. It's convenient for a personal machine because I can follow current releases without editing a version number every time. It's less predictable than pinning an exact version. For a project where reproducible builds matter, I record the project's required tool versions in its own configuration and commit the relevant configuration or lockfile.

### 4.1 The runtimes and package managers

These are the runtimes and package managers currently listed by mise:

| Tool | Installed version | Why it's in my environment |
| --- | ---: | --- |
| [Node.js](https://nodejs.org/en) (`node`) | `26.13.0` | A JavaScript runtime used by a large part of the web ecosystem. It runs development servers, build tools, scripts, and server-side JavaScript applications. My request is `26`, so I'm following the Node 26 line rather than pinning one patch release globally. |
| [pnpm](https://pnpm.io/) (`pnpm`) | `12.18.0` | A package manager for JavaScript and TypeScript projects. Its content-addressable store and linking approach can share package files between projects, which helps reduce duplicated dependency storage. |
| [Deno](https://deno.com/) (`deno`) | `2.9.8` | A JavaScript and TypeScript runtime with an integrated set of developer tools. It gives me another runtime and toolchain for scripts and projects that are a good fit for Deno. |
| [uv](https://docs.astral.sh/uv/) (`uv`) | `0.13.7` | A fast Python package and project manager. It manages project dependencies and virtual environments, works with lockfiles, and installs Python versions when needed. |

Node.js and Deno both run JavaScript and TypeScript, but I don't treat them as interchangeable in every project. The project determines which runtime and package manager it expects. Likewise, pnpm isn't a replacement for mise: pnpm manages JavaScript project dependencies, while mise manages the tools that run those projects.

uv plays a similar project-level role for Python. It's the tool I reach for when I need a Python environment or Python dependencies without manually managing every virtual environment.

### 4.2 GitHub and other command-line tools

| Tool | Installed version | What it's for |
| --- | ---: | --- |
| [GitHub CLI](https://cli.github.com/) (`gh`) | `2.103.3` | Interacting with GitHub from the terminal: repositories, issues, pull requests, releases, and workflow runs. It complements Git rather than replacing it. |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) (`yt-dlp`) | `2026.10.26` | A command-line media downloader with support for many video and audio websites. I keep it as a standalone tool instead of tying it to one project. |
| [Vite+](https://viteplus.dev/guide) (`vite-plus`, CLI `vp`) | `1.5.0` | A unified web-development toolchain. Its `vp` CLI brings together tools like Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. |

Vite+ is worth separating from a normal package manager. It's a broader web toolchain that can coordinate development, builds, tests, linting, formatting, and tasks. I don't need to use every part of that toolchain in every repository; the project and its configuration determine which commands are relevant.

### 4.3 Coding agents and agent-oriented tools

My mise inventory also contains a few tools designed around AI-assisted coding and agent workflows. They're not all the same kind of application, so it's useful to describe them separately.

| Tool | Installed version | Role |
| --- | ---: | --- |
| [OpenCode](https://opencode.ai/) (`opencode`) | `2.2.5` | An open-source coding agent available through a terminal interface, with other app integrations also available. It can work with a codebase, propose edits, and use configured model providers. |
| [oh-my-pi](https://github.com/can1357/oh-my-pi) (`omp`) | `18.17.0` | A coding-agent project built around a terminal workflow, with an IDE-oriented tool surface. Its project documentation describes features like code navigation, language-server integration, and agent tools. |
| [herdr](https://github.com/herdrdev/herdr) (`herdr`) | `0.9.5` | A workspace and session runtime for coding agents. It keeps terminal sessions organized, preserves layouts, and makes it easier to see which agent sessions need attention. |
| [9router](https://github.com/decolua/9router) (`9router`) | `0.5.112` | A local AI-provider router for compatible coding tools. It acts as a common endpoint between clients and configured providers, with options for routing and fallback behavior. |

These tools sit at different layers. OpenCode and oh-my-pi are coding-agent interfaces. Herdr focuses on the sessions and workspace around agents. 9router focuses on the connection between a compatible client and model providers. Having them installed doesn't mean every project needs all of them; I can choose the one that fits the task.

Because these tools may read project files, run commands, connect to external services, or use provider credentials, I treat their permissions and configuration as part of the development environment. API keys belong in an appropriate secret store or environment variable, not in a public repository or a checked-in config file.

### 4.4 Browser automation through MCP

Two packages in the list expose browser-related capabilities to Model Context Protocol (MCP) clients:

| Package | Installed version | Purpose |
| --- | ---: | --- |
| [`@playwright/mcp`](https://playwright.dev/docs/getting-started-mcp) | `0.0.84` | A Playwright MCP server that lets an MCP-compatible client control a browser using structured browser and accessibility information. Useful for repeatable browser interactions and web testing workflows. |
| [`@askjo/camofox-browser-mcp`](https://github.com/jo-inc/camofox-browser/tree/master/mcp) | `1.18.1` | An MCP adapter for the Camofox browser service. It exposes the browser service's tools to an MCP-compatible host. |

The boundary between the browser and the agent matters. Playwright is a browser automation framework; the MCP server exposes browser actions in a form an MCP client can call. Camofox is a separate browser service with its own implementation and MCP adapter. They're related in that both can make browser interaction available to an agent, but they're not the same browser or server.

Browser automation can access pages and data that a normal script may not. I only connect it to accounts and websites where I have permission to automate actions, and I'm careful about which browser sessions, ports, and credentials are exposed to other processes.

## 5. How the pieces fit together

The point of this setup isn't to use every command in the list every day. Each layer gives me a different part of the workflow.

A normal development session might look like this:

1. I open Windows Terminal and start an Ubuntu WSL profile.
2. My configured shell starts and loads its completion, prompt, and navigation tools.
3. I move into a project directory in the Linux filesystem.
4. mise selects the runtimes and CLIs declared for that project.
5. I inspect the repository with `git`, `rg`, `fdfind`, or `eza`, and open files in Neovim.
6. I use the package manager that the project expects, like pnpm for a JavaScript project or uv for a Python project.
7. I run the project's development, build, and test commands. If browser interaction is part of the task, I can use the browser tooling available to the relevant MCP client.
8. I review the changes with Git or LazyGit and use `gh` when I need to work with GitHub itself.

The commands below are examples of the tools working together, not a fixed script that every repository must follow:

```bash
# Enter a project stored in the WSL filesystem
cd ~/projects/example

# See the tool versions selected for this directory
mise ls --current

# Search the codebase
rg "createServer" .

# Find TypeScript files (Ubuntu's fd package command)
fdfind -e ts

# Review repository state
git status
lazygit

# Check the JavaScript toolchain
node --version
pnpm --version
```

A Python project would use its own `pyproject.toml` and uv workflow; a Deno project would use Deno's commands; a web project might use Vite+ or its own build system. I don't force every project into the same stack just because those tools are installed globally.

## 6. Keeping the setup maintainable

A development environment is useful only while it stays understandable. I try to keep a few boundaries in place.

### System packages and development tools have different owners

APT owns Ubuntu packages, system libraries, and operating-system utilities. mise owns the runtime and CLI versions I want independently of the Ubuntu release. Project package managers like pnpm and uv own dependencies inside individual projects.

When something breaks, this distinction helps narrow down the problem. A missing shared library is likely an operating-system package issue. The wrong Node version is likely a mise selection issue. A package missing from `node_modules` belongs to the project's package manager.

### Global defaults aren't project guarantees

My global mise configuration is convenient for my own machine. It's not automatically a reliable description of what a repository needs on another computer. For that, the repository should declare its own tool requirements and dependency versions.

I prefer project-level version files for tools where compatibility matters. A global `latest` request is a personal convenience; it shouldn't silently become the only documentation of a production project's runtime requirements.

### Keep credentials out of the repository

GitHub authentication, AI-provider credentials, cloud-storage remotes, and browser sessions can all grant access to private resources. I keep secrets out of source control and avoid copying tokens into shell history, issue descriptions, or example configuration files.

### Treat a package list as a snapshot

The `apt-mark showmanual` and `mise ls` outputs describe the machine at a particular point in time. They're useful records, but they're not timeless. Ubuntu package names and defaults can change between releases, and tools requested as `latest` can resolve to newer versions later.

The version numbers in this article are a snapshot from **6 November 2026**. They describe what I reported from my machine on that date; they're not a recommendation that everyone should install those exact versions.

## 7. My current mise inventory

For completeness, this is the active set of tools and versions from the `mise ls` output I used while writing this article. The `Source` column in that output points to my global configuration file for most tools, while the `npm:`, `pypi:`, and `github:` prefixes identify the installation backend.

| Tool | Version | Version request / source |
| --- | ---: | --- |
| `deno` | `2.9.8` | `latest` |
| `gh` | `2.103.3` | `latest` |
| `github:can1357/oh-my-pi` | `18.17.0` | `latest` |
| `herdr` | `0.9.5` | `latest` |
| `node` | `26.13.0` | `26` |
| `npm:9router` | `0.5.112` | `latest` |
| `npm:@askjo/camofox-browser-mcp` | `1.18.1` | `latest` |
| `npm:@playwright/mcp` | `0.0.84` | `latest` |
| `opencode` | `2.2.5` | `latest` |
| `pnpm` | `12.18.0` | `latest` |
| `npm:vite-plus` | `1.5.0` | `latest` |
| `pypi:yt-dlp` | `2026.10.26` | `latest` |
| `uv` | `0.13.7` | `latest` |

mise may also display versions that are scheduled for pruning after a version change. I have left those out of the table because they are not the selected version in the current inventory.

## 8. The APT package snapshot

This is the package list as reported by `apt-mark showmanual`, with default Ubuntu/WSL packages removed to focus on tools I chose to install.

```text
bash-completion
bat
binutils
btop
build-essential
byobu
coreutils-from-uutils
eza
fastfetch
fd-find
ffmpeg
fzf
git
gnu-coreutils
google-chrome-stable
jq
lazygit
lsof
neovim
psmisc
rclone
ripgrep
rsync
rust-coreutils
software-properties-common
starship
vim
zoxide
zsh
```

Default packages like `bash`, `curl`, `dpkg`, `coreutils`, `diffutils`, `findutils`, `grep`, `gzip`, `tar`, `file`, `time`, `dash`, `ed`, `nano`, `openssh-client`, `patch`, `wget`, `init`, `dbus-x11`, `gnupg`, `dirmngr`, `apparmor`, `unattended-upgrades`, `snapd`, `cloud-init`, `landscape-client`, `ubuntu-insights`, `update-manager-core`, `ubuntu-minimal`, `wsl-pro-service`, `wsl-setup`, `libpam-systemd`, `man-db`, `manpages`, `info`, and various system libraries (`libegl1`, `libgl1`, `libgtk-3-0t64`, `libattr1`, `ncurses-base`, `ncurses-bin`, `media-types`, `fonts-ubuntu`, `hostname`, `util-linux`, `show-motd`, `motd-news-config`) come with a standard Ubuntu WSL installation and aren't listed above.

## 9. Documentation and project links

These are the upstream references I use to understand the tools and keep up with changes. The project documentation is the best place to check current installation instructions, compatibility notes, and available features.

### Windows and Linux environment

- [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/)
- [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/)
- [Ubuntu on WSL](https://documentation.ubuntu.com/wsl/)
- [APT and package management](https://ubuntu.com/server/docs/package-management/)
- [`apt-mark` manual](https://manpages.ubuntu.com/manpages/resolute/man8/apt-mark.8.html)

### Shell and terminal utilities

- [Bash](https://www.gnu.org/software/bash/manual/)
- [Zsh](https://zsh.sourceforge.io/Doc/)
- [Starship](https://starship.rs/guide/)
- [zoxide](https://github.com/ajeetdsouza/zoxide)
- [fzf](https://github.com/junegunn/fzf)
- [eza](https://github.com/eza-community/eza)
- [bat](https://github.com/sharkdp/bat)
- [fd](https://github.com/sharkdp/fd)
- [ripgrep](https://github.com/BurntSushi/ripgrep)
- [btop](https://github.com/aristocratos/btop)
- [Byobu](https://www.byobu.org/)
- [Neovim](https://neovim.io/doc/user/)
- [LazyGit](https://github.com/jesseduffield/lazygit)

### Development runtimes and toolchain

- [mise documentation](https://mise.jdx.dev/)
- [Node.js](https://nodejs.org/en)
- [pnpm](https://pnpm.io/)
- [Deno](https://docs.deno.com/)
- [uv](https://docs.astral.sh/uv/)
- [Vite+](https://viteplus.dev/guide)
- [GitHub CLI](https://cli.github.com/manual/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [rclone](https://rclone.org/docs/)

### Coding agents and browser tools

- [OpenCode](https://opencode.ai/docs/)
- [oh-my-pi](https://github.com/can1357/oh-my-pi)
- [herdr](https://github.com/herdrdev/herdr)
- [9router](https://github.com/decolua/9router)
- [Playwright MCP](https://playwright.dev/docs/getting-started-mcp)
- [Camofox Browser MCP](https://github.com/jo-inc/camofox-browser/tree/master/mcp)

---

This setup will keep changing. I'll probably replace a few tools, remove things I stop using, and add new ones as projects demand them. The important part isn't keeping the longest possible tool list; it's having a development environment that stays comfortable, understandable, and useful for the work I actually do.
