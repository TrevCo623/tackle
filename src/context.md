# Tackle — Project Context

Nov 3, 2026 · @Trevor Connolly

## What this is

Tackle is a personal planning app that tells me what to tackle when, and above all what to tackle today. The weekly rhythm (themed days, a Monday plan, a Friday wrap) is the backbone. The daily "what now?" is the main feature. It also tracks to-dos, sends reminders, and has a calendar view.

The Today screen is the heart of the app: open it and today's work is laid out clearly by the day's theme, task status, and what's waiting on something. Tackle shows the options; I decide what to start with.

The core idea: **tasks live in a day's theme, not on a date.** "Website tweaks" belongs to Friday until it's done. No due date needed, and unfinished work rolls forward without guilt.

## The weekly plan

Five themed weekdays, weekends off on purpose.

| Day | Theme | Short label | Today header phrase | Theme icon | What happens |
| --- | --- | --- | --- | --- | --- |
| Mon | Plan & Set Up | Planning | planning the week | Clipboard with check | Weekly plan, setup, correspondence, finding work |
| Tue | Deep Work | Client | client work | Target | Heads-down project delivery |
| Wed | Deep Work | Client | client work | Target | Heads-down project delivery |
| Thu | Wrap Up | Wrap up | wrapping up | Double check | Client updates, close out client work |
| Fri | Website & Personal | Personal | website and personal projects | Sparkles | Website, writing, personal projects; the weekly Wrap flow |
| Sat–Sun | Off | — | resting | — | Blank on purpose |

**Monday planning prompts:** what's due, what does done look like, what are the steps, what's blocked, which day does it go on.

**The loop:** Monday makes the plan, Tuesday and Wednesday work through it, Thursday wraps up client work, Friday is for my own projects and closes the week.

## How it should feel

Not overly complicated. Quiet, rhythmic, and forgiving.

- **Quiet.** Paper-planner energy: off-white ground, ink text, lots of white space. No badges or red counts.
- **Weekends start blank.** Sat/Sun are Free by default, but anyone can give them a theme (side hustles, social plans). Free days stay blank on purpose.
- **Readable without color.** Day themes are told apart by icon, never by color alone (works for colorblind users).
- **Rhythmic.** The tool knows Monday is planning and Friday is the wrap, and nudges by rhythm instead of pinging constantly.
- **Forgiving.** Unfinished tasks roll forward with no "overdue" guilt. Weekends stay empty.
- **Celebratory at wrap-up.** The wrap builds confidence and makes progress visible before it asks for anything.
- **Confident, like a playbook.** Big, heavy display headers give it a coach's-binder confidence. Everything below the headers stays plain and quiet, so the weight reads as conviction rather than decoration. (Replaces the earlier "Credible, never playful" rule.)
- **Physical progress.** Changing status should feel like moving something forward by hand, not ticking a form field.
- **I'm in charge.** The app organizes and suggests; it doesn't tell me which task to start, and every suggestion is easy to override.
- **Confirmations in sheets.** Anything that asks "are you sure?" comes up as a bottom sheet, never inline in a list.

## Platform

