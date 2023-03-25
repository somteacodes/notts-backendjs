import Donation from 'App/Models/Donation'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Donation, ({ faker }) => {
  return {
    //
    campaignId: faker.datatype.number({min:1, max:10}),
    userId: faker.datatype.number({min:1, max:10}),
    ownerId: faker.datatype.number({min:1, max:10}),
    rewardId: faker.datatype.number({min:1, max:10}),
    amount: faker.datatype.number({min:2000, max:10000}),
    paymentRef:faker.datatype.uuid(),
    paymentChannel:'paystack',
    claimed_reward: faker.datatype.number({min:0, max:1}),
  }
}).build()
