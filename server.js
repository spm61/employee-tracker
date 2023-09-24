const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

require('dotenv').config();

//First, create the db connection object.
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
//Then, attempt to use the connection.  
connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    welcometoDatabase();
  });

  //Now that we're connected, let the user know they've entered the database.
welcomeToDatabase = () => {
    console.log("***********************************")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("***********************************")
    userInteraction();
  };
  
  //Interact with the user to figure out what they want to do.
const userInteraction = () => {
    inquirer.prompt ([
      {
        type: 'list',
        name: 'choice', 
        message: 'What would you like to do?',
        choices: ['View all departments', 
                  'View all roles', 
                  'View all employees', 
                  'Add a department', 
                  'Add a role', 
                  'Add an employee', 
                  'Update an employee role',
                  'Update an employee manager',
                  "View employees by department",
                  'Delete a department',
                  'Delete a role',
                  'Delete an employee',
                  'View department budgets',
                  'Exit Database']
      }
    ]) //Then, once the user chooses an action, call a function to perform the action.
      .then((responses) => {
        const { choices } = responses; 
  
        if (choices === "View all departments") {
          getAllDepartments();
        }
  
        if (choices === "View all roles") {
          getAllRoles();
        }
  
        if (choices === "View all employees") {
          getAllEmployees();
        }
  
        if (choices === "Add a department") {
          addDepartment();
        }
  
        if (choices === "Add a role") {
          addRole();
        }
  
        if (choices === "Add an employee") {
          addEmployee();
        }
  
        if (choices === "Update an employee role") {
          updateEmployee();
        }
  
        if (choices === "Update an employee manager") {
          updateManager();
        }
  
        if (choices === "View employees by department") {
          getEmployeesByDepartment();
        }
  
        if (choices === "Delete a department") {
          deleteDepartment();
        }
  
        if (choices === "Delete a role") {
          deleteRole();
        }
  
        if (choices === "Delete an employee") {
          deleteEmployee();
        }
  
        if (choices === "View department budgets") {
          viewDepartmentBudgets();
        }
  
        if (choices === "Exit Database") {
          connection.end() //end the connection here because the user chose to.
      };
    });
  };

