import * as path from 'path';
import { Logger, Module, Scope } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { init, LDClient } from 'launchdarkly-node-server-sdk';
import { LAUNCHDARKLY_PROVIDER } from './constants';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), '.env'),
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: LAUNCHDARKLY_PROVIDER,
      useFactory: async (configService: ConfigService): Promise<LDClient> => {
        const logger = new Logger(LAUNCHDARKLY_PROVIDER);

        return init(configService.get('LAUNCHDARKLY_SDK_KEY'), {
          allAttributesPrivate: true,
          sendEvents: false,
          wrapperName: `NestJS:${LAUNCHDARKLY_PROVIDER}`,
          logger: {
            debug: (...args) => {
              console.log(args);
              logger.debug(args);
            },
            info: (...args) => logger.log(args),
            warn: (...args) => logger.warn(args),
            error: (...args) => logger.error(args),
          },
        }).waitForInitialization();
      },
      inject: [ConfigService],
      scope: Scope.DEFAULT,
    },
  ],
  exports: [LAUNCHDARKLY_PROVIDER],
})
export class ConfigModule {}
