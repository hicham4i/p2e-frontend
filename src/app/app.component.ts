import { Component, OnInit} from '@angular/core';
import { UserService } from '../app/services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (this.userService.user && this.userService.games.length) return;
    this.userService.getUser();
    this.userService.getGames();
    // this.userService.getBNB();
  }
}
