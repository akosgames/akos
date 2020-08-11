import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScenesService } from '../../core/services/scenes.service';
import { FormBuilder } from '@angular/forms';
import { generateId } from '../../shared/utils/entity.util';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Command, deepCopy } from 'akos-common';
import { ScenesState } from '../../core/states/scenes.state';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'page-scene',
  templateUrl: './scene.page.html',
  styleUrls: ['./scene.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenePage implements OnInit, OnDestroy {

  references: any;
  referencedCommands: number[];
  commands = this.fb.array([]);
  sceneForm = this.fb.group({
    id: null,
    name: '',
    commands: this.commands
  });

  private sceneId: number;
  private unsubscribe$ = new Subject();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private scenesService: ScenesService,
    private scenesState: ScenesState
  ) {
  }

  ngOnInit() {

    this.route.params
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {

        const scene = this.scenesState.getById(params.id);
        this.sceneId = scene.id;

        this.commands.clear();
        scene.commands.forEach(() => this.commands.push(this.fb.control({})));
        this.sceneForm.setValue(scene, {
          emitEvent: false
        });

        this.updateReferences(scene.commands);
      });

    this.sceneForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(500)
      )
      .subscribe(value => {
        this.updateReferences(value.commands);
        this.scenesService.updateScene(value);
        this.changeDetectorRef.detectChanges();
      });

    this.scenesState
      .observe()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(scenes => {
        if (!scenes.some(scene => scene.id === this.sceneId)) {
          this.router.navigateByUrl('/game');
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onDeleteScene() {
    this.scenesService.deleteScene(this.sceneId);
  }

  onAddCommand() {
    this.commands.push(this.fb.control({
      id: generateId(),
      type: 'displayText',
      displayedSections: ['body'],
      reference: '',
      parameters: {
        waitForPlayer: true,
        text: ''
      }
    }));
  }

  onMoveCommandToStart(command: Command) {
    moveItemInArray(this.commands.controls, this.getCommandIndex(command), 0);
    this.commands.updateValueAndValidity();
  }

  onMoveCommandToEnd(command: Command) {
    moveItemInArray(this.commands.controls, this.getCommandIndex(command), this.commands.length - 1);
    this.commands.updateValueAndValidity();
  }

  onMoveCommandToPosition(command: Command, index: number) {
    let maxIndex = this.commands.length - 1;
    moveItemInArray(this.commands.controls, this.getCommandIndex(command), index > maxIndex ? maxIndex : index);
    this.commands.updateValueAndValidity();
  }

  onDuplicate(command: Command) {
    this.commands.insert(this.getCommandIndex(command) + 1, this.fb.control({
      ...deepCopy(command),
      id: generateId()
    }));
  }

  onDeleteCommand(command: Command) {
    this.commands.removeAt(this.getCommandIndex(command));
  }

  onDropCommand(event: CdkDragDrop<Command[]>) {
    moveItemInArray(this.commands.controls, event.previousIndex, event.currentIndex);
    this.commands.updateValueAndValidity();
  }

  private updateReferences(commands: Command[]) {

    this.references = {};
    this.referencedCommands = [];

    commands.forEach(command => {

      if (command.reference) {
        this.references[command.id] = command.reference;
      }

      if (command.parameters.toCommand) {
        this.referencedCommands.push(command.parameters.toCommand);
      }

      if (command.parameters.choices) {

        Array.prototype.push.apply(
          this.referencedCommands,
          command.parameters.choices
            .filter(choice => choice.toCommand)
            .map(choice => choice.toCommand)
        );
      }
    });
  }

  private getCommandIndex(command: Command): number {
    return this.commands.getRawValue().findIndex(c => c.id === command.id);
  }
}
