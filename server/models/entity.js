const mongoose = require('mongoose');

const entity = new mongoose.Schema({
  id: String,
  type: String,
  individual: {
    first_name: String,
    last_name: String,
    phone: String,
    dob: String,
    email: String
  },
  corporation: {
    name: String,
    dba: String,
    ein: String,
    owners: []
  },
  receive_only: String,
  capabilities: [String],
  error: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String
  },
  status: String,
  metadata: String,
  created_at: String,
  updated_at: String
})

module.exports = mongoose.model('Entity', entity)