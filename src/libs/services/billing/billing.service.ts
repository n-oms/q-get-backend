import { SQS_EVENT_IDS } from "@/libs/constants/common";
import { VendorCreditService } from "../credits/service";
import { Invoices } from "../mongo/models/invoice";
import { OrganizationService } from "../organization/service";
import { SqsService } from "../sqs/service";
import {
  CalculateTotalCreditsInput,
  CreateInvoiceInput,
  RaiseInvoiceEventType,
} from "./types";
import { SQS_QUEUES } from "@/libs/constants/sqs";

export class BillingService {
  private readonly vendorCreditService: VendorCreditService;
  private readonly sqsService: SqsService;
  private readonly organizationService: OrganizationService;
  constructor() {
    this.vendorCreditService = new VendorCreditService();
    this.sqsService = new SqsService();
    this.organizationService = new OrganizationService();
    this.pushRaiseInvoiceEvent = this.pushRaiseInvoiceEvent.bind(this);
    this.createInvoiceId = this.createInvoiceId.bind(this);
    this.calculateTotalCredits = this.calculateTotalCredits.bind(this);
    this.createInvoice = this.createInvoice.bind(this);
  }

  async pushRaiseInvoiceEvent(input: RaiseInvoiceEventType) {
    const creditsToBeRaised =
      await this.vendorCreditService.getCreditsToRaiseInvoice({
        vendorId: input.vendorId,
      });

    if (creditsToBeRaised.length === 0) {
      throw new Error("No credits to raise invoice");
    }

    const invoiceId = this.createInvoiceId({ vendorId: input.vendorId });
    // Attaching invoice request ids to credits
    await this.vendorCreditService.attachInvoiceRequestIdsToCredits({
      toBeRaisedCreditIds: creditsToBeRaised.map((credit) => credit.creditId || credit._id.toString()),
      invoiceReqId: invoiceId,
    });

    const totalAmount = this.calculateTotalCredits({
      credits: creditsToBeRaised,
    });

    const organization = await this.organizationService.getOrganizationInfo();
    const message = {
      eventId: SQS_EVENT_IDS.RAISE_INVOICE_REQUEST,
      vendorId: input.vendorId,
      tenantId: organization.tenantId,
      invoiceReqId: invoiceId,
      eventDetails: {
        applicationList: creditsToBeRaised,
        totalAmount,
      },
    };

    // Pushing raise invoice request message to SQS
    const queueResponse = await this.sqsService.sendMessage({
      queueUrl: SQS_QUEUES.RAISE_INVOICE_REQUEST_QUEUE.url,
      message: message,
    });

    if (queueResponse.$metadata.httpStatusCode === 200) {
      const invoice = await this.createInvoice({
        vendorId: input.vendorId,
        amountRaised: totalAmount,
        invoiceReqId: invoiceId,
      });
      return {
        message: "Invoice request sent successfully",
        invoice,
      };
    }
    return { message: "Failed to send invoice request" };
  }

  private createInvoiceId({ vendorId }: { vendorId: string }) {
    return `${Date.now()}_${vendorId}`;
  }

  private calculateTotalCredits({ credits }: CalculateTotalCreditsInput) {
    return credits.reduce((acc, credit) => acc + credit.credit, 0);
  }

  async createInvoice({
    amountRaised,
    invoiceReqId,
    vendorId,
  }: CreateInvoiceInput) {
    const invoice = await Invoices.create({
      invoiceReqId,
      amountRaised,
      vendorId,
      status: "PENDING",
    });
    return invoice.toJSON();
  }
}
