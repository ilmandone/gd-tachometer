import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly socket: Socket = io();

  on<T>(event: string): Observable<T> {
    return fromEvent<T>(this.socket as never, event);
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
