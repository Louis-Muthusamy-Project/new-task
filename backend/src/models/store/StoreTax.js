const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * StoreTax.js
 *
 * One StoreTax document per Store (its tax configuration) — same
 * relational pattern as StoreShipping (one settings document per store,
 * linked back via storeId). Deliberately simple to match what the Tax &
 * checkout panel in StoresTab.jsx actually asks a merchant for: a single
 * sales tax rate applied to every order, plus whether tax is enabled at
 * all. Per-zone/per-category tax rules are out of scope — if that's ever
 * needed, this is the document to extend, not a second tax mechanism.
 */
const StoreTaxSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
    // Percentage, e.g. 7.5 means 7.5%.
    rate: { type: Number, default: 0, min: 0, max: 100 },
    isEnabled: { type: Boolean, default: true },
    // Cosmetic label shown next to the tax line at checkout, e.g. "Sales tax" / "VAT".
    label: { type: String, trim: true, default: 'Sales tax' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StoreTax || mongoose.model('StoreTax', StoreTaxSchema);
