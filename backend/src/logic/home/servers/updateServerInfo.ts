import { BadRequestException } from '@nestjs/common';
import { ServersService } from '../../../services/servers.service';

export const updateServerInfo = async (
  serverId: string,
  updates: { name?: string; pfp?: string },
  serversService: ServersService,
) => {
  if (!serverId || (!updates.name && !updates.pfp)) {
    throw new BadRequestException('Missing serverId or update fields');
  }
  if (updates.name && updates.name.length > 20) {
    throw new BadRequestException('Server name must be 20 characters or less');
  }
  const server = await serversService.findById(serverId);
  if (!server || server.length === 0) {
    throw new BadRequestException('Server does not exist');
  }
  try {
    await serversService.updateServerInfo(serverId, updates);
    return { valid: true, message: 'Server info updated.' };
  } catch (err) {
    throw new BadRequestException('Failed to update server info');
  }
};
