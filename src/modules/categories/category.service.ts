import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Categories } from './entities/category.entity';

@Injectable()
export class CategoryService extends BaseService<Categories> {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {
    super(categoryRepo);
  }

  async createOne(category: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: category.name },
    });
    if (exists)
      throw new BadRequestException(
        'Категория с таким названием уже существует',
      );
    return await this.categoryRepo.save(category);
  }

  async deleteOne(id: number) {
    const oldCategory = await this.categoryRepo.findOne({
      where: { id: id },
    });
    return this.categoryRepo.remove(oldCategory);
  }

  async getCategoryBlogs(name: string) {
    const category = await this.categoryRepo.findOne({
      where: { name: name },
      relations: ['videoBlogs'],
    });
    if (!category)
      throw new BadRequestException('Введите имя категории правильно');
    return category.videoBlogs;
  }
}
