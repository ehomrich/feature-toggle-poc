import * as path from 'path';
import { Module, Scope } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { SplitFactory } from '@splitsoftware/splitio';
import { SPLIT_PROVIDER } from './constants';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), '.env'),
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: SPLIT_PROVIDER,
      useFactory: (configService: ConfigService) =>
        SplitFactory({
          core: {
            authorizationKey: configService.get('SPLIT_API_KEY'),
            labelsEnabled: false,
            IPAddressesEnabled: false,
          },
        }).client(),
      inject: [ConfigService],
      scope: Scope.DEFAULT,
    },
  ],
  exports: [SPLIT_PROVIDER],
})
export class ConfigModule {}
