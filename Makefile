.PHONY: install

bin := ./node_modules/.bin
prettier ?= $(bin)/prettier
node_req_version := $(shell cat .nvmrc)
node_version := $(shell node -v)

install: clean format

clean: nuke
		rm -rf ./bin

format: build bin
		$(prettier) --config .prettierrc --write "**/*.{js,ts}"

node_modules: check-node
		npm install -g .

build: node_modules
		tsc --outDir 'bin'

bin:
		chmod +x ./bin/index.js

nuke:
		rm -rf node_modules

check-node:
ifneq ($(node_version), $(node_req_version))
	$(error Incorrect node version.  You have '$(node_version)', but need '$(node_req_version)'.  ===> RUN: 'nvm use $(node_req_version)' <===)
endif
