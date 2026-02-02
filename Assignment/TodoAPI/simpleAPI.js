const http = require('http');

let todos = [];   // in-memory storage
let idCounter = 1;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // GET all todos
  if (req.method === 'GET' && req.url === '/todos') {
    res.end(JSON.stringify(todos));
    return;
  }

  // POST create todo
  if (req.method === 'POST' && req.url === '/todos') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const data = JSON.parse(body);

      const newTodo = {
        id: idCounter++,
        task: data.task,
        done: false
      };

      todos.push(newTodo);
      res.end(JSON.stringify(newTodo));
    });
    return;
  }

  // PUT update todo
  if (req.method === 'PUT' && req.url.startsWith('/todos/')) {
    const id = Number(req.url.split('/')[2]);
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const data = JSON.parse(body);
      const todo = todos.find(t => t.id === id);

      if (!todo) {
        res.statusCode = 404;
        res.end(JSON.stringify({ msg: 'Todo not found' }));
        return;
      }

      todo.task = data.task;
      todo.done = data.done;

      res.end(JSON.stringify(todo));
    });
    return;
  }

  // DELETE todo
  if (req.method === 'DELETE' && req.url.startsWith('/todos/')) {
    const id = Number(req.url.split('/')[2]);

    todos = todos.filter(t => t.id !== id);
    res.end(JSON.stringify({ msg: 'Todo deleted' }));
    return;
  }

  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({ msg: 'Route not found' }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
