
const Customer = require('../models/customers');
const Product = require('../models/product');
// const Cart = require('../models/cart');
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

exports.handleAddToCart = async (request, response, next) => {
    try {
        const productId = request.params.productId;
        let newQuantity = 1;
        const cart = await request.customer.getCart();
        const uniqueProduct = await Product.findByPk(productId);
        // Check if product already exists in cart
        const cartProduct = await cart.getProducts({ where: { id: productId } });
        // If product doesn't exist in cart, create a new cart item
        if (!cartProduct[0]) {
            cart.addProduct(uniqueProduct, { through: { quantity: newQuantity } });
        }
        else {
            const oldQuantity = cartProduct[0].CartItem.quantity;
            newQuantity = oldQuantity + 1;
            cart.addProduct(uniqueProduct, { through: { quantity: newQuantity } });
        }
        return response.status(201).json({ message: "Product successfully added to cart" });

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal Server Error unable to add product to cart' });
    }
}

exports.getShoppingCart = async (request, response, next) => {
    try {
        const customer = request.customer;
        const shoppingCart = await customer.getCart();
        const productsInCart = await shoppingCart.getProducts({
            attributes: ['id', 'productName', 'productPrice',],
        });
        const products = productsInCart.map(product => {
            const cartItem = product.CartItem;
            return {
                id: product.id,
                productName: product.productName,
                productPrice: product.productPrice,
                quantity: cartItem.quantity
            };
        });

        return response.status(201).json({ products, message: 'Successfully retrieved shopping Cart' });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'unable to fetch Shopping Cart details' });
    }
}

exports.deceaseFromCart = async (request, response, next) => {
    const productId = request.params.productId;
    try {
        const cart = await request.customer.getCart();
        const product = await cart.getProducts({ where: { id: productId } });
        if (product[0].CartItem.quantity > 1) {
            let newQuantity = product[0].CartItem.quantity - 1;
            cart.addProduct(product[0], { through: { quantity: newQuantity } });
            return response.status(201).json({ message: "Product Quantity updated successfully" });
        } else {
            await product[0].CartItem.destroy();
            return response.status(201).json({ message: "Product removed from cart" })
        }

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.increaseFromCart = async (request, response, next) => {
    const productId = request.params.productId;
    try {
        const cart = await request.customer.getCart();
        const product = await cart.getProducts({ where: { id: productId } });
        let newQuantity = product[0].CartItem.quantity + 1;
        cart.addProduct(product[0], { through: { quantity: newQuantity } });
        return response.status(201).json({ message: "Product Quantity updated successfully" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.deleteFromCart = async (request, response, next) => {
    const productId = request.params.productId;
    try {
        const cart = await request.customer.getCart();
        const product = await cart.getProducts({ where: { id: productId } });
        await product[0].CartItem.destroy();
        return response.status(201).json({ message: "Product removed successfully" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to add update product quantity' });
    }
}
exports.getOrderHistory = async (request, response, next) => {
    try {
        const Allorders = await request.customer.getOrders({
            attributes: ['id', 'date', 'status'],
            include: [
                {
                    model: Product,
                    attributes: ['productName', 'productPrice'],
                },
            ],
            where: {
                status: "Successful",
            }
        });
        const orders = Allorders.map((order) => {
            const products = order.Products.map((product) => {
                const orderItem = product.OrderItem;
                return {
                    productName: product.productName,
                    productPrice: product.productPrice,
                    quantity: orderItem.quantity
                }
            });
            return {
                id: order.id,
                date: order.date,
                Products: products
            }
        })
        response.status(200).json({ orders, message: "Order history successfully fetched" });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal Server Error unable to get Order History' });
    }
}




