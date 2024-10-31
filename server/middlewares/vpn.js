import axios from 'axios';

const IPINFO_API_URL = 'https://ipinfo.io';
const API_KEY = 'dc750824f1d744'; // Replace with your IPinfo API key

// Function to check if the IP address is private
const isPrivateIP = (ip) => {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./
  ];
  return privateRanges.some((range) => range.test(ip));
};

export const vpnDetectionMiddleware = async (req, res, next) => {
  const ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';

  if (isPrivateIP(ip)) {
    // Allow private IPs (local development, etc.)
    return next();
  }

  try {
    const response = await axios.get(`${IPINFO_API_URL}/${ip}?token=${API_KEY}`);
    const data = response.data;

    if (data.vpn) {
      // If the IP is identified as a VPN, block the request
      return res.status(403).send('Access denied. VPNs are not allowed.');
    } else {
      // Otherwise, allow the request to proceed
      next();
    }
  } catch (error) {
    console.error('Error fetching IP information:', error);
    // In case of an error, allow the request to proceed (or handle as needed)
    next();
  }
};

// export default vpnDetectionMiddleware;
