import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Simpsons } from '../../services/simpsons';
import { Location } from '../../models/location';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, Spinner],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
    
    showScrollTop = false;
      loading = true;
      isFetching = false;
      locations: Location[] = [];
      nextUrl: string | null = null;
    
      constructor(
        private simpsonsService: Simpsons,
        private cdr: ChangeDetectorRef // 🔥 AGREGADO
      ) {}
    
      @HostListener('window:scroll', [])
    onScroll(): void {
      const scrollY = window.scrollY;
    
      this.showScrollTop = scrollY > 300;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 100; // margen
    
      if (scrollPosition >= threshold && !this.loading && this.nextUrl && !this.isFetching) {
        this.isFetching = true;
        this.loadLocations(this.nextUrl);
      }
    }
      ngOnInit() {
        this.loadLocations();
      }
    
      loadLocations( url?: string) {
        this.loading = true;
    
        this.simpsonsService.getLocations(url).subscribe({
          next: (data) => {
            console.log("API RESPONSE:", data);
    
            this.locations = [...this.locations , ...data.results];
            this.loading = false;
            this.nextUrl = data.next;
            this.isFetching = false;
    
            this.cdr.detectChanges(); // 🔥 CLAVE
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.isFetching = false;
    
            this.cdr.detectChanges(); // 🔥 también aquí
          }
        });
      }
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
}
