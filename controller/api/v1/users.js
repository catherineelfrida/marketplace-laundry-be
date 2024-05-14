const { v4 : uuidv4 } = require('uuid')
const { PrismaClient } = require('@prisma/client')
const { encryptPassword, checkPassword } = 
    require('../../../middleware/auth')

const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const result = await prisma.user.findMany();
      
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Success!",
        data: result
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params

      const result = await prisma.user.findUnique({
        where: { id: id }
      })
      
      if(!result){
        return res.status(404).json({
          status: "fail",
          code: 404,
          message: "User not found!"
        })
      }

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Success!",
        data: result
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async create(req, res) {
    try {
      const { username, password, role } = req.body
      
      // validate request
      if (!username || !password || !role ) {
        return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
      }

      // check if username already exist
      const existingUser = await prisma.user.findFirst({
        where: { username: username }
      })

      if(existingUser){
        return res.status(409).json({
          status: "Fail!",
          message: "Username sudah digunakan!"
        })
      }

      // proceed to create a new user
      const id = 'user-'+ uuidv4()
      
      const result = await prisma.user.create({
        data: {
          id: id,
          username: username,
          password: await encryptPassword(password),
          role: role
        }
      })
      
      return res.status(201).json({
        status: "success",
        code: 201,
        message: "Berhasil Register.",
        data: result
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal server error.', error })
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params
      const { username, password, role } = req.body

      // validate request
      if (!username || !password || !role ) {
        return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      })

      if (user.role === 'ADMIN') {
        const user = await prisma.user.findUnique({
          where: { id: id }
        })

        if (!user) {
          return res.status(404).json({
            status: "fail",
            code: 404,
            message: "User not found!"
          })
        }

        const result = await prisma.user.update({
          where: { id: id },
          data: {
            username: username,
            password: await encryptPassword(password),
            role: role
          }
        })
        
        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Data berhasil diperbarui.",
          data: result
        })
      } else if (user.role === 'SELLER' || user.role === 'CUSTOMER') {
        const existingUsername = await prisma.user.findUnique({
          where: { username }
        })
  
        if (existingUsername) {
          return res.status(409).json({
            status: "Fail!",
            message: "Username sudah digunakan!"
          })
        }

        const result = await prisma.user.update({
          where: { id: req.user.id },
          data: {
            username: username,
            password: await encryptPassword(password),
            role: role
          }
        })
        
        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Data berhasil diperbarui.",
          data: result
        })
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async destroy(req, res){
    try {
      const { id } = req.params

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      })

      if (user.role === 'ADMIN') {
        const user = await prisma.user.findUnique({
          where: { id: id }
        })

        if (!user) {
          return res.status(404).json({
            status: "fail",
            code: 404,
            message: "User not found!"
          })
        }

        await prisma.user.delete({
          where: { id: id }
        })

        return res.status(204).json()
      } else if (user.role === 'SELLER' || user.role === 'CUSTOMER') {
        await prisma.user.delete({
          where: { id: req.user.id }
        })
        
        return res.status(204).json()
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
