const mongoose = require('mongoose');

const requestedSkillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    categories: [{ type: String }],
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    location: { type: String, default: '' },
    remote: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

requestedSkillSchema.index({ title: 'text', description: 'text', tags: 1, categories: 1 });
requestedSkillSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RequestedSkill', requestedSkillSchema);
