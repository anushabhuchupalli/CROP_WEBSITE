const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, collection, where, getDocs, addDoc, doc, updateDoc, arrayUnion } = require('firebase-admin/firestore');
const bcrypt = require('bcrypt');
const cors = require('cors');

const serviceAccount = require('./capstone.json');

// Initialize Firebase App first
initializeApp({
  credential: cert(serviceAccount)
});
// Initialize Firestore after Firebase App is initialized
const db = getFirestore();

// Continue with the rest of your code


const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/' + 'logincrop.html');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
    try {
      // Query Firestore to check if a user with the same email already exists
      const userRef = db.collection('users'); // Corrected this line
      const querySnapshot = await userRef.where('email', '==', email).get();
  
      if (!querySnapshot.empty) {
        res.status(409).send('User with this email already exists');
      } else {
        // Store user data in Firestore
        const hashedPassword = await bcrypt.hash(password, 10);
  
        await userRef.add({
          email: email,
          password: hashedPassword,
        });
  
        // Redirect to the indexed.html page after successful signup
        res.redirect('/indexed.html');
      }
    } catch (error) {
      res.status(500).send('Error signing up: ' + error.message);
    }
  });
  
  app.post('/loginsubmit', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Query Firestore to check user credentials
      const userRef = db.collection('users'); // Corrected this line
      const querySnapshot = await userRef.where('email', '==', email).get();
  
      if (querySnapshot.empty) {
        res.status(401).send('Invalid credentials');
      } else {
        const userData = querySnapshot.docs[0].data();
        const hashedPassword = userData.password;
  
        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (passwordMatch) {
          // Successful login
          res.redirect('/indexed.html');
        } else {
          res.status(401).send('Invalid credentials');
        }
      }
    } catch (error) {
      res.status(500).send('Error checking credentials: ' + error.message);
    }
  });
  app.post('/predict', async (req, res) => {
    // Extract the input data from the request body
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = req.body;
  
    // Prepare the data to send to the Flask server
    const data = {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall
    };
  
    try {
      const flaskResponse = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      const prediction = await flaskResponse.text();

    res.send(prediction);
  } catch (error) {
    res.status(500).send('Error getting prediction: ' + error.message);
  }
});
  app.listen(3000, () => {
    console.log('App is listening on port 3000');
  });
