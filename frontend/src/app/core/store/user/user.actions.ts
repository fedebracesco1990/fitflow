import { User, UpdateProfileRequest, ChangePasswordRequest } from '../../models';

// Profile actions
export class LoadProfile {
  static readonly type = '[User] Load Profile';
}

export class LoadProfileSuccess {
  static readonly type = '[User] Load Profile Success';
  constructor(public payload: User) {}
}

export class LoadProfileFailure {
  static readonly type = '[User] Load Profile Failure';
  constructor(public payload: { error: string }) {}
}

export class UpdateProfile {
  static readonly type = '[User] Update Profile';
  constructor(public payload: UpdateProfileRequest) {}
}

export class UpdateProfileSuccess {
  static readonly type = '[User] Update Profile Success';
  constructor(public payload: User) {}
}

export class UpdateProfileFailure {
  static readonly type = '[User] Update Profile Failure';
  constructor(public payload: { error: string }) {}
}

export class ChangePassword {
  static readonly type = '[User] Change Password';
  constructor(public payload: ChangePasswordRequest) {}
}

export class ChangePasswordSuccess {
  static readonly type = '[User] Change Password Success';
}

export class ChangePasswordFailure {
  static readonly type = '[User] Change Password Failure';
  constructor(public payload: { error: string }) {}
}

export class ClearUserError {
  static readonly type = '[User] Clear Error';
}

export class ClearUserSuccess {
  static readonly type = '[User] Clear Success';
}

export class ResetUserState {
  static readonly type = '[User] Reset State';
}
