import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PersonalRecordsService } from '../../services/personal-records.service';
import { PersonalRecord, PrCelebrationData, PR_BADGES, PrBadge } from '../../models';
import {
  LoadPersonalRecords,
  LoadPersonalRecordsSuccess,
  LoadPersonalRecordsFailure,
  TriggerCelebration,
  DismissCelebration,
  ResetPersonalRecordsState,
} from './personal-records.actions';

export interface PersonalRecordsStateModel {
  records: PersonalRecord[];
  isLoading: boolean;
  error: string | null;
  celebrationData: PrCelebrationData | null;
}

const defaults: PersonalRecordsStateModel = {
  records: [],
  isLoading: false,
  error: null,
  celebrationData: null,
};

@State<PersonalRecordsStateModel>({
  name: 'personalRecords',
  defaults,
})
@Injectable()
export class PersonalRecordsState {
  private readonly prService = inject(PersonalRecordsService);

  @Selector()
  static records(state: PersonalRecordsStateModel): PersonalRecord[] {
    return state.records;
  }

  @Selector()
  static isLoading(state: PersonalRecordsStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static error(state: PersonalRecordsStateModel): string | null {
    return state.error;
  }

  @Selector()
  static totalCount(state: PersonalRecordsStateModel): number {
    return state.records.length;
  }

  @Selector()
  static celebrationData(state: PersonalRecordsStateModel): PrCelebrationData | null {
    return state.celebrationData;
  }

  @Selector()
  static currentBadges(state: PersonalRecordsStateModel): PrBadge[] {
    const count = state.records.length;
    return PR_BADGES.map((badge) => ({
      ...badge,
      achieved: count >= badge.level,
    }));
  }

  @Selector()
  static highestBadge(state: PersonalRecordsStateModel): PrBadge | null {
    const count = state.records.length;
    const achieved = PR_BADGES.filter((b) => count >= b.level);
    if (achieved.length === 0) return null;
    const highest = achieved[achieved.length - 1];
    return { ...highest, achieved: true };
  }

  @Action(LoadPersonalRecords)
  loadRecords(ctx: StateContext<PersonalRecordsStateModel>) {
    ctx.patchState({ isLoading: true, error: null });

    return this.prService.getMyRecords().pipe(
      tap((records) => ctx.dispatch(new LoadPersonalRecordsSuccess(records))),
      catchError((error) => {
        ctx.dispatch(new LoadPersonalRecordsFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(LoadPersonalRecordsSuccess)
  loadSuccess(ctx: StateContext<PersonalRecordsStateModel>, action: LoadPersonalRecordsSuccess) {
    ctx.patchState({
      records: action.payload,
      isLoading: false,
      error: null,
    });
  }

  @Action(LoadPersonalRecordsFailure)
  loadFailure(ctx: StateContext<PersonalRecordsStateModel>, action: LoadPersonalRecordsFailure) {
    ctx.patchState({
      isLoading: false,
      error: action.payload.error,
    });
  }

  @Action(TriggerCelebration)
  triggerCelebration(ctx: StateContext<PersonalRecordsStateModel>, action: TriggerCelebration) {
    ctx.patchState({ celebrationData: action.payload });
  }

  @Action(DismissCelebration)
  dismissCelebration(ctx: StateContext<PersonalRecordsStateModel>) {
    ctx.patchState({ celebrationData: null });
  }

  @Action(ResetPersonalRecordsState)
  resetState(ctx: StateContext<PersonalRecordsStateModel>) {
    ctx.setState(defaults);
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const err = error as { error?: { message?: string | string[] } };
      if (err.error?.message) {
        return Array.isArray(err.error.message) ? err.error.message[0] : err.error.message;
      }
    }
    return 'Ha ocurrido un error inesperado';
  }
}
