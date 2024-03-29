import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Hash } from '../../utils/hash.util';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SmsNikitaService } from '../../services/sms-nikita/sms-nikita.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfirmCode } from './entities/confirm-code.entity';
import { Repository } from 'typeorm';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmCodeDto } from './dto/confirm-code.dto';
import { SearchUserDto } from '../user/dto/search-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly smsNikitaService: SmsNikitaService,
    @InjectRepository(ConfirmCode)
    private readonly confirmCodesRepository: Repository<ConfirmCode>,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    let user;
    if (loginDto.email) {
      user = await this.usersService.findOne({ email: loginDto.email });
    } else if (loginDto.phoneNumber) {
      user = await this.usersService.findOne({
        phoneNumber: loginDto.phoneNumber,
      });
    } else {
      throw new BadRequestException('Not proper credentials');
    }

    if (!user) {
      throw new BadRequestException(
        'Password on login credentials are incorrect!',
      );
    }

    if (loginDto.phoneNumber && loginDto.email) {
      if (
        loginDto.phoneNumber !== user.phoneNumber ||
        loginDto.email !== user.email
      ) {
        throw new BadRequestException(
          'Both email and phoneNumber provided, but not correct!',
        );
      }
    }

    if (!user.confirmed) {
      throw new UnauthorizedException('Account is not confirmed!');
    }

    if (user && Hash.compare(loginDto.password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signup(createUserDto: CreateUserDto) {
    const isUserExists = await this.usersService.checkIfUserExists(
      createUserDto,
    );

    if (isUserExists) {
      throw new BadRequestException('User already exists');
    }

    const codeToConfirm = Math.random().toString().substr(2, 6);

    const confirmCode = new ConfirmCode();
    confirmCode.phoneNumber = createUserDto.phoneNumber;
    confirmCode.email = createUserDto.email;
    confirmCode.code = codeToConfirm;

    await this.saveConfirmCode(confirmCode);

    this.smsNikitaService.sendSms(createUserDto.phoneNumber, codeToConfirm);

    const newUser = await this.usersService.create(createUserDto);

    // const emailResponse = await this.sendEmailConfirmation(
    //   newUser,
    //   codeToConfirm,
    // );
    return newUser;
  }

  async saveConfirmCode(createUserDto: ConfirmCodeDto) {
    const existingCode = await this.confirmCodesRepository.findOneBy({
      phoneNumber: createUserDto.phoneNumber,
    });
    if (existingCode) {
      await this.confirmCodesRepository.remove(existingCode);
    }

    const newCode = new ConfirmCode();
    newCode.phoneNumber = createUserDto.phoneNumber;
    newCode.code = createUserDto.code;
    if (createUserDto.email) {
      newCode.email = createUserDto.email;
    }
    return this.confirmCodesRepository.save(newCode);
  }

  async confirm(confirmAccountDto: ConfirmAccountDto) {
    const { code, phoneNumber } = confirmAccountDto;
    const sentAccount = await this.confirmCodesRepository.findOne({
      where: {
        phoneNumber: confirmAccountDto.phoneNumber,
      },
    });
    if (!sentAccount || phoneNumber !== sentAccount.phoneNumber) {
      throw new BadRequestException('Incorrect credentials');
    }

    const currentTime = new Date().getTime();
    const createdAt = sentAccount.createdAt.getTime();
    const timeDifference = (currentTime - createdAt) / 1000 / 60;
    const tenMinutes = 10;
    if (timeDifference > tenMinutes) {
      this.confirmCodesRepository.remove(sentAccount);
      throw new BadRequestException(
        'Code time is expired, you have to send code in 10 minutes',
      );
    }

    if (phoneNumber === sentAccount.phoneNumber && code === sentAccount.code) {
      const account = await this.usersService.findOne({ phoneNumber });
      this.confirmCodesRepository.remove(sentAccount);
      this.usersService.activateUser(account.id);
      const payload = {
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber,
        role: account.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new BadRequestException('Incorrect code');
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const refresh_token = this.generateRefreshToken();
    user.refresh_token = refresh_token;
    await this.userRepo.save(user);
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
    };
  }

  async sendEmailConfirmation(user: User, code) {
    const response = await this.mailService.sendMail(
      user.email,
      user.firstName,
      code,
    );
    return response;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOne(forgotPasswordDto);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const codeToConfirm = Math.random().toString().substr(2, 6);

    const confirmCodeDto = new ConfirmCodeDto();
    confirmCodeDto.phoneNumber = user.phoneNumber;
    confirmCodeDto.email = user.email;
    confirmCodeDto.code = codeToConfirm;

    await this.saveConfirmCode(confirmCodeDto);

    // await this.sendEmailConfirmation(user, codeToConfirm);

    await this.smsNikitaService.sendSms(user.phoneNumber, codeToConfirm);

    return {
      message: 'Code sent to your phone and email',
    };
  }

  async confirmCodeToChangePassword(
    confirmCodeDto: ConfirmCodeDto,
  ): Promise<{ access_token: string }> {
    const { code, ...searchPart } = confirmCodeDto;

    const user = await this.usersService.findOne(searchPart);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const savedConfirmCode = await this.confirmCodesRepository.findOneBy(
      confirmCodeDto,
    );

    if (!savedConfirmCode) {
      throw new BadRequestException('Incorrect credentials');
    }

    await this.confirmCodesRepository.remove(savedConfirmCode);

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    searchUserDto: SearchUserDto,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findOne(searchUserDto);
    if (!user) throw new BadRequestException('User not found');
    const result = await this.usersService.changePassword(
      user,
      changePasswordDto,
    );
    return {
      message: 'Password successfully changed',
    };
  }

  private async generateToken(data, options?: SignOptions) {
    return this.jwtService.sign(data, options);
  }

  private async verifyToken(token) {
    try {
      const data = this.jwtService.verify(token);
      return data;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }

  async refreshAccessToken(refresh_token: string) {
    const user = await this.userRepo.findOne({
      where: { refresh_token: refresh_token },
    });
    if (!user) {
      throw new UnauthorizedException('Refresh token is invalid');
    }
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
    };
  }
}
