import svgCaptcha from 'svg-captcha';

export function create(req, res) {
    var captcha = svgCaptcha.createMathExpr({
        color: true,
        width: 75,
        height: 45,
        fontSize: 45
    });

    req.session.captcha = captcha.text;
    
    res.type('svg');
    res.status(200).send(captcha.data);
}
