import { Component, OnInit } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { SpotifyService } from '../services/spotify.service';
import { DatastoreService } from '../services/datastore.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss'],
})
export class ChallengeComponent implements OnInit {
  constructor(
    private titleTagService: TitleTagService,
    private spotify: SpotifyService,
    private data: DatastoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  url = '';
  urlchange;
  hostName: string;
  customTitle: string;
  config = {};
  nameStr: string;
  validCode = true;

  ngOnInit(): void {
    this.titleTagService.setTitle(
      'Whisperify Challenge - Enter your name to start the quiz!'
    );
    this.titleTagService.setSocialMediaTags(
      'Whisperify Challenge - Enter your name to start the quiz!',
      "Take a quiz on your friend's music, see where you rank, and create your own!"
    );
    sessionStorage.setItem('currentLink', '');
    this.validCode = true;
    this.urlchange = this.route.params.subscribe((params) => {
      const isCode = params['code'] || '';
      if (isCode == '') {
        this.router.navigate(['/']);
      }
      this.spotify
        .getChallenge(isCode)
        .then((res) => {
          //console.log(res);
          //this.hostName = res["scoreboard"][0]["name"];
          // finds the first obj in leaderboard with 'host' field which is the host
          this.customTitle = res['title'] || 'Whisperify';
          this.hostName = res['scoreboard'].find((obj) => {
            return obj['host'] === true;
          })['name'];
          sessionStorage.setItem('challenge', isCode);
          this.data.changeSongs({
            tracks: res['tracks'],
            dynamic: res['dynamic'] || false,
          });
          this.data.changeSongList({ tracks: res['tracklist'] });
          this.data.changeIndexes({ ind: res['indexes'] });
          this.data.changeConfigs({
            whisperLen: res['whisperLen'],
            timeLimit: res['timeLimit'],
            excludeArtists: [],
            multChoice: true,
          });
        })
        .catch((e) => {
          console.log(e);
          this.validCode = false;
        });
    });
  }

  startChallenge(): void {
    sessionStorage.setItem('enteredName', this.nameStr);
    this.router.navigate(['/quiz']);
  }
}
