# api-perf-reporter
Tool to generate different api performance reports from postman collections.

## Usage

api-perf [command] [options]
    
        runner  ............... run api performance test for given postman collection
        version ............... show package version
        help    ............... show help menu for a command

api-perf runner [options]
    
        --directory, -d   ..... directory path with postman_collection.json and postman_environment.json files
        --load, -l        ..... number of iterations to run the given collection
        --report, -r      ..... generate run cli and html report
        --influx, -i      ..... influx db web url to save run results eg: http://user:password@host:8086/database

Examples
     
    `api-perf runner -d ../collection -r -l 5 -i http://username:password@localhost:8086`
    
   
    
