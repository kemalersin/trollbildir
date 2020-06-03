/**
 * Main application routes
 */

import path from 'path';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';

import errors from './components/errors';
import config from './config/environment';

export default function (app) {
    // Insert routes below
    var env = process.env.NODE_ENV;

    app.use('/api/logs', require('./api/log'));
    app.use('/api/stats', require('./api/stat'));
    app.use('/api/images', require('./api/image'));
    app.use('/api/spams', require('./api/spam'));
    app.use('/api/reports', require('./api/report'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/members', require('./api/member'));
    app.use('/auth', require('./auth').default);
    
    app.set('appPath', path.join(config.root, 'client'));

    app.use(express.static(app.get('appPath')));
    
    if(env === 'production') {
        app.use('/', expressStaticGzip(app.get('appPath')));
    }

    console.log(app.get('appPath'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the app.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
        });
}
