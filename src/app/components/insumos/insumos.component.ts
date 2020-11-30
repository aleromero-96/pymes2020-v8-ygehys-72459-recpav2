import { Component, OnInit } from '@angular/core';
import { Insumo } from "../../models/insumo";
import { InsumosService } from "../../services/insumos.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css']
})
export class InsumosComponent implements OnInit {

  Titulo:String = "Insumos";
  TituloAccionABMC = {
    A: "(Agregar)",   
    C: "(Consultar)",
    L: "(Listado)"
  };
  Insumos: Insumo[] = [];
  insumo: Insumo;
  AccionABMC:string = "L";
    Mensajes = {
    RD: " Revisar la carga de datos"
  };
  SinBusquedasRealizadas = true;

  FormReg: FormGroup;
  submitted = false;

  constructor(
    private insumosService:  InsumosService,
    public formBuilder: FormBuilder,
    private modalDialogService: ModalDialogService
  ) { }

  ngOnInit() {
    this.Buscar();
    this.Resetear();

  }
    Resetear(){
    this.FormReg = this.formBuilder.group({
      IdInsumo: [0],
      Descripcion: [
        "",[Validators.required, Validators.minLength(4), Validators.maxLength(50)]
      ],
      Cantidad: [null, [Validators.required, Validators.pattern("[0-9]{1,300}")]],
      FechaStock: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          )
        ]
      ],      
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    this.Resetear();
    this.FormReg.reset(this.FormReg.value);
    this.submitted = false;
    this.FormReg.markAsUntouched(); 
  }

  BuscarPorId(e, AccionABMC) {
    window.scroll(0, 0);
    this.insumosService.getById(e.IdInsumo).subscribe((res: any) => {
      this.FormReg.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaStock.substr(0, 10).split("-");
      this.FormReg.controls.FechaStock.patchValue(
        arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Volver(){
    this.AccionABMC = "L";
  }

Grabar() {
      this.submitted = true;
    // VERIFICACION QUE LOS DATOS INGRESADOS SON VALIDOS Y NO ERRONEOS.
     if (this.FormReg.invalid) {
      return;
    }

    const itemCopy = { ...this.FormReg.value };

    var arrFecha = itemCopy.FechaStock.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaStock = 
          new Date(
            arrFecha[2],
            arrFecha[1] - 1,
            arrFecha[0]
          ).toISOString();

    // COMANDO POST PARA QUE AGREGUE EL REGISTRO A LA BASE DE DATOS
    if (itemCopy.IdInsumo == 0 || itemCopy.IdInsumo == null) {
      this.insumosService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    } else {      
        }
    }

    Buscar() {
    this.SinBusquedasRealizadas = false;
    this.insumosService
      .get()
      .subscribe((res:Insumo[]) => {
        this.Insumos = res;
      });
    }
    
  Consultar(Dto) {
    this.BuscarPorId(Dto, "C");
  }
}