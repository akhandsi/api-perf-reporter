import minimist from 'minimist';

export default function (args: minimist.ParsedArgs) {
    const subCmd = args._[0] === 'help' ? args._[1] : args._[0];

    const menus: any = {
        main: `
        api-perf [command] <options>
    
        runner  ............... run api performance test for given postman collection
        version ............... show package version
        help    ............... show help menu for a command`,

        runner: `
        api-perf runner <options>
    
        --directory, -d   ..... directory path with a single postman collection and environment file
        --load, -l        ..... number of iterations that collection will be run for
        --report, -r      ..... generate collection run report
        --influx, -i      ..... influx db web url eg: http://user:password@host:8086/database`,
    };

    console.log(menus[subCmd] || menus.main);
}
