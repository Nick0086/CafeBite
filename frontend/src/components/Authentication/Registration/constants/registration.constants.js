import { Coffee, MapPin, Phone, User } from "lucide-react";

export const authQueryKeys = {
    COUNTRY: 'all-country',
    STATE: 'state-by-country',
    CITY: 'city-by-state',
    CURRENCY: 'currency',
};

export const registerFormDefaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    cafeName: '',
    cafeDescription: '',
    cafeLogo: undefined,
    cafeAddress: '',
    cafeCity: '',
    cafeState: '',
    cafeCountry: '',
    cafeZip: '',
    cafeCurrency: '',
    cafePhone: '',
    cafeEmail: '',
    cafeWebsite: '',
    socialInstagram: '',
    socialFacebook: '',
    socialTwitter: '',
};

export const stepFieldMap = {
    1: ['firstName', 'lastName', 'email', 'phoneNumber', 'password'],
    2: ['cafeName', 'cafeDescription', 'cafeLogo'],
    3: ['cafeAddress', 'cafeCity', 'cafeCountry', 'cafeCurrency', 'cafeState', 'cafeZip'],
    4: ['cafePhone'],
};

export const getStepIcon = (stepNumber, currentStep) => {
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;

    const bgColor = isActive
        ? "bg-indigo-500"
        : isCompleted
            ? "bg-indigo-100"
            : "bg-gray-200";
    const textColor = isActive || isCompleted
        ? "text-indigo-500"
        : "text-gray-500";

    const iconClass = `w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${isActive ? 'text-white' : textColor}`;
    const textClass = `text-sm mt-1 font-medium ${textColor}`;

    const icons = { 1: User, 2: Coffee, 3: MapPin, 4: Phone };
    return { Icon: icons[stepNumber], iconClass, textClass };
};

export const getStepLabel = (stepNumber) => {
    const labels = { 1: 'Account', 2: 'Basic Info', 3: 'Location', 4: 'Contact' };
    return labels[stepNumber];
};
