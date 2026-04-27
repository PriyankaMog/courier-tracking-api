const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  location: String
});

const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true, required: true },
  sender: { name: String, address: String },
  receiver: { name: String, address: String },
  status: {
    type: String,
    enum: ['created', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered'],
    default: 'created'
  },
  history: [historySchema]
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);