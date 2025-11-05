const mongoose = require('mongoose');

const offeredSkillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    categories: [{ type: String }],
    availability: { type: String, default: '' },
    rateType: { type: String, enum: ['hourly', 'swap', 'free'], default: 'swap' },
    rateValue: { type: Number },
    location: { type: String, default: '' },
    remote: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

offeredSkillSchema.index({ title: 'text', description: 'text', tags: 1, categories: 1 });
offeredSkillSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('OfferedSkill', offeredSkillSchema);
