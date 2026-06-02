require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User.model');
const Log = require('./models/Log.model');
const Alert = require('./models/Alert.model');

connectDB();

const seedData = async () => {
  try {
    // Clear data
    await User.deleteMany();
    await Log.deleteMany();
    await Alert.deleteMany();
    
    // Seed users with face data
    const users = [
      { 
        email: 'operator@campus.edu',
        name: 'Operator (Superuser)',
        idNumber: 'OPERATOR001',
        password: 'password',
        role: 'admin',
        faceImages: [{ data: '/9j/4AAQSkZJRgABAQAAAQABAAD...' }],
        faceEmbedding: Array(128).fill(0.15).map((v,i) => v + i*0.0009)
      },
      { 
        email: 'admin@test.com', 
        name: 'Admin User',
        idNumber: 'ADMIN001',
        password: 'admin123', 
        role: 'admin',
        faceImages: [{ data: '/9j/4AAQSkZJRgABAQAAAQABAAD...' }], // dummy base64
        faceEmbedding: Array(128).fill(0.1).map((v,i) => v + i*0.001) // dummy 128-dim vec
      },
      { 
        email: 'guard@test.com', 
        name: 'Security Guard',
        idNumber: 'GUARD101',
        password: 'guard123', 
        role: 'guard',
        faceImages: [{ data: '/9j/4AAQSkZJRgABAQAAAQABAAD...' }],
        faceEmbedding: Array(128).fill(0.2).map((v,i) => v + i*0.0008)
      },
      { 
        email: 'user@test.com', 
        name: 'John Student',
        idNumber: 'STUDENT456',
        password: 'user123', 
        role: 'user',
        faceImages: [{ data: '/9j/4AAQSkZJRgABAQAAAQABAAD...' }],
        faceEmbedding: Array(128).fill(0.05).map((v,i) => v + i*0.0012)
      }
    ];

    const seededUsers = [];
    for (let userData of users) {
      const user = new User(userData);
      await user.save();
      seededUsers.push(user);
      console.log(`Created user: ${user.email} (${user.idNumber})`);
    }

    const userId = seededUsers[2]._id; // user@test.com

    // Sample logs (AI/smart)
    const sampleLogs = [
      { userId, status: 'Authorized', method: 'face', reason: 'AI conf 0.92', gateName: 'Main Gate' },
      { userId, status: 'Unauthorized', method: 'face', reason: 'Unknown face (conf 0.23)', gateName: 'Main Gate' },
      { userId, status: 'Authorized', method: 'card', reason: 'RFID match', gateName: 'Side Gate' },
      { userId, status: 'Unauthorized', method: 'manual', reason: 'Guard override deny', gateName: 'Main Gate' }
    ];

    for (let logData of sampleLogs) {
      const log = new Log(logData);
      await log.save();
      console.log(`Created log: ${log.method} ${log.status}`);
    }

    // Sample alerts
    const sampleAlerts = [
      { userId, type: 'Unauthorized Access', message: '3 failed face at Main Gate', severity: 'high' },
      { userId, type: 'Suspicious Activity', message: 'Low conf pattern detected', severity: 'medium' }
    ];

    for (let alertData of sampleAlerts) {
      const alert = new Alert(alertData);
      await alert.save();
      console.log(`Created alert: ${alert.type}`);
    }

    console.log('Full seeding complete! Users:4, Logs:4, Alerts:2');
    console.log('Test: npm start, then POST /api/access-event w/ useAI:true + fake base64 image');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();

