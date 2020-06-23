'use strict';

import * as service from '../mail.service';

exports.sendMail = function(email, name, passwordResetCode) {
  return service.sendMail(
    'password-reset', {
      subject: 'Parola Sıfırlama',
      recipient: email,
      locals: {
        name,
        email,
        title: 'Parola Sıfırlama',
        code: passwordResetCode,
        url: process.env.DOMAIN + '/parola-sifirlama',
      }
    }
  );
};
