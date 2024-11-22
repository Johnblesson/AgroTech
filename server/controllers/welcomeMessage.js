export const generateWelcomeMessage = (adminId) => {
    return {
      senderId: adminId, // The Administrator's user ID
      message: `
        Thank you for joining AgroTech SL! 🌱 
        We’re thrilled to welcome you to our growing community of farmers and agriculture enthusiasts. 
        By becoming a part of AgroTech SL, you now have access to invaluable farming resources, daily tips, 
        weather updates, and the opportunity to connect with other farmers while showcasing your products for free. 
        Your journey towards enhanced productivity and sustainable farming begins here. 
        Let’s grow together and make a positive impact in agriculture. Welcome aboard! 🌾
      `,
      date: new Date(),
    };
  };
  
  