import { TelemetryData } from '@local/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelemetryService {
  generatePayload(deviceId: string): TelemetryData {
    return {
      deviceId: deviceId,
      timestamp: new Date().toISOString(),
      temperature: this.randomInRange(20, 30),
      humidity: this.randomInRange(30, 60),
    };
  }

  private randomInRange(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }
}
