import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:5000',
    package: ['invitation', 'villan'],
    protoPath: [
      join(__dirname, './invitation/invitation.proto'),
      join(__dirname, './villan/villan.proto'),
    ],
  },
};
