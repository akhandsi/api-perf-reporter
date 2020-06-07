import minimist from 'minimist';
import version from '../../package.json';

export default function (args: minimist.ParsedArgs) {
    console.log(`v${version}`);
}
