import { Router } from "express";
import * as commonController from "./common.controller.js";
import validate from "../../middleware/validate.middleware.js";
import { fetchStatesByCountryValidator, fetchCitiesByStateValidator } from "./common.validator.js";

const router = Router();

router.get("/country", commonController.fetchAllCountries);
router.get("/state/:country", fetchStatesByCountryValidator, validate, commonController.fetchStatesByCountry);
router.get("/city/:state", fetchCitiesByStateValidator, validate, commonController.fetchCitiesByState);
router.get("/currency", commonController.fetchAllCurrencies);

export default router;
