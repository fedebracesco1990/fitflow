import { Injectable, inject } from '@angular/core';
import { Observable, from, catchError, tap, map } from 'rxjs';
import { Store } from '@ngxs/store';
import { NetworkService } from './network.service';
import { UserProgramsService, MyProgramResponse, MyRoutineResponse } from './user-programs.service';
import { OfflineDbService } from './offline-db.service';
import { AuthState } from '../store';
import { CachedProgram, CachedRoutine } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OfflineProgramsService {
  private readonly networkService = inject(NetworkService);
  private readonly userProgramsService = inject(UserProgramsService);
  private readonly offlineDb = inject(OfflineDbService);
  private readonly store = inject(Store);

  private get userId(): string {
    const user = this.store.selectSnapshot(AuthState.user);
    return user?.userId || 'anonymous';
  }

  getMyProgram(): Observable<MyProgramResponse | null> {
    if (this.networkService.isOnline()) {
      return this.userProgramsService.getMyProgram().pipe(
        tap((program) => {
          if (program) {
            this.cacheProgram(program);
            this.cacheRoutinesFromProgram(program);
          }
        }),
        catchError(() => this.getMyProgramFromCache())
      );
    }

    return this.getMyProgramFromCache();
  }

  getMyRoutine(routineId: string): Observable<MyRoutineResponse> {
    if (this.networkService.isOnline()) {
      return this.userProgramsService.getMyRoutine(routineId).pipe(
        tap((routine) => this.cacheRoutine(routine)),
        catchError(() => this.getRoutineFromCache(routineId))
      );
    }

    return this.getRoutineFromCache(routineId);
  }

  private getMyProgramFromCache(): Observable<MyProgramResponse | null> {
    return from(this.offlineDb.getCachedProgram(this.userId)).pipe(
      map((cached) => {
        if (!cached || !this.offlineDb.isCacheValid(cached.cachedAt)) {
          return null;
        }
        return cached.data;
      })
    );
  }

  private getRoutineFromCache(routineId: string): Observable<MyRoutineResponse> {
    return from(this.offlineDb.getCachedRoutine(routineId)).pipe(
      map((cached) => {
        if (!cached) {
          throw new Error('Routine not found in cache');
        }
        return cached.data as MyRoutineResponse;
      })
    );
  }

  private async cacheProgram(program: MyProgramResponse): Promise<void> {
    const cached: CachedProgram = {
      id: program.id,
      userId: this.userId,
      data: program,
      cachedAt: Date.now(),
    };
    await this.offlineDb.cacheProgram(cached);
  }

  private async cacheRoutinesFromProgram(program: MyProgramResponse): Promise<void> {
    for (const routine of program.routines) {
      const cached: CachedRoutine = {
        id: routine.id,
        userProgramId: program.id,
        data: routine,
        cachedAt: Date.now(),
      };
      await this.offlineDb.cacheRoutine(cached);
    }
  }

  private async cacheRoutine(routine: MyRoutineResponse): Promise<void> {
    const cached: CachedRoutine = {
      id: routine.id,
      userProgramId: routine.userProgramId,
      data: routine,
      cachedAt: Date.now(),
    };
    await this.offlineDb.cacheRoutine(cached);
  }
}
