import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { EstadisticasService } from './services/estadisticas.service';

/**
 * Pantalla de inicio tras el login: tarjetas de acceso rápido a cada módulo
 * (filtradas por rol, igual que el menú del layout) y, para ADMIN/SUPERADMIN,
 * los gráficos de estadísticas del negocio (mismo criterio de acceso que el
 * backend en estadisticas.routes.js: un CLIENTE nunca ve esta sección).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly estadisticasService = inject(EstadisticasService);

  // Mismo criterio que el backend (estadisticas.routes.js exige ADMIN/SUPERADMIN):
  // si esto da false, ni siquiera se piden los datos (ver ngOnInit).
  readonly esStaff = ['ADMIN', 'SUPERADMIN'].includes(this.authService.getUser()?.type ?? '');

  readonly cards = [
    { title: 'Usuarios', subtitle: 'Administradores del sistema', path: '/usuarios', roles: ['SUPERADMIN'] },
    { title: 'Canchas', subtitle: 'Espacios disponibles para alquilar', path: '/canchas', roles: null },
    { title: 'Reservas', subtitle: 'Turnos solicitados y confirmados', path: '/reservas', roles: ['ADMIN', 'SUPERADMIN'] },
    { title: 'Mis reservas', subtitle: 'Tus turnos pedidos y su estado', path: '/mis-reservas', roles: ['CLIENTE'] },
    { title: 'Pagos', subtitle: 'Cobros asociados a reservas', path: '/pagos', roles: ['ADMIN', 'SUPERADMIN'] },
  ].filter((card) => {
    const rol = this.authService.getUser()?.type;
    return !card.roles || card.roles.includes(rol!);
  });

  // Opciones comunes: maintainAspectRatio en false para que el canvas llene
  // el alto fijo del contenedor (.chart-content en el scss) en vez de imponer el suyo.
  private readonly opcionesComunes = { responsive: true, maintainAspectRatio: false };
  readonly pieOptions: ChartConfiguration<'pie'>['options'] = this.opcionesComunes;
  readonly lineOptions: ChartConfiguration<'line'>['options'] = this.opcionesComunes;
  readonly barOptions: ChartConfiguration<'bar'>['options'] = this.opcionesComunes;

  // ChartData<TipoDeGrafico, TipoDeLosValores, TipoDeLasEtiquetas> es el tipo que
  // espera [data] en <canvas baseChart>. Arrancan vacíos: recién se completan
  // cuando responde el backend (cargarEstadisticas), por eso el template no
  // necesita un @if de carga — ng2-charts dibuja un gráfico vacío sin romper.
  readonly reservasPorEstadoData = signal<ChartData<'pie', number[], string>>({ labels: [], datasets: [{ data: [] }] });
  readonly ingresosPorMesData = signal<ChartData<'line', number[], string>>({ labels: [], datasets: [{ data: [] }] });
  readonly canchasMasReservadasData = signal<ChartData<'bar', number[], string>>({ labels: [], datasets: [{ data: [] }] });
  readonly metodosPagoData = signal<ChartData<'pie', number[], string>>({ labels: [], datasets: [{ data: [] }] });

  ngOnInit(): void {
    // No tiene sentido pedir /api/estadisticas/* si el usuario no es staff:
    // el backend lo rechazaría con 403 igual (mismo guard que en las rutas).
    if (this.esStaff) {
      this.cargarEstadisticas();
    }
  }

  /**
   * Pide las 4 estadísticas en paralelo con forkJoin (en vez de 4 .subscribe()
   * sueltos) y, cuando responden TODAS, traduce cada respuesta del backend
   * (arrays de {estado, total} / {mes, total} / etc.) al formato {labels, datasets}
   * que entiende Chart.js.
   */
  private cargarEstadisticas(): void {
    forkJoin({
      reservas: this.estadisticasService.getReservasPorEstado(),
      ingresos: this.estadisticasService.getIngresosPorMes(),
      canchas: this.estadisticasService.getCanchasMasReservadas(),
      metodos: this.estadisticasService.getMetodosPago(),
    }).subscribe(({ reservas, ingresos, canchas, metodos }) => {
      // Torta: una porción por estado, `labels` son los nombres de estado y
      // `data` la cantidad de reservas en cada uno (mismo índice en ambos arrays).
      this.reservasPorEstadoData.set({
        labels: reservas.data.map((d) => d.estado),
        datasets: [{ data: reservas.data.map((d) => d.total) }],
      });

      // Línea: un punto por mes. `fill: true` pinta el área debajo de la línea,
      // `tension: 0.3` la curva un poco en vez de unir los puntos con rectas.
      this.ingresosPorMesData.set({
        labels: ingresos.data.map((d) => d.mes),
        datasets: [{ data: ingresos.data.map((d) => d.total), label: 'Ingresos ($)', fill: true, tension: 0.3 }],
      });

      // Barras: una barra por cancha (ya viene ordenado top-5 desde el backend).
      this.canchasMasReservadasData.set({
        labels: canchas.data.map((d) => d.nombreCancha),
        datasets: [{ data: canchas.data.map((d) => d.total), label: 'Reservas' }],
      });

      // Torta: una porción por método de pago.
      this.metodosPagoData.set({
        labels: metodos.data.map((d) => d.metodoPago),
        datasets: [{ data: metodos.data.map((d) => d.total) }],
      });
    });
  }
}
