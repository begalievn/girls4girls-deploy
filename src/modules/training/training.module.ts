import { Module } from '@nestjs/common';
import { TrainingsService } from './training.service';
import { TrainingsController } from './training.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from './entities';
import { Image } from '../image/entities/image.entity';
import { Questionnaire } from '../questionnaire/entities/questionnaire.entity';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';
import { ImageModule } from '../image/image.module';
import { UserToTraining } from './entities/users-to-training.entity';
import { UserModule } from '../user/user.module';
import { LecturerModule } from '../lecturers/lecturers.module';
import { MailModule } from '../mail/mail.module';
import { JetonModule } from '../jeton/jeton.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, Image, UserToTraining, Questionnaire]),
    CloudinaryModule,
    ImageModule,
    UserModule,
    LecturerModule,
    MailModule,
    JetonModule,
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
