const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));


const connection = mysql.createConnection({
    host: 'localhost',      // Database host
    user: 'root',           // Your database username
    password: 'Sandeep@2001',   // Your Connection password
    database: 'myDiary' // The name of the database
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

app.get('/', (req, res) => {
    console.log(req)
    res.status(200).json({ message: 'sucessful' })
})

app.post('/registerUser', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password: ", hashedPassword)
        connection.query(`insert into Users(EmailID,HashedPassword) values('${email}','${hashedPassword}')`, (err, results) => {
            if (err) {
                res.status(500).send('no')
            }
            res.status(200).send('okay')
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Error while hashing password');
    }
})

app.post('/userLogin', async (req, res) => {
    console.log("User logged in: ", req.body);
    const { email, password } = req.body;
    // let hashedPassword="asasasasasas"
    // let hashedPassword = "$2b$10$gHIyn9AKUkhoULo5BVkz5ul/wuNoV/PLLFUFE9ELum2XFbWPfvp7e";
    let hashedPassword = '';
    let userID = ''
    connection.query(`select ID,HashedPassword from Users where EmailID='${email}'`, async (err, result) => {
        if (err) {
            res.status(500);
            return
        }
        // console.log("Line 63: ",result);
        hashedPassword = result[0].HashedPassword;
        userID = result[0].ID;
        let response = await bcrypt.compare(password, hashedPassword)
        if (response) {
            res.status(200).json({ userID: userID });
            return
        }
        else {
            res.status(500)
            return
        }
    })

    // console.log('Is same? ', response);
})

app.post('/newPost', async (req, res) => {

    const { postTitle, postDescription, userID } = req.body;
    connection.query(`insert into Posts(UserID,postTitle,postDescrition) values(${userID},"${postTitle}","${postDescription}")`, async (err, response) => {
        if (err) {
            res.status(500);
            return
        }
        res.status(200)
    })
})

app.get('/getMyPosts', async (req, res) => {
    console.log(req.query)
    connection.query(`select * form Posts where UserID=${req.query.userID}`, (err, result) => {
        if (err) {
            res.status(500)
            return
        }
        res.status(200).send(result);
    })
})

app.listen(3000, () => {
    console.log("Server 3000 is running successfully....!")
})