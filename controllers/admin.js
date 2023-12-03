

const Admin = require('../models/admins');
const Product = require('../models/product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
exports.adminHomePage = (request, response, next) => {
    response.sendFile('home.html', { root: 'views/admin' });
}

exports.adminSignup = async (request, response, next) => {
    try {
        const { name, email, phonenumber, password } = request.body;
        let adminExist = await Admin.fetchAdmin(email);
        if (!adminExist) {
            const hash = await bcrypt.hash(password, 10);
            const admin = new Admin(name, email, phonenumber, hash)
            const { insertedId } = await admin.save();
            const adminId = insertedId.toString();
            const token = jwt.sign({ adminId }, secretKey, { expiresIn: '1h' });
            response.cookie('token', token, { maxAge: 3600000 });
            return response.status(201).json({ message: "admin Account created successfully" });
        } else {
            return response.status(409).json({ message: 'Email or Phone Number already exist!' })
        }
            const hash = await bcrypt.hash(password, 10);
            const adminObj = new Admin(name,email,phonenumber,hash);
            await adminObj.save();
            return response.status(201).json({ message: "Admin Account created successfully" });
    } catch (error) {
        console.log(error);
    }
}
exports.adminSignin = async (request, response, next) => {
    try {
        const { email, password } = request.body;
         let adminExist = await Admin.fetchAdmin(email);
        if (adminExist) {
            const isPasswordValid = await bcrypt.compare(password, adminExist.password);
            if (isPasswordValid) {
                const adminId = adminExist._id.toString();
                const token = jwt.sign({ adminId }, secretKey, { expiresIn: '1h' });
                response.cookie('token', token, { maxAge: 3600000 });
                return response.status(201).json({ message: "Username and password correct" })
            } else {
                return response.status(401).json({ message: 'Invalid Password!' })
            }
        } else {
            return response.status(409).json({ message: 'Account is not exist!' })
        }
        
    } catch (error) {
        console.log(error);
    }
}
exports.addproduct = async (request, response, next) => {
    try {
        const adminId = request.adminId;
        const { productName, productQuantity, productPrice, productDescription, imageUrl } = request.body;
        const productObj = new Product(adminId,productName,productQuantity,productPrice,productDescription,imageUrl);
        await productObj.save(); 

        return response.status(201).json({ message: "Product created successfully" });
    } catch (err) {
        console.error(err);
        response.status(500).json({message:'Internal Server Error unable to add product'});
    }
}
exports.getProducts = async (request, response, next) => {
    try {        
        const adminId = request.adminId;
        const pageNo = request.query.pageNo;
        const limit = Number(request.query.noProducts);
        const offset = (pageNo - 1) * limit;
        const products= await Product.fetchProducts(offset,limit,adminId);
        response.status(200).json({
            products,
            newHasMoreProducts : products.length === limit,
            newHasPreviousProducts : pageNo > 1,
            message: "Product  successfully fetched"
        });
        
        

    } catch (error) {
        console.error(error);
        response.status(500).json({message:'Internal Server Error unable to getproducts'});
    }
}
exports.getProduct = async (request,response,next) =>{
    try {
        const productId = request.params.productId;
        const product = await Product.fetchProduct(productId);
        return response.status(201).json({product, message: "Product fetched successfully" });
        
    } catch (error) {
        console.error(error);
        response.status(500).json({message:'Internal Server Error unable to getproduct'});
    }
}
exports.updateProduct = async (request, response, next) => {
    try {
        const adminId = request.adminId;
        const productId = request.params.productId;
        const { productName, productQuantity, productPrice, productDescription, imageUrl } = request.body;
        const product = await Product.fetchProduct(productId);
        if(product){
            const productObj = new Product(adminId,productName,productQuantity,productPrice,productDescription,imageUrl,productId);
            await productObj.save(); 
            return response.status(200).json({ message: "Product updated successfully"});
        }else{
            return response.status(404).json({ message: "Product not found" }); 
        }
        
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Internal Server Error unable to update product' });
    }
}
exports.deleteProduct = async (request,response,next) =>{
    try {
        const productId = request.params.productId;
        const res = await Product.deleteById(productId);
        if(res.deletedCount){
            return response.status(200).send('Product Successfully Deleted');
        }else{
            return response.status(404).json({ message: "Product not found" }); 
        }
        
    } catch (error) {
        console.error(error);
        response.status(500).json({message:'Internal Server Error unable to delete product'});       
    }
}
