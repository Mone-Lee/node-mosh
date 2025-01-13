const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  isGold: { type: Boolean, required: true },
  name: String,
  phone: String
})

const Customer = mongoose.model('Customer', customerSchema);

async function createCustomer() {
  const customer = new Customer({
    isGold: true,
    name: 'Camille',
    phone: '1234567890'
  })
}

createCustomer();