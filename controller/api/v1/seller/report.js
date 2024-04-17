const request = require('request')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found.' });
      } else if (existingUser.role !== 'SELLER') {
        return res.status(403).json({ error: 'Forbidden.' });
      }

      const existingStore = await prisma.store.findFirst({
        where: { seller_id: req.user.id }
      })

      if (!existingStore) {
        return res.status(404).json({ error: 'This user does not have a store.' })
      } 

      const existingOrders = await prisma.transaction.findMany({
        where: { 
          store_id: existingStore.id,
          status: { 
            notIn: ['EXPIRED',  'PENDING_DELIVERY']
          }
        },
        orderBy: { start_date: 'desc' }
      })

      if (!existingOrders || existingOrders.length === 0) {
        return res.status(404).json({ error: 'No orders found for this store.' })
      }

      const items = [];

      const fetchCustomerName = async (customerId) => {
        const customer = await prisma.profile.findFirst({
          where: { user_id: customerId }
        });
        return customer ? customer.name : "Unknown";
      };

      for (const order of existingOrders) {
        const transactionDetails = await prisma.transaction_detail.findMany({
          where: { transaction_id: order.id },
          include: {
            service: true
          }
        });
      
        const services = transactionDetails.map(detail => ({
          code: detail.service_id,
          qty: detail.quantity,
          rate: detail.service.rate
        }));

        items.push({
          start_date: order.start_date.toLocaleDateString(),
          end_date: order.end_date ? order.end_date.toLocaleDateString() : '-',
          buyer: await fetchCustomerName(order.customer_id),
          service: services,
          status: order.status,
          price: order.total
        });
      }

      const data = {
        template:{'shortid':'-rUl7na'},
        data: {
          "seller": {
            "name": existingStore.store_name,
            "road": existingStore.address
          },
          "items": items 
        }
      }

      const options = {
        uri: 'http://localhost:5488/api/report',
        method: 'POST',
        json: data
      }
      request(options).pipe(res)
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }, 
}