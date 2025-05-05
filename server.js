const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Set up MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  port: 3307,
  database: 'mydb'
});

// Connect to the MySQL database
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the MySQL server');
});

// Serve static files
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/Dashboard.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'Dashboard.html'));
});

// Session verification endpoint
app.get('/api/verify-session', (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ valid: false });
  }
  
  // Check if user exists in database
  connection.query(
    'SELECT UserID, Email FROM Users WHERE UserID = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error verifying session:', err);
        return res.status(500).json({ valid: false });
      }
      
      if (results.length === 0) {
        // User not found
        return res.status(401).json({ valid: false });
      }
      
      // User found, session is valid
      res.json({ valid: true });
    }
  );
});

// Authentication APIs
app.post('/api/signin', (req, res) => {
    console.log('Received signin request');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
  
    connection.query(
      'SELECT * FROM Users WHERE Email = ?', 
      [email], 
      (err, results) => {
        if (err) {
          console.error('Error executing database query: ', err);
          return res.status(500).json({ error: "Database error" });
        }
  
        if (results.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
  
        const user = results[0];
        
        // Simple password check (in production, you'd use bcrypt to compare hashed passwords)
        const match = password === user.Password;
  
        if (!match) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
  
        // Don't send the password back to the client
        delete user.Password;
        
        res.json({
          success: true,
          user: {
            userID: user.UserID,
            firstName: user.FirstName,
            lastName: user.LastName,
            name: `${user.FirstName} ${user.LastName}`,
            email: user.Email,
            phone: user.PhoneNumber,
            address: user.Address,
            role: user.Role || 'User',
            dateRegistered: user.DateRegistered
          }
        });
      }
    );
  });
app.post('/api/signup', (req, res) => {
    console.log('Received signup request:', req.body);
    
    const { firstName, lastName, email, password, phone, address, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: "Required fields missing" });
    }
  
    // Check if email already exists
    connection.query(
      'SELECT * FROM Users WHERE Email = ?', 
      [email], 
      (err, results) => {
        if (err) {
          console.error('Error checking existing user:', err);
          return res.status(500).json({ error: "Database error checking user" });
        }
  
        if (results.length > 0) {
          console.log('Email already exists:', email);
          return res.status(409).json({ error: "Email already registered" });
        }
  
        // Create new user
        const userData = {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          Password: password,
          PhoneNumber: phone,
          Address: address,
          Role: role,
          DateRegistered: new Date()
        };
  
        console.log('Attempting to insert user:', userData);
  
        // Insert user into database
        connection.query('INSERT INTO Users SET ?', userData, (err, result) => {
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: "Failed to create user: " + err.message });
          }
  
          console.log('User created successfully with ID:', result.insertId);
          
          // Don't send password back to client
          delete userData.Password;
          
          // Return success response
          res.status(201).json({
            success: true,
            user: {
              userID: result.insertId,
              firstName: userData.FirstName,
              lastName: userData.LastName,
              name: `${userData.FirstName} ${userData.LastName}`,
              email: userData.Email,
              phone: userData.PhoneNumber,
              address: userData.Address,
              role: userData.Role,
              dateRegistered: userData.DateRegistered
            }
          });
        });
      }
    );
  });

// Chicken Coop APIs
app.get('/api/coops', (req, res) => {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    connection.query(
      'SELECT * FROM ChickenCoop WHERE UserID = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Error fetching coops:', err);
          return res.status(500).json({ error: "Failed to fetch coops" });
        }
        
        res.json(results);
      }
    );
  });

// Add a new coop
app.post('/api/coops', (req, res) => {
    const { userId, location, size, capacity } = req.body;
    
    if (!userId || !location || !size || !capacity) {
      return res.status(400).json({ error: "Required fields missing" });
    }
  
    const coopData = {
      UserID: userId,
      Location: location,
      Size: size,
      Capacity: capacity,
      DateInstalled: new Date(),
      Status: 'Active'
    };
  
    connection.query('INSERT INTO ChickenCoop SET ?', coopData, (err, result) => {
      if (err) {
        console.error('Error creating coop:', err);
        return res.status(500).json({ error: "Failed to create coop" });
      }
      
      res.status(201).json({
        success: true,
        coop: {
          id: result.insertId,
          ...coopData
        }
      });
    });
  });

  // Update a coop
app.put('/api/coops/:id', (req, res) => {
    const coopId = req.params.id;
    const { location, size, capacity } = req.body;
    
    if (!location || !size || !capacity) {
      return res.status(400).json({ error: "Required fields missing" });
    }
  
    const coopData = {
      Location: location,
      Size: size,
      Capacity: capacity
    };
  
    connection.query(
      'UPDATE ChickenCoop SET ? WHERE CoopID = ?',
      [coopData, coopId],
      (err, result) => {
        if (err) {
          console.error('Error updating coop:', err);
          return res.status(500).json({ error: "Failed to update coop" });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Coop not found" });
        }
        
        res.json({
          success: true,
          coop: {
            id: parseInt(coopId),
            ...coopData
          }
        });
      }
    );
  });

  // Delete a coop
