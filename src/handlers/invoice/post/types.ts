export enum InvoiceApiActionType {
  RAISE_INVOICE = "RAISE_INVOICE",
}

export type InvoiceApiRequestType = {
  body: {
    action: InvoiceApiActionType;
    data: {
      vendorId: string;
    };
  };
};
