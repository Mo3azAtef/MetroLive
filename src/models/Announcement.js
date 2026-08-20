const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'delay', 'disruption'],
      default: 'info',
    },
  },
  { timestamps: true }
);

// Newest-first per station is the primary read pattern.
announcementSchema.index({ station: 1, createdAt: -1 });

announcementSchema.statics.SEVERITIES = ['info', 'delay', 'disruption'];

module.exports = mongoose.model('Announcement', announcementSchema);
