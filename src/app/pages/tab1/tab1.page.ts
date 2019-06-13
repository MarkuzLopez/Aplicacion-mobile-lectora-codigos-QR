import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  swiperOpts = {
    allowSlidePrev: false,
    allowSlideNext: false
  };

  constructor(private barcoScanner: BarcodeScanner,
              private datalocal: DataLocalService ) {}

  //  TODO CICLOS DE VIDA DE IONIC

  // ionViewDidEnter() {
  //   console.log('viewDidEnter');
  // }

  // ionViewDidLeave() {
  //   console.log('viewDidLeave');
  // }

  ionViewWillEnter() {
   // console.log('viewWillEnter');
    this.scan();
  }

  // ionViewWillLeave() {
  //   console.log('viewWillLeave');
  // }
  scan() {
    this.barcoScanner.scan().then(barcodeData => {
     // console.log('Barcode data', barcodeData);

      // ssi no es cancelado el QR
      if (!barcodeData.cancelled) {
          this.datalocal.guardarRegistro(barcodeData.format, barcodeData.text);
      }

     }).catch(err => {
         console.log('Error', err);
         this.datalocal.guardarRegistro('QRCode', 'geo:19.368227, -99.258467');
         // this.datalocal.guardarRegistro('QRCode', 'https://www.todoensubastas.com.mx/');
         // 19.368227, -99.258467
     });
  }

}
