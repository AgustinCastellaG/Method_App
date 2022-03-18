
const mongoose = require('mongoose');

const AchSchema = new mongoose.Schema({
  routing: String,
  number: String,
  type: String
});

const LiabilitySchema = new mongoose.Schema({
  mchId: String,
  mask: String,
});

const account = new mongoose.Schema({
  batch_id: String,
  id: String,
  holder_id: String,
  status: String,
  type: String,
  ach: AchSchema,
  liability: LiabilitySchema,
  clearing: String,
  capabilities: [String],
  error: String,
  metadata: String,
  created_at: String,
  updated_at: String
})

module.exports = mongoose.model('Account', account)