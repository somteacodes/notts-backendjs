import Profile from 'App/Models/Profile'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Profile, ({ faker }) => {
  return {
    //
    userId: faker.datatype.number({min:1, max:10}),// assuming 10 users exist in your database
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: faker.phone.number('0##########'),
    image: faker.image.avatar(),
  }
}).build()
