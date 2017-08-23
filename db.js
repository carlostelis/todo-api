var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': `${__dirname}/data/dev-todo-api-database.sqlite`,
});

var db = {};

// Esta función pasa los parámetros de sequelize y DataTypes a la función
db.todo = sequelize.import(`${__dirname}/models/todo.js`);
db.user = sequelize.import(`${__dirname}/models/user.js`);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;