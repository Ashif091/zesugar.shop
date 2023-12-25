const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const connectDb = require('./config/dbConnection')
const path = require('path')
const nocache = require('nocache');
const dotenv = require('dotenv').config()
const app = express();       

const PORT =process.env.PORT          
connectDb()  
app.use(cookieParser());
app.use(nocache()); 
  
app.use(session({ 
  secret: 'my-secret-key', 
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 24*60*60*1000 }
}));

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));
 

app.use('/',require("./routes/userRoutes")) 
app.use('/admin',require("./routes/adminRoutes"))
app.get("*", (req, res) => {
  const error = `path error ,Enter http://localhost:${PORT}`;
  return res.status(404).render("404page", { error});
});


       
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log(`running at http://localhost:${PORT}`);  
})    
