import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logomark',
  standalone: true,
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="inline-block flex-shrink-0"
      aria-label="Rafeeq Care logomark"
    >
      <!-- Teal companion circle -->
      <circle cx="16" cy="20" r="12" fill="#1E4D46" fill-opacity="0.9" />
      <!-- Gold warmth circle, overlapping with mix-blend effect -->
      <circle cx="24" cy="20" r="12" fill="#D98A3D" fill-opacity="0.85" style="mix-blend-mode: multiply;" />
    </svg>
  `
})
export class LogomarkComponent {
  @Input() size: number = 32;
}
