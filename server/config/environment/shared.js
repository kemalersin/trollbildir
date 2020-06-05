/*eslint no-process-env:0*/

export const env = process.env.NODE_ENV;
export const port = process.env.PORT || 9000;
export const spamLimitPerApp = process.env.SPAM_LIMIT_PER_APP || 900000;
export const spamLimitPerUser = process.env.SPAM_LIMIT_PER_USER || 900;
export const redirectUrl = process.env.REDIRECT_URL || 'https://twitter.com/isimsizhareket';

// List of user roles
export const userRoles = ['user', 'member', 'admin'];

export const dataLimit = 20;
export const maxFileSize = 1024 * 500;

export const errors = {
    userNotFound: "Kullanıcı bulunamadı!"
}

export default {
    env,
    port,
    errors,
    userRoles,
    dataLimit,
    maxFileSize,
    redirectUrl,
    spamLimitPerApp,
    spamLimitPerUser,
};
