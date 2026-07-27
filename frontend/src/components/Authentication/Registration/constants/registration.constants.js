import { CheckCircle2, Coffee, MapPin, Phone, User } from "lucide-react";

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
    cafeCurrency: 'INR',
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
    3: ['cafeAddress', 'cafeState', 'cafeCity', 'cafeZip'],
    4: ['cafePhone'],
};

export const getStepIcon = (stepNumber, currentStep) => {
    const isActive = stepNumber === currentStep;
    const isCompleted = stepNumber < currentStep;

    let iconClass;
    let textClass;

    if (isActive) {
        iconClass = `w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white`;
        textClass = `text-[11px] mt-1.5 font-semibold text-indigo-600`;
    } else if (isCompleted) {
        iconClass = `w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600`;
        textClass = `text-[11px] mt-1.5 font-semibold text-indigo-500`;
    } else {
        iconClass = `w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-400`;
        textClass = `text-[11px] mt-1.5 font-semibold text-gray-400`;
    }

    const icons = { 1: User, 2: Coffee, 3: MapPin, 4: Phone };
    // For completed steps, show a checkmark overlay via the completed icon
    const CompletedIcon = CheckCircle2;
    const Icon = isCompleted ? CompletedIcon : icons[stepNumber];

    return { Icon, iconClass, textClass };
};

export const getStepLabel = (stepNumber) => {
    const labels = { 1: 'Account', 2: 'Cafe Info', 3: 'Location', 4: 'Contact' };
    return labels[stepNumber];
};
