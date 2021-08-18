# api-perf-reporter
Tool to generate different api performance reports from postman collections.

## Install

```bash
$ git clone git@github.com:akhandsi/api-perf-reporter.git
$ cd api-perf-reporter
$ make install
```

## Usage

```bash
api-perf [command] [options]

        runner  ............... run api performance test for given postman collection
        help    ............... show help menu for a command

api-perf runner [options]

        --directory, -d   ..... directory path with postman_collection.json and postman_environment.json files
        --load, -l        ..... number of iterations to run the given collection
        --report, -r      ..... generate run cli and html report
        --influx, -i      ..... influx db web url to save run results eg: http://user:password@host:8086/database
```

Examples

    `api-perf runner -d ../collection -r -l 5 -i http://username:password@localhost:8086`
