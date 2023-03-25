import Campaign from 'App/Models/Campaign'
import Factory from '@ioc:Adonis/Lucid/Factory'
import RewardFactory from './RewardFactory'

export default Factory.define(Campaign, ({ faker }) => {
  return {
    //

    userId:   faker.datatype.number({min:1, max:10}),// assuming 10 users exist in your database
    categoryId: faker.datatype.number({min:1, max:7}), // assuming 5 categories exist in your database
    name: faker.commerce.productName(),
    slug: faker.lorem.slug(),
    amount: faker.datatype.number({ min: 5000, max: 200000 }),
    end_date: faker.date.future(),
    description: faker.lorem.sentences(),
    image: faker.image.image(800,800,true),
    // image:faker.image.abstract(),
    verified: 1,
    featured:  faker.datatype.number({min:0, max:1}),

  }

})
.relation('rewards', () => RewardFactory)
.build()
