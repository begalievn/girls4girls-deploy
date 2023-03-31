import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
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

@ApiTags('Видеоблоги')
@Controller('video-blog')
export class VideoBlogController {
  constructor(private readonly videoBlogService: VideoBlogService) {}

  @ApiOperation({ summary: 'Вывести все видеоблоги' })
  @Get()
  async getBlogs(@Query() listParamsDto: ListParamsDto) {
    return await this.videoBlogService.list(listParamsDto);
  }

  @ApiOperation({ summary: 'Найти один видеоблог по id' })
  @Get(':id')
  async getBlog(@Param('id') id: number) {
    return await this.videoBlogService.get(id);
  }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать видеоблог' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videoUrl: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        lecturerName: { type: 'string' },
        lecturerInfo: { type: 'string' },
        lecturerImage: {
          type: 'string',
          format: 'binary',
        },
        categoryId: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @UseInterceptors(FileInterceptor('lecturerImage'))
  @Post('/post')
  async postBlog(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const blog = new CreateBlogDto();
    Object.assign(blog, req.body);
    blog.lecturerImage = file;
    return await this.videoBlogService.createOne(blog);
  }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Изменить содержание видео блога' })
  // @Put('/put/:id')
  // async editBlog(@Param('id') id: string, @Body() newBlog: EditBlogDto) {
  //   return await this.videoBlogService.editOne(+id, newBlog);
  // }

  // @Roles(UserRoleEnum.ADMIN)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить блог' })
  @Delete(':blogId')
  async deleteBlog(@Param('blogId') blogId: number) {
    return await this.videoBlogService.deleteOne(blogId);
  }
}