app.delete('/api/coops/:id', (req, res) => {
    const coopId = req.params.id;
  
    connection.query(
      'DELETE FROM ChickenCoop WHERE CoopID = ?',
      [coopId],
      (err, result) => {
        if (err) {
          console.error('Error deleting coop:', err);
          return res.status(500).json({ error: "Failed to delete coop" });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Coop not found" });
        }
        
        res.json({
          success: true,
          id: parseInt(coopId)
        });
      }
    );
  });
// Sensor APIs
app.get('/api/sensors', (req, res) => {
  const coopId = req.query.coopId;
  
  if (!coopId) {
    return res.status(400).json({ error: "Coop ID is required" });
  }

  connection.query(
    'SELECT * FROM SensorDevice WHERE CoopID = ?',
    [coopId],
    (err, results) => {
      if (err) {
        console.error('Error fetching sensors: ', err);
        return res.status(500).json({ error: "Failed to fetch sensors" });
      }
      
      res.json(results);
    }
  );
});

// Add a new sensor reading
app.post('/api/readings', (req, res) => {
  console.log('Received request body:', req.body);
  
  // Extract data
  const coopId = req.body.coopId || req.body.CoopID;
  const temperature = req.body.temperature || req.body.Temperature;
  const humidity = req.body.humidity || req.body.Humidity;
  const co2Level = req.body.co2Level || req.body.CO2Level;
  const ammoniaLevel = req.body.ammoniaLevel || req.body.AmmoniaLevel;
  
  // Convert ISO timestamp to MySQL format
  let timestamp;
  try {
    // If timestamp is provided, convert it to MySQL format
    if (req.body.timestamp || req.body.TimeStamp) {
      const date = new Date(req.body.timestamp || req.body.TimeStamp);
      timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      // Use current date if no timestamp provided
      const now = new Date();
      timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    }
  } catch (e) {
    console.error('Error parsing timestamp:', e);
    // Fallback to current date/time
    const now = new Date();
    timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // Validate required field
  if (!coopId) {
    return res.status(400).json({ error: "Coop ID is required" });
  }
  
  // Create reading data object
  const readingData = {
    CoopID: coopId,
    Temperature: temperature || null,
    Humidity: humidity || null,
    CO2Level: co2Level || null,
    AmmoniaLevel: ammoniaLevel || null,
    TimeStamp: timestamp,
    Status: 'Normal'
  };
  
  console.log('Inserting formatted data:', readingData);
  
  // Insert into database
  connection.query('INSERT INTO SensorReading SET ?', readingData, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Failed to create reading: " + err.message });
    }
    
    res.status(201).json({
      success: true,
      reading: {
        ReadingID: result.insertId,
        ...readingData
      }
    });
  });
});
// Add a new sensor reading - with improved error handling
app.post('/api/readings', (req, res) => {
  console.log('Received request body:', req.body);
  
  // Extract data using more flexible property access
  const coopId = req.body.coopId || req.body.CoopID;
  const temperature = req.body.temperature || req.body.Temperature;
  const humidity = req.body.humidity || req.body.Humidity;
  const co2Level = req.body.co2Level || req.body.CO2Level;
  const ammoniaLevel = req.body.ammoniaLevel || req.body.AmmoniaLevel;
  const timestamp = req.body.timestamp || req.body.TimeStamp || new Date();
  
  // Validate required field
  if (!coopId) {
    return res.status(400).json({ error: "Coop ID is required" });
  }
  
  // Create reading data object with consistent case for MySQL
  const readingData = {
    CoopID: coopId,
    Temperature: temperature || null,
    Humidity: humidity || null,
    CO2Level: co2Level || null,
    AmmoniaLevel: ammoniaLevel || null,
    TimeStamp: timestamp,
    Status: 'Normal'
  };
  
  // Log what we're about to insert
  console.log('Inserting data:', readingData);
  
  // Use a try-catch to handle unexpected errors
  try {
    connection.query('INSERT INTO SensorReading SET ?', readingData, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      // Success!
      res.status(201).json({
        success: true,
        reading: {
          ReadingID: result.insertId,
          ...readingData
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});
// Delete a sensor reading
app.delete('/api/readings/:id', (req, res) => {
    const readingId = req.params.id;
  
    connection.query(
      'DELETE FROM SensorReading WHERE ReadingID = ?',
      [readingId],
      (err, result) => {
        if (err) {
          console.error('Error deleting reading:', err);
          return res.status(500).json({ error: "Failed to delete reading" });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Reading not found" });
        }
        
        res.json({
          success: true,
          id: parseInt(readingId)
        });
      }
    );
  });


// User profile API
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, phone, address, role } = req.body;
    
    // Validate required fields
    if (!userId || !firstName || !lastName || !email) {
      return res.status(400).json({ error: "Required fields missing" });
    }
  
    // Prepare data for database update
    const userData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phone,
      Address: address,
      Role: role
    };
  
    // Update user in database
    connection.query(
      'UPDATE Users SET ? WHERE UserID = ?',
      [userData, userId],
      (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          return res.status(500).json({ error: "Failed to update user" });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Return success response
        res.json({
          success: true,
          user: {
            userID: userId,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            address,
            role
          }
        });
      }
    );
  });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});