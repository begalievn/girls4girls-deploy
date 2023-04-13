import { BaseEntity } from 'src/base/base.entity';
import { Image } from 'src/modules/image/entities/image.entity';
import { Training } from 'src/modules/training/entities';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class Lecturer extends BaseEntity {
  @Column()
  lecturerFullName: string;

  @Column()
  jobTitle: string;

  @Column()
  lecturerInfo: string;

  @Column({ nullable: true })
  lecturerInfoKG: string;

  @ManyToOne(() => Training, (training) => training.lecturers, {
    onDelete: 'CASCADE',
  })
  training: Training[];

  @OneToOne(() => Image, { cascade: true })
  @JoinColumn()
  image: Image;
}
