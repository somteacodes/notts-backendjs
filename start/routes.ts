/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

Route.get('/', async () => {
  return ' notts api reached';
});

Route.get('users', 'UsersController.index');

Route.post('auth/register/:provider', 'AuthController.register');
Route.post('auth/login/:provider', 'AuthController.login');
Route.get('campaigns/get/:type?', 'CampaignsController.getCampaignsByType');
Route.get('campaigns/all', 'CampaignsController.getAllCampaigns');
Route.get('campaign/view/:slug', 'CampaignsController.getCampaignBySlug');
Route.get('rewards/view/:slug', 'RewardsController.getRewards'); //TODO this could be redundant, confirm where it is needed and clear this comment
Route.get('banks/accounts/:nuban', 'BanksController.getBanks');
Route.get('mail/test', 'UsersController.sendEmail');
Route.post('verify/email', 'AuthController.verifyCodeFromEmail');
// protected routes
Route.group(() => {
  Route.post('requestVerification/email', 'AuthController.requestVerification');

  Route.post('user/upload/image', 'UsersController.uploadImage');
  Route.post('user/details/update', 'UsersController.updateDetails');
  Route.post('campaign/upload/image', 'CampaignsController.uploadImage');
  Route.post('campaign/create', 'CampaignsController.createCampaign');
  Route.get('campaign/d/view/:type/:slug', 'CampaignsController.viewMyCampaign');
  Route.post('reward/create', 'RewardsController.createReward');
  Route.post('donation/save', 'DonationsController.saveDonation');
  Route.get('user/get/donation', 'UsersController.getUserDonationStats');
  Route.get('user/get/campaign/stats', 'UsersController.getUserCampaignStats');
  Route.get('user/get/campaigns', 'CampaignsController.getAllMyCampaigns');
  Route.get('user/bank/get/code', 'BanksController.getBankVerificationCode');
  Route.post('user/bank/update', 'BanksController.updateBankDetails');
  Route.get('user/bank/detail', 'UsersController.getUserBankDetail');
  Route.post('user/phone/sendcode', 'UsersController.sendCodeToPhone');

  // Admin group routes
  Route.group(() => {
    Route.get('user/get/token', 'UsersController.getUserFromToken');
    Route.get('users/all', 'UsersController.getAllUsers');
    Route.put('admin/campaign/:slug/status', 'CampaignsController.changeCampaignStatus');
  }).middleware('checkRole:admin');
  // FOR TESTING
  Route.post('user/phone/verifycode', 'UsersController.verifyCodeFromPhone');
}).middleware(['auth']);
// Admin group routes
