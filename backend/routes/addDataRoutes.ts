import express from 'express';
import { addUsers } from '../controller/addDataController';

const router = express.Router();

router.post('/users', addUsers);


export default router;