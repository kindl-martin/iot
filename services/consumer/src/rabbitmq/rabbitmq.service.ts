import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TelemetryService } from '../telemetry/telemetry.service';
import { Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { connectWithRetry } from '@local/utils';
import { QueueNames } from '@local/types';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async onModuleDestroy() {
    await this.stopConsumer();
  }

  private channel: Channel;

  private async startConsumer() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL')!;
    const connection = await connectWithRetry(rabbitmqUrl);

    this.channel = await connection.createChannel();
    await this.channel.assertQueue(QueueNames.TELEMETRY);

    await this.channel.consume(QueueNames.TELEMETRY, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());

        if (this.telemetryService.isValidData(data)) {
          await this.telemetryService.saveData(data);

          console.log(`Received telemetry data:`, data);
          this.channel.ack(msg);
        } else {
          console.warn('Invalid telemetry format:', data);
          this.channel.nack(msg, false, false);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
        this.channel.nack(msg, false, false);
      }
    });
  }

  async stopConsumer() {
    if (this.channel) {
      await this.channel.close();
      console.log('Producer stopped');
    }
  }
}
