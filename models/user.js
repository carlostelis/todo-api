const bcrypt = require('bcryptjs');
const _ = require('underscore');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
         email: {
             type: DataTypes.STRING,
             allowNull: false,
             unique: true,
             validate: {
                 isEmail: true
             }
         },
         salt: {
             type: DataTypes.STRING
         },
         password_hash: {
             type: DataTypes.STRING
         },
         password: {
             type: DataTypes.VIRTUAL,   // No se almacena en BD
             allowNull: false,
             validate: {
                 len: [7, 100]
             },
             set: function(value) { // ACA NO FUNCIONAN LAMBDAS
                 const salt = bcrypt.genSaltSync(10);
                 const hashedPassword = bcrypt.hashSync(value, salt);
                 this.setDataValue('password', value);
                 this.setDataValue('salt', salt);
                 this.setDataValue('password_hash', hashedPassword);
             }
         }
    }, {
        hooks: {
            beforeValidate: (user, options) => {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            autenticar: function(body) {
                return new Promise(function (resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject();
                    }

                    user.findOne({where: {
                        email: body.email
                    }}).then(function(user) {
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                            return reject();
                        }

                        resolve(user);
                    }, function (error) {
                        console.log(error);
                        return reject();
                    });
                });
            },
            findByToken: function (token) {
                return new Promise((resolve, reject) => {
                    try {
                        let decodedJWT = jwt.verify(token, 'qwerty098');
                        let bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123$%&');
                        let tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        user.findById(tokenData.id).then((user) => {
                            if (user) {
                                resolve(user);
                            } else {
                                reject();
                            }
                        }, (error) => {
                            reject();
                        });
                    } catch (e) {
                        reject();
                    }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            },
            generarToken: function(type) {
                if (!_.isString(type)) {
                    return undefined;
                }

                try {
                    let stringData = JSON.stringify({id: this.get('id'), type: type});
                    let encryptedData = cryptojs.AES.encrypt(stringData, 'abc123$%&').toString();
                    let token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty098');

                    return token;
                } catch (e) {
                    return undefined;
                }
            }
        }
    });

    return user;
}
