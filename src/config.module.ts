import * as path from 'path';
import * as os from 'os';
import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { UnleashModule } from 'nestjs-unleash';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), '.env'),
      isGlobal: true,
    }),
    UnleashModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        appName: `${configService.get('APP_NAME')}:nestjs-unleash`,
        url: `${configService.get('UNLEASH_API_URL')}client`,
        instanceId: os.hostname(),
        http: {
          headers: {
            Authorization: configService.get('UNLEASH_API_KEY'),
          },
        },
        refreshInterval: 10000,
        metricsInterval: 60000,
        disableRegistration: false,
        /**
         * nestjs-unleash expects the userId to be in `request.user.id`,
         * however, in this test we're going to get the userId as `storeId`
         * from the query string, so we need this one-liner function.
         * There's no way to override the aforementioned behavior.
         */
        userIdFactory: (request) => request['query'].storeId,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ConfigModule {}
