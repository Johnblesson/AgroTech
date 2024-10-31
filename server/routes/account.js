import { Router } from "express";
const router = Router();

import { 
    expensesForm, 
    createExpenses, 
    getAllExpenses, 
    accDashboard, 
    deleteExpenses, 
    editExpenses, 
    updateExpenses, 
    createTransactions, 
    transactionsForm, 
    getAllTransactions,
    ownerPercent,
    deleteTransactions,
    updateTransactions,
    getUpdateTransactions
} from "../controllers/account.js";

import { 
    createNewStaffs, 
    createNewSalaries, 
    addStaffsForm, 
    addSalariesForm, 
    getAllStaffs, 
    getAllSalaries, 
    deleteStaffs, 
    deleteSalaries, 
    editstaff, 
    updatestaff,
    viewstaff
} from "../controllers/staffs.js";

import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAccountant } from "../middlewares/isAccountant.js";
import { checkSudoMiddleware } from '../middlewares/sudo.js';
import { checkManagerMiddleware } from '../middlewares/manager.js'

// Expenses Routes
router.get("/expenses-form", ensureAuthenticated, isAccountant, isAdmin, expensesForm);
router.post("/expenses", ensureAuthenticated, isAccountant, isAdmin, createExpenses);
router.get("/all-expenses", ensureAuthenticated, isAccountant, isAdmin, getAllExpenses);
router.get("/account", ensureAuthenticated, isAccountant, isAdmin, accDashboard);
router.delete("/delete-expenses/:id", ensureAuthenticated, isAccountant, isAdmin, deleteExpenses);
router.get("/delete-expenses/:id", ensureAuthenticated, isAccountant, isAdmin, deleteExpenses);
router.get("/edit-expenses/:id", ensureAuthenticated, isAccountant, isAdmin, editExpenses);
router.patch("/update-expenses/:id", ensureAuthenticated, isAccountant, isAdmin, updateExpenses);

// Transactions Routes
router.post("/transaction-form", ensureAuthenticated, isAccountant, isAdmin, createTransactions)
router.get("/transaction-form", ensureAuthenticated, isAccountant, isAdmin, transactionsForm)
router.get("/all-transactions", ensureAuthenticated, isAccountant, isAdmin, getAllTransactions)
router.get("/owner-percent", ensureAuthenticated, isAccountant, isAdmin, ownerPercent)
router.get("/buyer-percent", ensureAuthenticated, isAccountant, isAdmin, ownerPercent)

// Delete Transactions
router.delete("/delete-transactions/:id", ensureAuthenticated, isAccountant, isAdmin, deleteTransactions)
router.get("/delete-transactions/:id", ensureAuthenticated, isAccountant, isAdmin, deleteTransactions)

// Upadte Transactions
router.get("/edit-transactions/:id", ensureAuthenticated, isAccountant, isAdmin, getUpdateTransactions);
router.patch("/update-transactions/:id", ensureAuthenticated, isAccountant, isAdmin, updateTransactions);

// Staffs and Salary Routes
router.post("/add-staffs", ensureAuthenticated, isAccountant, isAdmin, createNewStaffs);
router.post("/add-salaries", ensureAuthenticated, isAccountant, isAdmin, createNewSalaries);
router.get("/add-staffs-form", ensureAuthenticated, isAccountant, isAdmin, addStaffsForm);
router.get("/add-salaries-form", ensureAuthenticated, isAccountant, isAdmin, addSalariesForm);
router.get("/all-staffs", ensureAuthenticated, isAccountant, isAdmin, getAllStaffs);
router.get("/all-salaries", ensureAuthenticated, isAccountant, isAdmin, getAllSalaries);
router.patch("/update-staff/:id", ensureAuthenticated, checkManagerMiddleware, isAdmin, updatestaff);
router.get("/edit-staff/:id", ensureAuthenticated, isAccountant, isAdmin, editstaff);
router.get("/view-staff/:id", ensureAuthenticated, isAccountant, isAdmin, viewstaff);

// Delete staffs
router.delete("/delete-staffs/:id", ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteStaffs)
router.get("/delete-staffs/:id", ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteStaffs)

// Delete Salaries 
router.delete("/delete-salaries/:id", ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteSalaries)
router.get("/delete-salaries/:id", ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteSalaries)

export default router;