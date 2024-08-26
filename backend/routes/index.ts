import express from 'express';
import addDataRouter from './addDataRoutes';
import loginRouter from './loginRoutes';

const router = express.Router();

router.use('/addData', addDataRouter); 
router.use('/login', loginRouter); 

export default router;