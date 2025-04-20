import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'cruises', component: HomeComponent }, // Thay bằng CruisesComponent sau
  { path: 'flights', component: HomeComponent },
  { path: 'hotels', component: HomeComponent },
  { path: 'tours', component: HomeComponent },
  { path: 'blog', component: HomeComponent },
  { path: 'about-halong', component: HomeComponent },
  { path: 'about-nhatrang', component: HomeComponent },
  { path: 'about-dalat', component: HomeComponent },
  { path: 'about-phuquoc', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' } // Route mặc định
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }