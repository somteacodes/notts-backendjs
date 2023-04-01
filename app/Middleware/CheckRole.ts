// middleware to check if user has a role
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
export default class CheckRole {
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles?: string[]
  ) {

    if (allowedRoles && allowedRoles.length > 0) {
      const user = await auth.user!
      await user.refresh();
      await user.load((loader) => {
        loader.load('role');
      });
      if (!allowedRoles.includes(user.role.name)) {
          /**
     * Unable to authenticate using any guard
     */
    throw new AuthenticationException(
      'Unauthorized access',
      'E_UNAUTHORIZED_ACCESS',
      // this.redirectTo,
    )
        // return response.unauthorized({ error: 'You are not authorized to perform this action' })
      }
    }
    await next()
  }
}
