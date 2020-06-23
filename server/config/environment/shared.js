/*eslint no-process-env:0*/

export const env = process.env.NODE_ENV;

export const port = process.env.PORT || 9000;
export const spamLimitPerApp = process.env.SPAM_LIMIT_PER_APP || 900000;
export const spamLimitPerUser = process.env.SPAM_LIMIT_PER_USER || 900;

export const redirectUrl = process.env.REDIRECT_URL || 'https://twitter.com/isimsizhareket';

export const EMAIL_REGEXP = /^[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}$/;

export const userRoles = ['user', 'member', 'admin'];

export const dataLimit = 20;
export const maxFileSize = 1024 * 500;
export const nameMinimumLength = 3;
export const usernameMinimumLength = 3;
export const passwordMinimumLength = 3;

export const errors = {
    wrongCaptcha: "Doğrulama kodu yanlış.",    
    userNotFound: "Kullanıcı bulunamadı.",
    incorrectPassword: "Parola hatalıdır.",
    incorrectEmail: "Hatalı e-posta adresi.",
    emailNotSent: "E-posta gönderilemedi.",
    emailExists: "E-posta adresi kullanılıyor.",    
    tryAgain: "Lütfen daha sonra tekrar deneyin.",
    usernameTaken: "Kullanıcı adı alınmış.",    
    missingUsername: "Kullanıcı adı girilmelidir.",        
    missingInformation: "Tüm alanlar doldurulmalıdır.",
    passwordMinimumLength: "Parola en az 3 karakter olmalıdır.",
    nameMinimumLength: "Tam ad en az 3 karakter olmalıdır.",    
    usernameMinimumLength: "Kullanıcı adı en az 3 karakter olmalıdır.", 
}

export const messages = {
    usernameInform: "Ayarlardan kullanıcı adı belirleyebilirsiniz."
}

export default {
    env,
    port,

    errors,  
    messages,

    userRoles,

    dataLimit,
    maxFileSize,

    redirectUrl,
    
    spamLimitPerApp,
    spamLimitPerUser,

    EMAIL_REGEXP
};
