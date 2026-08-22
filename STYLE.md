# Writing for this app

How the words in this repo should read: scheme notes, the handbook, Checks
messages, `README.md`, `CLAUDE.md`, commit messages. Adapted from Isaac's
document style guide, which covers essays and briefs. The principle carries
over. The register does not.

**Principle: checkable beats clever.** The reader is standing in a garden, or
holding a shovel, or opening the repo a year from now. They need to see each
claim on its own and test it. Where a sentence has to choose between reading
well and being checkable, it is checkable.

## The worked rewrite

This is the calibration. Two paragraphs from the `s-sumps` notes, and Isaac's
rewrite of each.

### Pair 1

Before, 110 words, sentences averaging 37:

> The drainage as elements. Every pit that was a dot on the line is a Yard sump
> you can select, move and check: S0, S1, S2 and S3 down the DN150 spine in the
> side strip, D1 on its branch, P0 at the foot of the corner swale, P1 at the
> head of the sleeve under the garage, and P3 at the driveway. Same positions
> the drainage design has always had, all eight sit clear of every protection
> zone and every structural root zone, which is not luck, it is what the routes
> were chosen for, and it is the thing to preserve if the builder wants one
> moved.

After, 63 words, sentences averaging 12:

> **Drainage**
> - All drainage components are now elements. The stormwater spines show the
>   yard sumps as selectable elements, not dots.
> - Positions are unchanged. S0 to S3 run down the DN150 spine, D1 sits on its
>   branch, and P0, P1 and P3 sit at the corner swale, the garage sleeve and
>   the driveway.
> - All eight are clear of every protection zone and structural root zone.
>   Keep them clear if one is moved.

The first draft of this one cut to 38 words and went too far. Three things had
no other home: the eight pit IDs, which are in `DRAIN.pits` and rendered
nowhere; the structural root zones, which are the stricter test; and the
instruction to keep a moved sump clear. See **Check before you cut** below.

### Pair 2

Before, 151 words, sentences averaging 38:

> What the Checks screen now asks of each one. Whether it reaches a line,
> because a sump that falls to nothing is a hole that fills up, move it more
> than 2 m off every pipe and it says so. Whether it is one of the two taking
> runoff off the reserve, P0 and P1, which need a silt trap: a sump below the
> outlet with a removable grate, because that water arrives orange and heavily
> silted and shovelling sand out of a box once a year beats clearing it out of
> the pipe under the garage slab. And it treats the overland flow corridor the
> opposite way round for a sump than for anything else, a pit draining that
> corridor belongs there, so long as its lid sits flush, because a raised
> surround is a weir across the route the block needs if the reserve bank lets
> go.

After, 26 words:

> **Checks**
> - Does the yard sump attach to a line?
> - Does it require a silt trap?
> - Unlike other earthworks, sumps are allowed in the overland flow corridor

## What the rewrite demonstrates

1. **A list is a list.** Pair 2 was three parallel items wearing paragraph
   clothing. The tell is prose that starts successive clauses with "Whether",
   "Whether", "And". Set it as bullets and the parallel structure does the work
   the sentences were straining to do.
2. **Cut the reason, keep the fact.** Every "because" in pair 2 went. The
   reasoning belongs in the handbook, where someone has come to understand the
   design, or in the Checks message itself, which the reader is about to see.
   A scheme note saying what the app checks does not also argue for it.
3. **Don't recite what the plan shows.** The sump IDs and their positions came
   out. They are on the drawing, labelled, two inches from the note.
4. **Delete the tic, don't rephrase it.** "which is not luck, it is what the
   routes were chosen for" has no replacement in the rewrite. It was doing no
   work.
5. **Delete the flourish too.** "a hole that fills up", "a raised surround is a
   weir", "arrives orange and heavily silted". All gone, nothing put in their
   place.
6. **Fragment headings become sentences or headings.** "The drainage as
   elements." became "All drainage components are now elements." "What the
   Checks screen now asks of each one." became the heading **Checks**.
7. **Check before you cut.** A fact can go if the reader will meet it anyway.
   Everything pair 2 dropped is in the Checks messages: the 2 m threshold,
   which sumps need a silt trap, the trap spec, and the flush lid. Search for
   it before deleting it. If it lives nowhere else, it stays.
8. **Plain and slightly flat is right.** "The positions are the same as
   previously" is duller than "Same positions the drainage design has always
   had" and better. The note is a record, not a performance.

## Targets

- **Cut half to two thirds.** The worked pair went from 261 words to 89.
  Pair 2, where the app carries the detail, went further: 151 to 26.
- **Sentences average about 10 words.** One fact per sentence. If a sentence
  needs a comma splice or a "which", it is two sentences.
- **Em and en dashes: zero in prose.** Comma, colon, full stop, brackets. The one
  exception is a numeric or date range inside a table cell, where `20–40 mm` and
  `Jan–Mar` are typography rather than rhetoric. A dash in a sentence is never that.
- **A label is not a sentence.** Where a Checks title or a legend joins a name to a
  figure, the app uses a middle dot: `Yard sump · ground 610.20 m`. Same for an
  empty table cell. That is the separator this repo already used in scheme names.
- **Bullets wherever the content is a list.** Questions the app asks, things
  that changed, what is left to decide. Prose is for the one idea that needs a
  paragraph.

## Rules

1. Say the thing, then stop. Do not say it again in a better-sounding way.
2. No line built to land. If a sentence would work as a pull quote, cut it.
3. No "not X, it is Y".
4. No headings that announce a move. Name the subject, in normal case. Never
   in capitals.
5. One fact, one place. If the app computes a number, name it once and say the
   app is what to trust.
6. Every number says where it comes from: survey, geotechnical report, tree
   plan, or computed by the app.
7. Assert or drop. One hedge, plainly, or none. If it is unknown, say so and
   say what to measure.
8. Contractions in. Plain words.
9. One form per term. `Yard sump`, not "sump" then "pit".
10. UK/Australian spelling.

## Register, by surface

- **Scheme notes.** To the owner, reading on an iPad beside the plan. What it
  is for, what changed, what is left to decide. Bullets for all three. The
  owner writes in the same box, so no house voice to match.
- **Handbook.** Read in the garden with a decision to make. This is where
  reasons belong. Lead with the instruction, then the reason.
- **Checks messages.** One line on what is wrong, one on what to do. No
  metaphor. Read while something is being moved.
- **README and CLAUDE.md.** To whoever opens the repo next. Say what breaks if
  they get it wrong.
- **Commit messages.** What changed and why. Not a retelling of the session.

## Checking a draft

Word count against the original, average sentence length, dash count. All
countable. Run them before calling a rewrite done.
