const express = require("express");
const bodyParser = require('body-parser');
const mysql = require("mysql");

const app = express();
const port = 3000;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password",
  database: "hotel"
});

//Connect to the database
connection.connect(error => {
  if (error) {
    console.error("Failed to connect to database:", error);
  } else {
    console.log("Connected to database.");
  }
});


// Handle the room booking

app.use(express.json());
app.post("/bookRoom", (request, response) => {
    const booking = request.body;
  
    // Save the booking information in the database
    const sql = "INSERT INTO booking (email, room_type, room_number, start_time, end_time) VALUES (?, ?, ?, ?, ?)";
    const values = [booking.email, booking.roomType, booking.roomNumber, booking.startTime, booking.endTime];
  
    connection.query(sql, values, (error, result) => {
      if (error) {
        console.error("Failed to save booking:", error);
        response.status(500).send("Failed to save booking.");
      } else {
        console.log("Booking saved:", result);
        response.status(200).send("Room booked successfully!");
      }
    });
  });

  //edit
  app.get('/bookings/search', async (req, res) => {
    const email = req.query.email;
  
    // Check if email was provided in the query string
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      // Execute the query to find the booking with the given email
      const [rows] = await connection.execute(
        'SELECT * FROM booking WHERE email = ?',
        [email]
      );
  
      // Release the connection back to the pool
      connection.release();
  
      // Check if a booking was found
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      // Return the booking
      return res.json(rows[0]);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Define a route for updating a booking by email
  app.put('/bookings/update', async (req, res) => {
    const { email, roomType, startTime, endTime } = req.body;
  
    // Check if required fields were provided in the request body
    if (!email || !roomType || !startTime || !endTime) {
      return res.status(400).json({ message: 'Email, room type, start time, and end time are required' });
    }
  
    try {
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      // Execute the query to update the booking with the given email
      const [result] = await connection.execute(
        'UPDATE booking SET room_type = ?, start_time = ?, end_time = ? WHERE email = ?',
        [roomType, startTime, endTime, email]
      );
  
      // Release the connection back to the pool
      connection.release();
  
      // Check if a booking was updated
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      // Return a success message
      return res.json({ message: 'Booking updated successfully' });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  

  // // View Bookings
  app.get("/bookings", function (req, res) {
    var sql = "select * from booking";
    connection.query(sql, function (err, result) {
        if (err) throw err;

        var row = [];
        for (var i = 0; i < result.length; i++) {
            row.push(result[i]);
        }
        //console.log(row);
        res.render(row);
    });
  });
  
  //delete
  
  app.delete('/bookings/:id', async (req, res) => {
    try {
      const bookingId = req.params.id;
      const [booking] = await pool.query('SELECT * FROM booking WHERE id = ?', [bookingId]);
  
      if (!booking) {
        return res.status(404).send('Booking not found');
      }
  
      const now = new Date();
      const start = new Date(booking.start_time);
      const timeDiff = start.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
  
      let refund = 0;
      if (hoursDiff > 48) {
        refund = booking.cost;
      } else if (hoursDiff > 24) {
        refund = booking.cost / 2;
      }
  
      await pool.query('DELETE FROM booking WHERE id = ?', [bookingId]);
  
      res.json({
        message: 'Booking cancelled',
        refundAmount: refund
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  
  


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
