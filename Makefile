.PHONY: bin build format check-node clean install
BIN := ./node_modules/.bin
PRETTIER ?= $(BIN)/prettier
NODE_REQ_VERSION := $(shell cat .nvmrc)
NODE_VERSION := $(shell node -v)

install: clean format

clean:
	npm uninstall
	rm -rf ./bin

format: node_modules build bin
	$(PRETTIER) --config .prettierrc --write "**/*.{js,ts}"

node_modules: check-node
	npm install

check-node:
ifneq ($(NODE_VERSION), $(NODE_REQ_VERSION))
	$(error Incorrect node version.  You have '$(NODE_VERSION)', but need '$(NODE_REQ_VERSION)'.  ===> TO SWITCH TO THE CORRECT VERSION, RUN: 'nvm use' <===)
endif

build:
	tsc --outDir 'bin'

bin:
	npm link

nuke:
	rm -rf node_modules
	rm -Rf node


