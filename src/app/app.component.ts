import { Component } from '@angular/core';
import * as math from 'mathjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'CalculadoraDeLineasDeTransmision';
  lineas = ['Cable coxial', 'Linea Bifilar', 'Microcinta'];
  // Variables
  linea = 0;
  tipoCalculo = 0;
  dielectrico = 0;
  metal = 0;
  dielectricovalor = 0;
  metalvalor = 0;
  tangentevalor = 0;
  frecuencia = 0;
  impedancia: any;
  //Constantes
  oc = [1.03e7, 1.45e7, 1.5e7, 1.67e7, 1.82e7, 3.82e7, 4.1e7, 5.8e7, 6.17e7];
  tag_perdidas = [
    50e-3, 0.6e-3, 20e-3, 8e-3, 30e-3, 0.2e-3, 0.3e-3, 0.05e-3, 14e-3, 0.6e-3,
    0.75e-3,
  ];
  er = [4.2, 5.4, 3.5, 3, 3.45, 2.26, 2.25, 2.56, 6, 4, 3.8];
  e0 = 8.8542e-12;
  mr = 1;
  //Valores de coaxial
  coaxialA = 0;
  coaxialB = 0;
  coaxialC = 0;
  //Valores de bifilar
  bifilarD = 0;
  bifilarA = 0;
  //Valores de microcinta
  microW = 0;
  microT = 0;
  microH = 0;
  //Valores de calculo
  od = 0;
  acosh = 0;
  mu = 0;
  l = 0;
  R = 0;
  L = 0;
  C = 0;
  G = 0;
  calcular() {
    let oc = this.metalvalor > 0 ? this.metalvalor : this.oc[this.metal];
    let er =
      this.dielectricovalor > 0
        ? this.dielectricovalor
        : this.er[this.dielectrico];
    let perdidas =
      this.tangentevalor > 0
        ? this.tangentevalor
        : this.tag_perdidas[this.dielectrico];
    this.mu = this.mr * (4 * math.pi * 1e-7);
    this.acosh =
      this.bifilarD / this.bifilarA >= 10
        ? math.log(this.bifilarD / this.bifilarA)
        : math.acosh(this.bifilarD / (2 * this.bifilarA));
    this.profundidad(oc);
    this.conductividad_od(perdidas, er);
    if (this.linea == 0) {
      this.inductancia_coaxial();
      this.capacitancia_coaxial(er);
      this.resistencia_coaxial(oc);
      this.conductancia_coaxial();
    }
    if (this.linea == 1) {
      this.inductancia_bifilar();
      this.capacitancia_bifilar(er);
      this.resistencia_bifilar(oc);
      this.conductancia_bifilar();
    }
    if (this.linea == 2) {
      this.inductancia_microcinta();
      this.capacitancia_microcinta(er);
      this.resistencia_microcinta(oc);
      this.conductancia_microcinta();
    }
    this.impedacia_caracteristica();
  }
  profundidad(oc: number) {
    let w = 2 * math.pi * this.frecuencia;
    this.l = math.sqrt(2 / (w * this.mu * oc));
  }
  conductividad_od(perdidas: number, er: number) {
    this.od = perdidas * (2 * math.pi * this.frecuencia) * er * this.e0;
  }
  //#region Coaxial
  inductancia_coaxial() {
    if (this.l > this.coaxialA) {
      this.L =
        (this.mu / (2 * math.pi)) *
        (math.log(this.coaxialB / this.coaxialA) +
          1 / 4 +
          (1 / (4 * (this.coaxialC ** 2 - this.coaxialB ** 2))) *
            (this.coaxialB ** 2 -
              3 * this.coaxialC ** 2 +
              ((4 * this.coaxialC ** 4) /
                (this.coaxialC ** 2 - this.coaxialB ** 2)) *
                math.log(this.coaxialC / this.coaxialB)));
    } else {
      this.L =
        (this.mu / (2 * math.pi)) * math.log(this.coaxialB / this.coaxialA);
    }
  }
  capacitancia_coaxial(er: number) {
    this.C =
      (2 * math.pi * this.e0 * er) / math.log(this.coaxialB / this.coaxialA);
  }
  resistencia_coaxial(oc: number) {
    if (this.l > this.coaxialA) {
      this.R =
        (1 / (oc * math.pi)) *
        (1 / this.coaxialA ** 2 +
          1 / (this.coaxialC ** 2 - this.coaxialB ** 2));
    } else {
      this.R =
        (1 / (oc * 2 * math.pi * this.l)) *
        (1 / this.coaxialA + 1 / this.coaxialB);
    }
  }
  conductancia_coaxial() {
    this.G = (2 * math.pi * this.od) / math.log(this.coaxialB / this.coaxialA);
  }
  //#endregion
  //#region Linea Bifilar
  inductancia_bifilar() {
    let acosh =
      this.bifilarD / this.bifilarA >= 10
        ? math.log(this.bifilarD / this.bifilarA)
        : math.acosh(this.bifilarD / (2 * this.bifilarA));
    if (this.l > this.bifilarA) {
      this.L = (this.mu / math.pi) * (1 / 4 + acosh);
    } else {
      this.L = (this.mu / math.pi) * acosh;
    }
  }
  capacitancia_bifilar(er: number) {
    this.C = (math.pi * er * this.e0) / this.acosh;
  }
  resistencia_bifilar(oc: number) {
    if (this.l > this.bifilarA) {
      this.R = 2 / (oc * math.pi * this.bifilarA ** 2);
    } else {
      this.R = 1 / (math.pi * this.bifilarA * this.l * oc);
    }
  }
  conductancia_bifilar() {
    this.G = (math.pi * this.od) / this.acosh;
  }
  //#endregion
  //#region Microcinta
  inductancia_microcinta() {
    this.L = (this.mu * this.microH) / this.microW;
  }
  capacitancia_microcinta(er: number) {
    this.C = (er * this.e0 * this.microW) / this.microH;
  }
  resistencia_microcinta(oc: number) {
    let delta = 1 / math.sqrt(math.pi * this.frecuencia * this.mu * oc);
    this.R =
      delta > this.microT
        ? 1 / (oc * this.microW * this.microT)
        : 2 / (oc * this.microW * delta) +
          2 / (oc * (this.microT - 2 * delta) * delta);
  }
  conductancia_microcinta() {
    this.C = (this.od * this.microW) / this.microH;
  }
  //#endregion
  impedacia_caracteristica() {
    const a = math.complex(this.R, 2 * math.pi * this.frecuencia * this.L);
    const b = math.complex(this.G, 2 * math.pi * this.frecuencia * this.C);
    const c = math.divide(a, b);
    this.impedancia = this.complex_sqrt(c);
  }

  complex_sqrt(x: any) {
    var r = Math.sqrt(x.re * x.re + x.im * x.im);
    var re, im;
    if (x.re >= 0) {
      re = 0.5 * Math.sqrt(2.0 * (r + x.re));
    } else {
      re = Math.abs(x.im) / Math.sqrt(2 * (r - x.re));
    }
    if (x.re <= 0) {
      im = 0.5 * Math.sqrt(2.0 * (r - x.re));
    } else {
      im = Math.abs(x.im) / Math.sqrt(2 * (r + x.re));
    }
    if (x.im >= 0) {
      return math.complex(re, im);
    } else {
      return math.complex(re, -im);
    }
  }
}
