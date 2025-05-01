import { Coffee, MapPin, Phone, User } from "lucide-react";

export const registerFormDefaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    cafeName: "",
    cafeDescription: "",
    cafeLogo: "",
    cafeAddress: "",
    cafeCity: "",
    cafeState: "",
    cafeCountry: "",
    cafeZip: "",
    cafeCurrency: "",
    cafePhone: "",
    cafeEmail: "",
    cafeWebsite: "",
    socialInstagram: "",
    socialFacebook: "",
    socialTwitter: "",
};

export const queryKeyLoopUp = {
    COUNTRY: 'all-country',
    STATE: 'state-by-country',
    CITY: 'city-by-state',
    CURRENCY: 'currency',
};

export const getStepIcon = (stepNumber, currentStep) => {
    const isActive = stepNumber === currentStep
    const isCompleted = stepNumber < currentStep

    let bgColor = "bg-gray-200"
    let textColor = "text-gray-400"

    if (isActive) {
        bgColor = "bg-indigo-500"
        textColor = "text-white"
    } else if (isCompleted) {
        bgColor = "bg-indigo-100"
        textColor = "text-indigo-500"
    }

    const iconClass = `w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${textColor}`
    const textClass = `text-sm mt-1 font-medium ${isActive ? "text-indigo-500" : isCompleted ? "text-indigo-500" : "text-gray-500"}`

    let Icon

    switch (stepNumber) {
        case 1:
            Icon = User
            break
        case 2:
            Icon = Coffee
            break
        case 3:
            Icon = MapPin
            break
        case 4:
            Icon = Phone
            break
    }

    return { Icon, iconClass, textClass }
}

export const getStepLabel = (stepNumber) => {
    switch (stepNumber) {
        case 1:
            return "Account"
        case 2:
            return "Basic Info"
        case 3:
            return "Location"
        case 4:
            return "Contact"
    }
}