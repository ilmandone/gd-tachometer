import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CounterEntry {
  id?: number;
  date: string;
  god: number;
  dog: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class CounterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/counter';

  getToday(): Observable<CounterEntry> {
    return this.http.get<CounterEntry>(`${this.baseUrl}/today`);
  }

  getAll(): Observable<CounterEntry[]> {
    return this.http.get<CounterEntry[]>(`${this.baseUrl}/all`);
  }

  update(god: number, dog: number): Observable<CounterEntry> {
    return this.http.post<CounterEntry>(this.baseUrl, { god, dog });
  }
}
