const mongoose = require('mongoose');
const { Schema } = mongoose;

const DnsRecordSchema = new Schema(
  {
    type: { type: String, enum: ['A', 'CNAME', 'TXT'], required: true },
    host: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const WebsiteDomainSchema = new Schema(
  {
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      default: null,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verifying', 'Connected', 'Failed'],
      default: 'Pending',
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    sslStatus: {
      type: String,
      enum: ['Pending', 'Active', 'Failed'],
      default: 'Pending',
    },
    dnsRecords: {
      type: [DnsRecordSchema],
      default: [],
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

WebsiteDomainSchema.index({ websiteId: 1, isPrimary: 1 });

module.exports =
  mongoose.models.WebsiteDomain || mongoose.model('WebsiteDomain', WebsiteDomainSchema);
