const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({extended: false});

const uri = "mongodb+srv://NaoremHemlet:H5ml5t@cluster0.los8o.mongodb.net/MyDatabase?retryWrites=true&w=majority";

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then( ()=> {
    console.log("Connected to database");
    app.listen(3000);
    console.log('Listening in localhost:3000');
}).catch( (err) =>{console.log(err);});

var schema = new mongoose.Schema({
    _id: Number,
    name: String,
    email: String,
    balance: Number,
    data: [{recipient: String, amount: Number, direction: String}]
}, {collection: 'customers'});

var MyDatabase = mongoose.model('MyDatabase', schema);

MyDatabase.find({}, (err, docs)=>{
    customers = docs;
    if(err) throw err;

    app.get('/', function(req, res){
        res.render('index');
    });
    app.get('/home', function(req, res){
        res.render('index');
    });
    app.get('/customers', function(req, res){
        res.render('customers', {customers: customers});
    });
    app.get('/customers/:name', function(req, res){
        const name = req.params.name;
        for(var i=0; i < customers.length; i++){
            if(name == customers[i].name){
                res.render('transfer', {customer: customers[i], customers: customers, data: customers[i].data});
            }
        }
       
    });
    
    app.post('/customers/:name', urlencodedParser, function(req, res){
        const name = req.params.name;
        response = {
            recipient: req.body.recipient,
            amount: req.body.amount,
            direction: 'To'
        }
        request = {
            recipient: name,
            amount: req.body.amount,
            direction: 'From'
        }

        if(name == req.body.recipient){
            res.send('You have send it to your same-account-name. Please return and check again.');
        }
        else{
            MyDatabase.findOneAndUpdate(
                { name: req.body.recipient },
                { $push: { data: request }, $inc: {balance: req.body.amount} },
              ).exec(function(err,docs){
                if (docs == null){
                    res.send('Recipient Name not register. Please return and check the name of recipient properly');
                }
                else{
                    MyDatabase.findOneAndUpdate(
                        { name: name },
                        { $push: { data: response }, $inc: { balance: - req.body.amount} },
                      ).exec(function(){
                        MyDatabase.find({}, (err, docs)=>{
                            customers = docs;
                            for(var i=0; i < customers.length; i++){
                                if(name == customers[i].name){
                                    res.render('transfer', {customer: customers[i], customers: customers, data: customers[i].data});
                                }
                            }
                        });
                      });
                }
              });
        }
    
    });
});