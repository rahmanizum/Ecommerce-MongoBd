
const Customer = require('../models/customers');
const Razorpay = require('razorpay');
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
exports.paymentInitiate = async (request, response, next) => {
    try {
        const {customerId} = request;
        const { cart: { items } } = await Customer.fetchById(customerId);
        let totalAmount = 0;
        items.forEach((product)=>{
            totalAmount += product.productPrice * product.quantity;
        });
        const taxPrice = ((totalAmount * 2.5) / 100);
        const finalAmount = (totalAmount + taxPrice).toFixed(2)
        if (items.length>0) {
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
            const customer = await  Customer.fetchById(customerId)
            const order = await Customer.createOrder(customerId,{
                order_id: id,
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
        const {customerId} = request;
        const { order: { order_items } , cart:{items}} = await Customer.fetchById(customerId);
        let itemIndex = order_items.findIndex(ele=>ele.order_id==order_id);
        order_items[itemIndex].payment_id = payment_id;
        order_items[itemIndex].status = "Successfull";
        order_items[itemIndex].createdAt = new Date();
        order_items[itemIndex].products = items
        await Customer.updateOrder(customerId,order_items);
        items.length = 0 ;
        await Customer.addtoCart(customerId,items);
        response.status(202).json({ success: true, message: "Payment is successfull and Check Order History for more" });
    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, message: "Error updating transaction we will get back to you" });
    }
}