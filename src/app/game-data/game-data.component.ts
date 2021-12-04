import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { StatsService } from '../services/stats.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-game-data',
  templateUrl: './game-data.component.html',
  styleUrls: ['./game-data.component.scss']
})
export class GameDataComponent implements OnInit {
  public lineBigDashboardChartType;
  public gradientStroke;
  public chartColor;
  public canvas : any;
  public ctx;
  public gradientFill;
  public lineBigDashboardChartData:Array<any>;
  public lineBigDashboardChartOptions:any;
  public lineBigDashboardChartLabels:Array<any>;
  public lineBigDashboardChartColors:Array<any>

  public gradientChartOptionsConfiguration: any;
  public gradientChartOptionsConfigurationWithNumbersAndGrid: any;

  public lineChartType;
  public lineChartData:Array<any>;
  public lineChartOptions:any;
  public lineChartLabels:Array<any>;
  public lineChartColors:Array<any>

  public lineChartWithNumbersAndGridType;
  public lineChartWithNumbersAndGridData:Array<any>;
  public lineChartWithNumbersAndGridOptions:any;
  public lineChartWithNumbersAndGridLabels:Array<any>;
  public lineChartWithNumbersAndGridColors:Array<any>

  public lineChartGradientsNumbersType;
  public lineChartGradientsNumbersData:Array<any>;
  public lineChartGradientsNumbersOptions:any;
  public lineChartGradientsNumbersLabels:Array<any>;
  public lineChartGradientsNumbersColors:Array<any>
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
  public hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }
  maxDate = null;
  constructor(
    private statsService: StatsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
  ) { 
    const current = new Date();
    this.maxDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }
  entries = [];
  dailyStats = [];
  currentGame;
  closeResult = '';
  popupEntry =  {
    type: 'Earn',
    date: null,
    balance: 0,
    entry: 0,
    linked: true,
    main: 'entry'
  }
  balance = 0;
  isSaving = false;
  globals = {
    balance: 0
  }
  ngOnInit() {
    this.setmainChart([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.currentGame = this.getGameID(this.route.snapshot.params['name']);
    if (!this.currentGame) return;
    this.statsService.getEntries(this.currentGame.id)
    .subscribe(
      res => {
        this.entries = res;
      },
      err => {
        console.log('🚀 ~ file: game-data.component.ts ~ line 80 ~ GameDataComponent ~ this.router.events.subscribe ~ err', err);
      }
    );
    this.statsService.getDailyStats(this.currentGame.id).subscribe(
      res => {
        this.dailyStats = res;
        this.setmainChart(this.getData(), this.getLabels());
        this.getReadyToClaim();
      },
      err => {
        console.log('🚀 ~ file: game-data.component.ts ~ line 80 ~ GameDataComponent ~ this.router.events.subscribe ~ err', err);
      }
    );
    this.statsService.getCurrency(this.currentGame.address).then(res => {
      this.currentGame['tokenValue'] = res;
    }).catch(err => {
      console.log('🚀 ~ file: game-data.component.ts ~ line 87 ~ GameDataComponent ~ this.userService.getCurrency ~ err', err);      
    })
  }
  updatePopupBalance(event: any) {
    const value = event.target.value;
    switch (this.popupEntry.type) {
      case 'Earn':
        this.popupEntry.balance = this.balance + +value;
        break;
      case 'Claim':
        this.popupEntry.balance = this.balance - +value;
        break;
      case 'Fees':
        this.popupEntry.balance = this.balance - +value;
        break;
      default:
        break;
    }
  }
  updatePopupEntry(event: any) {
    const value = event.target.value;
    switch (this.popupEntry.type) {
      case 'Earn':
        this.popupEntry.entry =  this.toFixed(+value - this.balance, this.currentGame.tokenValue.countDecimals());
        break;
      case 'Claim':
        this.popupEntry.entry =  +value;
        break;
      case 'Fees':
        this.popupEntry.entry =  this.toFixed(this.balance - +value, this.currentGame.tokenValue.countDecimals());
        break;
      default:
        break;
    }
  }
  getGameID(name: string) {
    return this.userService.games.find(g => g.name.toLowerCase().replace(/ /g, '') === name);
  }
  getReadyToClaim() {
    if (!this.dailyStats.length) return;
    const lastEl = this.dailyStats.length - 1;
    this.globals.balance = this.dailyStats[lastEl].earningFromLastClaim;
  }
  getLabels() {
    return this.dailyStats.map(e => e.date);
  }
  getData() {
    return this.dailyStats.map(e => e.dailyEarning);
  }
  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  async saveEntry(modal) {
    this.isSaving = true;
    const entry = {
      type: this.popupEntry.type,
      game: this.currentGame.id,
      earningFromLastClaim: this.popupEntry.balance,
      entryValue: this.popupEntry.entry,
      tokenValue: 0,
      createdAt: ''
    }
    const datePickerValues = this.popupEntry.date;
    const date = new Date(Date.UTC(datePickerValues.year, datePickerValues.month - 1, datePickerValues.day,0,0,0));
    entry.createdAt = date.toISOString();
    entry.tokenValue = await this.statsService.getCurrencyAtDate(this.currentGame.tokenID, date);
    this.statsService.postEntries(entry).subscribe(res => {
      const existing = this.dailyStats.findIndex(e => e.id === res['id']);
      if (existing) {
        this.dailyStats[existing] = res;
      } else {
        this.dailyStats = [...this.dailyStats, res];
      }
      modal.close('Save click');
      this.isSaving = false;
    }, err => {
      console.log('----', err);
      this.isSaving = false;
    });
  }
  switch() {
    this.popupEntry.main = this.popupEntry.main === 'entry' ?  'balance' : 'entry';
    this.updateBalance(this.popupEntry.date);
  }
  updateBalance(date) {
    const datePickerDate = new Date(Date.UTC(date.year, date.month - 1, date.day,0,0,0)).toLocaleDateString('es-CL');
    const today = new Date().toLocaleDateString('es-CL');
    const entry = this.dailyStats.find(e => e.date === datePickerDate);
    this.popupEntry.balance = this.balance = datePickerDate === today ? this.globals.balance : entry ? entry.earningFromLastClaim : 0;
  }
  toFixed(value, set) {
    return value.toFixed(set);
  }
  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  setmainChart(data: number[], labels?: string[]) {
    this.chartColor = "#FFFFFF";
    this.canvas = document.getElementById("bigDashboardChart");
    this.ctx = this.canvas.getContext("2d");

    this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
    this.gradientStroke.addColorStop(0, '#80b6f4');
    this.gradientStroke.addColorStop(1, this.chartColor);

    this.gradientFill = this.ctx.createLinearGradient(0, 200, 0, 50);
    this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
    this.gradientFill.addColorStop(1, "rgba(255, 255, 255, 0.24)");

    this.lineBigDashboardChartData = [
        {
          label: "Data",

          pointBorderWidth: 1,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointRadius: 5,
          fill: true,

          borderWidth: 2,
          data
        }
      ];
      this.lineBigDashboardChartColors = [
       {
         backgroundColor: this.gradientFill,
         borderColor: this.chartColor,
         pointBorderColor: this.chartColor,
         pointBackgroundColor: "#2c2c2c",
         pointHoverBackgroundColor: "#2c2c2c",
         pointHoverBorderColor: this.chartColor,
       }
     ];
    this.lineBigDashboardChartLabels = labels ? labels : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    this.lineBigDashboardChartOptions = {

          layout: {
              padding: {
                  left: 20,
                  right: 20,
                  top: 0,
                  bottom: 0
              }
          },
          maintainAspectRatio: false,
          tooltips: {
            backgroundColor: '#fff',
            titleFontColor: '#333',
            bodyFontColor: '#666',
            bodySpacing: 4,
            xPadding: 12,
            mode: "nearest",
            intersect: 0,
            position: "nearest"
          },
          legend: {
              position: "bottom",
              fillStyle: "#FFF",
              display: false
          },
          scales: {
              yAxes: [{
                  ticks: {
                      fontColor: "rgba(255,255,255,0.4)",
                      fontStyle: "bold",
                      beginAtZero: true,
                      maxTicksLimit: 5,
                      padding: 10
                  },
                  gridLines: {
                      drawTicks: true,
                      drawBorder: false,
                      display: true,
                      color: "rgba(255,255,255,0.1)",
                      zeroLineColor: "transparent"
                  }

              }],
              xAxes: [{
                  gridLines: {
                      zeroLineColor: "transparent",
                      display: false,

                  },
                  ticks: {
                      padding: 10,
                      fontColor: "rgba(255,255,255,0.4)",
                      fontStyle: "bold"
                  }
              }]
          }
    };

    this.lineBigDashboardChartType = 'line';


    this.gradientChartOptionsConfiguration = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: 1,
      scales: {
        yAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }],
        xAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }]
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 15
        }
      }
    };
  }
}
