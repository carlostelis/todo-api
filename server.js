var express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
let todos = [{
    id: 1,
    descripcion: 'Ver a mamá para almorzar',
    completado: false,
}, {
    id: 2,
    description: 'Ir al mercado',
    completado: false
}, {
    id: 3,
    description: 'Trabajar',
    completado: true
}];

app.get('/', function(req, res) {
    res.send('Todo API root');
});

app.get('/todos', function(req, res) {
    // json() se encarga de decidir si usar parse o stringify para enviar
    res.json(todos);
});

app.get('/todos/:id', function(req, res) {
    console.log(`Pidiendo ${req.params.id}`);

    todos.forEach(function(todo) {
        // El parámetro viene como tipo string
        if (todo.id === parseInt(req.params.id, 10)) {
            res.json(todo);
        }
    });

    // Recurso no encontrado
    res.status(404).send();
});

app.listen(PORT, function() {
    console.log(`Express escuchando en puerto ${PORT}`);
});