| Decision | Detail |
| --- | --- |
| Name | Tackle |
| Platform | Phone-first PWA (installs to home screen, no app store, one codebase) |
| Data | Supabase (Postgres + Google sign-in). One row per user holds the whole plan; row-level security; a local copy keeps it working offline. Replaces the earlier "local-only to start" decision |
| Hosting | GitHub repo [TrevCo623/tackle](https://github.com/TrevCo623/tackle) on GitHub Pages. **App:** trevco623.github.io/tackle (sign-in, synced, installable). **Prototype:** trevco623.github.io/tackle/prototype (sample data, day switcher). Both build from one source. Claude pushes updates directly |

## Features and decisions

| Feature | Decision |
| --- | --- |
| Tasks | Belong to a day theme, not a date. Each task has a name, project (optional), day, status, repeat (one time / weekly), Waiting on, and Notes. **Adding is quick:** name, then Save. Project and Notes are optional, and the day is picked for you and shown as "Lands on Wednesday · Client Work" with a Change link that opens the day list. Status, repeat details and Waiting on live on the full Edit task page |
| Day themes | Each theme has its own line icon (no color): Plan & Set Up = clipboard with check, Client Work = target, Wrap Up = double check, Website & Personal = sparkles. Theme icons stand alone (no tile), which keeps them distinct from project icons (in tiles). Used on Week day headers, the Move sheet's day buttons, Wrap wins and the Wrap plan |
| Status | Three states: To do → In progress → Done. On Today, tapping the status circle opens a sheet with a three-stop slider (To do left, In progress middle, Done right). Each stop shows its icon above its label. The thumb is an ink block (icon over label) that I drag along the track or tap to a stop; it snaps and the sheet closes with "Moved to In progress / Done". Arrow keys also move it. In-progress tasks sort to the top |
| Hold (dependency) | Under the status slider, a text link "Put on hold for dependency" opens an inline form: Waiting on (text field), Cancel / Put on hold. Putting a task on hold moves it to "Waiting on something" on Today. When I come back to a held task (its link icon on Today opens the same sheet), the sheet shows an "On hold · Waiting on: …" card with a **Remove hold** button, which returns the task to Ready. The Edit task page's "Waiting on something" field edits the same value |
| Task rows (Today) | Status circle on the left, task name, then a meta line that starts with a small project icon (then In progress / Every week). A three-dot menu sits on the right: Move to another day, Edit task, Mark as done, Delete task. Tapping the name opens the Edit task page |
| Edit task page | Full page (not a sheet), matching Trev's Figma, top to bottom: "EDIT TASK" label; the task name as a big Gasoek title with a small "Change task name" link; **Project** dropdown; **Status** as the same three-stop slider as the status sheet (it only takes effect on Save); **Day** list of the five days with their themes; **Notes**; **Repeats**, a One-time / Recurring toggle ("Comes back every Monday." when it's on), which replaces the repeat button that used to sit on the day row; a centered "Put on hold for dependency" link that opens a Waiting on field (a task on hold shows an On hold card with Remove hold instead); then **Save**. Close (✕) leaves without saving. Delete lives in the ⋯ menu, not on this page. The New task page has the same Repeats toggle under Notes, and the cursor starts in the task name |
| Bottom sheets | Grabber handle centered at the top, title row (project tile + title, or back arrow + title), ✕ on the right |
| No suggested task | Tackle does not pick a "start here" task. Ready tasks are listed; I choose |
| Today header | "TODAY IS FOR [PHRASE]" in Gasoek One caps, with the date above in mono. No theme dot or description line |
| Day buttons on Today | Monday: "Make a plan for the week". Friday: "Wrap up the week" (opens the Wrap flow) |
| Projects | Optional. Each has a name and an icon (18 monochrome line icons), and no "type". It learns a usual day: new tasks go to the day you last put one of its tasks on, through a move, a drag, an edit or a Wrap day change. "This week only" moves don't count. A theme that spans days (Client, Tue–Wed) picks the lighter of those days, with ties going to the sooner day. New projects and tasks with no project go to Monday. **Projects** opens as a full page from Settings (back link "‹ Settings"), and as a bottom sheet from a task's project dropdown ("Manage projects"): each row shows "Usually Tuesday · 4 tasks". Tap a project to open it (a full page from Settings). There you rename it, change its icon, set **Tasks fall on**, or delete it. Tasks fall on uses the same day list as Edit task, with your themed days plus "Let Tackle decide" (word matching); moving one of its tasks still updates the day (a confirm sheet; its tasks keep their days and lose the project). New accounts start with no projects |
| Dependencies | A free-text "Waiting on" value, not linked to other tasks. Set from the status sheet's hold link or the Edit task page. Anything with a value sits in "Waiting on something" below "Ready" |
| Filters | Dropdown pills, not scrolling chips: "All projects" (plus "Every day" on All tasks and Progress). The pill turns dark when a filter is set, and shows the project icon. On Week it shares a row with Expand all. Used on Today, Week, All tasks and Progress |
| Moving tasks | From Week or Today, the three-dot menu opens a sheet with four equal options: Move to another day, Edit task, Mark as done, Delete task. Move opens a second step: back arrow, the title "MOVE “TASK”" in Gasoek caps, then five tall day buttons (theme icon, day name, short theme label in mono caps; the current day dashed, the picked day solid ink). The button reads "Pick a day" (disabled) until a different day is picked, then "Move to Tuesday". Recurring tasks then ask **Just this week** or **Every week**. A this-week-only move shows a dashed outline and "usually Mon" | **Tap and hold** a card on Week or on Wrap's plan page to pick it up, then drag it to another day or another spot in a day (the target day gets an outline, a line shows where it lands; holding near the top or bottom edge scrolls). On Week, a dragged recurring task moves for this week only; on the plan page, a carried task changes its day for next week and a recurring task changes its weekly day.
| Daily notification | Real web push: "What do you want to tackle today?" with "Today is for [theme]." Weekdays only, at a time you pick (15-minute steps, default 8:30am, in your time zone). In the Account sheet (your initial, top right of Today): a Daily nudge toggle; when it's on, a Time row appears. The toggle is per device; the time syncs. On iPhone it needs Tackle added to the Home Screen. Follows each person's rhythm: "Today is for [theme phrase]", and no nudge on Free days. Sent by a Supabase Edge Function (deployed as `quick-task`; code in supabase/functions/daily-nudge) that pg_cron runs every 15 minutes. Tested end to end on iPhone on Nov 3: it lands on the lock screen. Each nudge is a fresh alert; nudges don't replace each other. The time picker is the one deliberate exception to "no settings in v1" |
| Reminders | Tied to the rhythm (e.g. "Thursday: send client updates"), not lots of timed alarms |
| Calendar view | The Week screen: the same black summary card as Wrap at the top (it links to Progress; the project tally sits in two even columns) (tasks done, project tally, "Wrap it up on Friday for your Nth week in a row"), then a vertical list of Mon–Fri day sections, each headed by its theme icon. Each day is collapsible: tap the header to open or close it. Collapsed, it shows a summary ("3 open tasks · 1 waiting · 3 done", "All done" or "Nothing planned") just under the day name, with no project icons. Today opens by default. "Expand all / Collapse all" above the list. Summaries follow the active filter. Days already past fade to half strength, still readable but no longer active. The black card no longer says which day to wrap up |
| Wrap (the Wrap Up day, else Friday) | Runs on the first day themed **Wrap Up**; if no day has that theme, it runs on Friday (even when Friday is Free). The Wrap tile shows on Today only on that day, and the Weekly rhythm page says which day it is. | A three-step flow with a progress bar. A small "‹ Back" text link sits top left, above the progress bar (previous step; on step 1 it returns to Today), without pushing anything down. **1 This week:** black hero (count, project tally, streak), a plain list of completed tasks (project tile + name; nothing to pick), then the two reflect prompts: "What are you proud of this week?" and "What did you get better at?" **2 Next week:** every unfinished one-off task is assumed to move to next week, with a suggested day from its project's home day. Each row: task, then ✕, then a fixed-width day pill on the far right that I can change. The ✕ opens a bottom sheet: "REMOVE FROM NEXT WEEK?", the task (project tile + name), a note that it won't carry over, and Keep it / Remove. Removed tasks show in a list on the page with Undo. Plus "What should next week start with?" **3 Confirm:** next week laid out Mon–Fri (rows are the Week task cards with ⋯ menus; the label sits under the task name: "Carried over" on a dashed card, or "↻ Every week". Move from this ⋯ sets the day for next week; a recurring task moves every week), then "Close the week" |
| Weekly rhythm | Settings → Weekly rhythm. A short intro explains that each day gets a theme and that new tasks land on the day they fit. Below it, all 7 days in Week-style collapsible cards. Each card has a **Theme** button that opens a bottom sheet (not the browser's menu) listing Free, the library below and "Custom", each with an icon, name, one-line description and a check on the current one. Picking your own theme adds a name field and a **What goes on [day]** box. Picking a library theme fills the box with its starter description, which you can edit; your own theme starts blank. Sat/Sun start Free. Free days stay blank everywhere (Today says "Today is for resting" and points to the next themed day; Week lists them as "Sun · Free"), and they get no nudge. Changes save as you type. The Planning day gets the "Make a plan for the week" tile. The Wrap happens on the Wrap Up day, or on Friday if no day has that theme |
| Day picking | In order: (1) a project's learned usual day (a theme that spans several days picks the lighter one that hasn't passed); (2) **simple word matching**: the task name and project are matched against each themed day's name and description, and the best match wins (no AI yet); (3) the Planning day, or the first themed day. The "Lands on…" line updates live as you type the name |
| Progress | Tap the black card on Week ("See progress →") to open a full page ("‹ Week"). Eyebrow "Progress", headline the date range; the same black card; a donut (% of planned tasks done, thin stroke) with round keys for "N done" and "N still open" and "of N planned this week" beside it; **By project** (horizontal bars, gray track = planned, filled = done, "3/4"); **By day** (done only, a column per themed day, today's label bold); **Completed · N** (works like All tasks: day and project dropdowns, always done-only; cards with the repeat icon on recurring ones). No streak shown. Sections have generous spacing. "By day" uses the day a task sits on, not when it was checked off |
| Celebration | When everything on today is done (nothing ready, nothing waiting, at least one done), Today drops its "Today is for…" headline, filter and lists, and the tile sits right under the date in the headline's place: a Sage green tile with "Great job!" in the display face, "You tackled all your tasks today.", and white sparkles; the "N done today" link stays below. When every task this week is done, Week shows the same tile above the black card: "You tackled every task this week." It pops in with a small bounce the first time it appears. At the moment the last task of the day (or the week) is marked done, a short burst of confetti in the palette colors (about 1.5 seconds) comes out of the tile; it doesn't replay when you reopen an already-cleared day. No motion at all if reduced motion is on. |
| Leftovers check | Once a day, on a themed day, when the app opens to Today, Week or All tasks: if any one-off tasks are still open on a day that has passed this week, a bottom sheet asks where they should go. It lists every one, using the two-line rows from Today (project · day · status), and grows to fit (scrolling past 90% of the screen). Three choices: **Today** (moves them all to today), **Next week** (each goes to its project's usual day next week, otherwise Tackle's usual pick), **Let me choose** (a page listing each task with a day dropdown: today, the rest of this week, or any day next week; Save pill applies). Closing the sheet leaves them where they are; it won't ask again that day. Recurring tasks are left out. |
| Navigation | Bottom nav: **Today · Week · All tasks · Settings**. Wrap isn't a tab: it opens only from the black "Wrap up the week" tile on Today on Fridays, and no tab is highlighted while you're in it |
| Back and visual cleanup | Back is one round, icon-only button (40px, white, ‹). On All tasks, Settings and every sub-page the headline sits in a fixed spot: a 72px slot above it holds the back button (or stays empty), so headlines never jump; these pages have no eyebrow above the headline (All tasks: small label "All tasks" above, headline "N open tasks", counting what the filters show, Progress is titled "Your progress", Edit project keeps its small label inside the slot). Today and Week use the same fixed spot, with their date label sitting just above the headline inside the top space, so every main page lines up. Counts say "open tasks", not "open". New task and Edit task both have a "Scheduled for" box (theme icon, day · theme, and a round repeat toggle on the right; when on, the toggle fills black and the box reads "Every Wednesday · Deep Work"), with a "Change day" text link under it; tapping the box itself (anywhere but the repeat toggle) also opens the day list, and tapping the task title on Edit task starts renaming, same as "Change task name"; there is no separate Repeats control. The box sits on Edit task "Put on hold for dependency" is the last thing before Save; Pages you save (New task, Edit task, Edit project, Account) have the round back button top left (leaves without saving) and a black "Save" pill top right; the bottom Save button is still there. When a page has both header buttons and a small label (Edit task, New task, Edit project), the label gets the usual room below the buttons. Swiping left to right on any page with a back button goes back (ignored on sliders, text fields and while dragging). Edit task has no Status control (status changes from the status circle on the task row); Change opens the day list, and picking a day closes it back to the box. Only New task auto-picks the day as you type. The Move sheet ("Move to another day") uses the same vertical day list as the task and project pages (theme icon, day, theme), marking the task's current day and any day that would land next week. Status slider: the three labels never move; the pill slides behind them and the part of a label it covers turns light. The pill takes the status color: Ink for To do, the In progress ochre (#B07A1E) for In progress, Sage (#6E9274) for Done. Week's headline follows the week, first match wins: last weekday or weekend "You did great"; first weekday "Have a great week"; everything done "All done!"; 75%+ done "Almost done!"; 50%+ "You’re on a roll!"; anything in progress or done "Making progress"; otherwise "Start strong". Week's label reads "Monday Nov 2 – Friday Nov 6", and there is no "↻ = every week" legend; recurring tasks carry the small repeat icon. On day cards (Week and Weekly rhythm), the line under the day name starts where the day name starts, not under the icon. The Weekly rhythm page no longer states the Wrap day. The prototype has no control panel and follows the real day. The Settings tab icon is a line-art person (head and shoulders). Task rows on Today show project name · ↻ Every week · status under the title; waiting rows show project · "Waiting on …", cut off with … if long. Cards and tiles have no faint outline: the fill alone separates them. Dashed outlines (carried, Free, no project) and list dividers stay |
| All tasks | Every task in one list, sorted by day then status. Rows are the same as Today's (status circle, name, ⋯ menu), in one long list with no day groups: the Day filter does that. Under each name: project glyph and name · day (with ↻ for recurring, "Next Monday" for next week) · status (To do, In progress, Waiting, Done). Two filter rows: day (Every day, Mon–Fri, Next week) and project. Done tasks are hidden behind "Show N done" |
| Settings | The 4th tab (gear icon). One plain list of rows in the Projects row style (title, one line under it, chevron), with no section labels: **Weekly rhythm** (with the day-by-day stack) → rhythm page; **Projects** ("6 projects") → Projects page; **Notifications** ("Daily nudge on · 8:30am" / "Daily nudge off") → Notifications page; **Account** (your name) → Account page. Sign out sits at the bottom. Every row opens a full page with a "‹ Settings" back link |
| Notifications page | Full page: the Daily nudge toggle, then Time when it's on. The prototype's toggle works locally |
| Account page | Full page ("‹ Settings"). **Name** is editable and saved to your Supabase profile; it's used in "Good week, [first name]." **Email** is read-only and comes from Google. **Delete account** is a red outline button with a warning; it confirms in a bottom sheet ("Delete your account?" with Keep it / Delete), then erases the plan, projects, rhythm and push signups, removes the sign-in (Supabase `delete_my_account()` function), and signs out |
| Next week | A task placed on a day that has already passed this week (added, edited, moved or dragged there) goes to **next week**. Today still counts as this week; on the weekend every day counts as past. Next-week tasks stay off Today and Week (Week shows "N tasks set for next week" with a link to All tasks → Next week), show as "Next Monday" in All tasks, and appear on Wrap's plan page as "Added for next week". Closing or rolling the week makes them this week's. They're never in Wrap's carry-over list |
| Closing the week | Done one-offs clear, recurring tasks reset to To do, this-week-only moves go back home, carried tasks move to their chosen day, removed tasks are deleted, streak +1. A "Week closed" screen follows, with "See next week" |

## Screens so far

**Working prototype:** trevco623.github.io/tackle, also at [Tackle Prototype](https://claude.ai/artifact/HJ8d9Yc67CcS9NRHNaMAPb) in Claude. Phone-width web app with Today, Week, the Edit task page and the Wrap flow, a sample week, add/edit/move tasks, holds, project icons, a notification preview, and a day switcher. Data saves on the device it's opened on.

**Figma:** [Tackle — Screens](https://www.figma.com/design/c5IX7n2jeuLuCEiIFKtDzz). Top row: Daily notification · Mon, Today · Mon, Week, Week · Task menu, Week · Move to, Today · Status (slider + hold link), Today · Status · Add hold, Today · Status · On hold, **Edit task · Page** (Trev's full-page design), and the three Day + repeat explorations (Options A, B, C; C chosen). Second row: Wrap 1/3 This week (completed list + reflect prompts), 2/3 Next week, 3/3 Confirm, 2/3 Remove confirm (bottom sheet), 3/3 Drag (hold-to-drag state). Fourth row: New task · Quick add, Projects · Page, Edit project · Page. Fifth row: Progress, All tasks, Settings, Notifications · Page, Account · Page, Weekly rhythm, Weekly rhythm · Theme picker. Week now has the black card linking to Progress. Third row (real app): Sign in, Today · Account (sheet with Daily nudge and Sign out). Today now shows the account button (your initial, top right). App icon artboard. Plus a Styleguide (type ramp, day theme icons, project icons, accent palette) and Components (Chip with icon slot, Task row and Waiting row with project glyph and three-dot menu, Project icon set, Project tile, Theme icon set, Week card, Repeat button Off/On, Nav bar). Earlier versions are in the [Tackle design canvas](https://claude.ai/artifact/9A5CzW1KGQPxhWECsY9zeJ). Screens are joined by a bottom nav: Today · Week · All tasks · Settings (Nav bar component, variants Today/Week/All tasks/Settings/None; Wrap frames use None).

**Visual system:** Gasoek One in caps for headers, big numbers and some sheet titles. Archivo for all other text. JetBrains Mono for labels (10px minimum on phone). All set in the Figma "Tackle/" text styles. Day themes use icons, not color: open line icons with a 1.5 stroke (24 grid), 18px in headers and 26px in the Move sheet. **Accent palette (unassigned, kept for other uses):** Blue #5B7BA6, Ochre #B08A4F, Plum #9A6F84, Sage #6E9274. App icon: the TACKLE wordmark in Gasoek One, off-white on black (#1C1C1A). It replaced the four colored dots. Status: In progress amber #B07A1E (circle on Today rows), Done ink #1C1C1A; the slider thumb is always ink. Destructive actions: rust #A3402F. Project icons are monochrome line icons in tiles. Wrap hero is black #000000. Type history: Inter Tight → Instrument Sans → Libre Baskerville → Gasoek One + Archivo (playbook direction).

**Working rule:** every prototype change gets mirrored in Figma in the same pass.

## Theme library

The theme names use "&", not "+". Website & Personal, Day Job, Second Job, Family & Kids and Money were cut on Nov 4. Anyone already using one keeps it as their own theme, under the same name and description.

| Theme | Short label | Starter description |
| --- | --- | --- |
| Plan & Set Up | Planning | Plan the week, clear the inbox, schedule, send invoices, set up anything new. |
| Deep Work | Deep work | Heads-down, focused work: projects, deliverables, writing, building. Client or team calls and feedback rounds. |
| Wrap Up | Wrap up | Send updates, deliver files, close loops, tidy notes and folders before the week ends. |
| Meetings & Calls | Meetings | 1:1s, team meetings, check-ins, interviews and calls you can batch into one day. |
| Side Hustle | Side hustle | Orders, content, customer emails, product and marketing work for your side business. |
| Home & Admin | Home & admin | Bills, paperwork, forms, returns, appointments, cleaning, laundry, groceries, repairs, meal prep. |
| Social Life | Social | Dinners, birthdays, RSVPs, gifts, plans with friends, catching up with people. |
| Health & Fitness | Health | Workouts, doctor and dentist appointments, prescriptions, meal planning. |
| Learn & Create | Learn & create | Courses, reading, practice, classes, writing, music, art, photography, making things for you. |
| Rest & Reset | Reset | Light tasks only: tidy up, plan meals, get ready for the week ahead. |
| Custom | (your name) | Starts blank |
| Free | — | Day stays blank |

Merged on Nov 4: Work + Deep Focus → Deep Work; Admin & Errands + Home & Chores → Home & Admin; Learning + Creative Time → Learn & Create. Anyone on an old theme moves to the merged one. "Off" was renamed **Free**.

## Real app

- Sign-in: Google only, through Supabase Auth. Sign-in screen (Trev's design): black, with the TACKLE wordmark and "Tackle your tasks, one day at a time." centered above a white Continue with Google button. No settings screen; the Account sheet holds name/email, the Daily nudge toggle and time, and Sign out.
- Weeks roll over on their own: if Monday arrives without a Wrap, done one-off tasks clear, recurring tasks reset, and open work stays on its day. The streak resets.
- After "Close the week," Week shows the week ahead.
- New accounts start empty, with no projects.

## Prototype assumptions (not yet decided)

- Monday also holds setup, correspondence and finding work.
- Today and Week each keep their own filter.
- Week: today open, other days collapsed by default; choices reset when the day changes.
- Carry-over only applies to one-off tasks; recurring tasks come back on their own.
- The Edit task page saves with an explicit Save button (the Figma page has none yet); ✕ discards.
- Putting a task on hold keeps its status (an in-progress task stays in progress while waiting).
- Sheet titles: Trev's status sheet mock uses Archivo; the prototype currently uses Gasoek on all sheet titles.
- Plan this week is a prompt sheet that hands off to Week, not a full flow yet.
- Projects can be created but not yet renamed, re-iconed, re-homed or deleted.
- No custom filter builder.
- Body font Archivo was paired by Claude (Gasoek has a single weight).
- Move-sheet theme labels follow the current rhythm (Planning, Client, Client, Wrap up, Personal), not the labels in Trev's mock.
- Theme icons (clipboard, target, double check, sparkles) were picked by Claude.

## Open questions and next steps

- [x] How does Tackle pick what to tackle today? It doesn't: no suggested task.
- [x] Planning day: Monday. Wrap day: Friday.
- [x] Wrap breakdown: project tally with icons, not a bar chart.
- [x] Week layout: vertical list, collapsible days with summaries.
- [x] Where do unfinished tasks land? Everything moves to next week on a suggested day; I can change the day or remove it.
- [x] Project picker: a dropdown, under the task title on the Edit task page.
- [x] Status change: a three-stop slider, To do → In progress → Done.
- [x] Repeat: a One-time / Recurring toggle under Notes. It replaced the day-row button (Option C) on Nov 4.
- [x] Day themes: icons instead of colors.
- [x] Dependencies: "Put on hold for dependency" link in the status sheet; "Remove hold" when returning.
- [x] Remove-from-next-week confirmation: a bottom sheet, not inline.
- [x] Reordering: tap and hold a card to drag it (Week and Wrap plan page); ⋯ menu stays for the accessible path.
- [x] Day picking: learned per project from where you put tasks, not project types or AI. AI could later help with brand-new projects.
- [x] Each person sets their own weekly rhythm (Nov 4): themes for all 7 days, from the library or their own, with descriptions that drive day matching.
- [ ] Replace word matching with AI once there are enough real tasks to judge it.
- [x] The Wrap follows the rhythm: it runs on the Wrap Up day, or on Friday if there isn't one.
- [x] Wrap is three steps; no "proudest" pick. Completed tasks and reflect prompts share step 1.
- [ ] Sheet titles: Gasoek caps or Archivo?
- [ ] What should the freed accent colors (Blue, Ochre, Plum, Sage) be used for? Options: project colors (tile tint), Wrap celebration, status, or the app icon only.
- [ ] **Has the weekly rhythm changed?** Two of Trev's mocks used different themes. Edit page mock: Mon Plan & Setup, Tue Business work, Wed–Thu Client work, Fri Wrap up & Personal. Move sheet mock: Mon Planning, Tue Admin, Wed–Thu Client, Fri Wrap up. Current: Mon Plan & Set Up, Tue–Wed Client, Thu Wrap Up, Fri Website & Personal.
- [ ] Edit task page: Save button, or save automatically as you change things?
- [x] The status slider also sits on the Edit task page.
- [ ] Could the slider live right on the task row (swipe the row to advance it), skipping the sheet?
- [ ] Can you open the Wrap flow early (e.g. Thursday) if the week ends early? It's Friday-only right now.
- [ ] A real backlog ("Later") for tasks with no day yet? Next week covers only days that have already passed.
- [x] Daily notification: "What do you want to tackle today?" + "Today is for [theme]." at 8:30am on weekdays.
- [ ] Should a filter picked on Week carry over to Today, or should each screen keep its own?
- [ ] Custom filters: keep for v1, or ship with fixed project chips only?
- [ ] Project management: rename, change icon, change home day, archive
- [ ] Design the Monday planning flow screen
- [x] Decide platform: phone-first PWA, local-only data to start
- [x] Pick fonts: Gasoek One (display, caps) + Archivo (text) + JetBrains Mono (labels)
- [x] Build a clickable prototype to evaluate the app
- [x] Build approach: same single-file app plus Supabase (auth, data, cron + edge function), on GitHub Pages as a PWA.
