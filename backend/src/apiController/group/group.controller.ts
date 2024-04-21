import {
  Body,
  Controller,
  HttpStatus,
  Request,
  Post,
  Req,
  Res,
  Get,
  UseGuards,
  Headers,
  Param,
  Put,
  HttpException,
  Delete,
  Patch,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UserDecodeToken } from 'src/dto/user.dto';
import { CreateGroupDto, GroupDto } from 'src/dto/group.dto';
import { Types } from 'mongoose';

@Controller('/group')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
  ) {}
  @Get()
  async getAllGroup(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    const user: UserDecodeToken = await this.authService.decodedToken(token);
    return await this.groupService.getAllGroup(user);
  }
  @Get(':id')
  async getOneGroup(
    @Param() param: any,
    @Headers('authorization') auth: string,
  ) {
    return await this.groupService.getOneGroup(param?.id);
  }
  @Put('/join')
  async joinGroup(@Body() body: any, @Headers('authorization') auth: string) {
    const username = body?.username;
    let groupCode: Types.ObjectId;

    try {
      groupCode = Types.ObjectId(body?.group_code.trim());
      return await this.groupService.joinGroup({ username, groupCode });
    } catch (err) {
      if (err.message && err.status) {
        throw err;
      } else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Username or code not exist',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
  @Put(':id/addMember')
  async addMember(
    @Body() body: Array<UserDecodeToken>,
    @Param() params: any,
    @Headers('authorization') auth: string,
  ) {
    const arrayUser: Array<UserDecodeToken> = body?.map((e) => {
      return {
        _id: e?._id,
        username: e?.username,
      };
    });
    let groupCode: Types.ObjectId;
    try {
      groupCode = Types.ObjectId(params?.id?.toString().trim());
      return await this.groupService.addMember(groupCode, arrayUser);
    } catch (err) {
      if (err.message && err.status) {
        throw err;
      } else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Username or code not exist',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
  @Put(':id')
  async editOneGroup(
    @Body() body: GroupDto,
    @Headers('authorization') auth: string,
  ) {
    let groupCode: Types.ObjectId;
    const createG: CreateGroupDto = {
      _id: '',
      members: body?.members?.map((e) => {
        return {
          _id: e._id,
          username: e.username,
        };
      }),
      name: body.name,
      description: body.description,
      listPost: [],
      listMessage: [],
      owner: {
        username: body.owner.username,
        _id: body.owner._id,
      },
    };
    try {
      groupCode = Types.ObjectId(body?._id.toString().trim());
      return await this.groupService.updateGroup(groupCode, createG);
    } catch (err) {
      if (err.message && err.status) {
        throw err;
      } else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Username or code not exist',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
  @Delete(':id')
  async deleteGroup(
    @Body() group: CreateGroupDto,
    @Param() params: any,
    @Headers('authorization') auth: string,
  ) {
    const token = auth.replace('Bearer ', '');
    const owner: UserDecodeToken = await this.authService.decodedToken(token);
    let groupCode: Types.ObjectId;
    try {
      groupCode = Types.ObjectId(params?.id?.toString().trim());
      return await this.groupService.deleteGroup(owner, groupCode);
    } catch (err) {
      if (err.message && err.status) {
        throw err;
      } else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Code not exist',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
  @Patch(':id/leave')
  async leaveGroup(
    @Body() group: CreateGroupDto,
    @Param() params: any,
    @Headers('authorization') auth: string,
  ) {
    const token = auth.replace('Bearer ', '');
    const owner: UserDecodeToken = await this.authService.decodedToken(token);
    let groupCode: Types.ObjectId;
    try {
      groupCode = Types.ObjectId(params?.id?.toString().trim());
      return await this.groupService.leaveGroup(owner, groupCode);
    } catch (err) {
      if (err.message && err.status) {
        throw err;
      } else
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'Code not exist',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
  @Post()
  async createGroup(
    @Body() group: CreateGroupDto,
    @Headers('authorization') auth: string,
  ) {
    const token = auth.replace('Bearer ', '');
    const owner: UserDecodeToken = await this.authService.decodedToken(token);
    group.owner = {
      username: owner.username,
      _id: owner._id,
    };
    const createG: CreateGroupDto = {
      _id: '',
      members: group?.members?.map((e) => {
        return {
          _id: e._id,
          username: e.username,
        };
      }),
      name: group.name,
      description: group.description,
      listPost: [],
      listMessage: [],
      owner: {
        username: owner.username,
        _id: owner._id,
      },
    };
    await this.groupService.createGroup(createG);
    return {};
  }
}
