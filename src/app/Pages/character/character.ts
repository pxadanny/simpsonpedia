import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Simpsons } from '../../services/simpsons';
import { Characterid } from '../../models/characterid';
import { Spinner } from '../../Components/spinner/spinner';
@Component({
  selector: 'app-character',
  imports: [ CommonModule, Spinner],
  templateUrl: './character.html',
  styleUrl: './character.css',
})
export class Character implements OnInit {

  character!: Characterid;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private simpsonsService: Simpsons,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));

    if (id) {
      this.getCharacter(id);
    }
  });
}

  getCharacter(id: number) {
    this.simpsonsService.getCharacterById(id).subscribe({
      next: (data) => {
        console.log("API RESPONSE:", data);

        this.character = data;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
