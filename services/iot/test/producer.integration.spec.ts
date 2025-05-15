import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { Channel, ChannelModel, connect } from 'amqplib';
import { startRabbitMQContainer } from '@local/utils';
import { QueueNames } from '@local/types';

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
    const received = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject('Message not received in time'),
        15000
      );

      channel.consume(
        QueueNames.TELEMETRY,
        (msg) => {
          if (msg !== null) {
            clearTimeout(timeout);
            const data = JSON.parse(msg.content.toString());
            channel.ack(msg);
            resolve(data);
          }
        },
        { noAck: false }
      );
    });

    expect(received).toEqual(
      expect.objectContaining({
        deviceId: expect.any(String),
        timestamp: expect.any(String),
        temperature: expect.any(Number),
        humidity: expect.any(Number),
      })
    );
  }, 20000);
});
