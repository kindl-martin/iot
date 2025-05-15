export interface TelemetryData {
    deviceId: string;
    timestamp: string;
    temperature: number;
    humidity: number;
}

export enum QueueNames {
    TELEMETRY = 'TELEMETRY_QUEUE',
}