import Expenses from '../models/expenses.js';
import User from '../models/auth.js';
import Transactions from '../models/transaction.js';
import Staffs from '../models/staffs.js'
import IPAddress from "../models/ipaddress.js";
import { sumTransactionsAmount, sumTotalPercentAmount, sumOwnerPercent, sumBuyerTenantPercent } from './transactionSum.js'

// Controller function to create a new Expenses
export const createExpenses = async (req, res) => {
    try {
      // Extracting data from request body
      const { 
        date,
        purpose,
        amount,
        receivedBy,
        approvedBy,
        createdBy,
        username,  
        comments } = req.body;
  
        
      // Create a new Expenses object with form data
      const expensesForm = new Expenses({
        date,
        purpose,
        amount,
        receivedBy,
        approvedBy,
        createdBy,
        username,
        comments,
        createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
        updatedAt: new Date()
      });
  
      // Saving the Expenses to the database
      const savedExpenses = await expensesForm.save();
  
      // Sending a success response
      res.status(201).render('success/expenses')
      console.log(savedExpenses);
    } catch (error) {
      // Sending an error response
      res.status(400).json({ error: error.message });
    }
  };


  // Render Expenses Form
export const expensesForm = async (req, res) => {

    // Function to determine the time of the day
    const getTimeOfDay = () => {
      const currentHour = new Date().getHours();
  
      if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };
  
    try {
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Check if the user is authenticated
      const user = req.isAuthenticated() ? req.user : null;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;

      const role = user ? user.role : null; // Get user role if user is authenticated
  
      // Render the apply page with the necessary data
      res.render('expense-form', {
        user,
        greeting,
        sudo,
        accountant,
        manager,
        role,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };


  
// Get All Expenses Controller
export const getAllExpenses = async (req, res) => {

    try {
      const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Fetch all storage data
      // const allStorage = await User.find().skip(skip).limit(limit);
      const totalEntries = await Expenses.countDocuments();
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch all users from the database
      // const users = await User.find({}, '-password'); // Exclude password field from the response
      const expenses = await Expenses.aggregate([
        { $skip: skip },
        { $limit: limit }
    ]);
    
      res.render('expenses-list', { 
        expenses: expenses, 
        currentPage: page, 
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  };


// Function to calculate total amount from an array of expenses
const calculateTotalAmount = (expenses) => {
    // Initialize total amount
    let totalAmount = 0;

    // Loop through each expense and add its amount to the total
    for (const expense of expenses) {
        totalAmount += expense.amount;
    }

    return totalAmount;
};

// Acc Dashboard
export const accDashboard = async (req, res) => {
    try {
        // Function to determine the time of the day
        const getTimeOfDay = () => {
            const currentHour = new Date().getHours();

            if (currentHour >= 5 && currentHour < 12) {
                return 'Good Morning';
            } else if (currentHour >= 12 && currentHour < 18) {
                return 'Good Afternoon';
            } else {
                return 'Good Evening';
            }
        };

        const usersCount = await User.countDocuments();
        const staffsCount = await Staffs.countDocuments();
        const ipAddressCount = await IPAddress.countDocuments();

        // Determine the time of the day
        const greeting = getTimeOfDay();

        // Call the function to sum all transactions amount
        const totalAmount = await sumTransactionsAmount();
        const totalPercent = await sumTotalPercentAmount();
        const totalOwner = await sumOwnerPercent();
        const totalBuyerTenant = await sumBuyerTenantPercent();

        // Fetch all expenses from the database
        const allExpenses = await Expenses.find();

        // Calculate total amount of expenses
        const totalExpensesAmount = calculateTotalAmount(allExpenses);

        const user = req.isAuthenticated() ? req.user : null;

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const sudo = user && user.sudo ? user.sudo : false;

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const accountant = user && user.accountant ? user.accountant : false;

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const manager = user && user.manager ? user.manager : false;

        const role = user ? user.role : null; // Get user role if user is authenticated


        // Render the apply page with the necessary data
        res.render('acc-dashboard', {
            user,
            accountant,
            sudo,
            role,
            manager,
            greeting,
            totalExpensesAmount,
            usersCount,
            totalAmount,
            totalPercent,
            totalOwner,
            totalBuyerTenant,
            staffsCount,
            ipAddressCount
        });
    } catch (error) {
        console.error('Error rendering the page:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Delete Expenses data
export const deleteExpenses = async (req, res) => {
    try {
      await Expenses.deleteOne({ _id: req.params.id });
      res.render("success/delete-expenses");
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Expenses data
export const deleteTransactions = async (req, res) => {
  try {
    await Transactions.deleteOne({ _id: req.params.id });
    res.render("success/delete-transactions");
  } catch (error) {
    console.log(error);
  }
};

  // Get expenses page
export const editExpenses = async (req, res) => {
    const locals = {
      title: "Edit expenses",
      description: "This is the edit expenses page.",
    };
  
    // Function to determine the time of the day
    const getTimeOfDay = () => {
      const currentHour = new Date().getHours();
  
      if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };
  
    try {
      const expenses = await Expenses.findOne({ _id: req.params.id });
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      const user = req.isAuthenticated() ? req.user : null;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;

      const role = user ? user.role : null; // Get user role if user is authenticated
  
      res.render("expenses-update", {
        locals,
        expenses,
        greeting,
        user,
        sudo,
        role,
        accountant,
        manager,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      // Handle errors gracefully
      console.error(error.message);
      res.status(404).send("User not found");
    }
  };


  // Update Admin Expenses record
export const updateExpenses = async (req, res) => {
    try {
      const { id } = req.params; // Extract the ID of the record to be updated
  
      // Find the existing Expensess record by ID and update its fields
      const updatedExpenses = await Expenses.findByIdAndUpdate(id, req.body, { new: true });
  
      // Check if the Expensess record exists
      if (!updatedExpenses) {
        return res.status(404).json({ message: 'Expenses record not found' });
      }
  
      // Respond with the updated Expensess record
      res.status(200).render('success/expenses-update', { updatedExpenses });
    } catch (error) {
      console.error('Error updating Expensess record:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Transaction Contollers

// Controller function to create a new Expenses
export const createTransactions = async (req, res) => {
  try {
    // Extracting data from request body
    const { 
      date,
      aid,
      ownerName,
      buyerName,
      tenantName,
      amount,
      createdBy,
      username,
      comments
    } = req.body;

    // Calculate ownerPercent and buyerTenantPercent based on 5% of the amount
    const ownerPercent = amount * 0.05;
    const buyerTenantPercent = amount * 0.05;
    const totalPercentAmount = ownerPercent + buyerTenantPercent;

    // Create a new Transactions object with form data
    const TransactionsForm = new Transactions({
      date,
      aid,
      ownerName,
      buyerName,
      tenantName,
      amount,
      ownerPercent,
      buyerTenantPercent,
      totalPercentAmount,
      createdBy,
      username,
      comments,
      createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
      updatedAt: new Date()
    });

    // Saving the Transactions to the database
    const savedTransactions = await TransactionsForm.save();

    // Call the function to sum all transactions amount
    const totalAmount = await sumTransactionsAmount();

    // Sending a success response with total amount
    res.status(201).render('success/transactions', { totalAmount }); // Pass totalAmount to the view or handle it as needed
    console.log(savedTransactions);
  } catch (error) {
    // Sending an error response
    res.status(400).json({ error: error.message });
  }
};



  // Render transactions Form
  export const transactionsForm = async (req, res) => {

    // Function to determine the time of the day
    const getTimeOfDay = () => {
      const currentHour = new Date().getHours();
  
      if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };
  
    try {
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Check if the user is authenticated
      const user = req.isAuthenticated() ? req.user : null;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;

      const role = user ? user.role : null; // Get user role if user is authenticated
  
      // Render the apply page with the necessary data
      res.render('transaction', {
        user,
        greeting,
        sudo,
        role,
        accountant,
        manager
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  // Get All transactions Controller
export const getAllTransactions = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Transactions.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    // Fetch all users from the database
    // const users = await User.find({}, '-password'); // Exclude password field from the response
    const transactions = await Transactions.aggregate([
      { $skip: skip },
      { $limit: limit }
  ]);
  
    res.render('transaction-list', { 
      transactions: transactions, 
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};

  // Get All transactions Controller
export const ownerPercent = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Transactions.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    // Fetch all users from the database
    // const users = await User.find({}, '-password'); // Exclude password field from the response
    const transactions = await Transactions.aggregate([
      { $skip: skip },
      { $limit: limit }
  ]);
  
    res.render('owner-percent', { 
      transactions: transactions, 
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};

// Update transactions data

  // Get expenses page
  export const getUpdateTransactions = async (req, res) => {
    const locals = {
      title: "Edit expenses",
      description: "This is the edit expenses page.",
    };
  
    // Function to determine the time of the day
    const getTimeOfDay = () => {
      const currentHour = new Date().getHours();
  
      if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };
  
    try {
      const transactions = await Transactions.findOne({ _id: req.params.id });
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      const user = req.isAuthenticated() ? req.user : null;

      const role = user ? user.role : null; // Get user role if user is authenticated
  
      res.render("transactions-update", {
        locals,
        transactions,
        greeting,
        user,
        role,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      // Handle errors gracefully
      console.error(error.message);
      res.status(404).send("User not found");
    }
  };


  // Update Admin Transaction record
export const updateTransactions = async (req, res) => {
    try {
      const { id } = req.params; // Extract the ID of the record to be updated
  
      // Find the existing Transactions record by ID and update its fields
      const updatedTransaction = await Transactions.findByIdAndUpdate(id, req.body, { new: true });
  
      // Check if the Transactions record exists
      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transaction record not found' });
      }
  
      // Respond with the updated Transactions record
      res.status(200).render('success/Transaction-update', { updatedTransaction });
    } catch (error) {
      console.error('Error updating Transactions record:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };