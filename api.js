// Import required modules
const express = require('express');
const { Pool } = require('pg'); 

// Create an Express application
const app = express();
const port = 3000; 

// Create a pool for PostgreSQL connection
const pool = new Pool({
  user: 'username', 
  host: 'localhost', 
  database: 'database_name', 
  password: 'password', 
  port: 5432, 
});

// Middleware to parse JSON requests
app.use(express.json());

// Route for creating a new item
app.post('/items', async (req, res) => {
  try {
    const { name, description, price } = req.body; // Extract name, description and price from request body
    const newItem = await pool.query('INSERT INTO items (name, description,price) VALUES ($1, $2 ,$3) RETURNING *', [name, description, price]); // Execute SQL query to insert item into database
    res.json(newItem.rows[0]); // Send JSON response with the created item
  } catch (error) {
    console.error('Error creating item:', error.message);  //  error message
    res.status(500).json({ error: 'Internal Server Error' }); // send 500 internal server error response
  }
});

// Route for reading all items
app.get('/items', async (req, res) => {
  try {
    const allItems = await pool.query('SELECT * FROM items'); // Execute SQL query to select all items from database
    res.json(allItems.rows); // Send JSON response with all items
  } catch (error) {
    console.error('Error fetching items:', error.message); 
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

// Route for reading a single item by ID
app.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract item ID from request parameters
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [id]); // Execute SQL query to select item by ID from database
    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' }); 
    }
    res.json(item.rows[0]); // Send JSON response with the selected item
  } catch (error) {
    console.error('Error  item:', error.message); 
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

// Route for updating an item by ID
app.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description,price } = req.body; 
    const updatedItem = await pool.query('UPDATE items SET name = $1, description = $2,price= $3 WHERE id = $4 RETURNING *', [name, description,price, id]); // Execute SQL query to update item by ID in database
    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' }); // If item not found, send 404 Not Found response
    }
    res.json(updatedItem.rows[0]); // Send JSON response with the updated item
  } catch (error) {
    console.error('Error updating item:', error.message); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for deleting an item by ID
app.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]); 
    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' }); 
    }
    res.json({ message: 'Item deleted successfully' }); // Send JSON response indicating successful deletion
  } catch (error) {
    console.error('Error deleting item:', error.message);
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

// Start the server and listen on the  port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
