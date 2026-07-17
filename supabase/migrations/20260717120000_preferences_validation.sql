-- Keep the auth trigger's initial, mostly empty preferences row valid and make
-- budget/date validation consistent for direct database/API writes.
alter table public.preferences
  drop constraint if exists valid_budget,
  drop constraint if exists preferences_valid_move_window,
  drop constraint if exists preferences_valid_move_from,
  drop constraint if exists preferences_valid_move_to;

alter table public.preferences
  add constraint valid_budget
    check (
      budget_min is null
      or budget_max is null
      or (budget_min >= 0 and budget_max >= 0 and budget_min <= budget_max)
    ) not valid,
  add constraint preferences_valid_move_window
    check (move_in_from is null or move_in_to is null or move_in_from <= move_in_to)
    not valid,
  add constraint preferences_valid_move_from
    check (move_in_from is null or move_in_from >= current_date)
    not valid,
  add constraint preferences_valid_move_to
    check (move_in_to is null or move_in_to >= current_date)
    not valid;
