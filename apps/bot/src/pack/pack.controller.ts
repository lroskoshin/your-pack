import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { GetMembersResponseDto } from './dto/get-members-response.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PackService } from './pack.service';
import { plainToInstance } from 'class-transformer';

@Controller('pack')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @CacheTTL(5 * 60 * 1000)
  @Get(':base64PackId')
  @UseInterceptors(CacheInterceptor)
  async getPackMembers(
    @Param('base64PackId') base64PackId: string,
  ): Promise<GetMembersResponseDto> {
    const packId = this.packService.getPackFromBase64PackId(base64PackId);
    const data = await this.packService.getMemberData(packId);
    return plainToInstance(GetMembersResponseDto, data);
  }
}
