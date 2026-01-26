# CONTRIBUTING

<!-- ## Getting started with GitHub Codespaces

To get started, create a codespace for this repository by clicking this 👇

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=83716883)

A codespace will open in a web-based version of Visual Studio Code. The [dev container](.devcontainer/devcontainer.json) is fully configured with software needed for this project. -->


## Getting started on your machine

First of all, checkout if git is installed and clone this repo:

```bash
git clone git@github.com:gabrielguerrero/ngrx-traits.git
```

After that, you can choose between an automatic or a manual setup of your development enviroment.

### Dev Containers

Dev containers is an open spec which is supported by [GitHub Codespaces](https://github.com/codespaces) and [other tools](https://containers.dev/supporting).

Devcontainers setup on your machine is based on the same configuration for Github Codespaces.
Docker setup is mandatory.

Devcontainers, as open standard, is supporterd by different IDE.
If VSCode is your favourite choice, please remember to install [Dev Containers Extensions](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

### Manual setup

If you go for a local configuration, please install NodeJS(lts iron) and pnpm.

After that, install globally Angular CLI:

```bash
pnpm add -g @angular/cli
```

Move to the root folder of the project and install dependencies:

```bash
pnpm install
```

## Test

```bash
pnpm test
```

## Build Library

```bash
pnpm build
```

## Start Examples App

```bash
pnpm start
```

## Start Docs App

```bash
pnpm start-docs
```
