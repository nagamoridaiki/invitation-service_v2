import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';

@Module({
  controllers: [InvitationController],
})
export class InvitationModule {}
