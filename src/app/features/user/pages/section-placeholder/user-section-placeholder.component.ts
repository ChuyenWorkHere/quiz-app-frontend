import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-section-placeholder',
  template: `<main class="placeholder"><div><span>{{ eyebrow }}</span><h1>{{ heading }}</h1><p>{{ description }}</p></div></main>`,
  styles: [`:host{display:block}.placeholder{padding:24px}.placeholder>div{padding:40px;border-radius:16px;background:#fff;box-shadow:0 2px 7px #0b1c300a}.placeholder span{color:#004ac6;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.placeholder h1{margin:10px 0 8px;font-size:32px}.placeholder p{margin:0;color:#434655;line-height:24px}`]
})
export class UserSectionPlaceholderComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  protected readonly eyebrow = this.data['eyebrow'] as string;
  protected readonly heading = this.data['heading'] as string;
  protected readonly description = this.data['description'] as string;
}
