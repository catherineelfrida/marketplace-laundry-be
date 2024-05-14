const { v4 : uuidv4 } = require('uuid')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id },
      });
  
      if (!existingStore) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Store not found for the seller.',
        });
      }

      const result = await prisma.service_item.findMany({
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

      const result = await prisma.service_item.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!result) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service item not found.',
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
      const { item_name } = req.body;

      // validate request
      if (!item_name) {
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
      const id = 'sitem-'+ uuidv4()

      const result = await prisma.service_item.create({
        data: {
          id,
          item_name,
          store: {
            connect: { id: existingStore.id },
          },
        },
      });

      res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Service item created successfully.',
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
      const { item_name } = req.body;

      // validate request
      if (!item_name) {
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

      const existingServiceItem = await prisma.service_item.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingServiceItem) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service item not found.',
        });
      }

      // proceed to update store
      const result = await prisma.service_item.update({
        where: { id: id },
        data: {
          item_name
        },
      });

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Service item updated successfully.',
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

      const existingServiceItem = await prisma.service_item.findFirst({
        where: { id: id, store_id: existingStore.id }
      })

      if (!existingServiceItem) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Service item not found.',
        });
      }

      await prisma.service_item.delete({
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
