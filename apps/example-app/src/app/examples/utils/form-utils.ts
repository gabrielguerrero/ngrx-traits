/**
 * Helper function to reuse the form arrays controls so its state is not lost on renders which causes weird errors.
 * Rebuilds a form array depending of the values:
 * - Create the control if value id is not in the form array but is in the values.
 * - Do control.patchValue if the id exist in the form array and the values array.
 * - Delete if  id in the form array but not in the values array.
 * - Sorts the form array to match the values order.
 * @param options
 * @param options.form - target FormArray
 * @param options.buildRow - function to build the row controls when it doesnt exits, must have a control for the id
 * @param options.values - array of values where each element represents the value of each control in the form array
 * @param options.selectId function that return the identifier of each row, the id prop in the row controls should match
 * the id prop in the elements of the values array.
 */
import { AbstractControl, FormArray } from '@angular/forms';

export function rebuildFormArray<T>({
  form,
  buildRow,
  values,
  selectId,
}: {
  form: FormArray;
  buildRow: (value: T, index: number) => AbstractControl;
  values: T[];
  selectId: (value: T) => string;
}) {
  // sort controls in the same order as in values
  form.controls.sort((a, b) => {
    const aIndex = values.findIndex((v) => selectId(v) === selectId(a.value));
    const bIndex = values.findIndex((v) => selectId(v) === selectId(b.value));
    return aIndex - bIndex;
  });
  // delete any controls with ids not present in values
  const ids = values.map(selectId);
  for (let index = form.length - 1; index >= 0; index--) {
    const control = form.at(index);
    if (!ids.includes(selectId(control.value))) {
      form.removeAt(index);
    }
  }
  // update or create controls
  values.forEach((value, index) => {
    const control = form.at(index);
    if (control && selectId(control.value) === selectId(value)) {
      control.patchValue(value, { emitEvent: false });
    } else {
      const c = buildRow(value, index);
      form.insert(index, c);
    }
  });
}
