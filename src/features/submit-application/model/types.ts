export interface ApplicationPayload {
  phone: string;
  /** Код подтверждения телефона: отсекает выдуманные номера */
  code: string;
  cityId: number;
  offerId: number;
}
