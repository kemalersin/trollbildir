/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

var all = {
    env: process.env.NODE_ENV,

    root: path.normalize(`${__dirname}/../../..`),

    clientPort: process.env.CLIENT_PORT || 3000,

    port: process.env.PORT || 9000,

    blockUrl: process.env.BLOCK_URL,
    blockRoute: process.env.BLOCK_ROUTE,

    ip: process.env.IP || '0.0.0.0',

    seedDB: false,

    secrets: {
        session: process.env.SESSION_SECRET
    },

    mongo: {
        options: {
            db: {
                safe: true
            },
            useNewUrlParser: true
        }
    },

    twitter: {
        clientID: process.env.TWITTER_ID || 'id',
        masterUser: process.env.TWITTER_MASTER || '',
        clientSecret: process.env.TWITTER_SECRET || 'secret',
        callbackURL: `${process.env.DOMAIN || ''}/auth/twitter/callback`
    }
};

module.exports = _.merge(
    all,
    require('./shared').default,
    require(`./${process.env.NODE_ENV}.js`) || {});
