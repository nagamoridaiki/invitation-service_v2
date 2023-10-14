/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "invitation";

export interface HeroById {
  id: number;
}

export interface Invitation {
  id: number;
  name: string;
}

export const INVITATION_PACKAGE_NAME = "invitation";

export interface InvitationServiceClient {
  unaryCall(request: HeroById, metadata?: Metadata): Observable<Invitation>;
}

export interface InvitationServiceController {
  unaryCall(request: HeroById, metadata?: Metadata): Promise<Invitation> | Observable<Invitation> | Invitation;
}

export function InvitationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["unaryCall"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("InvitationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("InvitationService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const INVITATION_SERVICE_NAME = "InvitationService";
