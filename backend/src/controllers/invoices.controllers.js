import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organization } from "../models/organizations.model.js";
import { Client } from "../models/clients.model.js";
import { Invoice } from "../models/invoices.model.js";
import z from "zod";

const createInvoice = asyncHandler(async (req, res) => {

    const lineItemSchema = z.object({
        description: z.string().trim().min(1, { message: "Line item description cannot be empty" }),
        quantity: z.number().positive({ message: "Quantity must be a positive number" }),
        unitPrice: z.number().positive({ message: "Unit price must be a positive number" })
    });

    const createInvoiceSchema = z.object({
        clientId: z.string().min(1, { message: "Client is required" }),

        issueDate: z.coerce.date({ message: "Invalid issue date" }),
        dueDate: z.coerce.date({ message: "Invalid due date" }),

        lineItems: z.array(lineItemSchema).min(1, { message: "Invoice must have at least one line item" }),

        tax: z.object({
            rate: z.number()
                .min(0, { message: "Tax rate cannot be negative" })
                .max(100, { message: "Tax rate cannot be more than 100%" })
                .default(0)
        }).optional(),

        notes: z.string().optional(),
        terms: z.string().optional(),
        
        status: z.enum(["draft", "sent"]).default("draft")
    });

    const validationResult = createInvoiceSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const {clientId, issueDate,  dueDate, lineItems, tax, notes, terms, status} = validationResult.data;

    const organization = await Organization.findOneAndUpdate(
        { 
            ownerId: req?.user?._id 

        },
        {
            $inc: {"invoiceSettings.nextNumber" : 1}
        },
        {
            new: true
        }
    );

    if (!organization) {
        throw new ApiError(404, "Cannot create invoice no organization found for this user");
    }

    const client = await Client.findOne({
        _id : clientId,
        organizationId : organization._id
    });

    if (!client) {
        throw new ApiError(404, "Client not found or you do not have the permission to update it");
    }

    let subtotal = 0;

    const calculatedItems = lineItems.map(item => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {...item, total};
    });

    console.log(calculatedItems);
    
    const taxRate = tax?.rate || 0;

    const taxAmount = subtotal * (taxRate / 100);

    const totalAmount = subtotal + taxAmount;

    const invoiceNumber = `${organization.invoiceSettings.prefix}${organization.invoiceSettings.nextNumber}`;

    const invoice = await Invoice.create({
        organizationId: organization._id,
        clientId,
        invoiceNumber,
        status,
        issueDate,
        dueDate,
        lineItems: calculatedItems,
        subtotal,
        tax : {
            rate : taxRate,
            amount : taxAmount
        },
        totalAmount,
        notes,
        terms
    });

    if (!invoice) {
        throw new ApiError(500, "Something went wrong while creating a invoice");
    }

    return res.status(201)
        .json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

const getAllInvoice = asyncHandler(async (req, res) => {
    
    const organization = await Organization.findOne({ ownerId : req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot fetch invoices organization not found for this user");
    }

    const { month, year, status, clientName } = req.query;

    const pipeline = [];

    let filter = {
        organizationId : organization._id
    };

    if (status && status !== "all") {
        filter.status = status;
    }

    if (year && year !== "all") {
        const yearNum = parseInt(year);
        let startDate; let endDate;

        if (month && month !== "all") {
            const monthNum = parseInt(month);
            startDate = new Date(yearNum, monthNum - 1, 1);
            endDate = new Date(yearNum, monthNum, 1);
        } else {
            startDate = new Date(yearNum, 0, 1);
            endDate = new Date(yearNum + 1, 0, 1);
        }

        filter.issueDate = {
            $gte: startDate,
            $lt: endDate
        };
    }

    // Stage 1
    pipeline.push({ $match: filter });

    if (clientName?.trim()) {
        // Stage 2
        pipeline.push({
            $lookup: {
                from: "clients",
                localField: "clientId",
                foreignField: "_id",
                as: "clientDetails"
            }
        });

        // Stage 3
        pipeline.push({
            $match: { 
                "clientDetails.name": { $regex: clientName, $options: "i" } 
            }
        });
    }

    const invoices = await Invoice.aggregate(pipeline);

    return res.status(200)
        .json(new ApiResponse(200, invoices, "Invoices fetched successfully"));
});

const getSingleInvoice = asyncHandler(async (req, res) => {
    
    const organization = await Organization.findOne( {ownerId : req?.user?._id} );

    if (!organization) {
        throw new ApiError(404, "Cannot fetch invoice no organization found for this user");
    }

    const invoiceId = req.params.id;

    const invoice = await Invoice.findOne({
        _id : invoiceId,
        organizationId : organization._id
    });

    if (!invoice) {
        throw new ApiError(404, "Invoice not found or you do not have the permission to view it");
    }

    return res.status(200)
        .json(new ApiResponse(200, invoice, "Invoice fetched successfully"));
});

const updateInvoice = asyncHandler(async (req, res) => {

    const lineItemSchema = z.object({
        description: z.string().trim().min(1).optional(),
        quantity: z.number().positive().optional(),
        unitPrice: z.number().positive().optional()
    });

    const updateInvoiceSchema = z.object({
        issueDate: z.coerce.date().optional(),
        dueDate: z.coerce.date().optional(),

        lineItems: z.array(lineItemSchema).min(1).optional(),

        tax: z.object({
            rate: z.number()
                .min(0, { message: "Tax rate cannot be negative" })
                .max(100, { message: "Tax rate cannot be more than 100%" })
        }).optional(),

        amountPaid: z.number().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        
        status: z.enum(["draft", "sent", "paid", "overdue", "void"]).optional()
    });

    const validationResult = updateInvoiceSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const validationData = validationResult.data;
    const invoiceId = req.params.id;

    const organization = await Organization.findOne({ ownerId : req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot update invoice no organization found for this user");
    }

    const originalInvoice = await Invoice.findOne({
        _id: invoiceId,
        organizationId: organization._id
    });

    if (!originalInvoice) {
        throw new ApiError(404, "Invoice not found or you do not have permission to view it");
    }

    const updatePayload = { ...validationData };

    const needsRecalculation = validationData.lineItems || validationData.tax;

    if (needsRecalculation) {
        const lineItemsForCalc = validationData.lineItems ?? (originalInvoice.lineItems);
        
        const taxRatePercentage = validationData.tax?.rate ?? (originalInvoice.tax.rate * 100);

        let subtotal = 0;
        const calculatedLineItems = lineItemsForCalc.map(item => {
            const quantity = item.quantity ?? 0;
            const unitPrice = item.unitPrice ?? 0;
            const total = quantity * unitPrice;
            subtotal += total;
            return { ...item, total };
        });

        const taxRateDecimal = taxRatePercentage / 100;
        const taxAmount = subtotal * taxRateDecimal;
        const totalAmount = subtotal + taxAmount;

        updatePayload.lineItems = calculatedLineItems;
        updatePayload.subtotal = subtotal;
        updatePayload.tax = {
            rate: taxRateDecimal,
            amount: taxAmount
        };
        updatePayload.totalAmount = totalAmount;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { 
            $set: updatePayload 
        },
        { 
            new: true 
        }
    );

    if (!updatedInvoice) {
        throw new ApiError(500, "Something went wrong while updating the invoice");
    }

    return res.status(200)
        .json(new ApiResponse(200, updatedInvoice, "Invoice updated successfully"));
});

export { createInvoice, getAllInvoice, getSingleInvoice, updateInvoice };