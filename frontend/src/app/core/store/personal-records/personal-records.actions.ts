import { PersonalRecord, PrCelebrationData } from '../../models';

export class LoadPersonalRecords {
  static readonly type = '[PersonalRecords] Load';
}

export class LoadPersonalRecordsSuccess {
  static readonly type = '[PersonalRecords] Load Success';
  constructor(public payload: PersonalRecord[]) {}
}

export class LoadPersonalRecordsFailure {
  static readonly type = '[PersonalRecords] Load Failure';
  constructor(public payload: { error: string }) {}
}

export class TriggerCelebration {
  static readonly type = '[PersonalRecords] Trigger Celebration';
  constructor(public payload: PrCelebrationData) {}
}

export class DismissCelebration {
  static readonly type = '[PersonalRecords] Dismiss Celebration';
}

export class ResetPersonalRecordsState {
  static readonly type = '[PersonalRecords] Reset State';
}
