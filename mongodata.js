import mongoose from  'mongoose'

const slackschema =  mongoose.schema({
    channelName: String,
    conversation: [
        {
            message: String,
            timestamp: String,
            user: String,
            userImage: String
        }
    ]    
})

export default mongoose.model('conversation',slackschema) 