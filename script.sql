-- CREATE new database with name testdb
CREATE DATABASE IF NOT EXISTS testdb;  

--CREATE table 
CREATE TABLE Employees(  
    employeeID int NOT NULL,
    OrganizaionName varchar(75) NULL,
    PRIMARY KEY (employeeID) 
);
  
CREATE TABLE Users(  
    id int NOT NULL AUTO_INCREMENT,  
    firstname varchar(50) NULL,  
    lastname varchar(50) NULL,  
    email varchar(50) NOT NULL,  
    password varchar(250) NOT NULL,
    employeeID int NOT NULL,
    UNIQUE (id,email),
    PRIMARY KEY (id), 
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID)
);  
