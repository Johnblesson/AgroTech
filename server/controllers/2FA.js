import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/auth.js';
import jwt from 'jsonwebtoken';
import { checkUserMessages } from '../controllers/contact.js'
// import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

// Generate a QR code and set up 2FA for the user
export const setup2FA = async (req, res) => {
    try {
      const secret = speakeasy.generateSecret({ name: 'agrotech-sl' });
  
      // Save the base32 secret to the user's record in the database
      const user = await User.findById(req.user._id); // Assuming you are using session/cookie-based authentication
      user.twoFactorSecret = secret.base32;
      await user.save();
  
      // Generate a QR code for the user to scan
      QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating QR code' });
        }
        // Send the QR code and secret back to the client
        res.render('setup-2fa', { qrCode: dataUrl, secret: secret.base32 });
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to set up 2FA', error });
    }
  };


// 
export const verify2FA = async (req, res) => {
  try {
      const { token } = req.body; // Token from the form submission
      
      // Retrieve the user from the session
      const sessionUser = req.session.user;
      if (!sessionUser) {
          return res.status(401).json({ msg: 'Unauthorized: No user session found' });
      }

      // Fetch the user from the database to ensure we have the most up-to-date data
      const user = await User.findById(sessionUser._id);
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the user has a two-factor secret
      if (!user.twoFactorSecret) {
          return res.status(400).json({ msg: '2FA is not enabled for this user' });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret, // The user's 2FA secret
          token: token,
          encoding: 'base32', // The secret is in base32 encoding
          window: 2 // Allow for some leeway in token validity (2 periods of 30 seconds)
      });

      if (verified) {
          // Create a new JWT token and redirect based on user role
          const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
          req.session.user = user; // Ensure user session is updated

          // Check if the user has messages
          const hasMessages = await checkUserMessages(user._id);

          let redirectUrl = '';
          if (user.role === 'admin') {
              redirectUrl = `/admin-home?token=${newToken}`;
          } else if (user.role === 'user') {
              redirectUrl = `/home?token=${newToken}`;
          } else {
              redirectUrl = `/home?token=${newToken}`;
          }

          // Redirect with an alert if there are messages
          if (hasMessages) {
              return res.redirect(`${redirectUrl}&alert=You have new messages`);
          } else {
              return res.redirect(redirectUrl);
          }
      } else {
          console.error('2FA Verification failed:', {
              token,
              secret: user.twoFactorSecret,
              verified
          });
          res.redirect('/invalid-2FA-code');
      }
  } catch (err) {
      console.error('Error during 2FA verification:', err);
      res.status(500).json({ msg: 'Server error during 2FA verification' });
  }
};


  

// Handle 2FA enable/disable request
export const toggle2FA = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const { twoFactorAuth } = req.body;
  
      if (twoFactorAuth === 'enable' && !user.twoFactorEnabled) {
        // Enable 2FA
        const secret = speakeasy.generateSecret({ name: 'agrotech-sl' });
        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = true;
        await user.save();
        res.redirect('/setup-2fa'); // Redirect to the setup page to generate QR code
      } else if (twoFactorAuth === 'disable' && user.twoFactorEnabled) {
        // Disable 2FA
        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;
        await user.save();
        res.redirect('/settings');
      } else {
        res.redirect('/settings');
      }
    } catch (error) {
      res.status(500).json({ message: 'Error toggling 2FA', error });
    }
  };
