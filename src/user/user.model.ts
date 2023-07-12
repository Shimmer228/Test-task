    import mongoose from "mongoose";

    export const UserSchema = new mongoose.Schema({
        username:{type:String, required:true},
        password:{type:String, required:true},
        role:{type:String, required:true, enum: ["administrator", "boss", "regular"]}, 
        bossId:{type:String, required:true}
    });

    export interface User{
        
        id:string,
        username:string,
        password:string,
        role:string,
        bossId:string
        
    }