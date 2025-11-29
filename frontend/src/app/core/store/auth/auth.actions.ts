import { LoginRequest, RegisterRequest, TokensResponse, AuthenticatedUser } from '../../models';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginRequest) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public payload: { tokens: TokensResponse; user: AuthenticatedUser }) {}
}

export class LoginFailure {
  static readonly type = '[Auth] Login Failure';
  constructor(public payload: { error: string }) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public payload: RegisterRequest) {}
}

export class RegisterSuccess {
  static readonly type = '[Auth] Register Success';
  constructor(public payload: { tokens: TokensResponse; user: AuthenticatedUser }) {}
}

export class RegisterFailure {
  static readonly type = '[Auth] Register Failure';
  constructor(public payload: { error: string }) {}
}

export class CheckSession {
  static readonly type = '[Auth] Check Session';
}

export class CheckSessionSuccess {
  static readonly type = '[Auth] Check Session Success';
  constructor(public payload: AuthenticatedUser) {}
}

export class CheckSessionFailure {
  static readonly type = '[Auth] Check Session Failure';
}

export class RefreshToken {
  static readonly type = '[Auth] Refresh Token';
}

export class RefreshTokenSuccess {
  static readonly type = '[Auth] Refresh Token Success';
  constructor(public payload: TokensResponse) {}
}

export class RefreshTokenFailure {
  static readonly type = '[Auth] Refresh Token Failure';
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class LogoutSuccess {
  static readonly type = '[Auth] Logout Success';
}

export class ClearAuthError {
  static readonly type = '[Auth] Clear Error';
}

export class SetAuthLoading {
  static readonly type = '[Auth] Set Loading';
  constructor(public payload: boolean) {}
}
