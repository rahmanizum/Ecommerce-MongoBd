const Customer = require('../models/customers');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

exports.verifyAuthorization = async(request,response,next)=>{
    try {
        const token = request.cookies.token;
        const {customerId}= jwt.verify(token,secretKey);
        const {_id}= await Customer.fetchById(customerId)
        if(_id){
            request.customerId = _id.toString();
            next(); 
        }else{
            response.status(401).send({message:"Unauthorized"});
        }
      
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            response.status(401).json({ message: 'Time out please sign in again' });
        } else {
            console.log('Error:', error);
            response.status(500).json({ message: 'Something went wrong  - please sign again' });
        }
    }
}