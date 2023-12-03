
const Customer = require('../models/customers');
const Product = require('../models/product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

exports.customerHomePage = (request, response, next) => {
    response.sendFile('home.html', { root: 'views/customer' });
}
exports.customerSignup = async (request, response, next) => {
    try {
        const { name, email, phonenumber, password } = request.body;
        let customerExist = await Customer.fetchCustomer(email);
        console.log(customerExist);
        if (!customerExist) {
            const hash = await bcrypt.hash(password, 10);
            const customer = new Customer(name, email, phonenumber, hash)
            const { insertedId } = await customer.save();
            const customerId = insertedId.toString();
            const token = jwt.sign({ customerId }, secretKey, { expiresIn: '1h' });
            response.cookie('token', token, { maxAge: 3600000 });
            return response.status(201).json({ message: "Customer Account created successfully" });
        } else {
            return response.status(409).json({ message: 'Email or Phone Number already exist!' })
        }


    } catch (error) {
        console.log(error);
    }
}

exports.CustomerSignin = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        let customerExist = await Customer.fetchCustomer(email);
        if (customerExist) {
            const isPasswordValid = await bcrypt.compare(password, customerExist.password);
            if (isPasswordValid) {
                const customerId = customerExist._id.toString()
                const token = jwt.sign({ customerId }, secretKey, { expiresIn: '1h' });
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

exports.getProducts = async (request, response, next) => {
    try {
        const pageNo = request.query.pageNo;
        const limit = Number(request.query.noProducts);
        const offset = (pageNo - 1) * limit;
        const products = await Product.fetchProducts(offset,limit);
        return response.status(200).json({
            products,
            newHasMoreProducts: products.length === limit,
            newHasPreviousProducts: pageNo > 1,
            message: "Product  successfully fetched"
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal Server Error unable to getproducts' });
    }
}
exports.getProduct = async (request, response, next) => {
    try {
        const productId = request.params.productId;
        const product = await Product.fetchProduct(productId)
        return response.status(201).json({ product, message: "Product fetched successfully" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal Server Error unable to getproduct' });
    }
}

exports.addToCart = async (request, response, next) => {
    try {
        const {customerId} = request;
        const {productId }= request.params;
        const { cart }= await Customer.fetchById(customerId);
        const {productName,productPrice }= await Product.fetchProduct(productId);
        // Check if product already exists in cart
        const { items }= cart
        // If product doesn't exist in cart, create a new cart item
        let itemIndex = items.findIndex(ele=> ele.productId == productId)
        if (items.length==0||itemIndex==-1) {
            items.push({
                productId,
                productName,
                productPrice,
                quantity:1
            })
            await Customer.addtoCart(customerId,items)
        }
        else {
            items[itemIndex].quantity += 1;
            await Customer.addtoCart(customerId,items)
        }
        return response.status(201).json({ message: "Product successfully added to cart" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal Server Error unable to add product to cart' });
    }
}

exports.getShoppingCart = async (request, response, next) => {
    try {
        const {customerId} = request;
        const { cart }= await Customer.fetchById(customerId);
        const { items }= cart
        const products = items.map((ele)=>{
            return {
                id: ele.productId,
                productName: ele.productName,
                productPrice: ele.productPrice,
                quantity: ele.quantity
            }
        })
        return response.status(201).json({ products, message: 'Successfully retrieved shopping Cart' });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'unable to fetch Shopping Cart details' });
    }
}

exports.deceaseFromCart = async (request, response, next) => {
    try {
        const {productId} = request.params;
        const {customerId} = request;
        const { cart: { items } } = await Customer.fetchById(customerId);
        let itemIndex = items.findIndex(ele=> ele.productId == productId)
        if (items[itemIndex].quantity > 1) {
            items[itemIndex].quantity-= 1;
            await Customer.addtoCart(customerId,items)
            return response.status(201).json({ message: "Product Quantity updated successfully" });
        } else {
            items.splice(itemIndex,1);
            await Customer.addtoCart(customerId,items)
            return response.status(201).json({ message: "Product removed from cart" })
        }

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.increaseFromCart = async (request, response, next) => {
    try {
        const {productId} = request.params;
        const {customerId} = request;
        const { cart: { items } } = await Customer.fetchById(customerId);
        let itemIndex = items.findIndex(ele=> ele.productId == productId);
        items[itemIndex].quantity += 1;
        await Customer.addtoCart(customerId,items)
        return response.status(201).json({ message: "Product Quantity updated successfully" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.deleteFromCart = async (request, response, next) => {
    try {
        const {productId} = request.params;
        const {customerId} = request;
        const { cart: { items } } = await Customer.fetchById(customerId);
        let itemIndex = items.findIndex(ele=> ele.productId == productId);
        items.splice(itemIndex,1);
        await Customer.addtoCart(customerId,items)
        return response.status(201).json({ message: "Product removed successfully" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.getOrderHistory = async (request, response, next) => {
    try {
        const {customerId} = request;
        const { order: { order_items } } = await Customer.fetchById(customerId);
        const orders = order_items.filter((ele=>ele.status=="Successfull")).map((order) => {
            const products = order.products.map((product) => {
                return {
                    productName: product.productName,
                    productPrice: product.productPrice,
                    quantity: product.quantity
                }
            });
            return {
                id: order.order_id,
                date: order.createdAt,
                Products: products
            }
        })
        response.status(200).json({ orders, message: "Order history successfully fetched" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to get Order History' });
    }
}




