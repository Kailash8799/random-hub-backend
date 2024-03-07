import express from 'express'
import { contactController } from '../../controller/contact/contact';
const router = express.Router();

router.post("/", contactController);

export default router