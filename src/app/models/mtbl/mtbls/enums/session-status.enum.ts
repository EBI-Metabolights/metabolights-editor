// linter says enum members should be camelcase, I disagree
/* eslint-disable @typescript-eslint/naming-convention */
export enum SessionStatus { // eslint-disable-line no-shadow
  // no idea why no-shadow is flagging on the above line.
  NotInit = "not initialised",
  Expired = "session expired",
  Active = "session active",
  NoRecord = "no user data in local storage or data store",
}
