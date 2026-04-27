const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Shipment = require('../models/Shipment');

const STATUS_ORDER = ['created', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered'];

// CREATE shipment
router.post('/', async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver)
      return res.status(400).json({ error: 'Sender and receiver are required' });

    const shipment = new Shipment({
      trackingId: uuidv4(),
      sender,
      receiver,
      status: 'created',
      history: [{ status: 'created' }]
    });

    await shipment.save();
    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET shipment by trackingId
router.get('/:trackingId', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE status
router.patch('/:trackingId/status', async (req, res) => {
  try {
    const { status, location } = req.body;
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const currentIndex = STATUS_ORDER.indexOf(shipment.status);
    const newIndex = STATUS_ORDER.indexOf(status);

    if (newIndex === -1)
      return res.status(400).json({ error: 'Invalid status' });
    if (newIndex !== currentIndex + 1)
      return res.status(400).json({ error: `Cannot transition from "${shipment.status}" to "${status}"` });

    shipment.status = status;
    shipment.history.push({ status, location });
    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE shipment details
router.put('/:trackingId', async (req, res) => {
  try {
    const updated = await Shipment.findOneAndUpdate(
      { trackingId: req.params.trackingId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Shipment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE shipment
router.delete('/:trackingId', async (req, res) => {
  try {
    const deleted = await Shipment.findOneAndDelete({ trackingId: req.params.trackingId });
    if (!deleted) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ message: 'Shipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;