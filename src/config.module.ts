import * as path from 'path';
import { Logger, Module, Scope } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { startUnleash, Unleash } from 'unleash-client';
import { UNLEASH_EVENTS, UNLEASH_PROVIDER } from './constants';

function logEventFn(logger: Logger, level: string) {
  const method = ['error', 'warn'].includes(level) ? level : 'log';

  return (...args) =>
    logger[method](
      `[Event: ${level}] Payload: ${JSON.stringify(args, null, 2)}`,
    );
}

async function unleashProviderFactory(
  configService: ConfigService,
): Promise<Unleash> {
  const client = await startUnleash({
    appName: `${configService.get('APP_NAME')}:unleash`,
    environment: configService.get('APP_ENV', 'default'),
    url: configService.get('UNLEASH_API_URL'),
    refreshInterval: 10000, // polls the API
    timeout: 5000,
    customHeaders: {
      Authorization: configService.get('UNLEASH_API_KEY'),
    },
  });

  const logger = new Logger(UNLEASH_PROVIDER);

  // Attach handlers to log events with NestJS's built-in Logger, for easy viewing in the console.
  UNLEASH_EVENTS.forEach((level) =>
    client.on(level, logEventFn(logger, level)),
  );

  return client;
}

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), '.env'),
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: UNLEASH_PROVIDER,
      useFactory: unleashProviderFactory,
      inject: [ConfigService],
      scope: Scope.DEFAULT,
    },
  ],
  exports: [UNLEASH_PROVIDER],
})
export class ConfigModule {}
