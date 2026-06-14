const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // What the requester will teach the provider (requester's offered skill)
    requesterSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferedSkill' },
    // What the provider will teach the requester (provider's offered skill)
    providerSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferedSkill' },
    // Legacy fields kept for backward compatibility
    requestedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestedSkill' },
    offeredSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'OfferedSkill' },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'declined', 'cancelled', 'completed'],
      default: 'proposed',
    },
    notes: { type: String, default: '' },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

exchangeSchema.index({ requester: 1, provider: 1, createdAt: -1 });
exchangeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Exchange', exchangeSchema);
