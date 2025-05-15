import { TelemetryService } from './telemetry.service';

describe('TelemetryServiceUnitTest', () => {
  let telemetryService: TelemetryService;

  afterEach(() => {
    telemetryService.clearData();
  });

  beforeEach(async () => {
    telemetryService = new TelemetryService();
    telemetryService.clearData();
  });

  it('should connect and consume messages', async () => {
    const timeNow = new Date().toISOString();
    await telemetryService.saveData({
      deviceId: 'abc123',
      timestamp: timeNow,
      temperature: 25,
      humidity: 40,
    });

    const telemetryData = telemetryService.getAllData();

    expect(telemetryData.length).toBe(1);
    expect(telemetryData[0].deviceId).toBe('abc123');
    expect(telemetryData[0].timestamp).toBe(timeNow);
    expect(telemetryData[0].temperature).toBe(25);
    expect(telemetryData[0].humidity).toBe(40);
  });
});
