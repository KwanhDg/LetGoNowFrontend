import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  email: string = 'info@letgonow.com';
  private bannerTimer: any;

  ngOnInit() {
    this.startBannerSwitching();
  }

  ngOnDestroy() {
    if (this.bannerTimer) {
      clearInterval(this.bannerTimer);
    }
  }

  startBannerSwitching() {
    this.bannerTimer = setInterval(() => this.bannerSwitcher(), 5000);
  }

  bannerSwitcher() {
    const inputs = document.querySelectorAll('.sec-1-input') as NodeListOf<HTMLInputElement>;
    let currentIndex = Array.from(inputs).findIndex(input => input.checked);
    let nextIndex = (currentIndex + 1) % inputs.length;
    inputs[nextIndex].checked = true;
  }

  onControlClick() {
    if (this.bannerTimer) {
      clearInterval(this.bannerTimer);
    }
    this.startBannerSwitching();
  }
}