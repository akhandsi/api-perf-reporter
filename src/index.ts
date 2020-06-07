#!/usr/bin/env node
import minimist from 'minimist';
import * as error from './util/errors';

enum CommandEnum {
    VERSION = 'version',
    HELP = 'help',
    RUNNER = 'runner',
}

const args = minimist(process.argv.slice(2));
let cmd = args._[0] || CommandEnum.HELP;

if (args.version || args.v) {
    cmd = CommandEnum.VERSION;
}

if (args.help || args.h) {
    cmd = CommandEnum.HELP;
}

switch (cmd) {
    case CommandEnum.RUNNER:
        import('./cmd/runner').then((cmd) => {
            cmd.default(args);
        });
        break;

    case CommandEnum.VERSION:
        import('./cmd/version').then((cmd) => {
            cmd.default(args);
        });
        break;

    case CommandEnum.HELP:
        import('./cmd/help').then((cmd) => {
            cmd.default(args);
        });
        break;

    default:
        error.log(`"${cmd}" is not a valid command!`, true);
        break;
}
