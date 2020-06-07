import * as newman from 'newman';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import clc from 'cli-color';
import csvtojson from 'csvtojson';
import minimist from 'minimist';
import Lazy from 'lazy.js';
import * as error from './../util/errors';
import { InfluxUtil } from '../util/influx';
import { NewmanRunSummary } from 'newman';

enum ReportEnum {
    CLI = 'cli',
    CSV = 'csv',
    HTML = 'htmlextra',
    INFLUX = 'influxdb',
}

type FileName = string | string[];

interface INewmanReporter {
    cli: {
        noBanner: boolean;
    };
    csv: {
        export: string;
        includeBody?: boolean;
    };
    htmlextra?: {
        export: string;
        darkTheme?: boolean;
        skipHeaders?: boolean;
        omitHeaders?: boolean;
        logs?: boolean;
        title?: string;
    };
    influxdb?: {
        server: string;
        port: string;
        name: string;
        measurement: string;
        username: string;
        password: string;
    };
}

/**
 * Runner command helper class provides helper methods to provide / parse different
 * command arguments.
 */
class RunnerCommandHelper {
    /**
     * Get command simplified options from passed arguments
     */
    public static async getCommandOptions(args: minimist.ParsedArgs) {
        const directoryPath = args.directory || args.d;
        if (!directoryPath) {
            error.log(
                `missing directory path with a single postman collection and environment file!`,
                true
            );
        }

        const files = fs.readdirSync(directoryPath) || [];

        const collectionFilePath = files.find(
            (file: FileName) => file.indexOf('_collection.json') > -1
        );
        if (!collectionFilePath) {
            error.log(`missing collection file, please add a file name *collection.json!`, true);
        }

        const environmentFilePath = files.find(
            (file: FileName) => file.indexOf('_environment.json') > -1
        );
        if (!environmentFilePath) {
            error.log(`missing environment file, please add a file name *environment.json!`, true);
        }

        const isReportingNeeded = args.report || args.r;
        const influxUrl = args.influx || args.i;
        const reportConfig = await ReportConfiguration.getReportConfiguration(
            directoryPath,
            isReportingNeeded,
            influxUrl
        );
        return {
            collectionFilePath: `${directoryPath}/${collectionFilePath}`,
            environmentFilePath: `${directoryPath}/${environmentFilePath}`,
            reporters: reportConfig.reporters,
            reporter: reportConfig.reporter,
            iteration: args.load || args.l || 1,
        };
    }
}

/**
 * Collection Runner class provides methods to handle run events and creates a
 * simplified cli report on run complete.
 */
class CollectionRunner {
    /**
     * Handle run complete event for newman.
     */
    public static onRunComplete(csvReportConfig: { export: string }) {
        return async (err: Error | null, summary: NewmanRunSummary) => {
            const e = err || summary.error;
            if (e) {
                error.log(`Collection run encountered an error! ${e}`, true);
            }
            await CollectionRunner.generateRunSummary(csvReportConfig.export);
        };
    }

