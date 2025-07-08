import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from '../../../../services/roles.service';

export const fetchRoles = async (
  req: Request,
  serverId: string,
  rolesService: RolesService,
) => {
  if (!serverId) {
    throw new BadRequestException('Missing serverId');
  }
  try {
    const roles = await rolesService.findAllServerRolesFull(serverId);
    return {
      valid: true,
      roles: roles.map((row: any) => ({
        id: row.role_id,
        name: row.name,
        color: row.color,
        level: row.level,
        permissions: row.permissions || [],
      })),
    };
  } catch (err) {
    throw new BadRequestException('Failed to fetch roles');
  }
};
