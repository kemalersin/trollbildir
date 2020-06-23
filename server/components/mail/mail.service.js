'use strict';

import path from 'path';
import nodemailer from 'nodemailer';

var EmailTemplate = require('email-templates').EmailTemplate;

import config from '../../config/environment';

export function getMailTemplate(templateName) {
    return new Promise((resolve, reject) => {
        try {
            let templateDir = path.join(__dirname, 'templates', 'pages', templateName);
            let template = new EmailTemplate(templateDir);

            resolve(template);
        }
        catch (err) {
            reject(err);
        }
    });
}

export function sendMail(templateName, info) {
    return getMailTemplate(templateName)
        .then(template =>
            template.render(info.locals)
                .then(async (rendered) => {
                    var transporter = nodemailer.createTransport({
                        host: config.mail.host,
                        port: config.mail.port,
                        secure: true,
                        auth: {
                            user: config.mail.user,
                            pass: config.mail.pass
                        }
                    });

                    return await transporter.sendMail({
                        from: config.mail.from,
                        to: info.recipient,
                        subject: info.subject,
                        html: rendered.html,
                        text: rendered.text
                    }, console.log);
                })
                .catch(console.log)
        )
        .catch(console.log);
}