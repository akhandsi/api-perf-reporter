.PHONY: install nuke clean check-node node_modules build bin format

bin := ./node_modules/.bin
prettier ?= $(bin)/prettier
node_req_version := $(shell cat .nvmrc)
node_version := $(shell node -v)

nuke:
		rm -rf node_modules

check-node:
ifneq ($(node_version), $(node_req_version))
	$(error Incorrect node version.  You have '$(node_version)', but need '$(node_req_version)'.  ===> RUN: 'nvm use $(node_req_version)' <===)
endif

node_modules: check-node
		npm install

clean: nuke node_modules
		rm -rf ./bin

install: clean
	tsc --outDir 'bin'
	chmod +x ./bin/index.js
	npm install -g .
