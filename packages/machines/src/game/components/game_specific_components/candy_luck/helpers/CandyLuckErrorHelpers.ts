import { BuyCreditsError } from '@cgs/common';

export const enum ServerErrorCode {
  AdsToken = 0,
  AdsLimit = 1,
  InsufficientFunds = 3014,
}

export function isAdsLimitError(error: Error): boolean {
  return (
    error instanceof BuyCreditsError &&
    error.innerException.data?.data?.errorCode === ServerErrorCode.AdsLimit
  );
}
