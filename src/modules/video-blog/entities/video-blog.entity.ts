import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { BaseEntity } from 'src/base/base.entity';
import { Categories } from 'src/modules/categories/entities/category.entity';
import { Image } from 'src/modules/image/entities/image.entity';
import { Likes } from 'src/modules/likes/entities/like.entity';
import { Quiz } from 'src/modules/quiz/entities/quiz.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class VideoBlog extends BaseEntity {
  @Column()
  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({
    nullable: true,
  })
  titleKG: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Column({
    nullable: true,
  })
  descriptionKG: string;

  @Column({ default: 0 })
  @IsNotEmpty()
  @IsNumber()
  postViewCount: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  lecturerName: string;

  @Column({
    nullable: true,
  })
  @IsNotEmpty()
  @IsString()
  lecturerInfo: string;

  @Column({ nullable: true })
  lecturerInfoKG: string;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @OneToOne(() => Image, (image) => image.videoBlog, { cascade: true })
  @IsNotEmpty()
  lecturerImage: Image;

  @OneToMany(() => Likes, (like) => like.blog, { cascade: true })
  @IsOptional()
  likes: Likes[];

  @ManyToOne(() => Categories, (category) => category.videoBlogs)
  @IsNotEmpty()
  category: Categories;

  @OneToMany(() => Quiz, (quiz) => quiz.videoBlog, { cascade: true })
  quiz: Quiz[];
}
