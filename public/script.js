/* Login-signup page */

// Login function
async function login() {
    // Variables for holding DOM elements
    const userName = document.getElementById('login-userName');
    const password = document.getElementById('login-password');
    const message = document.getElementById('login-message');

  // Sending login information to API server
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST', // post request
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({
      // Getting values
      userName: userName.value,
      password: password.value
    })
  });
  // Parsing response
  const data = await response.json();
  // checking errors
  if (data.error) {
    message.innerHTML = data.error; // set message element text
    message.setAttribute('style', 'color: red;'); // set color as red for error
  } else {
    localStorage.setItem('_id', data._id); // save id in local storage for success full login
    window.location.replace('/tasks'); // go to tasks page
  }
}

// Signup function
async function signup() {
    // Variables for holding DOM elements
    const userName = document.getElementById('login-userName');
    const password = document.getElementById('login-password');
    const message = document.getElementById('login-message');
    
  // Sending signup information to API server
  const response = await fetch('http://localhost:3000/signup', {
    method: 'POST', // post request
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({
      // Getting values
      userName: userName.value,
      password: password.value
    })
  });
  // Parsing response
  const data = await response.json();
  // checking errors
  if (data.error) {
    message.innerHTML = data.error; // set message element text
    message.setAttribute('style', 'color: red;'); // set color as red for error
  } else {
    localStorage.setItem('_id', data._id); // save id in local storage for success full signup
    window.location.replace('/tasks'); // go to tasks page
  }
}

// ----------------------------------

// Tasks page

// Delete task function
async function deleteTask(_id) { // function called when the delete button for a task is clicked
    // Requesting for deletion of task
    const response = await fetch('http://localhost:3000/user-tasks/'+_id, {
        method: 'DELETE', // delete request
        headers: {
        'Authorization': localStorage.getItem('_id'),
        }
    });
    // Parsing response
    const data = await response.json();
    // checking errors
    if (data.error) {
        alert('Error:\n' + data.error);
    } else { // else refresh the page
        window.location.reload();
    }
}

async function loadTasks() {
    const tbody = document.getElementById('tasks-tbody');
    // Getting data from API
    const response = await fetch('http://localhost:3000/user-tasks', {
      method: 'GET', // get request for all tasks
      headers: {
        'Authorization': localStorage.getItem('_id'),
      }
    });
    // Parsing response
    const data = await response.json();
    // checking errors
    if (data.error) {
      alert('Error:\n' + data.error);
    } else {
      // success full response returns array of tasks
      // creating table rows for every task
      data.tasks.forEach((task) => {
        // creating row element
        const tr = document.createElement('tr');
        // creating title cell
        const tdTitle = document.createElement('td'); tdTitle.appendChild(document.createTextNode(task.title));
        // creating status cell
        const tdStatus = document.createElement('td'); tdStatus.appendChild(document.createTextNode(task.status)); tdStatus.setAttribute('status', task.status);
        // creating edit button
        const editBtn = document.createElement('button');
        editBtn.setAttribute('class', 'task-btn');
        editBtn.appendChild(document.createTextNode('Edit'));
        editBtn.onclick = () => { // adding onclick handler
          window.location.replace('/edit-task'); // go to edit task page
          localStorage.setItem('edit-task', JSON.stringify(task)) // save the task details in local storage temporarily
        };
        // creating details button
        const detailsBtn = document.createElement('button');
        detailsBtn.setAttribute('class', 'task-btn');
        detailsBtn.appendChild(document.createTextNode('Details'));
        detailsBtn.onclick = () => { // adding onclick handler
          window.location.replace('/task-details'); // go to task details page
          localStorage.setItem('task-details', JSON.stringify(task)) // save the task details in local storage temporarily
        };
        // creating delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('class', 'task-btn');
        deleteBtn.appendChild(document.createTextNode('Delete'));
        deleteBtn.onclick = () => { // adding onclick handler
          deleteTask(task._id); // delete task request
        };
        // creating action buttons cell
        const tdAction = document.createElement('td');
        tdAction.setAttribute('class', 'row gap-2 align-center');
        tdAction.append(detailsBtn, editBtn, deleteBtn); // adding children
        // adding cells to row
        tr.appendChild(tdTitle);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);

        tbody.append(tr); // adding row to table body
      }); // end of foreach loop
    };

    localStorage.removeItem('edit-task');
    localStorage.removeItem('task-details');
}

