import { Constructor } from '@cgs/syd';
import { AuthorizationKeyNotFoundException } from './exceptions/authorization_key_not_found_exception';
import { BonusUnavailableException } from './exceptions/bonus_unavailable_exception';
import { FinishPaymentTransactionException } from './exceptions/finish_payment_transaction_exception';
import { InvalidSequenceNumberException } from './exceptions/invalid_sequence_number_exception';
import { LoginFormInvalidCredenticalsException } from './exceptions/login_form_invalid_credentials_exception';
import { NeedToRereadException } from './exceptions/need_to_reread_exception';
import { NotActiveSessionException } from './exceptions/not_active_session_exception';
import { NotEnoughBalanceException } from './exceptions/not_enough_balance_exception';
import { SegmentableConfigNotFoundException } from './exceptions/segmentable_config_not_found_exception';
import { SessionExpiredException } from './exceptions/session_expired_exception';
import { SpinPerMinuteLimitExceededException } from './exceptions/spin_per_minute_limit_exceeded_exception';
import { StartPaymentTransactionException } from './exceptions/start_payment_transaction_exception';
import { VerifyTransactionLaterException } from './exceptions/verify_transaction_later_exception';
import { BuyCreditsError } from './exceptions/buy_credits_error';

export class KnownServerErrorProvider {
  get Errors(): Map<string, any> {
    return this._errors;
  }
  private readonly _errors: Map<string, Constructor<any>>;

  constructor() {
    this._errors = new Map<string, any>([
      ['E_SESSION_EXPIRED', SessionExpiredException],
      ['E_SPINS_PER_MINUTE_LIMIT_EXCEEDED', SpinPerMinuteLimitExceededException],
      // ['E_SOCIAL_NOT_AUTHORIZED', SocialAuthenticationException],
      // ['E_DIFFERENT_SOCIAL_ID', DifferentSocialIdException],
      // ['E_SOCIAL_AUTHENTICATION_FAILED', SocialAuthenticationException],
      ['E_AUTHORIZATION_KEY_NOT_FOUND', AuthorizationKeyNotFoundException],
      // ['E_GIFT_ONE_FRIEND_LIMIT', SendGiftPerFriendLimitException],
      // ['E_PROGRESSIVE_BONUS_PERIOD_NOT_ENDED', ProgressiveBonusPeriodNotEndedException],
      // ['E_ALREADY_PLAYED_DAILY_BONUS', AlreadyPlayedDailyBonusException],
      ['E_NOT_ENOUGH_BALANCE', NotEnoughBalanceException],
      ['E_PAYMENT_OPTION_UNAVALABLE', StartPaymentTransactionException],
      ['E_UNKNOWN_PURCHASE_PLATFORM', FinishPaymentTransactionException],
      ['E_TRANSACTION_NOT_FOUND', FinishPaymentTransactionException],
      ['E_INCORRECT_PRODUCT', FinishPaymentTransactionException],
      ['E_INCORRECT_PURCHASE_DATA', FinishPaymentTransactionException],
      // ['E_PAYMENT_PAGE_MISSING', PaymentPageMissingException],
      // ['E_GIFT_NOT_FOUND', SocialGiftNotFoundException],
      // ['E_GIFT_EXPIRED', SocialGiftExpiredException],
      // ['E_GIFT_NOT_AUTHORIZED', SocialGiftNotAuthorizedException],
      // ['E_GIFT_CANNOT_BE_COLLECTED_BY_OWNER', SocialGiftCantBeCollectedByOwnerException],
      // ['E_GIFT_ALREADY_COLLECTED', SocialGiftAlreadyCollectedException],
      ['E_VERIFY_LATER', VerifyTransactionLaterException],
      // ['E_SOCIAL_BONUS_UNAVAILABLE', SocialBonusUnavailableException],
      ['E_INVALID_SEQUENCE_NUMBER', InvalidSequenceNumberException],
      ['E_SEGMENTABLE_CONFIG_NOT_FOUND', SegmentableConfigNotFoundException],
      ['E_NOT_ACTIVE_SESSION', NotActiveSessionException],
      // ['E_PARLAY_NOT_EXISTS', ParlayNotExistException],
      // ['E_ANOTHER_FEATURE_IS_ACTIVE', AnotherFeatureIsActiveException],
      // ['E_GIFT_IS_EXPIRED', GiftIsExpiredException],
      ['E_NEED_TO_REREAD_CONFIG', NeedToRereadException],
      // ['E_USER_PROFILE_NAME_CONTAINS_PROHIBITED_WORDS', ProfileProhibitedWordsException],
      // ['E_USER_PROFILE_INCORRECT_EMAIL_FORMAT', ProfileIncorrectEmailException],
      // ['E_USER_PROFILE_INCORRECT_NAME_FORMAT', ProfileIncorrectFormatException],
      // ['E_USER_PROFILE_FULLNAME_IS_EMPTY', ProfileEmptyFullnameException],
      // ['E_USER_PROFILE_FULLNAME_TOO_LONG', ProfileNameTooLongException],
      // ['E_USER_PROFILE_NAME_HAVE_TO_CONTAIN_LETTERS', ProfileEmptyFullnameException],
      ['E_INVALID_LOGIN_FORM_CREDENTIALS', LoginFormInvalidCredenticalsException],
      // ['E_REGISTRATION_INVALID_PASSWORD', RegistrationFormInvalidPasswordException],
      // ['E_REGISTRATION_INVALID_EMAIL', RegistrationFormInvalidEmailException],
      ['E_REGISTRATION_INVALID_EMAIL_TOKEN', LoginFormInvalidCredenticalsException],
      ['E_REGISTRATION_EXPIRED_EMAIL_TOKEN', LoginFormInvalidCredenticalsException],
      ['E_EMAIL_NOT_FOUND', LoginFormInvalidCredenticalsException],
      // ['E_REGISTRATION_EMAIL_IN_USE', RegistrationFormEmailAlreadyInUseException],
      ['E_BONUS_UNAVAILABLE', BonusUnavailableException],
      ['buyCredits', BuyCreditsError],
      ['watchAds', BuyCreditsError],
      // ['E_ALBUM_HL_NO_ACTIVE_ALBUM', SecondAlbumNoActiveAlbumException],
    ]);
  }
}
