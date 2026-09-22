import { Routes } from '@angular/router';
import { ContactPageComponent } from './pages/contact/contact-page.component';
import { guestGuard } from '../auth/guards/auth.guard';
export const CONTACT_ROUTES: Routes = [{ 
    path: 'contact', 
    canActivate: [guestGuard],
    component: ContactPageComponent, 
    title: 'Contact QuizFlow | Feedback' 
}];
