import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TelemetryService } from '../telemetry/telemetry.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { connectWithRetry } from '@local/utils';
import { QueueNames } from '@local/types';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly deviceId: string;

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly configService: ConfigService
  ) {
    this.deviceId = this.configService.get('DEVICE_ID') ?? uuidv4();
  }

  async onModuleInit() {
    await this.startProducer();
  }

  async onModuleDestroy() {
    this.stopProducer();
  }

  private interval?: NodeJS.Timeout;

  private async startProducer() {
    const rabbitmqUrl = this.configService.get('RABBITMQ_URL');
    const connection = await connectWithRetry(rabbitmqUrl);

    const channel = await connection.createChannel();
    await channel.assertQueue(QueueNames.TELEMETRY);

    this.interval = setInterval(() => {
      const data = this.telemetryService.generatePayload(this.deviceId);
      channel.sendToQueue(
        QueueNames.TELEMETRY,
        Buffer.from(JSON.stringify(data))
      );

      console.log('Sent:', data);
    }, 10000);
    this.interval.unref();
  }

  stopProducer() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('Producer stopped');
    }
  }
}
