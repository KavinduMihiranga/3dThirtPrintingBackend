const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
    
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
},
  { timestamps: true } // adds createdAt and updatedAt
);

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;