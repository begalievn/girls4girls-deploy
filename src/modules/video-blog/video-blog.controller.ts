import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListParamsDto } from 'src/base/dto/list-params.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../auth/roles/role.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { CreateBlogDto } from './dto/create-blog.dto';
import { EditBlogDto } from './dto/edit-blog.dto';
import { VideoBlogService } from './video-blog.service';
import { AddToWatchedDto } from './dto/add-to-watched.dto';

@ApiTags('Видеоблоги')
@Controller('video-blog')
export class VideoBlogController {
  constructor(private readonly videoBlogService: VideoBlogService) {}

  @ApiOperation({ summary: 'Вывести все видеоблоги' })
  @Get()
  async getBlogs(@Query() listParamsDto: ListParamsDto) {
    return await this.videoBlogService.listWithRelations(
      listParamsDto,
      'VideoBlog',
      ['category', 'lecturerImage', 'quiz'],
    );
  }

  @ApiOperation({
    summary:
      'Найти один видеоблог по id и вывести 3 рандомных блога этой же категории',
  })
  @Get(':id')
  async getBlog(@Param('id') id: number) {
    return await this.videoBlogService.getWithRandomBlogs(id);
  }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Создать видеоблог' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videoUrl: { type: 'string', example: 'https://youtu.be/dQw4w9WgXcQ' },
        title: { type: 'string', example: 'Новое название видео' },
        titleKG: { type: 'string', example: 'Видео блогдун аты' },
        description: {
          type: 'string',
          example: 'Описание видео блога',
        },
        descriptionKG: {
          type: 'string',
          example: 'Видео блогдун суроттомосу',
        },
        lecturerName: { type: 'string', example: 'Имя Фамилия' },
        lecturerInfo: { type: 'string', example: 'Информация о лекторе' },
        lecturerInfoKG: { type: 'string', example: 'Лектор жонундо маалымат' },
        lecturerImage: {
          type: 'string',
          format: 'binary',
        },
        category: { type: 'string', example: 'Health' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('lecturerImage'))
  @Post('/post')
  async postBlog(
    @Body() body: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image should not be empty');
    const blog = new CreateBlogDto();
    blog.lecturerImage = file;
    Object.assign(blog, body);
    return await this.videoBlogService.createOne(blog);
  }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить содержание видео блога' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('lecturerImage'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videoUrl: { type: 'string', example: 'https://youtu.be/JojwHc1MKag' },
        title: { type: 'string', example: 'Новое название видео' },
        titleKG: { type: 'string', example: 'Видео блогдун аты' },
        description: {
          type: 'string',
          example: 'Описание видео блога',
        },
        descriptionKG: {
          type: 'string',
          example: 'Видео блогдун суроттомосу',
        },
        lecturerName: { type: 'string', example: 'Новое Имя и Фамилия' },
        lecturerInfo: { type: 'string', example: 'Информация о лекторе' },
        lecturerInfoKG: { type: 'string', example: 'Лектор жонундо маалымат' },
        lecturerImage: {
          type: 'string',
          format: 'binary',
        },
        category: { type: 'string', example: 'Business' },
      },
    },
  })
  @Put('/put/:id')
  async editBlog(
    @Param('id') id: number,
    @Body() newBlog: EditBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    newBlog.lecturerImage = file;
    return await this.videoBlogService.editOne(id, newBlog);
  }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить блог' })
  @Delete(':blogId')
  async deleteBlog(@Param('blogId') blogId: number) {
    return await this.videoBlogService.deleteOne(blogId);
  }

  @ApiOperation({ summary: 'Увеличить количество просмотров видеоблога на 1' })
  @Patch(':id')
  async addView(@Param('id') id: number) {
    return await this.videoBlogService.addView(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить видео-блог в просмотренные' })
  @Put('add-to-watched')
  async addToWatched(
    @Req() req: any,
    @Query() addToWatchedDto: AddToWatchedDto,
  ) {
    return this.videoBlogService.addToWatched(req.user.id, addToWatchedDto);
  }

  @Get('get/watched')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить просмотренные видеоблоги' })
  getWatchedVideoBlogs(@Req() req: any) {
    return this.videoBlogService.getWatchedVideoBlogs(req.user.id);
  }

  @Get('views/:videoId')
  @ApiOperation({ summary: 'Получить количество просмотров у видео' })
  getVideosViews(@Param('videoId') id: string) {
    return this.videoBlogService.getViewsCount(id);
  }
}
