//creating the http server using js
const express = require ('express')
const app = express()

const hbs = require ('express-handlebars')
const path = require ('path')

app.use (express.json()) //allows to post the json data when we make a post request

//serving common static files
app.use(express.static(path.join(__dirname, 'public'))) 

//connect mongodb database
require ('./server/database/database')();
//setup view engine
app.set ('view engine', 'hbs');

app.engine ('hbs', hbs({
    extname: 'hbs',
    defaultView: 'default',
    layoutsDir: path.join (__dirname, 'views'),
    partialDir: path.join (__dirname, 'views')
}));

// //routes
// app.get ('/', (req, res) => {
//     res.render('main');
// });

//calling routes
app.use ('/', require ('./server/router/router'));

app.listen(3001, () => console.log(`Server is stated on http://localhost:3001`));