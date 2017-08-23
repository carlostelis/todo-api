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

sequelize.sync(/*{force: true}*/).then(() => {
    console.log('Everything is synced');

    Todo.findById(2).then((todo) => {
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('No encontrado');
        }
    });


    // Todo.create({
    //     descripcion: 'Caminar con el perro',
    //     completado: false
    // }).then((todo) => {
    //     return Todo.create({
    //         descripcion: 'Limpiar el cuarto',
    //         completado: true
    //     }).then(() => {
    //         //return Todo.findById(1);
    //         return Todo.findAll({
    //             where: {
    //                 descripcion: {
    //                     $like: '%cuarto%'
    //                 }
    //             }
    //         });
    //     }).then((todos) => {
    //         if (todos) {
    //             todos.forEach((todo) => {
    //                 console.log(todo.toJSON());
    //             });
    //         } else {
    //             console.log('No encontrado');
    //         }
    //     });
    // }).catch((error) => {
    //     console.log(error);
    // });
});
