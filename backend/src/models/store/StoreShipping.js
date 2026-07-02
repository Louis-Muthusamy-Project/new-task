const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreShippingRateSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: null },
    maxOrderValue: { type: Number, default: null },
    // Estimated transit time shown to the customer at checkout, e.g.
    // "3-5 business days". Free-text rather than a structured range since
    // carriers phrase this inconsistently.
    deliveryTime: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const StoreShippingZoneSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    countries: { type: [String], default: [] },
    rates: { type: [StoreShippingRateSchema], default: [] },
  }
  // Zones keep their auto-generated _id (unlike the rate subdocument
  // above) so a single zone can be targeted directly by the admin API
  // (PATCH/DELETE /:storeId/admin/shipping/zones/:zoneId).
);

/**
 * One StoreShipping document per Store (a store's shipping configuration),
 * kept in its own collection and linked back via storeId — same relational
 * pattern as every other Store* collection.
 */
const StoreShippingSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
    zones: { type: [StoreShippingZoneSchema], default: [] },
    freeShippingThreshold: { type: Number, default: null },
    originAddress: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.StoreShipping || mongoose.model('StoreShipping', StoreShippingSchema);