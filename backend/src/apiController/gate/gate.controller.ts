import {
  Body,
  Controller,
  HttpStatus,
  HttpException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { GateService } from './gate.service';
import { CreateUserDto, UserDto } from '../../dto/user.dto';
import { compareHash, hash } from 'src/helper/hash.helper';
import { AuthService } from '../auth/auth.service';

@Controller('/auth')
export class GateController {
  constructor(
    private readonly gateService: GateService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signin')
  async signin(@Body() user: CreateUserDto) {
    const result: UserDto = await this.gateService.getUserByUsername(
      user.username,
    );
    if (result) {
      const check = await compareHash(user.password, result.password);
      if (check)
        return {
          status: HttpStatus.OK,
          data: {
            accessToken: await this.authService.generateJWT(result),
            username: user.username,
          },
        };
      else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Username or password incorrect',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    } else
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: [
            {
              label: 'Fail',
              content: 'Username or password incorrect',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
  }

  @Post('/signup')
  async signup(@Body() user: CreateUserDto) {
    const result = await this.gateService.getUserByUsername(user.username);
    if (result)
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: [
            {
              label: 'Fail',
              content: 'Username exist',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    else {
      const userDto: CreateUserDto = new CreateUserDto();
      userDto.username = user.username;
      userDto.password = await hash(user.password);
      await this.gateService.createUser(userDto);
      return {
        status: HttpStatus.OK,
        message: 'Success',
      };
    }
  }
}
