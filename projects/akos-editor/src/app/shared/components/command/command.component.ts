import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Command, deepCopy } from 'akos-common';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MoveCommandDialogComponent } from '../move-command-dialog/move-command-dialog.component';

const defaultParameters = {
  waitForPlayer: false,
  picture: '',
  fullscreen: false,
  text: '',
  sceneId: null
};

interface CommandType {
  type: string;
  icon: string;
  text: string;
  header: 'green' | 'blue' | 'yellow' | 'red';
  parameters?: string[];
}

@Component({
  selector: 'ak-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CommandComponent),
    multi: true
  }]
})
export class CommandComponent implements OnInit, ControlValueAccessor {

  @Input() command: Command;
  @Input() usedMarkers: any;
  @Input() index: number;
  @Output() moveToStart = new EventEmitter<Command>();
  @Output() moveToEnd = new EventEmitter<Command>();
  @Output() moveToPosition = new EventEmitter<{command: Command, index: number}>();
  @Output() duplicate = new EventEmitter<Command>();
  @Output() delete = new EventEmitter<Command>();

  form = this.fb.group({
    id: null,
    type: '',
    displayedSections: '',
    marker: new FormControl('', this.markerValidator()),
    parameters: this.fb.group(defaultParameters)
  });

  types: CommandType[] = [{
    type: 'displayText',
    icon: 'text-box',
    text: 'Display text',
    header: 'green',
    parameters: ['waitForPlayer', 'text']
  }, {
    type: 'hideText',
    icon: 'text-box-remove',
    text: 'Hide text',
    header: 'green',
    parameters: ['waitForPlayer']
  }, {
    type: 'displayPicture',
    icon: 'image',
    text: 'Display picture',
    header: 'green',
    parameters: ['waitForPlayer', 'picture', 'fullscreen']
  }, {
    type: 'startScene',
    icon: 'movie-open',
    text: 'Start scene',
    header: 'red',
    parameters: ['sceneId']
  }];

  private propagateChange = _ => {};

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.types = this.types.sort((a, b) => a.text.localeCompare(b.text));
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(value => this.propagateChange(this.formatOutputValue(value)));
  }

  writeValue(value) {
    this.value = value;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
  }

  onMoveToStart() {
    this.moveToStart.emit(this.value);
  }

  onMoveToPosition() {

    const dialogRef = this.dialog.open(MoveCommandDialogComponent, {
      data: {index: this.index}
    });

    dialogRef.afterClosed().subscribe(result => this.moveToPosition.emit({
      command: this.value,
      index: result
    }));
  }

  onMoveToEnd() {
    this.moveToEnd.emit(this.value);
  }

  onDuplicate() {
    this.duplicate.emit(this.value);
  }

  onDelete() {
    this.delete.emit(this.value);
  }

  selectedType() {
    return this.types.find(type => this.form.getRawValue().type === type.type);
  }

  private formatOutputValue(value: Command): Command {

    const formattedValue = deepCopy(value);
    formattedValue.id = this.command.id;
    Object.keys(formattedValue.parameters).forEach(parameter =>
      this.selectedType().parameters.includes(parameter) || delete formattedValue.parameters[parameter]
    );

    return formattedValue;
  }

  get value() {
    return this.formatOutputValue(this.form.getRawValue());
  }

  set value(value) {
    this.form.setValue({...value, parameters: Object.assign(defaultParameters, value.parameters)});
    this.propagateChange(this.formatOutputValue(value));
  }

  private markerValidator() {
    return (control: FormControl) => {

      if (!this.usedMarkers) {
        return null;
      }

      let used = false;
      Object.keys(this.usedMarkers).forEach(id => {
        if (control?.value !== '' && control?.value === this.usedMarkers[id] && Number(id) !== this.command.id) {
          used = true;
        }
      });

      return used ? {marker: true} : null;
    };
  }
}
