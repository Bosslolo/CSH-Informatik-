# CSH Auto Data — Package

**First installable package** for the project. This folder is the one-click entry point.

## One click (macOS)

Double-click **`Start CSH Auto Data.command`** → installs backend deps on first run → starts server → opens **http://localhost:4000**.

## Terminal

```bash
cd package
npm start
```

`postinstall` runs `backend` dependency install automatically after `npm install` in this folder.

## What lives here

| File | Purpose |
|------|---------|
| `package.json` | Launcher scripts (`npm start` → `cli/adm.js`) |
| `Start CSH Auto Data.command` | macOS double-click starter |
| `.gitignore` | Package-local ignore rules |

App code stays in sibling folders: [`../client`](../client/), [`../backend`](../backend/), [`../cli`](../cli/).