    /**
     * Generate run summary from the indirect csv report created through newman
     * delete the csv report file after run.
     */
    private static async generateRunSummary(csvFilePath: string) {
        console.log();
        console.log(
            '--------------------------------------------------------------------------------------------------'
        );
        console.log('Collection Run Summary Report');
        console.log(
            '--------------------------------------------------------------------------------------------------'
        );

        // read csv file
        const report = await csvtojson().fromFile(csvFilePath);

        // group requests based on iteration and request name
        // request name has to be in a form 'Request Name - Request Type'
        const requestGroupedByNameAndIteration = Lazy(report)
            .groupBy((request) => {
                const requestName = request.requestName.split(' - ')[0];
                const iteration = request.iteration;
                return `${requestName}::Iteration ${iteration}`;
            })
            .toObject();

        // create a request summary from computed grouped summary
        const requestSummary: any[] = Object.keys(requestGroupedByNameAndIteration)
            .map((key: any) => {
                const keys = key.split('::');
                const totalResponseTime = Lazy(requestGroupedByNameAndIteration[key])
                    .map((group: any) => parseFloat(group.responseTime) / 1000)
                    .sum();
                const responseTime = `${totalResponseTime} sec`;
                const totalResponseSize = Lazy(requestGroupedByNameAndIteration[key])
                    .map((group: any) => parseFloat(group.responseSize) / 1024)
                    .sum();
                const responseSize = `${totalResponseSize} kb`;
                return {
                    iteration: `${clc.yellow(keys[1])}`,
                    name: `${clc.magenta.bold(keys[0])}`,
                    numberOfRequests: `${clc.blue(requestGroupedByNameAndIteration[key].length)}`,
                    responseTime:
                        totalResponseTime > 3
                            ? `${clc.red(responseTime)}`
                            : `${clc.green(responseTime)}`,
                    responseSize: `${clc.cyan(responseSize)}`,
                };
            })
            .map((summary: any) => {
                return [
                    summary.iteration,
                    summary.name,
                    summary.numberOfRequests,
                    summary.responseTime,
                    summary.responseSize,
                ];
            });

        // print out a simplified table from summary
        process.stdout.write(
            clc.columns([
                [
                    clc.bold('Iteration'),
                    clc.bold('Request Set'),
                    clc.bold('Number of Requests'),
                    clc.bold('Response Time'),
                    clc.bold('Response Size'),
                ],
                ...requestSummary,
            ])
        );

        console.log(
            '--------------------------------------------------------------------------------------------------'
        );
        console.log();
    }
}

/**
 * Report Configuration class provides methods to generate different report
 * configurations for reporting the collection results from newman.
 */
class ReportConfiguration {
    /**
     * Get report configuration.
     */
    public static async getReportConfiguration(
        directoryPath: string,
        report: string,
        influxUrl: string
    ) {
        const reporters: string[] = [ReportEnum.CLI, ReportEnum.CSV];
        const reporter: INewmanReporter = {
            [ReportEnum.CLI]: {
                noBanner: true,
            },
            [ReportEnum.CSV]: {
                export: `${directoryPath}/report.csv`,
                includeBody: false,
            },
        };

        if (report) {
            reporters.push(ReportEnum.HTML);
            reporter[ReportEnum.HTML] = ReportConfiguration.getHtmlReporter(directoryPath);
        }

        if (influxUrl) {
            reporters.push(ReportEnum.INFLUX);
            reporter[ReportEnum.INFLUX] = await ReportConfiguration.getInfluxDBReporter(
                directoryPath,
                influxUrl
            );
        }

        return {
            reporters,
            reporter,
        };
    }

    /**
     * Get influxdb reporter.
     */
    public static async getInfluxDBReporter(directoryPath: string, influxUrl: string) {
        const urlObject = url.parse(influxUrl);

        if (!urlObject) {
            error.log(
                `missing influx db web url eg: http://user:password@host:8086/database`,
                true
            );
        }

        const directoryName = path.basename(directoryPath);
        const protocol = urlObject.protocol;
        const auth = urlObject.auth;
        const server = urlObject.hostname;
        const port = urlObject.port;
        const username = auth.split(':')[0];
        const password = auth.split(':')[1];
        const databaseName = directoryName || urlObject.pathname;
        const newInfluxUrl = `${protocol}//${auth}@${server}:${port}/${databaseName}`;

        await new InfluxUtil().createDatabase(databaseName, newInfluxUrl);

        return {
            server,
            port,
            username,
            password,
            name: databaseName,
            measurement: 'test_results',
        };
    }

    /**
     * Get Html reporter.
     */
    public static getHtmlReporter(directoryPath: string) {
        return {
            export: `${directoryPath}/report.html`,
            darkTheme: true,
            skipHeaders: true,
            omitHeaders: true,
            logs: false,
            title: `Collection Test Results`,
        };
    }
}

/**
 * Default method to run newman.
 */
export default async function (args: minimist.ParsedArgs) {
    const config = await RunnerCommandHelper.getCommandOptions(args);
    newman.run(
        {
            collection: require(`${config.collectionFilePath}`),
            environment: require(`${config.environmentFilePath}`),
            iterationCount: config.iteration,
            insecure: true,
            reporters: config.reporters,
            reporter: config.reporter,
        },
        CollectionRunner.onRunComplete(config.reporter[ReportEnum.CSV])
    );
}