//the queries follow below.  I don't normally like throwing errors without doing something with them, but I need execution to actually stop in as few lines as possible.
//If the user wants to see departments, that's what we give them.
getAllDepartments = () => {
    console.log('Getting all departments..\n');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`; 
  
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      userInteraction(); //if successfull, ask the user to perform another action.
    });
  };

  //Give all the roles when the user asks for them.
getAllRoles = () => {
    console.log('Getting all roles...\n');
  
    const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;
    
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows); 
      userInteraction();
    })
  };
  
  //This shows all the employees when asked.
getAllEmployees = () => {
    console.log('Getting all employees...\n'); 
    const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      userInteraction ();
    });
  };

  //Insert a new department into the table.
addDepartment = () => {
    inquirer.prompt([ //first we gotta ask the user what they want.
      {
        type: 'input', 
        name: 'deptToAdd',
        message: "What department do you want to add?",
        validate: deptToAdd => { //make sure they actually gave us something we can use.
          if (deptToAdd) {
              return true;
          } else {
              console.log('Please enter a department'); //if they didn't we need to make sure we do.
              return false;
          }
        }
      }
    ])
      .then(response => {
        const sql = `INSERT INTO department (name)
                    VALUES (?)`;
        connection.query(sql, response.deptToAdd, (err, result) => {
            if (err) throw err;
          console.log('Added ' + response.deptToAdd + " to departments! Getting updated table.");       
          getAllDepartments(); //show the table to demonstrate that it was updated.
      });
    });
  };

  //Add a role at the user's request
  //Good Lord this is starting to get complicated...
addRole = () => {
    inquirer.prompt([
      {
        type: 'input', 
        name: 'roleToAdd',
        message: "What role do you want to add?",
        validate: roleToAdd => {
          if (roleToAdd) {
              return true;
          } else {
              console.log('Please enter a role');
              return false;
          }
        }
      },
      {
        type: 'input', 
        name: 'salaryToAdd',
        message: "What is the salary of this role?",
        validate: salaryToAdd  => {
          if (isNAN(salaryToAdd)) { //if the salary is not a number, we don't want to add it.
              return true;
          } else {
              console.log('Please enter a salary');
              return false;
          }
        }
      }
    ])
      .then(response => {
        const params = [response.role, response.salary]; //create parameters for the query.
  
        //Grab the department.
        const roleSql = `SELECT name, id FROM department`; 
  
        connection.promise().query(roleSql, (err, data) => {
            if (err) throw err;
      
          const departments = data.map(({ name, id }) => ({ name: name, value: id })); //map the data returned into a useable array.
  
          inquirer.prompt([ //now, we need to specify which department the role is in.
          {
            type: 'list', 
            name: 'destinationDept',
            message: "What department is this role in?",
            choices: departments //the departments are gonna be the choices.
          }
          ])
            .then(deptChoice => {
              const destDept = deptChoice.destinationDept;
              params.push(destDept);
  
              const sql = `INSERT INTO role (title, salary, department_id)
                          VALUES (?, ?, ?)`; //prepare the query with the provided information.
  
              connection.query(sql, params, (err, result) => {
                if (err) { 
                    console.error('Failed to insert a role.  Ensure you are properly connected to the database and try again.');
                    throw err;
                }
                console.log('Added' + response.role + " to roles!  Getting updated table..."); 
  
                getAllRoles();
         });
       });
     });
   });
  };

  // function to add an employee 
addEmployee = () => {
    inquirer.prompt([ //first we have to ask what they want...
      {
        type: 'input',
        name: 'addFirstName',
        message: "What is the employee's first name?",
        validate: addFirstName => {
          if (addFirstName) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'addLastName',
        message: "What is the employee's last name?",
        validate: addLastName => {
          if (addLastName) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(response => {
      const params = [response.fistName, response.lastName] //start building up the parameters
  
      //Get the roles so they can be assigned.
      const roleSql = `SELECT role.id, role.title FROM role`;
    
      connection.promise().query(roleSql, (err, data) => {
        if (err) { 
            console.error('Failed to get assignable roles.  Ensure you are properly connected to the database and try again.')
            throw err;
        }
        
        const roles = data.map(({ id, title }) => ({ name: title, value: id })); //map the data to an array so it can be used.
  
        inquirer.prompt([
              {
                type: 'list',
                name: 'destinationRole',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.destinationRole;
                params.push(role);
  
                //assign a manager to the employee.  First get the rest of the employees.
                const managerSql = `SELECT * FROM employee`;
  
                connection.promise().query(managerSql, (err, data) => {
                    if (err) { 
                        console.error('Failed to get assinable managers.  Ensure you are properly connected to the database and try again.');
                    }
  
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      params.push(manager);
  
                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`; //finaly, perform the final query.
  
                      connection.query(sql, params, (err, result) => {
                        if (err) { 
                            console.error('Failed to add employee.  Ensure you are properly connected to the database and try again.');
                        }
                      console.log("Employee has been added! Getting updated table...");
                      getAllEmployees();
                });
              });
            });
          });
       });
    });
  };

updateEmployee = () => {
    //Get the list of employees so one can be chosen to update. 
    const employeeSql = `SELECT * FROM employee`;
  
    connection.promise().query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'employeeName',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
        .then(empChoice => {
          const employee = empChoice.employeeName;
          const params = []; //start preparing the params array.
  
          //get the roles to assign.
          const roleSql = `SELECT * FROM role`;
  
          connection.promise().query(roleSql, (err, data) => {
            if (err) throw err; 
  
            const roles = data.map(({ id, title }) => ({ name: title, value: id }));
            
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'assignedRole',
                  message: "What is the employee's new role?",
                  choices: roles
                }
              ])
                  .then(roleChoice => {
                  const role = roleChoice.assignedRole;
                  params.push(role); 
                  
                  params[0] = role; //make sure to add the params in the correct order.  
                  params[1] = employee; 
  
                  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  
                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                  console.log("Employee has been updated! Getting updated table...");
                
                  getAllEmployees();
            });
          });
        });
      });
    });
  };

//Update an employee's manager.  There's gotta be a more efficient way to do this.
updateManager = () => {
    // get employees from employee table so one can be chosen.
    const employeeSql = `SELECT * FROM employee`;
  
    connection.promise().query(employeeSql, (err, data) => {
      if (err) throw err; 
  
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'employeeName',
          message: "Which employee would you like to update?",
          choices: employees
        }
      ])
        .then(empChoice => {
          const employee = empChoice.employeeName;
          const params = []; 
            
          //we have our chosen employee, now we have to get our manager.  This is the same query as before, so we're not gonna redeclare it.
            connection.promise().query(employeeSql, (err, data) => {
              if (err) throw err; 
  
            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
              
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'managerName',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                    .then(managerChoice => {
                      const manager = managerChoice.managerName;
                      params.push(manager); //add the params in the right order.
                      params.push(employee);

                      const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
  
                      connection.query(sql, params, (err, result) => {
                        if (err) throw err;
                      console.log("Employee has been updated! Getting updated table.");
                    
                      showEmployees();
            });
          });
        });
      });
    });
  };