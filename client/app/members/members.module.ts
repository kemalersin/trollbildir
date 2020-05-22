import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/auth/auth-guard.service';
import { MembersService } from './members.service';
import { MembersComponent } from './members.component';


const MembersRoutes: Routes = [{
    path: 'ekip/:username',
    component: MembersComponent,
    canActivate: [AuthGuard]
}, {
    path: 'ekip',
    component: MembersComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forChild(MembersRoutes),

    ],
    declarations: [
        MembersComponent
    ],
    exports: [
        MembersComponent
    ],
    providers: [
        MembersService
    ]
})
export class MembersModule { }
