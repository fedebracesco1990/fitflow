import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PersonalRecord } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PersonalRecordsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'personal-records';

  getMyRecords(): Observable<PersonalRecord[]> {
    return this.api.get<PersonalRecord[]>(`${this.endpoint}/me`);
  }

  getRecordByExercise(exerciseId: string): Observable<PersonalRecord | null> {
    return this.api.get<PersonalRecord | null>(`${this.endpoint}/me/${exerciseId}`);
  }
}
