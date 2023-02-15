import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { MailModule } from './modules/mail/mail.module';
import { ImageModule } from './modules/image/image.module';
import { Image } from './modules/image/entities/image.entity';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { jwtConfig } from './configs';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Image],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MailModule,
    ImageModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
