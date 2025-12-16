# Hanma CLI

The official CLI for Hanma - Grapple your backend into shape with ready-to-use snippets.

## Installation

```bash
npm install -g hanma
# or
npx hanma <command>
```

## Usage

### Initialize

Initialize Hanma in your project:

```bash
hanma init
```

This will create a `hanma.json` configuration file.

### Add Snippets

Add snippets to your project:

```bash
# Interactive multi-select
hanma add

# Add specific snippets by name
hanma add cors jwt rate-limiter

# Add all snippets in a category
hanma add --all --category middleware

# With framework/version flags
hanma add cors --framework express --version v5
```

### Add Modules

Add multi-file modules to your project:

```bash
# Interactive multi-select
hanma module

# Add specific modules by name
hanma module i18n billing
hanma mod i18n  # 'mod' is an alias
```

### Create Project

Scaffold a new project from templates:

```bash
hanma create my-api --framework express-rest-api --database drizzle-postgres
```

## Options

### `add` Command Options

| Option | Description |
|--------|-------------|
| `-a, --all` | Add all snippets (use with `--category`) |
| `-c, --category <cat>` | Filter by category |
| `-f, --framework <fw>` | Framework to use |
| `-v, --version <ver>` | Version to use |
| `-p, --path <path>` | Destination path |

### `module` Command Options

| Option | Description |
|--------|-------------|
| `-f, --framework <fw>` | Framework to use |
| `-v, --version <ver>` | Version to use |
| `-p, --path <path>` | Destination path |
