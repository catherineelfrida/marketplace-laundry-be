const { PrismaClient } = require('@prisma/client')
const { encryptPassword, checkPassword } = require('../../../middleware/auth')
const { JWTsign } = require('../../../middleware/jwt')

const prisma = new PrismaClient();

module.exports = {
  async login(req, res){
    const {username, password} = req.body;
    
    const user = await prisma.user.findFirst({
      where: { username }
    })

    if(!user){
      return res.status(404).json({
        status: "fail",
        message: "User not found."
      })
    }

    const isPasswordCorrect = await checkPassword(
      password, user.password
    )
    
    if(!isPasswordCorrect){
      return res.status(401).json({
        status: "fail",
        message: "Password is incorrect."
      })
    }

    delete user.password
    const token = await JWTsign(user)

    if(user.role === 'SELLER'){
      const store = await prisma.store.findFirst({
        where: { seller_id: user.id }
      })
      if(!store){
        return res.status(200).json({
          status: "success",
          message: "Login success!",
          data: { 
            user, 
            accessToken: token,
            storeId: "Store is not created yet!"
          }
        })
      } else {
        return res.status(200).json({
          status: "success",
          message: "Login success!",
          data: { 
            user, 
            accessToken: token,
            storeId: store.id
          } 
        })
      }
    } else if(user.role === 'CUSTOMER'){
      const profile = await prisma.profile.findFirst({
        where: { user_id: user.id }
      })
      if(!profile){
        return res.status(200).json({
          status: "success",
          message: "Login success!",
          data: { 
            user, 
            accessToken: token,
            profileId: "Profile is not created yet!"
          }
        }) 
      } else {
        return res.status(200).json({
          status: "success",
          message: "Login success!",
          data: { 
            user, 
            accessToken: token,
            profileId: profile.id
          } 
        })
      }
    } else if(user.role === 'ADMIN'){
      return res.status(200).json({
        status: "success",
        message: "Login success!",
        data: { 
          user, 
          accessToken: token 
        } 
      })
    }
  },
  async whoami(req, res){
      return res.status(200).json({
          status: "success",
          message: "OK",
          data: {
              user: req.user
          }
      })
  }
}