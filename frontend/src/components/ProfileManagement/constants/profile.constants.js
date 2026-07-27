export const profileFieldMap = {
    'first_name': 'firstName',
    'last_name': 'lastName',
    'email': 'email',
    'mobile': 'phoneNumber',
    'cafe_name': 'cafeName',
    'cafe_description': 'cafeDescription',
    'address_line1': 'cafeAddress',
    'country_id': 'cafeCountry',
    'state_id': 'cafeState',
    'city_id': 'cafeCity',
    'postal_code': 'cafeZip',
    'currency_code': 'cafeCurrency',
    'cafe_phone': 'cafePhone',
    'cafe_email': 'cafeEmail',
    'cafe_website': 'cafeWebsite',
    'social_instagram': 'socialInstagram',
    'social_facebook': 'socialFacebook',
    'social_twitter': 'socialTwitter',
};

export const profileFormDefaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    cafeName: '',
    cafeDescription: '',
    cafeLogo: undefined,
    cafeAddress: '',
    cafeCountry: '',
    cafeState: '',
    cafeCity: '',
    cafeZip: '',
    cafeCurrency: '',
    cafePhone: '',
    cafeEmail: '',
    cafeWebsite: '',
    socialInstagram: '',
    socialFacebook: '',
    socialTwitter: '',
};

export const permissionsToFormValues = (permissions) => {
    if (!permissions) return profileFormDefaultValues;
    return Object.entries(profileFieldMap).reduce((acc, [apiKey, formKey]) => {
        acc[formKey] = permissions[apiKey] ?? '';
        return acc;
    }, { ...profileFormDefaultValues });
};
