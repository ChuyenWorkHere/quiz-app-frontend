import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RegistrationFormComponent } from '../../components/registration-form/registration-form.component';

@Component({ 
    selector: 'app-registration-page', 
    imports: [HeaderComponent, RegistrationFormComponent, RouterLink], 
    templateUrl: './registration-page.component.html', 
    styleUrl: './registration-page.component.css' 
})
export class RegistrationPageComponent {}
