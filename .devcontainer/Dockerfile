ARG VARIANT="20-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:1-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends chromium 

ENV CHROME_BIN=/usr/bin/chromium
ENV NODE_OPTIONS=--max-old-space-size=8192

ARG EXTRA_NODE_VERSION="lts/hydrogen"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

RUN su node -c "npm install -g @angular/cli@17.3.3"
