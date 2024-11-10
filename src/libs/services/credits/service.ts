import { VendorCreditStatus } from "../mongo/enums";
import { vendorCredits } from "../mongo/models/vendor-credits";
import {
  AttachInvoiceRequestIdsToCreditsInput,
  GetCreditsToRaiseInvoiceInput,
} from "./types";

export class VendorCreditService {
  async getCreditsToRaiseInvoice({ vendorId }: GetCreditsToRaiseInvoiceInput) {
    const credits = await vendorCredits
      .find({ vendorId, status: VendorCreditStatus.TO_BE_RAISED })
      .exec();
    return credits;
  }
  
  async attachInvoiceRequestIdsToCredits(
    input: AttachInvoiceRequestIdsToCreditsInput
  ) {
    const attachCreditPromises = input.toBeRaisedCreditIds.map(
      async (creditId) => {
        const updateResponse = await vendorCredits.updateOne(
          {
            creditId,
          },
          {
            invoiceReqId: input.invoiceReqId,
            status: VendorCreditStatus.RAISED,
          }
        );
        return updateResponse;
      }
    );
    return await Promise.all(attachCreditPromises);
  }
}
