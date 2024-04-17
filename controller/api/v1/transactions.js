const { v4 : uuidv4 } = require('uuid')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { witaDateTime } = require('../../../middleware/time')

module.exports = {
  async get(req, res) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'User not found.',
        });
      }

      if (existingUser.role === 'ADMIN') {
        existingTransactions = await prisma.transaction.findMany({
          include: {
            customer: {
              include: {
                profile: true
              }
            },
            store: true,
            transaction_detail: {
              include: {
                service: {
                  include: {
                    service_type: true,
                    service_item: true,
                    service_duration: true
                  }
                }
              }
            }
          },
          orderBy: {
            start_date: 'desc'
          }
        });
      } else if (existingUser.role === 'SELLER') {
        existingTransactions = await prisma.transaction.findMany({
          where: {
            store: { seller_id: req.user.id },
          },
          include: {
            customer: {
              include: {
                profile: true
              }
            },
            store: true,
            transaction_detail: {
              include: {
                service: {
                  include: {
                    service_type: true,
                    service_item: true,
                    service_duration: true
                  }
                }
              }
            }
          },
          orderBy: {
            start_date: 'desc'
          }
        });
      } else if (existingUser.role === 'CUSTOMER') {
        existingTransactions = await prisma.transaction.findMany({
          where: {
            customer_id: req.user.id,
          },
          include: {
            customer: {
              include: {
                profile: true
              }
            },
            store: true,
            transaction_detail: {
              include: {
                service: {
                  include: {
                    service_type: true,
                    service_item: true,
                    service_duration: true
                  }
                }
              }
            }
          },
          orderBy: {
            start_date: 'desc'
          }
        });
      }

      if (!existingTransactions || existingTransactions.length === 0) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Transaction not found.',
        });
      }

      const results = existingTransactions.map(transaction => ({
        ...transaction,
        store: {
          ...transaction.store,
          open_time: transaction.store.open_time.toISOString().slice(11, 19),
          close_time: transaction.store.close_time.toISOString().slice(11, 19),
        }
      }));

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Success!',
        data: results,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params

      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'User not found.',
        });
      }

      const existingTransaction = await prisma.transaction.findFirst({
        where: { id }
      })

      if (!existingTransaction) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Transaction not found.',
        });
      }

      const existingStore = await prisma.store.findFirst({
        where: { id: existingTransaction.store_id }
      })

      // cek apakah user adalah customer atau seller dari transaction tersebut
      if (existingUser.id === existingTransaction.customer_id || existingUser.id === existingStore.seller_id || existingUser.role === 'ADMIN') {
        return res.status(200).json({
          status: 'success',
          code: 200,
          message: 'Success!',
          data: existingTransaction,
        });
      } else {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'You are not authorized to access this transaction',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async create(req, res) {
    try {
      const { store_id } = req.params;
      const { transaction_detail } = req.body;

      // validate request
      if ( !transaction_detail ) {
        return res.status(400).json({ error: 'Invalid data provided.' });
      }

      if (!Array.isArray(transaction_detail) || transaction_detail.length === 0) {
        return res.status(400).json({ error: 'Invalid data provided in transaction detail.' });
      }

      // Validate each element in transaction_detail array
      for (const detail of transaction_detail) {
        if (
          !detail.quantity ||
          !detail.note ||
          !detail.service_id ||
          typeof detail.quantity !== 'number' ||
          typeof detail.note !== 'string' ||
          typeof detail.service_id !== 'string'
        ) {
          return res.status(400).json({ error: 'Invalid data provided in transaction detail.' });
        }
      }

      const existingCustomer = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingCustomer) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Customer not found.',
        });
      }

      if (existingCustomer.role !== 'CUSTOMER') {
        return res.status(400).json({
          status: 'fail',
          code: 403,
          message: 'Only customer can create transaction',
        });
      }

      const existingStore = await prisma.store.findFirst({
        where: { id: store_id }
      })

      async function isWithinOperatingHours(store_id, serviceDurationHours) {
        const store = await prisma.store.findFirst({
          where: { id: store_id },
          select: { open_time: true, close_time: true },
        })     
        if (!store) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Store not found.',
          });
        }
      
        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        const openingTime = new Date(store.open_time);
        const openingHours = openingTime.getUTCHours();

        const closingTime = new Date(store.close_time);
        const closingHours = closingTime.getUTCHours();        

        if (serviceDurationHours > (closingHours - openingHours) && currentHour >= openingHours && currentHour < closingHours) {
          return true;
        } else if (serviceDurationHours < (closingHours - currentHour) && currentHour >= openingHours && currentHour < closingHours) {
          return true;
        } else {
          return false;
        }
      }

      async function getRate(service_id) {
        const result = await prisma.service.findFirst({
          where: { id: service_id },
        });

        if (!result) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Service not found.',
          });
        }
        return result.rate;
      }

      async function calculateAmount(transaction_detail) {
        let totalAmount = 0;
        for (let i = 0; i < transaction_detail.length; i++) {

          transaction_detail[i].idTDetail = 'transaction_detail-'+ uuidv4()

          const rate = await getRate(transaction_detail[i].service_id);
          transaction_detail[i].amount = transaction_detail[i].quantity * rate;
          totalAmount += transaction_detail[i].amount;
          
        }
        return { totalAmount, transaction_detail }
      }

      const { totalAmount, transaction_detail: updatedTransactionDetail } = await calculateAmount(transaction_detail);

      // proceed to create transaction
      const id = 'transaction-'+ uuidv4()

      for (const detail of updatedTransactionDetail) {
        const service = await prisma.service.findFirst({
          where: { id: detail.service_id },
          select: { service_duration_id: true },
        });
     
        if (!service || !service.service_duration_id) {
          return res.status(404).json({
            status: 'fail',
            code: 404,
            message: 'Invalid service data provided in transaction detail.',
          });
        }
    
        const serviceDuration = await prisma.service_duration.findFirst({
          where: { id: service.service_duration_id },
          select: { hour: true },
        });
    
        if (!await isWithinOperatingHours(store_id, serviceDuration.hour)) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Service duration exceeds operating hours of the store.',
          });
        }
      }

      // Set timer untuk mengubah status menjadi EXPIRED setelah 30 menit
      setTimeout(async () => {
        const updatedTransaction = await prisma.transaction.findFirst({
          where: { id, status: 'PENDING_DELIVERY' },
        });

        if (updatedTransaction) {
          await prisma.transaction.update({
            where: { id },
            data: { status: 'EXPIRED' },
          });
        }
      }, 30 * 60 * 1000);  // 30 menit dalam milidetik

      await prisma.transaction.create({
        data: {
          id: id,
          status: "PENDING_DELIVERY",
          start_date: await witaDateTime(),
          end_date: null,
          total: totalAmount,
          payment_status: "UNPAID",
          payment_date: null,
          customer: {
            connect: { id: existingCustomer.id }
          },
          store: {
            connect: {
              id: store_id,
              seller_id: existingStore.seller_id
            }
          }
        },
      })

      // proceed to create transaction detail
      for (let i = 0; i < updatedTransactionDetail.length; i++) {
        await prisma.transaction_detail.create({
          data: {
            id: updatedTransactionDetail[i].idTDetail,
            quantity: updatedTransactionDetail[i].quantity,
            amount: updatedTransactionDetail[i].amount,
            note: updatedTransactionDetail[i].note,
            transaction:{
              connect: { id: id }
            },
            service: {
              connect: { id: updatedTransactionDetail[i].service_id }
            }
          },
        })
      }

      const response = await prisma.transaction.findFirst({
        where: { id: id },
        include: {
          transaction_detail: true
        }
      })

      res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Transaction created successfully.',
        data: response,
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: 'Invalid data provided.' });
      }

      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })
      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'User not found.',
        });
      }

      const existingTransaction = await prisma.transaction.findFirst({
        where: { id }
      })
      if (!existingTransaction) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Transaction not found.',
        });
      }

      const existingStore = await prisma.store.findFirst({
        where: { id: existingTransaction.store_id }
      })

      // admin, seller yang bersangkutan, dan customer yang bersangkutan yang dapat mengubah status
      if (existingUser.role === 'SELLER' && existingUser.id !== existingStore.seller_id) {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'You are not authorized to update this transaction',
        });
      } else if (existingUser.role === 'CUSTOMER' && existingUser.id !== existingTransaction.customer_id) {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'You are not authorized to update this transaction',
        });
      }

      if (existingTransaction.status === 'PENDING_DELIVERY' && status === 'PENDING_PROCESSING' && existingUser.role === 'SELLER') {
        await prisma.transaction.update({
          where: { id },
          data: { status },
        });
      } else if (existingTransaction.status === 'PENDING_PROCESSING' && status === 'IN_PROGRESS' && existingUser.role === 'SELLER') {
        await prisma.transaction.update({
          where: { id },
          data: { status },
        });
      } else if (existingTransaction.status === 'IN_PROGRESS' && status === 'READY_FOR_PICKUP' && existingUser.role === 'SELLER') {
        await prisma.transaction.update({
          where: { id },
          data: { status },
        });
      } else if (existingTransaction.status === 'READY_FOR_PICKUP' && status === 'COMPLETED' && existingUser.role === 'CUSTOMER') {
        if (existingTransaction.payment_status === 'UNPAID') {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: 'Payment status is not PAID.',
          })
        } else if (existingTransaction.payment_status === 'PAID') {
          await prisma.transaction.update({
            where: { id },
            data: { 
              status,
              end_date: await witaDateTime()
            },
          })
        }
      } else {
        return res.status(400).json({
          status: 'fail',
          code: 400,
          message: 'Invalid status update.',
        });
      }

      const response = await prisma.transaction.findFirst({
        where: { id },
        include: {
          transaction_detail: true
        }
      })
      
      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Transaction updated successfully.',
        data: response,
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'User not found.',
        });
      }

      if (existingUser.role === 'CUSTOMER') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'You are not authorized to update payment status.',
        });
      }

      const store = await prisma.store.findFirst({
        where: { seller_id: existingUser.id }
      })

      const existingTransaction = await prisma.transaction.findFirst({
        where: { id }
      })

      if (!existingTransaction ) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Transaction not found.',
        });
      } else if (existingTransaction.store_id !== store.id) {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'You are not authorized to update this transaction',
        });
      } else if (payment_status !== 'PAID') {
        return res.status(400).json({
          status: 'fail',
          code: 400,
          message: 'Invalid payment status.',
        });
      } else if (existingTransaction.payment_status === 'PAID') {
        return res.status(400).json({
          status: 'fail',
          code: 400,
          message: 'Payment status already PAID.',
        });
      }

      const result = await prisma.transaction.update({
        where: { id },
        data: { 
          payment_status,
          payment_date: await witaDateTime()
        },
        include: {
          transaction_detail: true
        }
      })

      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Payment status updated successfully.',
        data: result,
      })

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      const existingUser = await prisma.user.findFirst({
        where: { id: req.user.id }
      })

      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'User not found.',
        });
      }

      if (existingUser.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'fail',
          code: 403,
          message: 'Only admin can delete transaction',
        });
      }

      const existingTransaction = await prisma.transaction.findFirst({
        where: { id }
      })

      if (!existingTransaction) {
        return res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'Transaction not found.',
        });
      }

      // if (
      //   existingTransaction.status !== 'EXPIRED' || 
      //   existingTransaction.status !== 'PENDING_PROCESSING' ||
      //   existingTransaction.status !== 'IN_PROGRESS' ||
      //   existingTransaction.status !== 'READY_FOR_PICKUP' || 
      //   existingTransaction.status !== 'COMPLETED'
      // ) {
      //   return res.status(400).json({
      //     status: 'fail',
      //     code: 400,
      //     message: 'Transaction cannot be deleted.',
      //   });
      // }

      await prisma.transaction_detail.deleteMany({
        where: { transaction_id: id },
      });

      await prisma.transaction.delete({
        where: { id },
      });

      res.status(204).json();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },
}
