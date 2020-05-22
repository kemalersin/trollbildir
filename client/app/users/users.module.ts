import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { AuthModule } from '../../components/auth/auth.module';
import { UsersComponent } from './users.component';


const usersRoutes: Routes = [{
    path: 'uyeler/:username',
    component: UsersComponent,
    canActivate: [AuthGuard]
}, {
    path: 'uyeler',
    component: UsersComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        AuthModule,
        BrowserModule,
        FormsModule,
        RouterModule.forChild(usersRoutes),
        InfiniteScrollModule
    ],
    declarations: [
        UsersComponent,
    ],
    exports: [
        UsersComponent,
    ],
})
export class UsersModule { }
