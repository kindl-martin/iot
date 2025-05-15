import { Module } from '@nestjs/common';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [TelemetryModule],
  providers: [RabbitmqService],
})
export class RabbitmqModule {}
