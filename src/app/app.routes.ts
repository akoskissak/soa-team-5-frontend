import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'create-blog', 
    loadComponent: () =>
      import('./blog-create/blog-create.component').then((m) => m.BlogCreateComponent),
  },
  {
    path: 'blogs', 
    loadComponent: () =>
      import('./blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
];
