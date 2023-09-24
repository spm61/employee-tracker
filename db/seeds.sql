INSERT INTO department (name)
VALUES 
('IT'),
('Accounting'),
('Sales'),
('Operations');

INSERT INTO role (title, salary, department_id)
VALUES
('Full Stack Developer', 80000, 1),
('Software Engineer', 70000, 1),
('Accountant', 70000, 2), 
('Finanical Analyst', 70000, 2),
('Marketing Coordindator', 70000, 3), 
('Sales Lead', 60000, 3),
('Project Manager', 90000, 4),
('Operations Manager', 90000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('John', 'Doe', 2, null),
('Don', 'Joe', 1, 1),
('Mary', 'Smith', 4, null),
('Ashley', 'Jones', 3, 3),
('Sam', 'Samuels', 6, null),
('Ana', 'Thompson', 5, 5),
('Allen', 'Lewis', 7, null),
('Katy', 'Gainsboro', 8, 7);