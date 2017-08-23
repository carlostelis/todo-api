const bcrypt = require('bcryptjs');
const _ = require('underscore');

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
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });

    return user;
}