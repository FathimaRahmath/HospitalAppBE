const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Load hospital data from JSON file
let hospitalData = [];

// Read initial data from JSON file
try {
    const rawData = fs.readFileSync('hospitalData.json', 'utf8');
    const parsedData = JSON.parse(rawData);
    if (!parsedData.hospitals || !Array.isArray(parsedData.hospitals)) {
        throw new Error('Invalid data format in hospitalData.json');
    }
    hospitalData = parsedData.hospitals;
} catch (err) {
    console.error('Error reading or parsing file:', err);
}

// GET all hospitals
app.get('/hospitals', (req, res) => {
    res.json(hospitalData);
});

// GET a specific hospital by name
app.get('/hospitals/:name', (req, res) => {
    const hospital = hospitalData.find(hospital => hospital.name === req.params.name);
    if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
});

// POST a new hospital
app.post('/hospitals', (req, res) => {
    const newHospital = req.body;
    hospitalData.push(newHospital);
    fs.writeFile('hospitalData.json', JSON.stringify({ hospitals: hospitalData }), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(201).json(newHospital);
    });
});

// PUT (update) a hospital's patient count by name
app.put('/hospitals/:name', (req, res) => {
    const hospitalName = req.params.name;
    const newPatientCount = req.body.patient_count;

    const hospital = hospitalData.find(hospital => hospital.name === hospitalName);
    if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.patient_count = newPatientCount;
    fs.writeFile('hospitalData.json', JSON.stringify({ hospitals: hospitalData }), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(hospital);
    });
});

// DELETE a hospital by name
app.delete('/hospitals/:name', (req, res) => {
    const hospitalName = req.params.name;
    const index = hospitalData.findIndex(hospital => hospital.name === hospitalName);
    if (index === -1) {
        return res.status(404).json({ message: 'Hospital not found' });
    }
    hospitalData.splice(index, 1);
    fs.writeFile('hospitalData.json', JSON.stringify({ hospitals: hospitalData }), err => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.sendStatus(204);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
