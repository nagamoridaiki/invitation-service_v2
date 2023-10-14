import { Controller } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Invitation, HeroById, InvitationServiceController, InvitationServiceControllerMethods } from './invitation';

@InvitationServiceControllerMethods()
@Controller('invitation')
export class InvitationController implements InvitationServiceController {
  private readonly items: Invitation[] = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
  ];

  unaryCall(data: HeroById): Invitation {
    console.log('HeroService.UnaryCall received %o', data);
    const item = this.items.find(({ id }) => id === data.id);
    console.log('HeroService.UnaryCall responses %o', item);
    return item;
  }
}
