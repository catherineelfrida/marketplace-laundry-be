const { v4 : uuidv4 } = require('uuid')
const { PrismaClient } = require('@prisma/client');
const { getGeolocation } = require('../../../../middleware/geolocationApi');
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const profiles = await prisma.profile.findMany();
      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: profiles,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params;
      const profile = await prisma.profile.findUnique({
        where: { id },
      });

      if (!profile) {
        return res.status(404).json({
          status: 'failed',
          code: 404,
          message: 'Profile not found!',
        });
      }

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: profile,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async create(req, res) {
    try {
      const { name, address, telephone, username } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (user.role === 'SELLER') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Forbidden.',
        });
      } else if (user.role === 'ADMIN') {
        if (!name || !address || !telephone || !username) {
          return res.status(400).json({ error: 'Invalid data provided.' });
        }

        const customer = await prisma.user.findUnique({
          where: { 
            username, 
            role: 'CUSTOMER', 
          },
          include: {
            profile: true,
          }
        });

        if (!customer) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Customer not found.',
          });
        } else if (customer.profile) {
          return res.status(409).json({
            status: 'fail',
            code: 409,
            message: 'User already has a profile.',
          });
        } else {
          const { lat, lng } = await getGeolocation(address);

          if (lat === 0 && lng === 0) {
            return res.status(400).json({
              status: 'fail',
              code: 400,
              message: 'Invalid address.',
            });
          }

          const id = 'profile-'+ uuidv4()

          const profile = await prisma.profile.create({
            data: {
              id : id,
              name,
              address,
              telephone,
              latitude : lat,
              longitude : lng,
              user: {
                connect: { id: customer.id},
              },
            },
          });

          res.status(201).json({
            status: 'success',
            code: 201,
            message: 'Profile created successfully.',
            data: profile,
          });
        }
      } else if (user.role === 'CUSTOMER') {

        // validate request
        if (!name || !address || !telephone) {
          return res.status(400).json({ error: 'Invalid data provided.' });
        }
        
        const existingProfile = await prisma.profile.findFirst({
          where: { user_id: req.user.id },
        });

        if (existingProfile) {
          return res.status(409).json({
            status: 'fail',
            code: 409,
            message: 'User already has a profile.',
          });
        }

        const { lat, lng } = await getGeolocation(address);
        
        if (lat === 0 && lng === 0) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Invalid address.',
          });
        }

        // proceed to create profile
        const id = 'profile-'+ uuidv4()
        
        const profile = await prisma.profile.create({
          data: {
            id : id,
            name,
            address,
            telephone,
            latitude : lat,
            longitude : lng,
            user: {
              connect: { id: req.user.id },
            },
          },
        });

        res.status(201).json({
          status: 'success',
          code: 201,
          message: 'Profile created successfully.',
          data: profile,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async update(req, res) {
    try {
      const { name, address, telephone, username } = req.body; 
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (user.role === 'SELLER'){
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Forbidden.',
        });
      } else if (user.role === 'ADMIN') {
        if (!name || !address || !telephone || !username) {
          return res.status(400).json({ error: 'Invalid data provided.' });
        }

        const customer = await prisma.user.findUnique({
          where: { 
            username, 
            role: 'CUSTOMER', 
          },
          include: {
            profile: true,
          }
        });
        
        if (!customer) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Customer not found.',
          });
        } else if (!customer.profile) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Customer does not have a profile.',
          });
        } else {
          const { lat, lng } = await getGeolocation(address);

          if (lat === 0 && lng === 0) {
            return res.status(400).json({
              status: 'fail',
              code: 400,
              message: 'Invalid address.',
            });
          }

          const profile = await prisma.profile.update({
            where: { user_id: customer.id },
            data: {
              name,
              address,
              telephone,
              latitude : lat,
              longitude : lng
            }
          })

          res.status(200).json({
            status: 'success',
            code: 200,
            message: 'Profile updated successfully.',
            data: profile,
          }); 
        }
      } else if (user.role === 'CUSTOMER') {
        if (!name || !address || !telephone) {
          return res.status(400).json({ error: 'Invalid data provided.' });
        }
  
        const existingProfile = await prisma.profile.findFirst({
          where: { user_id: req.user.id },
        });
  
        if (!existingProfile) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Profile not found.',
          });
        }
  
        const { lat, lng } = await getGeolocation(address);
  
        if (lat === 0 && lng === 0) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Invalid address.',
          });
        }
        
        const profile = await prisma.profile.update({
          where: { user_id: req.user.id },
          data: {
            name,
            address,
            telephone,
            latitude : lat,
            longitude : lng
          }
        })
  
        res.status(200).json({
          status: 'success',
          code: 200,
          message: 'Profile updated successfully.',
          data: profile,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async destroy(req, res) {
    try {
      await prisma.profile.delete({
        where: { user_id: req.user.id},
      });

      res.status(204).json();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async destroyadmin(req, res) {
    try {
      const { username } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Forbidden.',
        });
      }

      const customer = await prisma.user.findUnique({
        where: { 
          username, 
          role: 'CUSTOMER', 
        },
        include: {
          profile: true,
        }
      });

      if (!customer) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Customer not found.',
        });
      }

      if (!customer.profile) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Customer does not have a profile.',
        });
      }

      await prisma.profile.delete({
        where: { user_id: customer.id },
      });

      res.status(204).json();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
}
