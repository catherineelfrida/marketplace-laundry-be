const { PrismaClient } = require('@prisma/client')
const { v4 : uuidv4 } = require('uuid');
const { getGeolocation } = require('../../../../middleware/geolocationApi');
const { calculateDistance } = require('../../../../middleware/distanceMatrixApi')

const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (user.role === 'ADMIN') {
        const result = await prisma.store.findMany();
        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Success!",
          data: result
        })
      } else if (user.role === 'CUSTOMER') {
        async function getSortedServices(orderBy) {
          const storesWithServices = await prisma.store.findMany({
            include: {
              service: {
                orderBy: {
                  rate: orderBy,
                },
                include: {
                  service_type: true,
                  service_item: true,
                  service_duration: true
                }
              },
            },
          });
          return storesWithServices
        }

        const sortedServices = await getSortedServices('asc');

        if (!sortedServices || sortedServices.length === 0) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'No stores found.',
          });
        }

        const stores = sortedServices.sort((a, b) => {
          const cheapestServiceA = a.service.length > 0 ? a.service[0].rate : Infinity;
          const cheapestServiceB = b.service.length > 0 ? b.service[0].rate : Infinity;
    
          return cheapestServiceA - cheapestServiceB;
        });

        const profile = await prisma.profile.findFirst({
          where: { user_id: req.user.id }
        })

        if (!profile) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Please complete your profile data first',
          });
        }

        const origins = [profile.address]
        
        const destinations = stores.map((store) => store.address)
      
        const distanceMatrixData = await calculateDistance(origins, destinations)

        const distances = distanceMatrixData.rows[0].elements.map((element) => element.distance)

        const result = stores.map((store, index) => ({
          ...store,
          distanceValue: distances[index].value,
          unit: 'm'
        }));

        // const { sortBy } = req.query;

        // let result;

        // if (sortBy === 'cheap') {
        //   const sortedServices = 

        //   result = sortedServices.sort((a, b) => {
        //     const cheapestServiceA = a.service.length > 0 ? a.service[0].rate : Infinity;
        //     const cheapestServiceB = b.service.length > 0 ? b.service[0].rate : Infinity;
      
        //     return cheapestServiceA - cheapestServiceB;
        //   });
        // // } else if (sortBy === 'expensive') {
        // //   const sortedServices = await getSortedServices('desc');

        // //   result = sortedServices.sort((a, b) => {
        // //     const cheapestServiceA = a.service.length > 0 ? a.service[0].rate : 0;
        // //     const cheapestServiceB = b.service.length > 0 ? b.service[0].rate : 0;
      
        // //     return cheapestServiceB - cheapestServiceA;
        // //   });
        // // } else if (sortBy === 'nearest') {
        // //   result = storesWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)
        // } else {
        //   result = storesWithDistance
        // }

        const results = result.map((store) => ({
          ...store,
          open_time: store.open_time.toISOString().slice(11, 19),
          close_time: store.close_time.toISOString().slice(11, 19),
        }));

        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Success!",
          data: results
        })
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params

      const result = await prisma.store.findUnique({
        where: { id: id }
      })
      
      if(!result){
        return res.status(404).json({
          status: "failed",
          code: 404,
          message: "Store not found!"
        })
      }

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Success!",
        data: result
      })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async create(req, res) {
    try {
      const { store_name, address, telephone, open_time, close_time, username} = req.body

      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (user.role === 'ADMIN') {
        if (!store_name || !address || !telephone || !open_time || !close_time || !username) {
          return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
        }

        const seller = await prisma.user.findFirst({
          where: { 
            username,
            role: 'SELLER'
          },
          include: {
            store: true
          }
        });

        if (!seller) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Seller not found.',
          });
        } else if (seller.store) {
          return res.status(409).json({
            status: 'fail',
            code: 409,
            message: 'Seller already has a store.',
          });
        } else {
          const id = 'store-'+ uuidv4()

          const { lat, lng } = await getGeolocation(address)

          if (lat === 0 && lng === 0) {
            return res.status(400).json({
              status: 'fail',
              code: 400,
              message: 'Invalid address.',
            });
          }

          const result = await prisma.store.create({
            data: {
              id: id,
              store_name,
              address,
              telephone,
              latitude : lat,
              longitude : lng,
              open_time : new Date(`1970-01-01T${open_time}Z`),
              close_time : new Date(`1970-01-01T${close_time}Z`),
              seller: {
                connect: { id: seller.id }
              }
            }
          })
          
          return res.status(201).json({
            status: "success",
            code: 201,
            message: "Store created successfully.",
            data: result
          })
        }
      } else if (user.role === 'SELLER') {
        if (!store_name || !address || !telephone || !open_time || !close_time) {
          return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
        }

        const existingStore = await prisma.store.findFirst({
          where: { seller_id : req.user.id },
        });
  
        if (existingStore) {
          return res.status(409).json({
            status: 'fail',
            code: 409,
            message: 'User already has a store.',
          });
        }
        
        // proceed to create store
        const id = 'store-'+ uuidv4()

        const { lat, lng } = await getGeolocation(address)

        if (lat === 0 && lng === 0) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Invalid address.',
          });
        }

        const result = await prisma.store.create({
          data: {
            id: id,
            store_name,
            address,
            telephone,
            latitude : lat,
            longitude : lng,
            open_time : new Date(`1970-01-01T${open_time}Z`),
            close_time : new Date(`1970-01-01T${close_time}Z`),
            seller: {
              connect: { id: req.user.id }
            }
          }
        })
        
        return res.status(201).json({
          status: "success",
          code: 201,
          message: "Store created successfully.",
          data: result
        })
      } else if (user.role === 'CUSTOMER') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'User is not authorized to create a store.',
        });
      }
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal server error.' })
    }
  },
  async update(req, res) {
    try {
      const { store_name, address, telephone, open_time, close_time, username} = req.body

      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (user.role === 'ADMIN') {
        if (!store_name || !address || !telephone || !open_time || !close_time || !username) {
          return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
        }

        const seller = await prisma.user.findFirst({
          where: { 
            username,
            role: 'SELLER'
          },
          include: {
            store: true
          }
        });

        if (!seller) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Seller not found.',
          });
        } else if (!seller.store) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Seller does not have a store.',
          });
        } else {
          const { lat, lng } = await getGeolocation(address)

          if (lat === 0 && lng === 0) {
            return res.status(400).json({
              status: 'fail',
              code: 400,
              message: 'Invalid address.',
            });
          }

          const result = await prisma.store.update({
            where: { seller_id : seller.id},
            data: {
              store_name,
              address,
              telephone,
              latitude : lat,
              longitude: lng,
              open_time : new Date(`1970-01-01T${open_time}Z`),
              close_time : new Date(`1970-01-01T${close_time}Z`)
            }
          })
          
          return res.status(200).json({
            status: "success",
            code: 200,
            message: "Store updated successfully.",
            data: result
          })
        }
      } else if (user.role === 'SELLER') {
        if (!store_name || !address || !telephone || !open_time || !close_time ) {
          return res.status(400).json({ error: 'Data yang diberikan tidak valid.' })
        }
  
        const store = await prisma.store.findFirst({
          where: { seller_id : req.user.id },
        });
  
        if (!store) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Store not found.',
          });
        }
  
        const { lat, lng } = await getGeolocation(address)
  
        if (lat === 0 && lng === 0) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Invalid address.',
          });
        }
  
        const result = await prisma.store.update({
          where: { id : store.id},
          data: {
            store_name,
            address,
            telephone,
            latitude : lat,
            longitude: lng,
            open_time : new Date(`1970-01-01T${open_time}Z`),
            close_time : new Date(`1970-01-01T${close_time}Z`)
          }
        })
        
        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Store updated successfully.",
          data: result
        })
      } else if (user.role === 'CUSTOMER') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Forbidden.',
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async destroy(req, res){
    try {

      const store = await prisma.store.findFirst({
        where: { seller_id : req.user.id },
      });

      if (!store) { 
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const existingService = await prisma.service.findFirst({
        where: { store_id : store.id },
      });

      if (existingService) {
        return res.status(409).json({
          status: 'fail',
          code: 409,
          message: 'Store has services.',
        });
      }

      await prisma.store.delete({
        where: { seller_id : req.user.id }
      })
      
      return res.status(204).json()
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async destroyadmin(req, res){
    try {
      const { username } = req.params

      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Forbidden.',
        });
      }

      const seller = await prisma.user.findFirst({
        where: { 
          username,
          role: 'SELLER'
        },
        include: {
          store: true
        }
      });
      
      if (!seller) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Seller not found.',
        });
      } else if (!seller.store) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Seller does not have a store.',
        });
      }

      const existingService = await prisma.service.findFirst({
        where: { store_id : seller.store.id },
      });

      if (existingService) {
        return res.status(409).json({
          status: 'fail',
          code: 409,
          message: 'Store has services.',
        });
      }

      await prisma.store.delete({
        where: { seller_id : seller.id }
      })

      return res.status(204).json()
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
