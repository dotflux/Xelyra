import { BadRequestException } from '@nestjs/common';
import { RolesService } from '../../../../services/roles.service';

export const renameRole = async (
  serverId: string,
  roleId: string,
  newName: string,
  rolesService: RolesService,
) => {
  if (!serverId || !roleId || !newName) {
    throw new BadRequestException('Missing serverId, roleId or newName');
  }
  try {
    await rolesService.renameRole(serverId, roleId, newName);
    return { valid: true, message: 'Role renamed.' };
  } catch (err) {
    throw new BadRequestException('Failed to rename role');
  }
};
