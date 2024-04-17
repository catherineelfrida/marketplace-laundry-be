const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const { storeid } = req.params;
      const result = await prisma.service.findMany({
        where: { store_id: storeid },
        include: {
          service_type: true,
          service_item: true,
          service_duration: true
        }
      });

      const response = await Promise.all(result.map(async (item) => {
        const serviceType = await prisma.service_type.findFirst({
          where: { id: item.service_type_id }
        })

        const serviceItem = await prisma.service_item.findFirst({
          where: { id: item.service_item_id }
        })

        const serviceDuration = await prisma.service_duration.findFirst({
          where: { id: item.service_duration_id }
        })

        return {
          id: item.id,
          rate: item.rate,
          serviceType: serviceType,
          serviceItem: serviceItem,
          serviceDuration: serviceDuration,
        }
      }))

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: response,
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async getById(req, res) {
    try {
      const { storeid, id } = req.params

      const existingStore = await prisma.store.findFirst({
        where: { id: storeid },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const result = await prisma.service.findFirst({
        where: { id: id, store_id: storeid }
      })

      if (!result) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service not found.',
        });
      }
    
      const response = {
        id: result.id,
        rate: result.rate,
        store: await prisma.store.findFirst({
          where: { id: result.store_id }
        }),
        serviceType: await prisma.service_type.findFirst({
          where: { id: result.service_type_id }
        }),
        serviceItem: await prisma.service_item.findFirst({
          where: { id: result.service_item_id }
        }),
        serviceDuration: await prisma.service_duration.findFirst({
          where: { id: result.service_duration_id }
        }),
      }

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: response,
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
}
