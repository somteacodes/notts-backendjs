import Reward from 'App/Models/Reward'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Reward, ({ faker }) => {
  return {
    //
    campaignId: faker.datatype.number({min:1, max:10}),
    name: faker.commerce.productName(),
    target: faker.datatype.number({ min: 5000, max: 200000 }),
    description: faker.lorem.sentences(Math.floor(Math.random() * 5) + 1),
    image: faker.image.fashion(150,150,true),
    count: faker.datatype.number({ min: 1, max: 10 }),
  }
}).build()
