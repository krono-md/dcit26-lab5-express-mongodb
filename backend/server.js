
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse incoming JSON request bodies
app.use(express.json());

// Fields allowed in student requests
const allowedFields = ['fullName', 'course', 'yearLevel', 'section'];

// Validate incoming student data
function validateStudentBody(body, requireAllFields = false) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return 'Request body must be a JSON object.';
    }

    const fields = Object.keys(body);

    if (fields.length === 0) {
        return 'Request body cannot be empty.';
    }

    const unknownFields = fields.filter(
        field => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
        return `Unknown field(s): ${unknownFields.join(', ')}.`;
    }

    if (requireAllFields) {
        const requiredFields = ['fullName', 'course', 'yearLevel'];

        for (const field of requiredFields) {
            const value = body[field];

            if (
                value === undefined ||
                value === null ||
                (typeof value === 'string' && value.trim() === '')
            ) {
                return `${field} is required.`;
            }
        }
    }

    for (const field of ['fullName', 'course']) {
        if (
            body[field] !== undefined &&
            (typeof body[field] !== 'string' ||
                body[field].trim() === '')
        ) {
            return `${field} must be a non-empty string.`;
        }
    }

    if (
        body.yearLevel !== undefined &&
        (!Number.isInteger(body.yearLevel) ||
            body.yearLevel < 1 ||
            body.yearLevel > 4)
    ) {
        return 'yearLevel must be a whole number from 1 to 4.';
    }

    if (
        body.section !== undefined &&
        typeof body.section !== 'string'
    ) {
        return 'section must be a string.';
    }

    return null;
}

// Validate MongoDB document IDs
function isValidId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

// Handle errors from asynchronous route handlers
function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Student Records API is running'
    });
});

// GET all students
app.get('/api/students', asyncHandler(async (req, res) => {
    const students = await Student.find();

    res.status(200).json(students);
}));

// GET one student by ID
app.get('/api/students/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            message: 'Invalid student ID.'
        });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
        return res.status(404).json({
            message: 'Student not found.'
        });
    }

    res.status(200).json(student);
}));

// POST: Create a student
app.post('/api/students', asyncHandler(async (req, res) => {
    const validationError = validateStudentBody(req.body, true);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const student = await Student.create(req.body);

    res.status(201).json(student);
}));

// PUT: Update a student
app.put('/api/students/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            message: 'Invalid student ID.'
        });
    }

    const validationError = validateStudentBody(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedStudent) {
        return res.status(404).json({
            message: 'Student not found.'
        });
    }

    res.status(200).json(updatedStudent);
}));

// DELETE: Remove a student
app.delete('/api/students/:id', asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            message: 'Invalid student ID.'
        });
    }

    const deletedStudent = await Student.findByIdAndDelete(
        req.params.id
    );

    if (!deletedStudent) {
        return res.status(404).json({
            message: 'Student not found.'
        });
    }

    res.status(200).json({
        message: 'Student deleted successfully.',
        student: deletedStudent
    });
}));

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found.'
    });
});

// Central error handler
app.use((err, req, res, next) => {
    if (
        err instanceof mongoose.Error.ValidationError ||
        err instanceof mongoose.Error.CastError
    ) {
        return res.status(400).json({
            message: err.message
        });
    }

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        Object.prototype.hasOwnProperty.call(err, 'body')
    ) {
        return res.status(400).json({
            message: 'Invalid JSON in request body.'
        });
    }

    console.error('Unexpected server error:', err.message);

    res.status(500).json({
        message: 'Internal server error.'
    });
});

// Connect to MongoDB before starting the server
async function startServer() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is missing from the .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to MongoDB successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
}

startServer();