// ---------------------------

// Edit task page

async function fillFields() {
    // Variables for holding DOM input elements
    const title = document.getElementById('edit-title');
    const startDate = document.getElementById('edit-startDate');
    const finishDate = document.getElementById('edit-finishDate');
    const description= document.getElementById('edit-description');
    const status = document.getElementById('edit-status');

    // Getting details of task from local storage
    const task = JSON.parse(localStorage.getItem('edit-task'));
    // Setting values of input fields according to task details
    title.value = task.title;
    startDate.value = task.startDate;
    finishDate.value = task.finishDate;
    description.value = task.description;
    status.value = task.status;

    localStorage.removeItem('task-details');
}



// Update task function
async function updateTask() {
    // Variables for holding DOM input elements
    const title = document.getElementById('edit-title');
    const startDate = document.getElementById('edit-startDate');
    const finishDate = document.getElementById('edit-finishDate');
    const description= document.getElementById('edit-description');
    const status = document.getElementById('edit-status');
    // Getting details of task from local storage
    const task = JSON.parse(localStorage.getItem('edit-task'));

    // Getting data from API
    const response = await fetch('http://localhost:3000/user-tasks/edit/' + task._id, { // the state holds the details of the object being updated
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json', // the data is sent in json format
        'accept': '*/*',
        Authorization: localStorage.getItem('_id'), // Providing login information
    },
    body: JSON.stringify({
        // Getting updated values from input fields
        title: title.value,
        startDate: startDate.value,
        finishDate: finishDate.value,
        description: description.value,
        status: status.value
    })
    });
    // Parsing response
    const data = await response.json();
    // checking errors
    if (data.error) {
    alert('Error:\n' + data.error);
    } else { // else goto tasks page
    window.location.replace('/tasks');
    }
}

// ---------------------------

// Add task page

// Add task function
async function addTask() {    
    // Variables for holding DOM input elements
    const title = document.getElementById('title');
    const startDate = document.getElementById('startDate');
    const finishDate = document.getElementById('finishDate');
    const description= document.getElementById('description');
    const status = document.getElementById('status');

    // Getting data from API
    const response = await fetch('http://localhost:3000/user-tasks/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json', // the data is sent in json format
        'accept': '*/*',
        Authorization: localStorage.getItem('_id'), // Providing login information
    },
    body: JSON.stringify({
        // Getting values from input fields
        title: title.value,
        startDate: startDate.value,
        finishDate: finishDate.value,
        description: description.value,
        status: status.value
    })
    });
    // Parsing response
    const data = await response.json();
    // checking errors
    if (data.error) {
        alert('Error:\n' + data.error.message);
    } else { // else goto tasks page
        window.location.replace('/tasks');
    }
}


// ---------------------------------------


// Task details page
function showTaskDetails() {
    // Variables for holding DOM elements
    const title = document.getElementById('details-title');
    const startDate = document.getElementById('details-startDate');
    const finishDate = document.getElementById('details-finishDate');
    const description = document.getElementById('details-description');
    const status = document.getElementById('details-status');
    // Getting task details from local storage
    const task = JSON.parse(localStorage.getItem('task-details')); // get the task in string format back to object format
    // Setting up details
    title.innerText = task.title;
    startDate.innerText = task.startDate;
    finishDate.innerText = task.finishDate;
    description.innerText = task.description;
    status.innerText = task.status;
    document.getElementById('details-status').setAttribute('status', task.status);

    localStorage.removeItem('edit-task');
}

function logout() {
  localStorage.removeItem('edit-task');
  localStorage.removeItem('task-details');
  localStorage.removeItem('_id');
  window.location.replace('/login-signup');
}