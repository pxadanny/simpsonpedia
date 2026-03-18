import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Simpsons } from '../../services/simpsons';
import { Characterid } from '../../models/characterid';
@Component({
  selector: 'app-character',
  imports: [ CommonModule],
  templateUrl: './character.html',
  styleUrl: './character.css',
})
export class Character implements OnInit {

  character!: Characterid;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private simpsonsService: Simpsons
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.getCharacter(+id);
    }
  }

  getCharacter(id: number) {
    this.simpsonsService.getCharacterById(id).subscribe({
      next: (data) => {
        this.character = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
