/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GameDataComponent } from './game-data.component';

describe('GameDataComponent', () => {
  let component: GameDataComponent;
  let fixture: ComponentFixture<GameDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
