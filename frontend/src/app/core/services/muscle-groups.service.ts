import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MuscleGroup } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MuscleGroupsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/muscle-groups`;

  getAll(): Observable<MuscleGroup[]> {
    return this.http.get<MuscleGroup[]>(this.apiUrl);
  }

  getById(id: string): Observable<MuscleGroup> {
    return this.http.get<MuscleGroup>(`${this.apiUrl}/${id}`);
  }
}
