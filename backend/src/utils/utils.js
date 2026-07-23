import moment from 'moment-timezone';

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

export const getCurrentTime = () => {
    return moment().tz('Asia/Kolkata').set({ second: 0 }).format('YYYY-MM-DD HH:mm:ss');
}
