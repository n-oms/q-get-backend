import { VendorCreditsType } from "../mongo/types";

export type RaiseInvoiceEventType = {
  vendorId: string;
};


export type CalculateTotalCreditsInput = { credits: VendorCreditsType[] }

export type CreateInvoiceInput = {
    invoiceReqId: string,
    amountRaised: number,
    vendorId: string,
}
