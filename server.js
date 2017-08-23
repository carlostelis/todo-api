const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcrypt = require('bcryptjs');
let todos = [];
let todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API root');
});

app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var whereObj = {};
    if (queryParams.hasOwnProperty('completado') && queryParams.completado === 'true') {
        whereObj.completado = true;
    } else if (queryParams.hasOwnProperty('completado') && queryParams.completado === 'false') {
        whereObj.completado = false;
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        whereObj.descripcion = {
            $like: `%${queryParams.q}%`
        }
    }

    const Todo = db.todo;
    Todo.findAll( {where : whereObj }).then((todos) => {
        if (todos) {
            console.log(todos);
            res.json(todos);
        }
    }, (error) => {
        console.log(error);
        res.status(404).send();
    }).catch((error) => {
        console.log(error);
        res.status(404).send();
    });



    // SIN BASE DE DATOS
    //
    // var filtrados = todos;
    // if (queryParams.hasOwnProperty('completado') && queryParams.completado === 'true') {
    //     filtrados = _.where(filtrados, {completado: true});
    // } else if (queryParams.hasOwnProperty('completado') && queryParams.completado === 'false') {
    //     filtrados = _.where(filtrados, {completado: false});
    // }
    //
    // if (queryParams.hasOwnProperty('q')) {
    //     filtrados = _.filter(filtrados, function(todo) {
    //         return todo.descripcion.toLowerCase().includes(queryParams.q.toLowerCase());
    //     });
    // }
    //
    // // json() se encarga de decidir si usar parse o stringify para enviar
    // res.json(filtrados);
});

app.get('/todos/:id', function(req, res) {
    let todoId = parseInt(req.params.id);
    console.log(`Pidiendo ${todoId}`);

    const Todo = db.todo;
    Todo.findById(todoId).then((todo) => {
        if (!!todo) {
            console.log(todo.toJSON());
            res.send(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(404).send();
    });


    // SIN BASE DE DATOS
    //
    // retorna el primer elemento que coincide
    // var matched = _.findWhere(todos, {id: parseInt(req.params.id)});
    // console.log(matched);
    // if (matched) {
    //     res.json(matched);
    // }
    // // Recurso no encontrado
    // res.status(404).send();
});

app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'completado', 'descripcion');
    console.log(body);

    let Todo = db.todo;

    Todo.create(body).then((todo) => {
        res.json(body);
    }).catch((error) => {
        console.log(error);
        res.status(400).json(error);
    });



    //  SIN BASE DE DATOS
    //
    // if (!_.isBoolean(body.completado) || !_.isString(body.descripcion) || body.descripcion.trim().length === 0) {
    //     return res.status(400).send();
    // }
    //
    // body.descripcion = body.descripcion.trim();
    //
    // body.id = todoNextId++;
    // todos.push(body);
    //
    // console.log(body);
    // res.json(body);
});

app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    var whereObj = {
        id: todoId
    };

    const Todo = db.todo;
    Todo.destroy( {where : whereObj }).then((borrados) => {
        console.log(`Borrados: ${borrados}`);
        if (borrados > 0) {
            res.json(borrados);
        } else {
            console.log('No hay borrados');
            res.status(404).send();
        }
    }, (error) => {
        console.log(error);
        res.status(404).send();
    });



    // SIN BASE DE DATOS
    //
    // const idTodo = parseInt(req.params.id);
    // console.log(`Borrando ${idTodo}`);
    //
    // // También se podía usar _.without
    //
    // var indice = _.findIndex(todos, function(todo) {
    //     return todo.id === idTodo;
    // });
    // console.log(`Ìndice: ${indice}`);
    //
    // if (indice >= 0) {
    //     return res.json(todos.splice(indice, 1));
    // } else {
    //     return res.status(404).send();
    // }

});

app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    var whereObj = {
        id: todoId
    };

    var body = _.pick(req.body, 'completado', 'descripcion');
    var atributos = {};

    if (body.hasOwnProperty('completado')) {
        atributos.completado = body.completado;
    }

    if (body.hasOwnProperty('descripcion') && _.isString(body.descripcion) && body.descripcion.trim().length > 0) {
        atributos.descripcion = body.descripcion;
    }

    const Todo = db.todo;
    Todo.findById(todoId).then((todo) => {
        if (todo) {
            // Update se realiza sobre cada objeto encontrado,
            // en vez de en una sola consulta para todos
            return todo.update(atributos);
        } else {
            res.status(404).send();
        }
    }, (error) => {
        res.status(500).send();
    }).then((todo) => {
        res.json(todo.toJSON());
    }, (error) => {
        // Sintaxis inválida
        res.status(400).send();
    });


    // SIN  BASE DE DATOS
    //
    // const idTodo = parseInt(req.params.id);
    //
    // var body = _.pick(req.body, 'completado', 'descripcion');
    // var atributos = {};
    //
    // if (body.hasOwnProperty('completado') && _.isBoolean(body.completado)) {
    //     atributos.completado = body.completado;
    // } else if (body.hasOwnProperty('completado')) {
    //     return res.status(404).send();
    // }
    //
    // if (body.hasOwnProperty('descripcion') && _.isString(body.descripcion) && body.descripcion.trim().length > 0) {
    //     atributos.descripcion = body.descripcion;
    // } else if (body.hasOwnProperty('descripcion')) {
    //     return res.status(404).send();
    // }
    //
    // var matched = _.findWhere(todos, {id: parseInt(idTodo)});
    // if (!matched) {
    //     return res.status(404).send();
    // }
    //
    // _.extend(matched, atributos);
    //
    // console.log(matched);
    // return res.json(matched);
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, 'email', 'password');
    console.log(body);

    let User = db.user;

    User.create(body).then((user) => {
        res.json(user.toPublicJSON());
    }).catch((error) => {
        console.log(error);
        res.status(400).json(error);
    });
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, 'email', 'password');
    console.log(body);


    db.user.autenticar(body).then((user) => {
        res.json(user.toPublicJSON());
    }, (error) => {
        console.log(error);
        res.status(401).send();
    });



    // if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    //     return res.status(400).send();
    // }
    //
    // let User = db.user;
    // User.findOne({where: {
    //     email: body.email
    // }}).then((user) => {
    //     // compareSync regresa true si hay diferencias
    //     if (!user || bcrypt.compareSync(body.password, user.get('password_hash'))) {
    //         res.json(user.toPublicJSON());
    //     }
    //
    //     res.status(401).send();
    // }, (error) => {
    //     res.status(400).send();
    // });
});

db.sequelize.sync().then(() => {
    app.listen(PORT, function() {
        console.log(`Express escuchando en puerto ${PORT}`);
    });
});
