export interface ApplicationPayload {
  name: string;
  phone: string;
  cityId: number;
  offerId: number;
  tariffId?: number;
  comment?: string;
  /** Желаемые даты — данные лида, ничего не бронируют */
  desiredStartDate?: string;
  desiredEndDate?: string;
  /** Показать заявку владельцам похожих машин */
  allowSimilar?: boolean;
}
