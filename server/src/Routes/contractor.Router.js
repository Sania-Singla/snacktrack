import express from 'express';
export const contractorRouter = express.Router();
import { upload, verifyJwt } from '../Middlewares/index.js';

import {
    getStudents,
    register,
    completeRegistration,
    updateAccountDetails,
    registerStudent,
    removeAllStudents,
    removeStudent,
    updateStudentAccountDetails,
    addSnack,
    deleteSnack,
    updateSnackDetails,
    toggleSnackAvailability,
    addItem,
    deleteItem,
    updateItemDetails,
} from '../Controllers/contractor.Controller.js';

contractorRouter.route('/register').post(register);

contractorRouter.route('/complete-registeration').post(completeRegistration);

contractorRouter.use(verifyJwt);

// personal usage
contractorRouter.route('/account').patch(updateAccountDetails);

// student management tasks
contractorRouter
    .route('/students')
    .get(getStudents)
    .post(registerStudent)
    .delete(removeAllStudents);
contractorRouter
    .route('/students/:studentId')
    .delete(removeStudent)
    .patch(updateStudentAccountDetails);

// snack management tasks
contractorRouter.route('/snacks').post(upload.single('image'), addSnack);
contractorRouter
    .route('/snacks/:snackId')
    .delete(deleteSnack)
    .patch(upload.single('image'), updateSnackDetails);
contractorRouter
    .route('/snacks/availability/:snackId')
    .patch(toggleSnackAvailability);

// packaged food management tasks
contractorRouter.route('/packaged').post(addItem);
contractorRouter
    .route('/packaged/:itemId')
    .delete(deleteItem)
    .patch(updateItemDetails);
