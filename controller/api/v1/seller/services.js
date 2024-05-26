const { PrismaClient } = require('@prisma/client')
const { generateId } = require('../../../../middleware/uuid')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id }
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const result = await prisma.service.findMany({
        where: { store_id: existingStore.id }
      });

      if (result.length === 0) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service not found.',
        });
      }

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
      const { id } = req.params

      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id }
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const result = await prisma.service.findFirst({
        where: { id: id, store_id: existingStore.id }
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
  },
  async create(req, res) {
    try {
      const { rate, serviceTypeId, serviceItemId, serviceDurationId } = req.body;

      // validate request
      if (!rate || !serviceTypeId || !serviceItemId || !serviceDurationId) {
        return res.status(400).json({ error: 'Invalid data provided.' });
      }

      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const existingServiceType = await prisma.service_type.findFirst({
        where: { id: serviceTypeId }
      })

      if (!existingServiceType) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service type not found.',
        });
      }

      const existingServiceItem = await prisma.service_item.findFirst({
        where: { id: serviceItemId }
      })

      if (!existingServiceItem) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service item not found.',
        });
      }

      const existingServiceDuration = await prisma.service_duration.findFirst({
        where: { id: serviceDurationId }
      })

      if (!existingServiceDuration) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service duration not found.',
        });
      }

      // proceed to create store
      const id = await generateId()

      await prisma.service.create({
        data: {
          id,
          rate,
          service_type_id: serviceTypeId,
          service_item_id: serviceItemId,
          service_duration_id: serviceDurationId,
          store_id: existingStore.id,
        }
      })

      const response = await prisma.service.findFirst({
        where: { id: id },
        select: {
          id: true,
          rate: true,
          store: true,
          service_type: true,
          service_item: true,
          service_duration: true,
        }
      })

      res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Service created successfully.',
        data: response,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { rate, serviceTypeId, serviceItemId, serviceDurationId } = req.body;

      // validate request
      if (!rate || !serviceTypeId || !serviceItemId || !serviceDurationId) {
        return res.status(400).json({ error: 'Invalid data provided.' });
      }

      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const existingService = await prisma.service.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingService) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service not found.',
        });
      }

      const existingServiceType = await prisma.service_type.findFirst({
        where: { id: serviceTypeId }
      })

      if (!existingServiceType) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service type not found.',
        });
      }

      const existingServiceItem = await prisma.service_item.findFirst({
        where: { id: serviceItemId }
      })

      if (!existingServiceItem) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service item not found.',
        });
      }

      const existingServiceDuration = await prisma.service_duration.findFirst({
        where: { id: serviceDurationId }
      })

      if (!existingServiceDuration) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service duration not found.',
        });
      }

      // proceed to update store
      const result = await prisma.service.update({
        where: { id: id },
        data: {
          rate,
          service_type_id: serviceTypeId,
          service_item_id: serviceItemId,
          service_duration_id: serviceDurationId,
        },
      });

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Service updated successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'This user doesn\'t have a store.',
        });
      }

      const existingServiceDuration = await prisma.service.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingServiceDuration) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service not found.',
        });
      }

      await prisma.service.delete({
        where: { 
          id,
          store_id: existingStore.id,
        },
      });

      res.status(204).json();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
}
