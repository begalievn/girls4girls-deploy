import { BaseDto } from 'src/base/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Image } from 'src/modules/image/entities/image.entity';
import { Type } from 'class-transformer';

export class CreateForumDto extends BaseDto {
  @ApiProperty({
    example: 'Female body',
    description: 'Forum of training',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Название форума на кыргызском',
    description: 'Title of training',
  })
  @IsString()
  @IsNotEmpty()
  titleKG: string;

  @ApiProperty({
    example: 'From high peaks to lush valleys, hard planes, and soft edges',
    description: 'Forum description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Описание форума на кыргызском',
    description: 'Training description',
  })
  @IsString()
  @IsNotEmpty()
  descriptionKG: string;

  @ApiProperty({
    example: 'Bokonbaeva 101',
    description: 'Address of the training',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsOptional()
  images: Image[];

  @ApiProperty({
    description: 'Date of the forum',
    example: '2023-03-22T10:30:40.000Z',
  })
  @IsNotEmpty()
  eventDate: Date;

  @ApiProperty({
    description: 'Deadline for submitting an application to the forum',
    example: '2023-03-22T10:30:40.000Z',
  })
  @IsNotEmpty()
  deadlineDate: Date;

  @ApiProperty({
    description: 'Time of a training',
    example: '18:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  time: string;

  @ApiProperty({
    description: 'Location of a training',
    example: 'Наарынская область',
    required: false,
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    description: 'Location of a training',
    example: 'Наарын областы',
    required: false,
  })
  @IsString()
  @IsOptional()
  locationKG: string;

  @ApiProperty({
    example: 3,
    description: 'ID of a questionnaire',
  })
  @Type(() => Number)
  @IsNumber()
  questionnaireId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lecturers: string;
}
