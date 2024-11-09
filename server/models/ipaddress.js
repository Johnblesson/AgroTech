import mongoose from 'mongoose';

// Define the schema for the ipaddress model
const { Schema } = mongoose;

const ipAddressSchema = new Schema({
  ip: {
    type: String,
    required: true,
  },
  country: {
    type: String,  // Store country name
    default: 'Unknown',
  },
  countryName: 
  { type: String,
    default: 'Unknown'
  }, 
  city: {
    type: String,  // Add city field
  },
  region: {
    type: String, // Add region (state or province)
  },
  postal: {
    type: String, // Add postal code
  },
  loc: {
    type: String, // Add latitude,longitude
  },
  org: {
    type: String, // Add organization or ISP
  },
  timezone: {
    type: String, // Add timezone
  },
  hostname: {
    type: String, // Add hostname
  },
  timestamp: {
      type: Date,
      default: Date.now,
    },
});

// Create the ipaddress model
const IPAddress = mongoose.model('IPAddress', ipAddressSchema);

export default IPAddress;