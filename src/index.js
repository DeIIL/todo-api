const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };
    users.push(user);
    return response.status(201).send(user);
  }
  return response.status(400).json({ error: "The username already exists" });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((object) => {
    return object.id == id;
  });

  if (index === -1) {
    return response
      .status(404)
      .json({ error: "Not be able to update a non existing todo" });
  }

  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return response.status(200).send(user.todos[index]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((object) => {
    return object.id == id;
  });

  if (index === -1) {
    return response
      .status(404)
      .json({ error: "Not be able to update a non existing todo" });
  }

  user.todos[index].done = true;

  return response.status(200).send(user.todos[index]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((object) => {
    return object.id === id;
  });

  if (index === -1) {
    return response
      .status(404)
      .json({ error: "Not be able to delete a non existing todo" });
  }

  user.todos.splice(index, 1);

  return response.status(204).json();
});

module.exports = app;