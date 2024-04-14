import { ApiResponseMeta } from '@@common/decorators/response.decorator';
import { RequestWithUser } from '@@common/interfaces';
import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { CorePasswordPolicyService } from './core-password-policy.service';
import { UpdatePasswordPolicyDto } from './dto/update-password-policy.dto';

@ApiExcludeController()
@ApiBearerAuth()
@ApiTags('Password Policy')
@Controller('/password/policy')
export class CorePasswordPolicyController {
  constructor(
    private readonly passwordPolicyService: CorePasswordPolicyService,
  ) {}

  @Get()
  async getPasswordPolicy() {
    return this.passwordPolicyService.findFirstOrThrow({});
  }

  @ApiResponseMeta({ message: 'Password policy updated successfully!' })
  @Patch('/:id')
  async updatePasswordPolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordPolicyDto,
    @Req() req: RequestWithUser,
  ) {
    await this.passwordPolicyService.updatePasswordPolicy(+id, dto, req);
  }
}
