
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const CARD_TYPES = ["VISC", "VPTL", "PULM", "CSC1", "USS9"] as const;
const CHANNEL_CODES = ["OMLG", "SAPL"] as const;
const LEAD_SOURCES = ["LG", "LG_RKPL", "LG_BankSaathi", "ENCIRCLE"] as const;

export const leadValidationSchema = z
  .object({
    firstName: z
      .string()
      .max(12, { message: "First name cannot exceed 12 characters" })
      .regex(/^[a-zA-Z]*$/, {
        message: "First name must contain only letters",
      }),

    middleName: z
      .string()
      .max(10, { message: "Middle name cannot exceed 10 characters" })
      .regex(/^[a-zA-Z\s]*$/, {
        message: "Middle name must contain only letters and spaces",
      })
      .optional(),

    lastName: z
      .string()
      .max(16, { message: "Last name cannot exceed 16 characters" })
      .regex(/^[a-zA-Z]*$/, { message: "Last name must contain only letters" }),

    mobileNumber: z.string().regex(/^[3-9][0-9]{9}$/, {
      message: "Mobile number must be 10 digits and start with 3-9",
    }),

    emailID: z
      .string()
      .max(40, { message: "Email ID cannot exceed 40 characters" })
      .regex(/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,10}$/, {
        message: "Invalid email format",
      }),

    sourceCode: z
      .string()
      .max(10, { message: "Source code cannot exceed 10 characters" })
      .regex(/^[a-zA-Z0-9]*$/, {
        message: "Source code must contain only alphanumeric characters",
      }),

    lgAgentID: z
      .string()
      .max(20, { message: "Agent ID cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9]*$/, {
        message: "Agent ID must contain only alphanumeric characters",
      })
      .optional(),

    cardType: z.enum(CARD_TYPES, {
      errorMap: () => ({ message: "Invalid card type" }),
    }),

    lgUID: z
      .string()
      .max(120, { message: "lgUID cannot exceed 120 characters" })
      .regex(/^[a-zA-Z0-9-]*$/, {
        message: "lgUID must contain only alphanumeric characters and hyphens",
      })
      .refine((val) => val.startsWith("LG-") || val.startsWith("EN-"), {
        message:
          "lgUID must start with 'LG-' for LG leads or 'EN-' for Encircle leads",
      }),

    breCode: z
      .string()
      .max(10, { message: "BRE code cannot exceed 10 characters" })
      .regex(/^[0-9]*$/, { message: "BRE code must contain only numbers" })
      .optional(),

    channelCode: z.enum(CHANNEL_CODES, {
      errorMap: () => ({
        message:
          "Channel code must be 'OMLG' for LG leads or 'SAPL' for Encircle leads",
      }),
    }),

    leadSource: z.enum(LEAD_SOURCES, {
      errorMap: () => ({ message: "Invalid lead source" }),
    }),

    gemId1: z
      .string()
      .max(250, { message: "GemId1 cannot exceed 250 characters" })
      .regex(/^[a-zA-Z0-9-_]*$/, {
        message:
          "GemId1 must contain only alphanumeric characters, hyphens and underscores",
      }),

    gemId2: z
      .string()
      .max(250, { message: "GemId2 cannot exceed 250 characters" })
      .regex(/^[a-zA-Z0-9-_]*$/, {
        message:
          "GemId2 must contain only alphanumeric characters, hyphens and underscores",
      }),

    filler1: z.string().optional(),
    filler2: z.string().optional(),
    filler3: z.string().optional(),
    filler4: z.string().optional(),
    filler5: z.string().optional(),

    action: z.literal("LG-Create-Lead"),
    type: z.literal("SPRINT_Partner"),
  })
  .strict(); // Prevents additional properties not defined in the schema

// Infer the TypeScript type from the schema
export type LeadValidationType = z.infer<typeof leadValidationSchema>;

export const validateLead = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    leadValidationSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
