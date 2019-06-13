import { Injectable } from '@angular/core';

import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  escaneosGuardados: Registro[] = [];

  constructor(private storage: Storage,
              private navCtrl: NavController,
              private inAppBrowser: InAppBrowser,
              private file: File,
              private emailComposer: EmailComposer) {
    this.cargarRegistros();
  }

  async guardarRegistro(format: string, text: string) {

    /// primerop verficamos si no tiene nada y depuess insertamoss oos registros 
    await this.cargarRegistros();

    const nuevoRegistro = new Registro(format, text);
    this.escaneosGuardados.unshift(nuevoRegistro);
    console.log(this.escaneosGuardados);
    this.storage.set('registros', this.escaneosGuardados);

    this.abrirRegistro(nuevoRegistro);
  }

  async cargarRegistros() {
    const registros =  await this.storage.get('registros');
    this.escaneosGuardados = registros  || [];
    return this.escaneosGuardados;
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {

        case 'http':
          this.inAppBrowser.create(registro.text, '_system');
          break;

        case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
    }
  }

  enviarCorreo() {

    const arrTemp =  [];
    const titulos = 'Tipo, Formato, Creado en, Texto \n';
    console.log(titulos);
    arrTemp.push(titulos);
    console.log(arrTemp);

    this.escaneosGuardados.forEach(registro => {
      console.log(registro);

      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', '')}\n`;

      arrTemp.push(linea);
    });

    console.log(arrTemp.join(''));
    this.crearArchivoFisico(arrTemp.join(''));
  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, 'registros.csv')
             .then(exisste => {
               console.log('exisste archivo', exisste);
               return this.escribirEnArchivo(text);
             }).catch(err => {
               return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
                       .then( creado => {
                         this.escribirEnArchivo(text);
                       }).catch(erroro2 => console.log('no se pudo crear el archivo', erroro2));
             });
  }

  async escribirEnArchivo(text: string) {
     await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
     // console.log('Archivo creado');
     // console.log(this.file.dataDirectory + 'registros.csv');

     const archivo = `${this.file.dataDirectory}/registros.csv`;

     const email = {
      to: 'markitos02lopezito@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
      ],
      subject: 'Backup de scans',
      body:    'Aqui tienen sus backups de los scans - <strong>ScanApp</strong>',
      isHtml: true
    };

    /// enviaar un mensaje de texto usandi por default la opcion
     this.emailComposer.open(email);
  }

}
