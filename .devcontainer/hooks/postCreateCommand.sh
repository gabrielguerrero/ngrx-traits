#!/bin/bash

echo "Set permissions"
sudo chown -R node:node node_modules
sudo chown -R node:node .angular
echo "Set permissions done"

echo "Installing Deps"
npm i
echo "Installing Deps done"
