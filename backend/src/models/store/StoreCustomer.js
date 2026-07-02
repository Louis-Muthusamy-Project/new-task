const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreCustomerSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, default: '' },
    addresses: {
      type: [
        {
          line1: String,
          line2: String,
          city: String,
          state: String,
          postalCode: String,
          country: String,
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

StoreCustomerSchema.index({ storeId: 1, email: 1 }, { unique: true, sparse: true });

module.exports =
  mongoose.models.StoreCustomer || mongoose.model('StoreCustomer', StoreCustomerSchema);
