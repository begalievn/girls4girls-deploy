import { Controller,
  Post,
  Body,
  Param,
  Delete, 
  Patch,
  UploadedFiles, 
  Get, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  Query} from '@nestjs/common';
import { TrainingsService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../auth/roles/role.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { title } from 'process';
import { ListParamsDto } from 'src/base/dto/list-params.dto';


@ApiTags('Тренинги')
@Controller('training')
export class TrainingsController {
constructor(private readonly trainingsService: TrainingsService) {}

@Post('post')
@Roles(UserRoleEnum.ADMIN)
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiConsumes('multypart/form-data')
@ApiBearerAuth()
@UseInterceptors(FileInterceptor('image'))
@ApiOperation({summary: 'Создание нового тренинга'})
async creat(@Body() createTrainingDto: CreateTrainingDto,
       @UploadedFile() file: Express.Multer.File
       ) {            
       return await this.trainingsService.createNewTraining(createTrainingDto,file)
}


@Get()
@ApiOperation({summary:'Получить список всех тренингов'})
async list(@Query() listParamsDto: ListParamsDto){
return await this.trainingsService.list(listParamsDto)
}

@Get(':title')
@ApiOperation({summary:'Получить один тренинг по его названию'})
async findOneById(@Param('title') title: string){
return await this.trainingsService.getOneByTitle(title)
}


@Roles(UserRoleEnum.ADMIN)
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
@Delete(':title')
@ApiOperation({summary: 'Удаление тренинга по названию'})
remove(@Param('title') title: string) {
return this.trainingsService.deleteTraining(title)
}
}
