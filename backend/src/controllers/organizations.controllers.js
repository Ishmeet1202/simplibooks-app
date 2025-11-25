import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organization } from "../models/organizations.model.js";
import z from "zod";

const createOrganization = asyncHandler(async (req, res) => {

    const createOrganizationSchema = z.object({
    name: z.string().trim().min(1, { message: "Name cannot be empty" }),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        }).optional(),
    gstin: z.string().optional(),
    });

    const validationResult = createOrganizationSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const validationData = validationResult.data;

    const createPayload = {};

    Object.keys(validationData).forEach((key) => {
        if (typeof validationData[key] === "object" && validationData[key] !== null && !Array.isArray(validationData[key])) {
            Object.keys(validationData[key]).forEach((nestedKey) => {
                createPayload[`${key}.${nestedKey}`] = validationData[key][nestedKey];
            });
        } else {
            createPayload[key] = validationData[key];
        }
    });

    const checkExistedOrg = await Organization.findOne({ownerId: req?.user?._id});

    if (checkExistedOrg) {
        throw new ApiError(409, "Organization already exists for this user");
    }

    const organization = await Organization.create({
        ownerId: req?.user?._id,
        ...createPayload
    });

    if (!organization) {
        throw new ApiError(500 ,"Something went wrong while creating the organization");
    }

    return res.status(201)
        .json(new ApiResponse(201, organization, "Organization created successfuly"));
});

const getOrganization = asyncHandler(async (req, res) => {
    const _id = req?.user?._id;

    const organization = await Organization.findOne({ ownerId: _id });

    if (!organization) {
        return res.status(200)
            .json(new ApiResponse(200, null, "No organization yet"));
    }

    return res.status(200)
        .json(new ApiResponse(200, organization, "Organization data fetched successfully"));
});


const updateOrganization = asyncHandler(async (req, res) => {

    const updateOrganizationSchema = z.object({
        name: z.string().trim().min(1, { message: "Name cannot be empty" }).optional(),
        address: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional()
        }).optional(),
        gstin: z.string().optional(),
        invoiceSettings: z.object({
            prefix: z.string().optional(),
            nextNumber: z.number().int().positive().optional(),
            terms: z.string().optional(),
            notes: z.string().optional()
        }).optional()
    });

    const validationResult = updateOrganizationSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

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

    const checkExistedOrg = await Organization.findOne({ownerId: req?.user?._id});

    if (!checkExistedOrg) {
        throw new ApiError(404, "Organization not found for this user");
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
        checkExistedOrg._id,
        {
            $set: updatePayload
        },
        {
            new: true
        }
    );

    if (!updatedOrganization) {
        throw new ApiError(500, "Something went wrong while updating an organization");
    }

    return res.status(200)
        .json(new ApiResponse(200, updatedOrganization, "Organization updated successfully"));
});

export { createOrganization, getOrganization, updateOrganization };
