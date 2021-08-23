
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HighchartsChartModule } from "highcharts-angular";
import { StackedAreaChartComponent } from "./stacked-area-chart/stacked-area-chart.component";
import { PieChartComponent } from "./pie-chart/pie-chart.component";
import { BarChartComponent } from './bar-chart/bar-chart.component';

const components = [StackedAreaChartComponent, PieChartComponent, BarChartComponent];

@NgModule({
  declarations: components,
  imports: [CommonModule, HighchartsChartModule],
  exports: components,
})
export class ChartsModule {}
