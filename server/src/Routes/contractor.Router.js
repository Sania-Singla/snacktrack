import express from 'express';
export const contractorRouter = express.Router();
import { upload, verifyJwt } from '../Middlewares/index.js';

import {
    getStudents,
    registerStudent,
    removeAllStudents,
    removeStudent,
    updateStudent,
    addSnack,
    deleteSnack,
    updateSnack,
    toggleSnackAvailability,
    addItem,
    deleteItem,
    updateItem,
    toggleItemAvailability,
} from '../Controllers/contractor.Controller.js';

contractorRouter.use(verifyJwt);

// student management

contractorRouter
    .route('/students')
    .get(getStudents)
    .post(registerStudent)
    .delete(removeAllStudents);

contractorRouter
    .route('/students/:studentId')
    .delete(removeStudent)
    .patch(updateStudent);

// snack management

contractorRouter.route('/snacks').post(upload.single('image'), addSnack);

contractorRouter
    .route('/snacks/:snackId')
    .delete(deleteSnack)
    .patch(upload.single('image'), updateSnack);

contractorRouter
    .route('/snacks/availability/:snackId')
    .patch(toggleSnackAvailability);

// packaged food management

contractorRouter.route('/packaged').post(addItem);

contractorRouter
    .route('/packaged/:itemId')
    .delete(deleteItem)
    .patch(updateItem);

contractorRouter
    .route('/packaged/availability/:itemId')
    .patch(toggleItemAvailability);
