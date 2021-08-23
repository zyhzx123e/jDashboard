
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "js-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  public now: Date = new Date();

  constructor() {}

  ngOnInit(): void {}
}
