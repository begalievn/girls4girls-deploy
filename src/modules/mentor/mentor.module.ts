import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './entities/mentor.entity';
import { MentorService } from './mentor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor])],
  providers: [MentorService],
})
export class MentorModule {}
