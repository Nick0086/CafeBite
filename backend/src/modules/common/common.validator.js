import { param } from "express-validator";

export const fetchStatesByCountryValidator = [
    param("country")
        .notEmpty().withMessage("Country ID is required")
        .trim()
];

export const fetchCitiesByStateValidator = [
    param("state")
        .notEmpty().withMessage("State ID is required")
        .trim()
];
