
# DCIT26 Lab 5 - Express and MongoDB

A Student Records REST API developed using Node.js, Express, MongoDB, and Mongoose for DCIT 26: Application Development and Emerging Technologies.

## Features

- Express server with JSON middleware
- MongoDB connection through Mongoose
- Student schema with validation
- Create, read, update, and delete student records
- Health check endpoint
- Error handling for invalid input, missing records, and unexpected errors
- Environment configuration using dotenv

## Requirements

- Node.js and npm
- MongoDB Community Server
- MongoDB Compass (optional, for viewing database records)

## Installation

1. Clone or download this repository.
2. Open the project folder in a terminal.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root using `.env.example` as a template.

5. Configure `.env`:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/lab5_students
   PORT=5000
   ```

6. Make sure your local MongoDB server is running.

## Running the Server

Start the development server:

```bash
npm run dev
```

To start the server without nodemon:

```bash
npm start
```

The API runs on port 5000 by default, unless another `PORT` value is configured.

The server connects to MongoDB before it starts listening for requests.

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/students` | Retrieve all students |
| GET | `/api/students/:id` | Retrieve a student by ID |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

## Student Fields

| Field | Type | Description |
|---|---|---|
| `fullName` | String | Required student name |
| `course` | String | Required course |
| `yearLevel` | Number | Required whole number from 1 to 4 |
| `section` | String | Optional section |
| `createdAt` | Date | Automatically generated creation date |

## Sample Student Request

Use this JSON body when creating a student with `POST /api/students`:

```json
{
  "fullName": "Alex Santos",
  "course": "BSIT",
  "yearLevel": 2,
  "section": "IT-2A"
}
```

## Testing

Test the health endpoint and all CRUD routes with Postman, Thunder Client, or curl.

Verify that student records are saved in MongoDB Compass and remain available after restarting the API server.

## Database

The default local database is `lab5_students`. Mongoose uses the `students` collection for Student documents.

## Security

Do not commit the local `.env` file. Use `.env.example` as the configuration template.