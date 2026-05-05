import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {UserRole} from '../enums/user-role.enum';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];
  const userRole = authService.getCurrentUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
