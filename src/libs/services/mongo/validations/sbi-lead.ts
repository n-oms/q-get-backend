import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const CARD_TYPES = ["VISC", "VPTL", "PULM", "CSC1", "SSU1"] as const;

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

    mobileNumber: z
      .string()
      .regex(/^[0-9]{10}$/, {
        message: "Mobile number must be exactly 10 digits",
      }),

    emailID: z
      .string()
      .max(50, { message: "Email ID cannot exceed 50 characters" })
      .regex(/^[A-Za-z0-9\.\@_-]*$/, {
        message: "Email ID contains invalid characters",
      })
      .email({ message: "Invalid email format" }),

    sourceCode: z
      .string()
      .max(15, { message: "Source code cannot exceed 15 characters" })
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
      .regex(/^[a-zA-Z0-9]*$/, {
        message: "lgUID must contain only alphanumeric characters",
      }),

    breCode: z
      .string()
      .max(9, { message: "BRE code cannot exceed 9 characters" })
      .regex(/^[0-9]*$/, { message: "BRE code must contain only numbers" })
      .optional(),

    channelCode: z
      .string()
      .max(4, { message: "Channel code cannot exceed 4 characters" })
      .regex(/^[a-zA-Z]*$/, {
        message: "Channel code must contain only letters",
      }),

    leadSource: z
      .string()
      .max(30, { message: "Lead source cannot exceed 30 characters" })
      .regex(/^[a-zA-Z0-9]*$/, {
        message: "Lead source must contain only alphanumeric characters",
      }),

    filler1: z.string().optional(),
    filler2: z.string().optional(),
    filler3: z.string().optional(),
    filler4: z.string().optional(),
    filler5: z.string().optional(),

    // These will be set by the service
    action: z.string().optional(),
    type: z.string().optional(),
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
