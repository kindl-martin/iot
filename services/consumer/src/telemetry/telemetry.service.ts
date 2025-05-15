import { Injectable } from '@nestjs/common';
import { telemetryData } from './datastore';
import { TelemetryData } from '@local/types';

@Injectable()
export class TelemetryService {
  async saveData(data: TelemetryData) {
    telemetryData.push(data);
  }

  getDataByDateRange(from?: Date, to?: Date): TelemetryData[] {
    return telemetryData.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      if (from && entryDate < from) {
        return false;
      }
      return !(to && entryDate > to);
    });
  }

  getAllData(): TelemetryData[] {
    return telemetryData;
  }

  clearData() {
    telemetryData.length = 0;
  }

  isValidData(data: any): data is TelemetryData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.deviceId === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.temperature === 'number' &&
      typeof data.humidity === 'number'
    );
  }
}
