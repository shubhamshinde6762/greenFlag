import express from 'express';
import { loginUser } from '../controller/loginController';

const router = express.Router();

router.post('/userlogin', loginUser);


export default router;