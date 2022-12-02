//'use strict';
const router = require('express').Router();
const axios = require('axios')
const request = require('request')
const User = require('../models/userModel')

const encode = require('node-base64-image').encode
const decode = require('node-base64-image').decode

async function getImage(id) {
    let fname = id + Date.now()
    const res = await axios.get(`https://graph.facebook.com/v15.0/${id}`, {
        headers: {
            "Authorization": `Bearer ${process.env.Meta_WA_accessToken}`
        }
    })

    let url = res.data.url
    var options = {
        string: true,
        headers: {
            "User-Agent": "my-app",
            "Authorization": `Bearer ${process.env.Meta_WA_accessToken}`

        }
    }
    const image = await encode(url, options)
    const image2 = await decode(image, { fname: "./uploads/" + fname, ext: "jpg" })
    const fname2 = fname + ".jpg"
    return (fname2)
}

const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');
const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.Meta_WA_accessToken,
    senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: process.env.Meta_WA_wabaId,
    graphAPIVersion: 'v15.0'
});

const AttendanceSession = new Map();




//const EcommerceStore = require('./../utils/ecommerce_store.js');
//let Store = new EcommerceStore();
//const CustomerSession = new Map();

router.get('/meta_wa_callbackurl', (req, res) => {
    try {
        console.log('GET: Someone is pinging me! (Get)');

        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        if (mode && token) {
            if (mode === "subscribe" && token === process.env.Meta_WA_VerifyToken) {
                //console.log(challenge)
                //console.log(process.env.Meta_WA_VerifyToken)
                return res.status(200).send(challenge);
            }
            else {
                return res.sendStatus(403);
            }
        }

    } catch (error) {
        console.error({ error })
        return res.sendStatus(500);
    }
});


