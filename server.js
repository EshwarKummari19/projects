const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NlpManager } = require('node-nlp');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'root', // replace with your MySQL password
    database: 'college' // replace with your database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Initialize NLP manager
const manager = new NlpManager({ languages: ['en'] });

// Train the NLP model
async function trainNLP() {
    // Add intents and responses for each table
    manager.addDocument('en', 'Tell me about the chairman', 'get.chairman');
    manager.addDocument('en', 'What is the mission of CMR Technical Campus?', 'get.mission');
    manager.addDocument('en', 'What courses are offered?', 'get.courses');
    manager.addDocument('en', 'Tell me about the director', 'get.director');
    manager.addDocument('en', 'What deans do we have?', 'get.deans');
    manager.addDocument('en', 'What are the admission documents?', 'get.admission_documents');
    manager.addDocument('en', 'What is the fee structure?', 'get.fee_structure');
    manager.addDocument('en', 'Tell me about the library', 'get.library');
    manager.addDocument('en', 'What about the auditorium?', 'get.auditorium');
    manager.addDocument('en', 'What is the training placement cell?', 'get.training_placement_cell');
    manager.addDocument('en', 'Who is on the placement team?', 'get.placement_team');
    manager.addDocument('en', 'Tell me about placement team members', 'get.placement_team_members');

    await manager.train();
    manager.save();
}

// Endpoint to handle chatbot queries
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const response = await manager.process('en', userMessage);

    switch (response.intent) {
        case 'get.chairman':
            db.query('SELECT name, qualification, title, institution, achievements FROM chairman', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const chairman = results[0];
                return res.json({
                    response: [
                        `Name: ${chairman.name}`,
                        `Qualification: ${chairman.qualification}`,
                        `Title: ${chairman.title}`,
                        `Institution: ${chairman.institution}`,
                        `Achievements: ${chairman.achievements}`
                    ]
                });
            });
            break;
        case 'get.mission':
            db.query('SELECT mission FROM CMR_Technical_Campus', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                return res.json({ response: [results[0].mission] });
            });
            break;
        case 'get.courses':
            db.query('SELECT course_name FROM courses', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const courses = results.map(course => course.course_name).join(', ');
                return res.json({ response: [`Courses offered: ${courses}`] });
            });
            break;
        case 'get.director':
            db.query('SELECT name, title, email FROM director', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const director = results[0];
                return res.json({
                    response: [
                        `Name: ${director.name}`,
                        `Title: ${director.title}`,
                        `Email: ${director.email}`
                    ]
                });
            });
            break;
        case 'get.deans':
            db.query('SELECT name, title, domain FROM deans', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const deansList = results.map(dean => `${dean.name} (${dean.title})`).join(', ');
                return res.json({ response: [`Deans: ${deansList}`] });
            });
            break;
        case 'get.admission_documents':
            db.query('SELECT particulars FROM admission_documents', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const docs = results.map(doc => doc.particulars).join(', ');
                return res.json({ response: [`Admission documents: ${docs}`] });
            });
            break;
        case 'get.fee_structure':
            db.query('SELECT course, tuition_fee FROM fee_structure', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const fees = results.map(fee => `${fee.course}: ${fee.tuition_fee}`).join(', ');
                return res.json({ response: [`Fee structure: ${fees}`] });
            });
            break;
        case 'get.library':
            db.query('SELECT name, description FROM library', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const library = results[0];
                return res.json({
                    response: [
                        `Library Name: ${library.name}`,
                        `Description: ${library.description}`
                    ]
                });
            });
            break;
        case 'get.auditorium':
            db.query('SELECT name, seating_capacity FROM auditorium', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const auditorium = results[0];
                return res.json({
                    response: [
                        `Auditorium Name: ${auditorium.name}`,
                        `Seating Capacity: ${auditorium.seating_capacity}`
                    ]
                });
            });
            break;
        case 'get.training_placement_cell':
            db.query('SELECT name, vision FROM training_placement_cell', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const placementCell = results[0];
                return res.json({
                    response: [
                        `Name: ${placementCell.name}`,
                        `Vision: ${placementCell.vision}`
                    ]
                });
            });
            break;
        case 'get.placement_team':
            db.query('SELECT position, name FROM placement_team', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const team = results.map(member => `${member.position}: ${member.name}`).join(', ');
                return res.json({ response: [`Placement Team: ${team}`] });
            });
            break;
        case 'get.placement_team_members':
            db.query('SELECT name, department FROM placement_team_members', (error, results) => {
                if (error) {
                    return res.status(500).json({ response: 'Sorry, something went wrong.' });
                }
                const members = results.map(member => `${member.name} (Dept: ${member.department})`).join(', ');
                return res.json({ response: [`Placement Team Members: ${members}`] });
            });
            break;
        default:
            return res.json({ response: ["I'm sorry, I don't understand that."] });
    }
});

// Start training the NLP model
trainNLP();

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
