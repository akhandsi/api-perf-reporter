import * as Influx from 'influx';

export class InfluxUtil {
    async createDatabase(databaseName: string, influxUrl: string) {
        try {
            const influx = new Influx.InfluxDB(influxUrl);
            const names = await influx.getDatabaseNames();
            if (!names.includes(databaseName)) {
                return await influx.createDatabase(databaseName);
            }
        } catch (e) {
            console.error(`Error creating influx database! ${e}`);
        }
    }

    async writeToInflux(databaseName: any, influxUrl: string, data: Influx.IPoint[]) {
        try {
            const influx = new Influx.InfluxDB(influxUrl);
            await this.createDatabase(databaseName, influxUrl);
            await influx.writePoints(data, {
                database: databaseName,
                precision: 'ms',
            });
        } catch (e) {
            console.error(`Error saving data to InfluxDB! ${e}`);
        }
    }
}
