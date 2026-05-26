import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CounterEntry } from './counter.entity';

@WebSocketGateway({ cors: true })
export class CounterGateway {
  @WebSocketServer()
  server!: Server;

  emitCounterUpdated(entry: CounterEntry): void {
    this.server.emit('counter:updated', entry);
  }
}
