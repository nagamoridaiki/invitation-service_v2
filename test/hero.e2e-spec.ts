import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as ProtoLoader from '@grpc/proto-loader';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import {
  ServiceClient,
  ServiceClientConstructor,
} from '@grpc/grpc-js/build/src/make-client';
import { resolve } from 'path';
import { HeroModule } from '../src/invitation/invitation.module';
import { Hero, HeroById } from '../src/invitation/hero.tsa';

describe('HeroController (E2E)', () => {
  let module: TestingModule;
  let app: INestMicroservice;
  let client: ServiceClient;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [HeroModule],
    }).compile();

    const url = 'localhost:5000';
    app = module.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        url,
        package: ['hero'],
        protoPath: [
          resolve(__dirname, '../src/hero/hero.proto'),
        ],
      },
    });
    await app.listenAsync()

    const proto = await ProtoLoader.load(resolve(__dirname, '../src/hero/hero.proto'));
    const protoGrpc = loadPackageDefinition(proto) as {
      hero: {
        HeroService: ServiceClientConstructor;
      };
    };
    client = new protoGrpc.hero.HeroService(
      url,
      credentials.createInsecure(),
    );
  });

  afterAll(async () => {
    await app.close();
    client.close();
  });

  it('unaryCall', async () => {
    await new Promise<void>((resolve) => {
      const payload: HeroById = { id: 1 };

      client.unaryCall(payload, (err: Error, response: Hero) => {
        expect(err).toBeNull();
        expect(response).toEqual({ id: 1, name: 'John' });
        resolve();
      });
    });
  });

  it('clientStreamAsObservable', async () => {
    const callHandler = client.clientStreamAsObservable((err: Error, res: Hero) => {
      if (err && String(err).toLowerCase().indexOf('cancelled') === -1) {
        fail('gRPC Stream error happened, error: ' + err);
      }
      expect(res).toEqual({ id: 2, name: 'Doe' });
    });

    return new Promise<void>((resolve, reject) => {
      callHandler.write({ id: 1 });
      callHandler.write({ id: 2 });
      callHandler.end();
      setTimeout(() => resolve(), 1000);
    });
  });

  it('serverStreamAsObservable', async () => {
    const callHandler = client.serverStreamAsObservable({ id: 1 });

    let n = 0;
    callHandler.on('data', (msg: Hero) => {
      if(n === 0) expect(msg).toEqual({ id: 1, name: 'John' });
      else if(n === 1) expect(msg).toEqual({ id: 2, name: 'Doe' });
      else fail(`received unexpected message: ${msg}`);
      n++;
    });

    callHandler.on('error', (err: Error) => {
      if (String(err).toLowerCase().indexOf('cancelled') === -1) {
        fail('gRPC Stream error happened, error: ' + err);
      }
    });

    await new Promise<void>((resolve, reject) => {
      setTimeout(() => resolve(), 3000);
    });
  });

  it('bidirectionalStreamAsObservable', async () => {
    const callHandler = client.bidirectionalStreamAsObservable();
    const payloads = [
      { id: 1 },
      { id: 2 },
    ];
    const responses = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    let n = 0;
    callHandler.on('data', (msg: Hero) => {
      if(n === 0) expect(msg).toEqual({ id: 1, name: 'John' });
      else if(n === 1) expect(msg).toEqual({ id: 2, name: 'Doe' });
      else fail(`received unexpected message: ${msg}`);
      n++;

      if(n === responses.length) callHandler.cancel();
    });

    callHandler.on('error', (err: Error) => {
      if (String(err).toLowerCase().indexOf('cancelled') === -1) {
        fail('gRPC Stream error happened, error: ' + err);
      }
    });

    await new Promise<void>((resolve, reject) => {
      payloads.forEach(payload => callHandler.write(payload));
      setTimeout(() => resolve(), 1000);
    });
  });
});
