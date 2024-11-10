export type GetCreditsToRaiseInvoiceInput = {
  vendorId: string;
};

export type AttachInvoiceRequestIdsToCreditsInput = {
    toBeRaisedCreditIds: string[];
    invoiceReqId: string;
  };
  
