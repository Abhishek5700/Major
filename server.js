import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import pusher from 'pusher'
require("../db/conn");
import mongodata from './mongodata.js'

// app config
const app = express() 
const port = process.env.port || 8000

// middle ware
app.use(cors())
app.use(express.json())

const changestream = mongoose.connection.collection('conversations').watch()

changestream.on('change',(change)=>{
    if (change.operationtype === 'insert'){
        pusher.trigger('channels', 'newchannel',{
            'change': change
        });
    } else if (change.operationtype === 'update'){
        pusher.trigger('conversation', 'newmessage',{
            'change': change
        });
    } else {
        console.log('errror triggering pusher')
    }

    
})


// api routers
app.get('/',(res,req)=>res.status(200).send('hello clever programmer'))

app.post('/new/channel',(req,res)=> {
    const dbdata = req.body
    mongodata.create(dbdata,(err,data)=>{
        if (err) {
            res.status(500).send(err)
        }
         else {
             res.status(201).send(data)
        }
    })
})
app.post('/new/message',(req,res)=>{
    const id = req.query.id
    const newmessage = req.body

    mongodata.updateMany(
        {_id: iid},
        {$push: {conversation: newmessage}},
        (err,data)=>{
            if(err){
                res.status(500).send(err)
            } else {
                res.status(201).send(data)
            
            }
        }

    )
})

app.get('/get/channellist',(req,res) => {
    mongodata.find((err,data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            let channels =[]

            data.map((channeldata)=>{
                const channelinfo={
                    id: channeldata._id,
                    name: channeldata.channelname
                }
                channels.push(channelinfo)
                
            })
            res.status(200).send(channels)
        }
    })

})

// listen
//app.listen(port,() => console.log('listening on localhost:${port}'))
app.listen(8000, () => {
    console.log("listing the port at 8000");
});

