var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': `${__dirname}/basic-sqlite-database.sqlite`,
});

var Todo = sequelize.define('todo', {
    descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]    //longitud >= 1 && <= 250
        }
    },
    completado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

const User = sequelize.define('user', {
    email: Sequelize.STRING
});

// Relaciones, crea llaves foráneas

// Un todo pertenece a un usuario
Todo.belongsTo(User)
// un usuario tiene muchos todos
User.hasMany(Todo);

sequelize.sync({
    //force: true
}).then(() => {
    console.log('Everything is synced');

    User.findById(1).then((user) => {
        // Crea métodos get para el tipo de objeto
        user.getTodos({ where: { completado: false }}).then((todos) => {
            todos.forEach((todo) => {
                console.log(todo.toJSON());
            });
        });
    });

    // User.create({
    //     email: 'carlos.telis@outlook.com'
    // }).then(() => {
    //     return Todo.create({
    //         descripcion: 'Limpiar jardin'
    //     });
    // }).then((todo) => {
    //     User.findById(1).then((user) => {
    //         user.addTodo(todo); // Crea métodos get para el tipo de objeto
    //     });
    // });
});
