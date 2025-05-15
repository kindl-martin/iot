import { ChannelModel, connect } from 'amqplib';
import { GenericContainer } from 'testcontainers';

export async function connectWithRetry(
  url: string,
  maxRetries = 5
): Promise<ChannelModel> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await connect(url);
      console.log('Connected to RabbitMQ');
      return conn;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error('Max connection attempts reached. Exiting.');
      }
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
    }
  }

  throw new Error(
    'Unreachable: all connection attempts failed without throwing.'
  );
}

export async function startRabbitMQContainer(rabbitmqUrl: string) {
  const parsed = new URL(rabbitmqUrl);

  const user = parsed.username;
  const pass = parsed.password;

  const rabbitContainer = await new GenericContainer('rabbitmq')
    .withExposedPorts(5672)
    .withEnvironment({
      RABBITMQ_DEFAULT_USER: user,
      RABBITMQ_DEFAULT_PASS: pass,
    })
    .start();

  console.log('RabbitMQ test container started.');

  const host = rabbitContainer.getHost();
  const mappedPort = rabbitContainer.getMappedPort(5672);

  return `amqp://${user}:${pass}@${host}:${mappedPort}`;
}
