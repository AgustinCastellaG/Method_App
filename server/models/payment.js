const mongoose = require('mongoose');

const payment = new mongoose.Schema({
  id: String,
  reversal_id: String,
  source_trace_id: String,
  destination_trace_id: String,
  source: String,
  destination: String,
  amount: Number,
  description: String,
  error: String,
  status: String,
  metadata: String,
  estimated_completion_date: String,
  created_at: String,
  updated_at: String
})

module.exports = mongoose.model('Payment', payment)