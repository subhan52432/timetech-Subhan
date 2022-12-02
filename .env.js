require('colors');

const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
};

const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: '8000',
    Meta_WA_accessToken:'EAAJRJLa6zZC4BAF5oxUH4zE4eZCsZAd20ZC4TNxe2Qy5hRZCcxFWcONDVq5CGfcOlvRnme6ZBq4gALEwdcpIZCxhXHDyJun95xmd6zIkPBRxErD864EMP6nQHF1yd32OwFCTBIrYx2HfrG47vueIdVlMV2QHYgSlhG7zPdBwEKk9tJT2J9F6xWYWZAFjpoypozorFbdlLmSctTTearVrEFA9',
    Meta_WA_SenderPhoneNumberId: '110385328550555',
    Meta_WA_wabaId: '100593762880759',
    Meta_WA_VerifyToken: "HelloItsMe",
    Version: 'v15.0',
    MONGO_URI: "mongodb+srv://zibbleweb:Zibbletech2022@cluster0.vvpfxot.mongodb.net/TimeTechWhatsaapAttendance?retryWrites=true&w=majority"
};

const fallback = {
    ...process.env,
    NODE_ENV: undefined,
};

module.exports = (environment) => {
    console.log(`Execution environment selected is: "${environment.red}"`);
    if (environment === 'production') {
        return production;
    } else if (environment === 'development') {
        return development;
    } else {
        return fallback;
    }
};