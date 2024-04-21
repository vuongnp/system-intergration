import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDecodeToken, UserDto } from 'src/dto/user.dto';
import UserRepository from '../../reponsitories/UserRepository';
import { Types } from 'mongoose';
import GroupReponsitory from 'src/reponsitories/GroupReponsitory';
import { CreateGroupDto, GroupDto } from 'src/dto/group.dto';
import { Notice } from 'src/dto/notice.dto';
import { NotificationGateway } from 'src/socket/Notification';
import * as fs from 'fs';

@Injectable()
export class GroupService {
  constructor(
    private groupRepo: GroupReponsitory,
    private userRepo: UserRepository,
    private noti: NotificationGateway,
  ) {}

  async createGroup(group: CreateGroupDto) {
    group._id = Types.ObjectId();
    await this.groupRepo.create(group);
    let noti: Notice = new Notice();
    noti = {
      id: null,
      title: 'New group',
      status: false,
      time: new Date().getTime(),
      action: '/all-group',
      content: group.owner.username + ' created group ' + group.name,
    };
    await fs.mkdir('./public/group/' + group._id, function (err) {
      if (err) {
        return console.error(err);
      }
    });
    await this.userRepo.update(
      {
        _id: Types.ObjectId(group?.owner?._id.toString()),
        username: group?.owner?.username,
      },
      {
        $push: {
          group_ids: group._id,
        },
      },
    );
    group.members.forEach(async (e) => {
      await this.userRepo.update(
        { _id: Types.ObjectId(e._id.toString()), username: e.username },
        {
          $push: {
            group_ids: group._id,
          },
        },
      );
      this.noti.pushNotiToClient([e.username], noti);
    });
    return {};
  }
  async getOneGroup(id: string) {
    return await this.groupRepo.findOne({ _id: Types.ObjectId(id) });
  }
  async joinGroup(object: any) {
    const userFind: UserDecodeToken = await this.userRepo.findOne({
      username: object.username,
    });
    const group: GroupDto = await this.groupRepo.findOne({
      _id: object.groupCode,
    });

    if (userFind && group) {
      if (
        !group.members.find((e) => e.username === userFind.username) &&
        group.owner.username !== userFind.username
      ) {
        await this.groupRepo.update(
          { _id: object.groupCode },
          {
            $push: {
              members: userFind,
            },
          },
        );
        await this.userRepo.update(
          { username: object.username },
          {
            $push: {
              group_ids: group._id,
            },
          },
        );
        return true;
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errors: [
              {
                label: 'Fail',
                content: 'You have been joined this group',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
        );
      }
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
  async addMember(id: Types.ObjectId, listMember: Array<UserDecodeToken>) {
    const groupFind: GroupDto = await this.groupRepo.findOne({ _id: id });
    listMember?.forEach(async (member) => {
      if (!groupFind?.members.find((e) => e.username === member.username)) {
        const noti: Notice = {
          id: null,
          title: 'New group',
          status: false,
          time: new Date().getTime(),
          action: '/all-group',
          content: 'You have been added to group ' + groupFind.name,
        };
        await this.userRepo.update(
          { username: member.username },
          {
            $push: {
              group_ids: id,
            },
          },
        );
        await this.groupRepo.update(
          { _id: id },
          {
            $push: {
              members: member,
            },
          },
        );
        this.noti.pushNotiToClient([member.username], noti);
      }
    });
    return true;
  }
  async updateGroup(id: Types.ObjectId, group: GroupDto) {
    const groupFind: GroupDto = await this.groupRepo.findOne({ _id: id });
    groupFind.members?.forEach(async (member) => {
      if (!group?.members.find((e) => e.username === member.username)) {
        await this.userRepo.update(
          { username: member.username },
          {
            $pull: {
              group_ids: id,
            },
          },
        );
        await this.groupRepo.update(
          { _id: groupFind._id },
          {
            $pull: {
              members: { username: member.username },
            },
          },
        );
      }
    });
    group?.members?.forEach(async (member) => {
      if (!groupFind?.members.find((e) => e.username === member.username)) {
        const noti: Notice = {
          id: null,
          title: 'New group',
          status: false,
          time: new Date().getTime(),
          action: '/all-group',
          content: 'You have been added to group ' + group.name,
        };
        await this.userRepo.update(
          { username: member.username },
          {
            $push: {
              group_ids: id,
            },
          },
        );
        await this.groupRepo.update(
          { _id: id },
          {
            $push: {
              members: member,
            },
          },
        );
        this.noti.pushNotiToClient([member.username], noti);
      }
    });
    return true;
  }
  async getAllGroup(user: UserDecodeToken) {
    const userFind: UserDto = await this.userRepo.findOne({
      _id: Types.ObjectId(user._id.toString()),
    });
    if (userFind) {
      const convert_ids: Array<Types.ObjectId> = userFind?.group_ids.map(
        (e) => {
          return Types.ObjectId(e.toString());
        },
      );
      return await this.groupRepo.getListGroupOfUser(convert_ids);
    } else return [];
  }
  async deleteGroup(owner: UserDecodeToken, groupCode: Types.ObjectId) {
    const groupFind: GroupDto = await this.groupRepo.findOne({
      _id: groupCode,
    });
    if (!groupFind)
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errors: [
            {
              label: 'Fail',
              content: 'Can not delete this group',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    else {
      if (groupFind.owner.username !== owner.username)
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            errors: [
              {
                label: 'Fail',
                content: 'Can not delete this group',
              },
            ],
          },
          HttpStatus.FORBIDDEN,
        );
      else {
        groupFind.members.forEach(async (member) => {
          await this.userRepo.update(
            { _id: member._id },
            {
              $pull: {
                group_ids: groupFind._id,
              },
            },
          );
        });
        await this.userRepo.update(
          { _id: owner._id },
          {
            $pull: {
              group_ids: groupFind._id,
            },
          },
        );
        return await this.groupRepo.delete({ _id: groupFind._id });
      }
    }
  }
  async leaveGroup(user: UserDecodeToken, groupCode: Types.ObjectId) {
    const groupFind: GroupDto = await this.groupRepo.findOne({
      _id: groupCode,
    });
    if (groupFind?.members?.find((e) => e.username === user.username)) {
      await this.groupRepo.update(
        { _id: groupCode },
        {
          $pull: {
            members: { username: user.username },
          },
        },
      );
      return await this.userRepo.update(
        { username: user?.username },
        {
          $pull: {
            group_ids: groupFind._id,
          },
        },
      );
    } else
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          errors: [
            {
              label: 'Fail',
              content: 'Can not leave this group',
            },
          ],
        },
        HttpStatus.FORBIDDEN,
      );
    return true;
  }
}
