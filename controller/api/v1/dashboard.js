const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async get(req, res) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (user.role === 'CUSTOMER' || user.role === 'SELLER') {
        return res.status(403).json({
          status: 'error',
          code: 403,
          message: 'Forbidden!'
        })
      }

      const totalUsers = await prisma.user.count()
      const totalStores = await prisma.store.count()
      const totalProfiles = await prisma.profile.count()
      const listUsers = await prisma.user.findMany()
      const listStores = await prisma.store.findMany({
        include: { seller: true }
      })
      const listProfiles = await prisma.profile.findMany({
        include: { user: true }
      })

      const response = {
        totalUsers,
        totalStores,
        totalProfiles,
        listUsers : listUsers.map(user => {
          return {
            username: user.username,
            role: user.role
          }
        }),
        listStores : listStores.map(store => {
          return {
            name: store.store_name,
            address: store.address,
            phone: store.telephone,
            openTime: store.open_time.toISOString().slice(11, 19),
            closeTime: store.close_time.toISOString().slice(11, 19),
            username: store.seller.username,
          }
        }),
        listProfiles : listProfiles.map(profile => {
          return {
            name: profile.name,
            address: profile.address,
            phone: profile.telephone,
            username: profile.user.username,
          }
        })
      }

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
  }
}