require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5001; // Change 5000 to 5001

// Add this line to address the deprecation warning
mongoose.set('strictQuery', false);

const allowedOrigins = ['https://ghana-pi.vercel.app', 'http://localhost:3000', 'https://ghana-api.vercel.app'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json());

let isConnected = false; // Variable to track connection status

// Update MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Connected to MongoDB');
  isConnected = true;
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Don't exit the process, let the server continue running
});

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
});

// Update User model
const User = mongoose.model('User', {
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr'], required: true }
}, 'ghana'); // Specify the collection name here

// Update JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

let pineconeIndex;
(async () => {
  try {
    pineconeIndex = await pc.Index("ghana");
    console.log("Pinecone index initialized successfully");
  } catch (error) {
    console.error("Error initializing Pinecone index:", error);
  }
})();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    console.log('Signup attempt:', { username, role }); // Log signup attempt

    // Check if the role is valid
    if (role !== 'hr' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    console.log('User created successfully:', username); // Log successful creation
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    if (error.name === 'MongooseServerSelectionError') {
      res.status(500).json({ error: 'Unable to connect to the database. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Error creating user', details: error.message });
    }
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, role: user.role, username: user.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// New route for document upload
app.post('/process-document', upload.single('document'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileContent;
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdf(req.file.buffer);
      fileContent = pdfData.text;
    } else {
      fileContent = req.file.buffer.toString('utf8');
    }
   // console.log(fileContent);
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < fileContent.length; i += chunkSize) {
      chunks.push(fileContent.slice(i, i + chunkSize));
    }
    //console.log(chunks);
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: chunks[i],
        encoding_format: "float"
      });
      const embedding = embeddingResponse.data[0].embedding;
      //console.log(embedding);
      vectors.push({
        id: `doc_${Date.now()}_chunk_${i}`,
        values: embedding,
        metadata: { content: chunks[i] }
      });
    }

    await pineconeIndex.upsert(vectors);

    // Add document analysis
    const analysisPrompt = `Analyze the following document and suggest improvements:\n\n${fileContent}`;

    const analysisCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are an expert HR document analyst."},
        {role: "user", content: analysisPrompt}
      ]
    });

    const analysis = analysisCompletion.choices[0].message.content.trim();

    res.json({ 
      message: 'Document processed and indexed successfully',
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing document:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Error processing document', details: error.message });
  }
});

// Update the query route
app.post('/query', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { query } = req.body;

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: query,
      encoding_format: "float"
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });

    const relevantContent = queryResponse.matches.map(match => match.metadata.content).join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are a helpful assistant that answers questions about Ghana's labor laws."},
        {role: "user", content: `Based on the following information about Ghana's labor laws, answer the question: "${query}"\n\nRelevant information:\n${relevantContent}`}
      ]
    });

    const result = completion.choices[0].message.content.trim();

    res.json({ result });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Error processing query', details: error.message });
  }
});

// New route for admin to create HR officers
app.post('/create-hr', async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: 'hr' });
    await user.save();
    res.status(201).json({ message: 'HR officer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating HR officer' });
  }
});

// Update the create-user route
app.post('/create-user', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Ensure that only 'user' and 'hr' roles can be created
    if (role !== 'user' && role !== 'hr') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// New route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {  // Changed from 'hr' && 'admin' to just 'admin'
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await User.find({}, 'username role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// New route to delete a user
app.delete('/delete-user/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// New route to promote HR to Admin
app.put('/promote-to-admin/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'hr') {
      return res.status(400).json({ error: 'User is not an HR officer' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error promoting user to admin' });
  }
});

// New route to request admin promotion
app.post('/request-admin-promotion', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.adminRequestPending = true;
    await user.save();

    res.json({ message: 'Admin promotion request sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error requesting admin promotion' });
  }
});

// New route to approve admin promotion
app.put('/approve-admin-promotion/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'hr' || !user.adminRequestPending) {
      return res.status(400).json({ error: 'Invalid promotion request' });
    }

    user.role = 'admin';
    user.adminRequestPending = false;
    await user.save();

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error promoting user to admin' });
  }
});

// New route for generating HR documents
app.post('/generate-document', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { documentType, additionalInfo } = req.body;

    const prompt = `Generate a ${documentType} policy for a company in Ghana. Include the following details: ${additionalInfo}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are an expert HR policy writer for companies in Ghana."},
        {role: "user", content: prompt}
      ]
    });

    const generatedDocument = completion.choices[0].message.content.trim();

    res.json({ document: generatedDocument });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: 'Error generating document', details: error.message });
  }
});

// New route for processing CSV performance reviews
app.post('/process-performance-review', upload.single('csvFile'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'hr' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = req.file.buffer.toString('utf8');

    // Here you would process the CSV content
    // For this example, we'll just pass it to the AI for analysis

    const analysisPrompt = `Analyze the following CSV performance review data. Identify top performers and recommend training:\n\n${csvContent}`;

    const analysisCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are an expert HR analyst specializing in performance reviews."},
        {role: "user", content: analysisPrompt}
      ]
    });

    const analysis = analysisCompletion.choices[0].message.content.trim();

    res.json({ analysis: analysis });
  } catch (error) {
    console.error('Error processing performance review:', error);
    res.status(500).json({ error: 'Error processing performance review', details: error.message });
  }
});

// Update the root route
app.get('/', (req, res) => {
  if (isConnected) {
    res.send('connected');
  } else {
    res.send('not connected');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // This is important for Vercel
