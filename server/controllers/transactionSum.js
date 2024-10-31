import Transactions from "../models/transaction.js";

// Function to sum all transactions amount
export const sumTransactionsAmount = async () => {
    try {
      // Retrieve all transactions from the database
      const allTransactions = await Transactions.find();
  
      // Initialize total amount variable
      let totalAmount = 0;
  
      // Iterate through each transaction and sum their amounts
      allTransactions.forEach(transaction => {
        totalAmount += transaction.amount;
      });
  
      return totalAmount;
    } catch (error) {
      throw new Error(error.message);
    }
  };
  

  // Function to sum all totalPercentAmount from transactions
export const sumTotalPercentAmount = async () => {
    try {
      // Retrieve all transactions from the database
      const allTransactions = await Transactions.find();
  
      // Initialize total totalPercentAmount variable
      let totalTotalPercentAmount = 0;
  
      // Iterate through each transaction and sum their totalPercentAmount
      allTransactions.forEach(transaction => {
        totalTotalPercentAmount += transaction.totalPercentAmount;
      });
  
      return totalTotalPercentAmount;
    } catch (error) {
      throw new Error(error.message);
    }
  };
  

  // Function to sum all ownerPercent from transactions
export const sumOwnerPercent = async () => {
    try {
      // Retrieve all transactions from the database
      const allTransactions = await Transactions.find();
  
      // Initialize total ownerPercent variable
      let totalOwnerPercent = 0;
  
      // Iterate through each transaction and sum their ownerPercent
      allTransactions.forEach(transaction => {
        totalOwnerPercent += transaction.ownerPercent;
      });
  
      return totalOwnerPercent;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  
  // Function to sum all buyerTenantPercent from transactions
export const sumBuyerTenantPercent = async () => {
    try {
      // Retrieve all transactions from the database
      const allTransactions = await Transactions.find();
  
      // Initialize total buyerTenantPercent variable
      let totalBuyerTenantPercent = 0;
  
      // Iterate through each transaction and sum their buyerTenantPercent
      allTransactions.forEach(transaction => {
        totalBuyerTenantPercent += transaction.buyerTenantPercent;
      });
  
      return totalBuyerTenantPercent;
    } catch (error) {
      throw new Error(error.message);
    }
  };
  