DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE department {
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
};

CREATE TABLE role {
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DEC NOT NULL,
    department_id INTEGER,
    INDEX dep_ind (department_id),
    CONSTRAINT foreignkey_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
};

CREATE TABLE employee {
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL.
    role_id INT,
    INDEX role_index (role_id),
    CONSTRAINT foreignkey_role FOREIGN KEY (role_id) referenes role(id) ON DELETE SET NULL
};