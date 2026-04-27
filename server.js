const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const shipmentRoutes = require('./routes/shipment');

dotenv.config();
const app = express();

app.use(express.json());
app.use(logger);

app.use('/api/shipments', shipmentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));