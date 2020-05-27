const fs = require('fs')
const stream = require('stream')

export function show(req, res, next) {
    const r = fs.createReadStream('./upload/' + req.params.id)
    const ps = new stream.PassThrough();

    stream.pipeline(
        r,
        ps,
        (err) => {
            if (err) {
                console.log(err);
                return res.sendStatus(400);
            }
        });

    ps.pipe(res);
}

export function authCallback(req, res) {
    res.sendFile('/uploads/' + req.params.id);
}
