'use strict';

const express = require('express');

function createServer() {
  // Use express to create a server
  // Add a routes to the server
  // Return the server (express app)
  const app = express();
  let users = [];
  let expenses = [];

  app.use(express.json());

  app
    .route('/users')
    .get((request, response) => {
      if (users.length === 0) {
        return response.status(200).json(users);
      } else {
        response.status(200).json(users);
      }
    })
    .post((request, response) => {
      const { name } = request.body;

      if (!name) {
        return response.sendStatus(400);
      }

      const user = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        name: name,
      };

      users.push(user);

      return response.status(201).json(user);
    });

  app.get('/users/:id', (request, response) => {
    const { id } = request.params;

    const user = users.find((u) => u.id === parseInt(id));

    if (!user) {
      return response.sendStatus(404);
    } else {
      response.status(200).json(user);
    }
  });

  app.delete('/users/:id', (request, response) => {
    const { id } = request.params;

    const newUsers = users.filter((u) => u.id !== parseInt(id));

    if (newUsers.length === users.length) {
      return response.sendStatus(404);
    } else {
      users = newUsers;
      response.sendStatus(204);
    }
  });

  app.patch('/users/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const { name } = request.body;

    const toEdit = users.find((u) => u.id === id);

    if (!toEdit) {
      return response.sendStatus(404);
    }

    if (!name || !id) {
      return response.sendStatus(400);
    } else {
      Object.assign(toEdit, { name });

      response.status(200).json(toEdit);
    }
  });

  app
    .route('/expenses')
    .get((request, response) => {
      const userIdQuery = parseInt(request.query.userId);
      const { from, to } = request.query;
      const { categories } = request.query;

      let expenseFiltered = expenses;

      if (categories) {
        // eslint-disable-next-line max-len
        expenseFiltered = expenseFiltered.filter(
          (c) => c.category === categories,
        );
      }

      if (from || to) {
        if (from) {
          expenseFiltered = expenseFiltered.filter((d) => d.spentAt >= from);
        }

        if (to) {
          expenseFiltered = expenseFiltered.filter((d) => d.spentAt <= to);
        }
      }

      if (userIdQuery) {
        expenseFiltered = expenseFiltered.filter(
          (ex) => ex.userId === userIdQuery,
        );

        return response.status(200).json(expenseFiltered);
      }

      response.status(200).json(expenseFiltered);
    })
    .post((request, response) => {
      const { spentAt, title, category, note } = request.body;
      const userId = parseInt(request.body.userId);
      const amount = parseInt(request.body.amount);

      const isUser = users.find((u) => parseInt(u.id) === userId);

      if (!isUser) {
        return response.sendStatus(400);
      }

      const expense = {
        id: expenses.length > 0 ? expenses[expenses.length - 1].id + 1 : 1,
        userId,
        spentAt,
        title,
        amount,
        category,
        note,
      };

      expenses.push(expense);

      response.status(201).json(expense);
    });

  app
    .route('/expenses/:id')
    .get((request, response) => {
      const id = parseInt(request.params.id);

      const expense = expenses.find((ex) => ex.id === id);

      if (!expense) {
        return response.sendStatus(404);
      } else {
        response.status(200).json(expense);
      }
    })
    .patch((request, response) => {
      const { spentAt, title, amount, category, note } = request.body;
      const expenseId = parseInt(request.params.id);

      const editExpense = expenses.find((ex) => ex.id === expenseId);

      if (!editExpense) {
        return response.sendStatus(404);
      }

      if (spentAt) {
        editExpense.spentAt = spentAt;
      }

      if (title) {
        editExpense.title = title;
      }

      if (amount) {
        editExpense.amount = amount;
      }

      if (category) {
        editExpense.category = category;
      }

      if (note) {
        editExpense.note = note;
      }

      response.status(200).json(editExpense);
    })
    .delete((request, response) => {
      const expenseId = parseInt(request.params.id);

      if (!expenseId) {
        return response.sendStatus(404);
      }

      const newExpense = expenses.filter((ex) => ex.id !== expenseId);

      if (newExpense.length === expenses.length) {
        return response.sendStatus(404);
      }

      expenses = newExpense;

      response.status(204).json(expenses);
    });

  return app;
}

module.exports = {
  createServer,
};
