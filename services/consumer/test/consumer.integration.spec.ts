import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { Channel, ChannelModel, connect } from 'amqplib';
import * as request from 'supertest';
import { QueueNames, TelemetryData } from '@local/types';
import { startRabbitMQContainer } from '@local/utils';

describe('TelemetryConsumer (e2e)', () => {
  let app: INestApplication;
  let channel: Channel;
  let connection: ChannelModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const configService = app.get(ConfigService);
    const rabbitmqUrl = configService.get<string>('RABBITMQ_URL')!;
    const dynamicRabbitUrl = await startRabbitMQContainer(rabbitmqUrl);
    process.env['RABBITMQ_URL'] = dynamicRabbitUrl;

    connection = await connect(dynamicRabbitUrl);
    channel = await connection.createChannel();

    await app.init();
  }, 60000);

  afterAll(async () => {
    await channel.close();
    await connection.close();
    await app.close();
  });

  it('should consume and process telemetry data from queue', async () => {
    const payload: TelemetryData = {
      deviceId: 'abc123',
      timestamp: new Date().toISOString(),
      temperature: 22.5,
      humidity: 55,
    };

    await channel.assertQueue(QueueNames.TELEMETRY);
    channel.sendToQueue(
      QueueNames.TELEMETRY,
      Buffer.from(JSON.stringify(payload))
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await request(app.getHttpServer())
      .get('/telemetry')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining(payload)])
    );
  });
});
