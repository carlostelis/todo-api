module.exports = function (db) {
    return {
        requiereAutenticacion: function (req, res, next) {
            let token = req.get('Auth');
            db.user.findByToken(token).then(function (user) {
                req.user = user;
                next();
            }, function () {
                res.status(401).send();
            });
        }
    };
}
