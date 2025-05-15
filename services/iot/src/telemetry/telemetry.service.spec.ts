import { TelemetryService } from './telemetry.service';

describe('TelemetryServiceUnitTest', () => {
  let telemetryService: TelemetryService;

  beforeEach(async () => {
    telemetryService = new TelemetryService();
  });

  it('should connect and consume messages', async () => {
    const payload = telemetryService.generatePayload('abc123');

    expect(payload).toHaveProperty('deviceId', 'abc123');
    expect(typeof payload.deviceId).toBe('string');

    expect(payload).toHaveProperty('timestamp');
    expect(typeof payload.timestamp).toBe('string');
    expect(new Date(payload.timestamp).toString()).not.toBe('Invalid Date');

    expect(payload).toHaveProperty('temperature');
    expect(typeof payload.temperature).toBe('number');
    expect(payload.temperature).toBeGreaterThanOrEqual(20);
    expect(payload.temperature).toBeLessThanOrEqual(30);

    expect(payload).toHaveProperty('humidity');
    expect(typeof payload.humidity).toBe('number');
    expect(payload.humidity).toBeGreaterThanOrEqual(30);
    expect(payload.humidity).toBeLessThanOrEqual(60);
  });
});
