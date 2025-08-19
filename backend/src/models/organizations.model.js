import mongoose,{Schema} from "mongoose";

const organizationSchema = new Schema(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            street: {
                type: String
            },
            city: {
                type: String
            },
            state: {
                type: String
            },
            postalCode: {
                type: String
            },
            country: {
                type: String,
                default: "India"
            }
        },
        gstin: {
            type: String
        },
        currency: {
            code: {
                type: String,
                default: "INR"
            },
            symbol: {
                type: String,
                default: "₹"
            }
        },
        invoiceSettings: {
            prefix: {
                type: String,
                default: "INV-"
            },
            nextNumber: {
                type: Number,
                default: 1
            }
        }
    },
    {
        timestamps: true
    }
);

export const Organization = mongoose.model("Organization", organizationSchema);