import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Marketplace } from './marketplace';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly market = inject(Marketplace);
  readonly router = inject(Router);
  is_menu_open = false;

  async logout(): Promise<void> {
    await this.market.logout();
    this.is_menu_open = false;
    await this.router.navigateByUrl('/');
  }

  close_menu(): void {
    this.is_menu_open = false;
  }
}
