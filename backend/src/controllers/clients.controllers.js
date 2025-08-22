import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Client } from "../models/clients.model.js";
import { Organization } from "../models/organizations.model.js";
import z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

const createClient = asyncHandler(async (req, res) => {
    
    const createClientSchema = z.object({
        name: z.string().trim().min(1, { message: "Client name cannot be empty" }),
        email: z.string().email({ message: "Invalid email address" }).optional(),
        phone: z.string().refine((phone) => {
            if (!phone)
                return true;
            return isValidPhoneNumber(phone);
        },
        {
            message: "Please enter a valid international phone number (e.g., +911555526714)",
        }).optional(),
        billingAddress: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional()
        }).optional()
    });

    const validationResult = createClientSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const validationData = validationResult.data;

    const organization = await Organization.findOne({ownerId: req?.user?._id});

    if (!organization) {
        throw new ApiError(404, "Cannot create client no organization found");
    }

    const client = await Client.create({
        organizationId: organization._id,
        ...validationData
    });

    if (!client) {
        throw new ApiError(500, "Something went wrong while creating a client");
    }

    return res.status(201)
        .json(new ApiResponse(201, client, "Client created successfully"));
});

const getAllClients = asyncHandler(async (req, res) => {
    
    const _id = req?.user?._id;

    const organization = await Organization.findOne({ownerId: _id});

    if (!organization) {
        throw new ApiError(404, "Cannot fetch clients no organization found");
    }

    const clients = await Client.find({ organizationId: organization._id });

    return res.status(200)
        .json(new ApiResponse(200, clients, "All clients fetched successfully"));
});

const getSingleClient = asyncHandler(async (req, res) => {
    
    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404 ,"Cannot fetch client no organization found");
    }

    const clientId = req.params?.id;

    const client = await Client.findOne({
        _id: clientId,
        organizationId: organization._id
    });

    if (!client) {
        throw new ApiError(404, "Client not found or you do not have the permission to view it");
    }

    return res.status(200)
        .json(new ApiResponse(200, client, "Client fetched successfully"));
});

const updateClient = asyncHandler(async (req, res) => {
    
    const updateClientSchema = z.object({
        name: z.string().trim().min(1, { message: "Client name cannot be empty" }).optional(),
        email: z.string().email({ message: "Invalid email address" }).optional(),
        phone: z.string().refine((phone) => {
            if (!phone)
                return true;
            return isValidPhoneNumber(phone);
        },
        {
            message: "Please enter a valid international phone number (e.g., +911555526714)",
        }).optional(),
        billingAddress: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional()
        }).optional()
    });

    const validationResult = updateClientSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }
    
    const organization = await Organization.findOne({ownerId: req?.user?._id});
    
    if (!organization) {
        throw new ApiError(404, "Cannot update client no organization found");
    }

    const clientId = req.params?.id;

    const validationData = validationResult.data;

    const updatePayload = {};

    Object.keys(validationData).forEach((key) => {
        if (typeof validationData[key] === "object" && validationData[key] !== null && !Array.isArray(validationData[key])) {
            Object.keys(validationData[key]).forEach((nestedKey) => {
                updatePayload[`${key}.${nestedKey}`] = validationData[key][nestedKey];
            });
        } else {
            updatePayload[key] = validationData[key];
        }
    });

    const updatedClient = await Client.findOneAndUpdate(
        {
            _id: clientId,
            organizationId: organization._id
        },
        {
            $set: updatePayload
        },
        {
            new: true
        }
    );

    if (!updatedClient) {
        throw new ApiError(404, "Client not found or you do not have the permission to update it");
    }

    return res.status(200)
        .json(new ApiResponse(200, updatedClient, "Client updated successfully"));
});

const toggleClientArchiveStatus = asyncHandler(async (req, res) => {
    
    const organization = await Organization.findOne({ ownerId: req?.user?._id });

    if (!organization) {
        throw new ApiError(404, "Cannot archive client no organization found");
    }

    const clientId = req.params?.id;

    const client = await Client.findOneAndUpdate(
        {
            _id: clientId,
            organizationId: organization._id
        },
        [
            {
                $set: {
                    isArchived: {
                        $not: "$isArchived"
                    }
                }
            }
        ],
        {
            new: true
        }
    );

    if (!client) {
        throw new ApiError(404, "Client not found or you do not have the permission to update it");
    }

    return res.status(200)
        .json(new ApiResponse(200, {}, "Client archived status changed successfully"));
});

export { createClient, getAllClients, getSingleClient, updateClient, toggleClientArchiveStatus };