import { BadRequestException } from '@nestjs/common';
import { RolesService } from '../../../../services/roles.service';

export const changeRoleColor = async (
  serverId: string,
  roleId: string,
  color: string,
  rolesService: RolesService,
) => {
  if (!serverId || !roleId || !color) {
    throw new BadRequestException('Missing serverId, roleId or color');
  }
  try {
    await rolesService.changeRoleColor(serverId, roleId, color);
    return { valid: true, message: 'Role color updated.' };
  } catch (err) {
    throw new BadRequestException('Failed to update role color');
  }
};
