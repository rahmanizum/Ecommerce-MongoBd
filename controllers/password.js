const Customer = require('../models/customers');
const Admin = require('../models/admins');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk');
const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.adminResetpasswordMail = async (request, response, next) => {
    try {

        const { email } = request.body;
        const admin = await Admin.fetchByEmail(email);
        if (admin) {
            const sender = {
                email: 'ramanizum@gmail.com',
                name: 'From Mufil Rahman Pvt.Ltd'
            }
            const receivers = [
                {
                    email: email
                }
            ]
            const newUUID = uuidv4();
            await Admin.createForgotPassword(admin._id, {
                forgotId: newUUID,
                isActive: true,
                createdAt: new Date()
            });
            const mailresponse = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: "Reset Your Password",
                htmlContent: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Password Reset</title>
                    </head>
                    <body>
                        <div class="container">
                            <div class="row">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <h1 class="text-center">Reset Your Password</h1>
                                            <p class="text-center">Click the button below to reset your admin account password:</p>
                                            <div class="text-center">
                                                <a href="${process.env.WEBSITE}/password/admin/reset/{{params.role}}" class="btn btn-primary">Reset Password</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>`,
                params: {
                    role: newUUID
                }
            })
            response.status(200).json({ message: 'Password reset email sent' });
        } else {
            response.status(404).json({ message: 'customer not found' });
        }


    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Interenal Server Error' });
    }
}
exports.adminResetpasswordform = async (request, response, next) => {
    try {
        const { forgotId } = request.params;
        const  admin  = await Admin.fetchByForgotId(forgotId);
        const { forgotPassword } = admin;
        if (forgotPassword.isActive) {
            forgotPassword.isActive = false;
            await Admin.updateForgotPassword(admin._id,forgotPassword)
            response.sendFile('reset.html', { root: 'views/admin' })
        } else {
            return response.status(401).json({ message: "Link has been expired" })
        }

    } catch (error) {

    }
}

exports.adminResetpassword = async (request, response, next) => {
    try {
        const { resetid, newpassword } = request.body;
        const  admin  = await Admin.fetchByForgotId(resetid);
        const { forgotPassword } = admin;
        const currentTime = new Date();
        const createdAtTime = new Date(forgotPassword.createdAt);
        const timeDifference = currentTime - createdAtTime;
        const timeLimit = 5 * 60 * 1000;
        if (timeDifference <= timeLimit) {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            await Admin.updatePassword(admin._id,hashedPassword)
            response.status(200).json({ message: "Password reset successful." });
        } else {
            response.status(403).json({ message: "Link has expired Generate a new link" });
        }

    } catch (error) {
        console.error("Error resetting password:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};

exports.customerResetpasswordMail = async (request, response, next) => {
    try {
        ;
        const { email } = request.body;
        const customer = await Customer.fetchCustomer(email);
        if (customer) {
            const sender = {
                email: 'ramanizum@gmail.com',
                name: 'From Mufil Rahman Pvt.Ltd'
            }
            const receivers = [
                {
                    email: email
                }
            ]
            const newUUID = uuidv4();
            await Customer.createForgotPassword(customer._id, {
                forgotId: newUUID,
                isActive: true,
                createdAt: new Date()
            });
            const mailresponse = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: "Reset Your Password",
                htmlContent: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Password Reset</title>
                    </head>
                    <body>
                        <div class="container">
                            <div class="row">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <h1 class="text-center">Reset Your Password</h1>
                                            <p class="text-center">Click the button below to reset your customer account password:</p>
                                            <div class="text-center">
                                                <a href="${process.env.WEBSITE}/password/customer/reset/{{params.role}}" class="btn btn-primary">Reset Password</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>`,
                params: {
                    role: newUUID
                }
            })
            response.status(200).json({ message: 'Password reset email sent' });
        } else {
            response.status(404).json({ message: 'Account not found' });
        }


    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Interenal Server Error' });
    }
}
exports.customerResetpasswordform = async (request, response, next) => {
    try {
        const { forgotId } = request.params;
        const  customer  = await Customer.fetchByForgotId(forgotId);
        const { forgotPassword } = customer;
        if (forgotPassword.isActive) {
            forgotPassword.isActive = false;
            await Customer.updateForgotPassword(customer._id,forgotPassword)
            response.sendFile('reset.html', { root: 'views/customer' })
        } else {
            return response.status(401).json({ message: "Link has been expired" })
        }

    } catch (error) {

    }
}
exports.customerResetpassword = async (request, response, next) => {
    try {
        const { resetid, newpassword } = request.body;
        const  customer = await Customer.fetchByForgotId(resetid);
        const { forgotPassword } = customer;
        const currentTime = new Date();
        const createdAtTime = new Date(forgotPassword.createdAt);
        const timeDifference = currentTime - createdAtTime;
        const timeLimit = 5 * 60 * 1000;
        if (timeDifference <= timeLimit) {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            await Customer.updatePassword(customer._id,hashedPassword)
            response.status(200).json({ message: "Password reset successful." });
        } else {
            response.status(403).json({ message: "Link has expired Generate a new link" });
        }



    } catch (error) {
        console.error("Error resetting password:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};






