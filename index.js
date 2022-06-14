const express = require('express');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const mongodb = require('mongodb');

// Setting up Mongodb Client
let Users;
let Tasks;

// Checking the mongodb connection with MongoClient.connect()
MongoClient.connect('mongodb://localhost:27017/', function (err, client) {
  if (err !== undefined) {
    console.log('Data base error: ' + err);
  } else {
    Users = client.db('doit').collection('users'); // users collection
    Tasks = client.db('doit').collection('tasks'); // tasks collection
    console.log('Connected to database successfully');
  }
})

const app = express(); // Initialized express app

app.use(express.json()); // parsing body as json data
app.use(express.static('./public')); // serving static files from public folder
app.use(express.urlencoded({ extended: false }));

// HTML Pages route handlers
app.get('/', (req, res) => { // home page route
  
  res.sendFile(__dirname + '/public/index.html'); // send index.html on home route
});
app.get('/login-signup', (req, res) => { // login-signup route
  res.sendFile(__dirname + '/public/login-signup.html'); // send login-signup.html
});
app.get('/tasks', (req, res) => { // tasks route
  res.sendFile(__dirname + '/public/tasks.html'); // send tasks.html
});
app.get('/add-task', (req, res) => {// add task page route
  res.sendFile(__dirname + '/public/add-task.html'); // send add-task.html on add-task route
});
app.get('/edit-task', (req, res) => {// edit task page route
  res.sendFile(__dirname + '/public/edit-task.html'); // send edit-task.html on edit-task route
});
app.get('/task-details', (req, res) => {// update task page route
  res.sendFile(__dirname + '/public/task-details.html'); // send task-details.html on update-task-details route
});

// login handler
app.post('/login', async (req, res) => {
  Users.findOne({ userName: req.body.userName }, function (err, data) {
    if (err !== undefined) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      if (!data) { // user not found
        res.status(500).json({ error: 'The user does not exist, please try again'})
      } else {
        // comparing hashed passwords with bcrypt
        if (!bcrypt.compareSync(req.body.password, data.password)) {
          res.status(400).json({ error: 'Incorrect password, please try again'});
        } else {
          // sending the id of successfully logged in user
          res.json({ _id: data._id });
        }
      }
    }
  });
});
// signup handler
app.post('/signup', async (req, res) => {
  Users.findOne({ userName: req.body.userName }, function (err, data) {
    if (err !== undefined) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      if (data) { // user found
        res.status(500).json({ error: 'This user already exists'})
      } else {
        const salt = bcrypt.genSaltSync(5); // generating salt with 5 rounds
        const hash = bcrypt.hashSync(req.body.password, salt); // generating hashed password
        Users.insertOne({ userName: req.body.userName, password: hash }, function(error, resp) {
          if (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
          } else {
            res.json({ _id: resp.insertedId });
          }
        });
      }
    }
  })
});
// login verification using _id of user
// _id of user is sent in Authorization header
async function verifyLogin(req, res, next) { // this is an express middleware function
  const _id = req.headers.authorization;
  // finding the user with id given in authorization
  Users.findOne({ _id: mongodb.ObjectId(_id) }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      if (!data) { // if user is not found
        res.status(400).json({ error: 'Not logged in, user not found' });
      } else {
        req.userData = data;
        next();
      }
    }
  });
}

// tasks router
const tasksRouter = express.Router();
tasksRouter.get('/', async (req, res) => {
  const uid = req.userData._id;
  // getting all tasks whose user id is supplied

  Tasks.find({ uid: uid }).toArray(function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ tasks: data });
    }
  });
});
tasksRouter.post('/add', async (req, res) => {
  const uid = req.userData._id;
  // along with all properties of a task, save the user id in database
  const task = req.body;
  Tasks.insertOne({ ...task, uid: uid }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ tasks: data });
    }
  });
});
tasksRouter.put('/edit/:_id', async (req, res) => {
  // Replace the old document with the new one
  Tasks.findOneAndReplace({ _id: mongodb.ObjectId(req.params._id) }, { ...req.body, uid: req.userData._id }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: data });
    }
  });
});
tasksRouter.delete('/:_id', async (req, res) => { // :_id is request parameter

  // deleting the task whose id is supplied
  Tasks.findOneAndDelete({ _id: mongodb.ObjectId(req.params._id) }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: data });
    }
  });
});
// using express middleware
app.use(
  '/user-tasks',
  verifyLogin, // before loading tasks, verify the user login
  tasksRouter, // all routes starting with /user-tasks will be handled by tasks router
);


app.listen(3000, () => console.log('listening on port 3000'));