const { Employee } = require('../../models/PerformanceTracking/employeeModel');

// Create a new employee
const CreateEmployee = async (req, res) => {
  try {
    const { fullName, jobTitle, department } = req.body;

    const employee = await Employee.create({ fullName, jobTitle, department });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create employee', error });
  }
};
module.exports = {
    CreateEmployee
}

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees', error });
  }
};

// Get a single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employee', error });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { fullName, jobTitle, department } = req.body;
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await employee.update({ fullName, jobTitle, department });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error });
  }
};
