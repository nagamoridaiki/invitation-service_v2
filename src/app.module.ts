import { Module } from '@nestjs/common';
import { InvitationModule } from './invitation/invitation.module';
import { VillanModule } from './villan/villan.module';

@Module({
  imports: [InvitationModule, VillanModule],
})
export class AppModule {}
