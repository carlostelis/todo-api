const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcrypt = require('bcryptjs');
const middleware = require('./middleware.js')(db);

let todos = [];
let todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API root');
});

app.get('/todos', middleware.requiereAutenticacion, function(req, res) {
    var queryParams = req.query;
    var whereObj = { userId: req.user.get('id')};

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
});

app.get('/todos/:id', middleware.requiereAutenticacion, function(req, res) {
    let todoId = parseInt(req.params.id);
    console.log(`Pidiendo ${todoId}`);

    const Todo = db.todo;
    Todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then((todo) => {
        if (!!todo) {
            console.log(todo.toJSON());
            res.send(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(404).send();
    });
});

app.post('/todos', middleware.requiereAutenticacion, middleware.requiereAutenticacion, function(req, res) {
    var body = _.pick(req.body, 'completado', 'descripcion');
    console.log(body);

    let Todo = db.todo;

    Todo.create(body).then((todo) => {
        req.user.addTodo(todo).then(() => {
            return todo.reload();
        }).then((todo) => {
            res.json(todo.toJSON());
        });
    }).catch((error) => {
        console.log(error);
        res.status(400).json(error);
    });
});

app.delete('/todos/:id', middleware.requiereAutenticacion, function(req, res) {
    var todoId = parseInt(req.params.id);

    const Todo = db.todo;
    Todo.destroy( {
        where : {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then((borrados) => {
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
});

app.put('/todos/:id', middleware.requiereAutenticacion, function(req, res) {
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
    Todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then((todo) => {
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
    let body = _.pick(req.body, 'email', 'password');
    let userInstance;

    db.user.autenticar(body).then((user) => {
        let token = user.generarToken('autenticacion');
        userInstance = user;

        return db.token.create({
            token: token
        });
    }).then((tokenInstance) => {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch((error) => {
        console.log(error);
        res.status(401).send();
    });
});

app.delete('/users/login', middleware.requiereAutenticacion, (req, res) => {
    req.token.destroy().then(() => {
        res.status(204).send();
    }).catch(() => {
        res.status(500).send();
    });
});

db.sequelize.sync({
    //force:true
}).then(() => {
    app.listen(PORT, function() {
        console.log(`Express escuchando en puerto ${PORT}`);
    });
});
