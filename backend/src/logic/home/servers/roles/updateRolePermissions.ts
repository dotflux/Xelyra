import { BadRequestException } from '@nestjs/common';
import { RolesService } from '../../../../services/roles.service';

export const updateRolePermissions = async (
  serverId: string,
  roleId: string,
  permissions: string[],
  rolesService: RolesService,
) => {
  if (!serverId || !roleId || !Array.isArray(permissions)) {
    throw new BadRequestException('Missing serverId, roleId or permissions');
  }
  try {
    await rolesService.updateRolePermissions(serverId, roleId, permissions);
    return { valid: true, message: 'Role permissions updated.' };
  } catch (err) {
    throw new BadRequestException('Failed to update role permissions');
  }
};
