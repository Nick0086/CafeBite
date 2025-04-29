import express from 'express';
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from '../controller/common.controller.js';

const router = express.Router();

router.get('/country', getAllCountry);
router.get('/state/:country', getStateByCountry);
router.get('/city/:state', getCityByState);
router.get('/currency', getAllCurrency);

export default router;