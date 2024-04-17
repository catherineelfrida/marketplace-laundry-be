const { v4 : uuidv4 } = require('uuid')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found for the seller.',
        });
      }

      const result = await prisma.service_type.findMany({
        where: { store_id: existingStore.id },
      });

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: result,
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
        where: { seller_id: req.user.id },
      })

      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found.',
        });
      }

      const result = await prisma.service_type.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!result) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service type not found.',
        });
      }

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: result,
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async create(req, res) {
    try {
      const { service_name, description } = req.body;

      // validate request
      if (!service_name || !description) {
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

      // proceed to create store
      const id = 'stype-'+ uuidv4()

      const result = await prisma.service_type.create({
        data: {
          id,
          service_name,
          description,
          store: {
            connect: { id: existingStore.id },
          },
        },
      });

      res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Service type created successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { service_name, description } = req.body;

      // validate request
      if (!service_name || !description) {
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
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingServiceType) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service type not found.',
        });
      }

      // proceed to update store
      const result = await prisma.service_type.update({
        where: { id: id },
        data: {
          service_name,
          description,
        },
      });

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Service type updated successfully.',
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
          message: 'Store not found.',
        });
      }

      const existingServiceType = await prisma.service_type.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingServiceType) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service type not found.',
        });
      }

      await prisma.service_type.delete({
        where: { 
          id,
          store_id: existingStore.id
        },
      });

      res.status(204).json();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
}