router.post('/meta_wa_callbackurl', async (req, res) => {
    try {
        console.log('POST: Someone is pinging me! (POST)');

        // let body_param = req.body
        // console.log(JSON.stringify(body_param, null, 2))

        // if (body_param.object) {
        //     if (body_param.entry &&
        //         body_param.entry[0].changes &&
        //         body_param.entry[0].changes[0].value.messages &&
        //         body_param.entry[0].changes[0].value.messages[0]
        //     ) {
        //         let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id
        //         let from = body_param.entry[0].changes[0].value.messages[0].from
        //         let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body
        //         let recipientName = body_param.entry[0].changes[0].value.contacts[0].profile.name
        //         let msg_type = body_param.entry[0].changes[0].value.messages[0].type
        //         let msg_id = body_param.entry[0].changes[0].value.messages[0].id

        //         console.log("phone no: " + phone_no_id)
        //         console.log("from: " + from)
        //         console.log("body param: " + msg_body)
        //         console.log("recipients name: " + recipientName)
        //         console.log("msg type: " + msg_type)
        //         console.log("msg id: " + msg_id)


        //         await axios({
        //             method: "POST",
        //             url: `https://graph.facebook.com/${process.env.Version}/${process.env.Meta_WA_SenderPhoneNumberId}/messages`,
        //             headers: {
        //                 'Authorization': `Bearer ${process.env.Meta_WA_accessToken}`,
        //                 'Content-Type': 'application/json'
        //               },
        //             data: {
        //                 messaging_product: "whatsaap",
        //                 recipient_type: "individual",
        //                 to: from,
        //                 type: "text",
        //                 text: {
        //                     preview_url: false,
        //                     body: "Hi I am Subhan, Your msg is "
        //                 }
        //             }
        //         })
        //             .then(function (response) {
        //                 console.log(response);
        //             })
        //             // .catch(function (error) {
        //             //     console.log("This is error " + error);
        //             // })

        //     }

        let data = Whatsapp.parseMessage(req.body);
        console.log(data)
        if (data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id




            const user = await User.findOne({ whatsaapNumberId: recipientPhone })

            if (user) {

                if (!AttendanceSession.get(recipientPhone)) {
                    AttendanceSession.set(recipientPhone, {
                        attendance: [],
                    });
                }



                if (typeOfMsg === 'text_message') {


                    //session push
                    if (AttendanceSession.get(recipientPhone).attendance[0]) {
                        AttendanceSession.get(recipientPhone).attendance = [];
                        console.log('>>>>>>>>>ok')
                    }

                    AttendanceSession.get(recipientPhone).attendance.push(recipientName)
                    //console.log(AttendanceSession.get(recipientPhone))

                    //-------------------------------------
                    await Whatsapp.sendSimpleButtons({
                        message: `Hello ${recipientName}, \nThank you for using TimeTech Whatsaap Attendance.\nPlease select your transaction`,
                        recipientPhone: recipientPhone,
                        listOfButtons: [
                            {
                                title: 'Check In',
                                id: 'check_in_attendance',
                            },
                            {
                                title: 'Check Out',
                                id: 'check_out_attendance',
                            },
                        ],
                    });
                }

                if (typeOfMsg === 'simple_button_message') {
                    let button_id = incomingMessage.button_reply.id;

                    if (button_id === 'check_in_attendance') {
                        let arr = AttendanceSession.get(recipientPhone).attendance
                        //console.log(arr.length)
                        if (arr.length === 0 || AttendanceSession.get(recipientPhone).attendance[1] || AttendanceSession.get(recipientPhone).attendance[2] || AttendanceSession.get(recipientPhone).attendance[3] || AttendanceSession.get(recipientPhone).attendance[4]) {
                            AttendanceSession.get(recipientPhone).attendance = [];
                            console.log('ok')
                            await Whatsapp.sendText({
                                recipientPhone: recipientPhone,
                                message: `Your session has expired, Please try again by texting 'hi'`,
                            });
                        }
                        else {
                            AttendanceSession.get(recipientPhone).attendance.push('CheckIn')

                            await Whatsapp.sendText({
                                recipientPhone: recipientPhone,
                                message: `Please Take your selfie  📸`,
                            });
                        }


                    }

                    if (button_id === 'check_out_attendance') {
                        let arr1 = AttendanceSession.get(recipientPhone).attendance
                        if (arr1.length === 0 || AttendanceSession.get(recipientPhone).attendance[1] || AttendanceSession.get(recipientPhone).attendance[2] || AttendanceSession.get(recipientPhone).attendance[3] || AttendanceSession.get(recipientPhone).attendance[4]) {
                            AttendanceSession.get(recipientPhone).attendance = [];
                            console.log('ok')
                            await Whatsapp.sendText({
                                recipientPhone: recipientPhone,
                                message: `Your session has expired, Please try again by texting 'hi'`,
                            });
                        }
                        else {
                            AttendanceSession.get(recipientPhone).attendance.push('CheckOut')

                            await Whatsapp.sendText({
                                recipientPhone: recipientPhone,
                                message: `Please Take your selfie  📸`,
                            });
                        }

                    }

                }

                if (typeOfMsg === "media_message") {
                    // if () {

                    // }
                    // else {
                    const id = incomingMessage.image.id
                    let imageFile = getImage(id)
                    imageFile.then(function (result) {
                        AttendanceSession.get(recipientPhone).attendance.push(result)

                    })

                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Please share Your 📌 Location `,
                    });
                    // }

                }

                if (typeOfMsg === "location_message") {
                    AttendanceSession.get(recipientPhone).attendance.push(incomingMessage.location.latitude)
                    AttendanceSession.get(recipientPhone).attendance.push(incomingMessage.location.longitude)



                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Attendance Transaction is registred successfully`,
                    });
                    let name = AttendanceSession.get(recipientPhone).attendance[0]
                    let category = AttendanceSession.get(recipientPhone).attendance[1]
                    let myImage1 = AttendanceSession.get(recipientPhone).attendance[2]
                    let latitude = AttendanceSession.get(recipientPhone).attendance[3]
                    let longitude = AttendanceSession.get(recipientPhone).attendance[4]
                    console.log(name)
                    console.log(category)
                    console.log(myImage1)
                    console.log(latitude)
                    console.log(longitude)



                    AttendanceSession.get(recipientPhone).attendance = [];
                }


            } else {
                await Whatsapp.sendText({
                    recipientPhone: recipientPhone,
                    message: `Hello ${recipientName}, \nSorry you are not registered in WhatsApp Attendance Service`,
                });

            }


        }

        return res.sendStatus(200);
    } catch (error) {
        console.log({ error })
        return res.sendStatus(500);
    }
});
module.exports = router;