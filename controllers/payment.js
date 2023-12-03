const Order = require('../models/order');
const Razorpay = require('razorpay');
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
exports.paymentInitiate = async (request, response, next) => {
    try {
        const customer = request.customer;
        const cart = await customer.getCart();
        const products = await cart.getProducts();
        let totalAmount = 0;
        products.forEach((product)=>{
            totalAmount += product.productPrice * product.CartItem.quantity;
        });
        const taxPrice = ((totalAmount * 2.5) / 100);
        const finalAmount = (totalAmount + taxPrice).toFixed(2)
        if (products[0]) {
            const rzpintance = new Razorpay({
                key_id: key_id,
                key_secret: key_secret
            })
            var options = {
                amount: finalAmount*100,
                currency: "INR",
            };
            const orderDetails = await rzpintance.orders.create(options);
            const { id, status } = orderDetails;
            const order = await customer.createOrder({
                orderid: id,
                status: status,
            });
            return response.status(200).json({ key_id: key_id, orderid: id , customer});
        } else {
            return response.status(403).json({ message: 'No Products in Cart!'})    
        }

    } catch (error) {
        console.log(error);
        return response.status(500).json({message:"Something went wrong try later"})
    }
}
exports.updatetransaction = async (request, response, next) => {
    try {
        const { order_id, payment_id } = request.body;
        await Order.update({ paymentid: payment_id, status: "Successful" },
        { where: { orderid: order_id }})
        const cart = await request.customer.getCart();
        const products = await cart.getProducts();
        const order = await Order.findOne({ where: { orderid: order_id }});
        cart.setProducts(null);

        response.status(202).json({ success: true, message: "Payment is successfull and Check Order History for more" });
    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, message: "Error updating transaction we will get back to you" });
    }
}