/* The reference half of the app: everything the landscape handbook holds that
   the plan, the checks and the stages do not compute for themselves.

   Blocks are [kind, value] pairs, rendered generically by the reference screen
   in index.html:
     p    paragraph
     h    sub-heading
     note paragraph set apart: the thing to remember from what precedes it
     ul   bullets
     kv   two-column table of label and value
     tbl  table, first row is the header

   Figures here come from the documents listed under Site → Sources. Where a
   number is also computed by the app, the app is what to trust: the plan works
   from the survey, this is what the survey was read to mean. */
window.HANDBOOK = [

/* ---------------------------------------------------------------- site --- */
{id:'site', group:'site', nav:'The site', title:'The site', sub:'Levels, soil, and why it is a Class P site', blocks:[
  ['kv',[
    ['Block area','807 m², 40.0 m deep by 21.3 m wide'],
    ['Orientation','Duffy Street north-north-west, reserve south-south-east'],
    ['Fall, rear boundary to street','2.08 m, average 1 in 19'],
    ['Cross-fall','about 1 in 132, effectively flat'],
    ['Ground levels','610.15 m at the front boundary to 612.26 m at the rear'],
    ['Floor level, house and addition','611.65 m (sunken lounge 611.07 m)'],
    ['Site classification','Class P, characteristic movement 20–40 mm'],
    ['Design rainfall, 5 min, 1 in 10 yr','122 mm/h'],
    ['Design rainfall, 5 min, 1 in 100 yr','189 mm/h'],
    ['Protected trees','5 assessed, plus reserve trees near the rear fence']
  ]],
  ['p','The side boundary at the vegetable strip faces east-north-east and takes the morning sun. The boundary at the garage and firepit end faces west-south-west and takes the afternoon and evening sun. Water moves in one direction across the block: off the reserve, through the back garden, past the house, to Duffy Street.'],

  ['h','Soil'],
  ['p','Two push-tube holes on 10 February 2026 found different profiles.'],
  ['tbl',[
    ['Depth','Back garden','Beside the house'],
    ['0 – 0.1 m','Silty sand topsoil, loose','Silty sand topsoil, loose'],
    ['0.1 – 0.4 m','Gravelly clayey sand, low plasticity, dry, medium dense to dense, to 0.7 m','Clayey sand, low plasticity, moist, loose to medium dense'],
    ['0.4 – 0.8 m','','Sandy clay, medium to high plasticity, very stiff'],
    ['0.7 – 1.1 m','Clayey sand, low to medium plasticity, dry, dense','Gravelly sandy clay, medium to high plasticity, very stiff to hard']
  ],[0.8,1.4,1.4]],
  ['p','Plasticity is the measure of how much a soil swells and shrinks as it wets and dries. Low plasticity sand barely moves; medium to high plasticity clay moves enough to lift and drop a footing. No groundwater was found and the soils were mostly dry, but temporary seepage can sit on the denser soil after rain.'],
  ['note','The arrangement is favourable. Free-draining sand where you will plant and dig by hand; reactive clay under and beside the house where you are not gardening. Soakage and infiltration work in the back garden, the ground there is erodible and needs cover, and moisture control matters most within a few metres of the walls. Two holes is limited evidence and the transition between them will not be sharp.'],

  ['h','Class P, and what it constrains'],
  ['p','The site is Class P under AS 2870 for one reason, ticked on the report’s own checklist: trees within the zone of influence of the building footprint. Bearing capacity is adequate and there is no fill or landslip. Characteristic ground surface movement is 20 to 40 mm, equivalent to Class M, and that figure already includes the drying effect of the trees.'],
  ['note','Keeping the pear is the sounder choice structurally. Trees near footings draw moisture from the soil. Remove one and the soil beneath slowly takes up water again and swells. Tree 2 stands about 4 m from the rear addition, and the engineer\u2019s assessment assumes it stays. Removing it later would risk the ground lifting under the new slab. Retaining it keeps the assessment valid. So the pear has to come through the build in reasonable health. Root pruning held to the approved minimum, arborist supervision as the plan requires, and the mulching and watering actually done.'],

  ['h','What the engineer has designed around it'],
  ['p','The structural drawings are issued for construction and carry the Class P classification through. Worth knowing, because several of them set limits on what the landscaping can do near the house.'],
  ['kv',[
    ['Slab','raft, 100 mm, SL82 top mesh, 32 MPa (changed from waffle)'],
    ['Piers','1 m into natural ground, maximum 2.2 m centres under load-bearing beams and pads'],
    ['Edge beams','EB-1, 550 by 300, founded 400 mm minimum below natural ground'],
    ['Allowable bearing pressure','100 kPa, footings to undisturbed ground below the root zone'],
    ['Retained edge','section F on sheet 05: reinforced block or double brick with a 100 mm agricultural pipe at its base'],
    ['Excavation near footings','note F6: no deeper than a 30 degree line from the footing edge, 45 degrees in clay'],
    ['Permanent excavation','note F8: deeper than 600 mm must be retained or battered']
  ]],
  ['p','The engineer makes the long-term maintenance your obligation, in writing. Note SV3 requires site management and maintenance in accordance with AS 2870 Appendix B, and refers explicitly to the CSIRO homeowner\u2019s guide. So the paved apron, the graduated planting and the restraint on irrigation near the walls are not just prudent. They are the stated condition on which the footing design rests.'],
  ['note','There is no stormwater or hydraulic design in the structural set, so the drainage in this app is the only design for it.'],
  ['ul',[
    'Cut deeper than 0.5 m or fill thicker than 0.4 m triggers a reassessment of the classification. The design stays inside this. The firepit is a 450 mm cut. The firepit terrace balances cut and fill within the free pocket. The rear swale is formed within 100 mm of mulch.',
    'Trees, gardens, landscaping and ponds can all induce abnormal soil moisture conditions near the perimeter of the structure. This governs where beds and watering go, which the planting section covers.'
  ]]
]},

/* --------------------------------------------------------------- shape --- */
{id:'shape', group:'site', nav:'The shape of it', title:'The shape of the ground', sub:'The block as a solid, before and after', blocks:[
  ['p','A plan gives the levels and a section gives one line through them. Neither shows the shape, and the shape is what gets argued about on site: how much this actually falls, where the hump is, what the cut looks like once it is open. So here is the block as a solid of earth, the ground the surveyor measured beside the ground this scheme leaves behind.'],
  ['iso',''],
  ['p','It is drawn off the working layout, so it answers for the scheme open now rather than for a fixed design. Move a terrace and it redraws.'],
  ['note','Height is stretched four times. The block falls 1.99 m over 40 m on the surveyor\u2019s surface, which at true scale is a flat sheet of paper. Lengths in plan are true, so nothing measured across the drawing is exaggerated. Only height is.'],
  ['p','The two halves come off the same numbers as the Levels sheet under Works. A surface that grades finishes on its own string line, anything with build-up declared finishes that much above what it sits on, and everything else stays as the surveyor found it. Where the two disagree, the Levels sheet is the one to hand a builder, because it carries the chainages and the string line and this does not.'],
  ['note','Nothing here is setting-out. It is the same surveyed surface as the rest of the app: exact where the levels were taken and interpolated between them.']
]},

/* ----------------------------------------------------------------- sun --- */
{id:'sun', group:'site', nav:'Sun', title:'Sun', sub:'Where the light is, season by season', blocks:[
  ['p','Direct sunlight was modelled across the block at quarter-hour intervals. It uses the solar geometry for this latitude and the surveyed heights of every building and tree. That includes both neighbouring houses, from the ridge and eave levels recorded on their roofs, and the three boundary fences at an assumed 1.8 m. The gum is treated as a permanently open canopy. The four deciduous trees each carry their own leaf window, set out below. It is the same model the Sun view on the plan runs. Southern hemisphere throughout, so the sun sits due north at midday, 78\u00b0 up on 21 December and 31\u00b0 on 21 June.'],
  ['tbl',[
    ['Area','Summer','Equinox','Winter'],
    ['Rear pocket and firepit','7.0 h','6.7 h','4.0 h'],
    ['Side strip, east-north-east · vegetables and fruit','8.3 h','6.5 h','3.9 h'],
    ['Paved terrace against the house','10.9 h','4.1 h','0.0 h'],
    ['Under trees 1 and 2','3.8 h','3.0 h','1.8 h'],
    ['Courtyard, once the maple goes','5.7 h','2.9 h','0.1 h'],
    ['Courtyard, while the maple is alive','1.6 h','0.7 h','0.0 h'],
    ['Back garden, average','5.8 h','4.3 h','2.2 h'],
    ['Front garden, average','4.5 h','3.4 h','2.0 h']
  ],[2.2,1,1,1]],
  ['note','Three sampled days cannot show a deciduous garden. 21 December and 21 June fall in the middle of the leafy and the bare halves of the year. The September equinox lands while three of the four canopies are still coming on. What the columns miss is April, May and October, which is where the difference between these trees actually lives. So read the windows below alongside the table, and scrub the day slider on the Sun view for anything in between.'],

  ['h','When each canopy is actually there'],
  ['p','Trees 2, 3, 4 and 5 are all deciduous, and not on the same dates. Tree 2 is an ornamental pear, which in this climate breaks bud in the last week of August and holds its leaves until well into May. Tree 3 runs on the ash window, a month behind it at both ends. Trees 4 and 5 are the street shade trees, earliest to drop and last to fill out. The dates are horticultural for Canberra rather than surveyed. The model ramps between them rather than switching, because a tree leafing out shades progressively over a few weeks.'],
  ['tbl',[
    ['Tree','Buds break','Full canopy','Starts thinning','Bare'],
    ['2 · ornamental pear','1 September','1 October','1 May','5 June'],
    ['3 · ash','1 October','5 November','5 May','10 June'],
    ['4 and 5 · street shade trees','25 September','25 October','20 April','25 May'],
    ['1 · brittle gum','evergreen','·','·','·']
  ],[1.5,1,1,1,1]],
  ['p','Read as shade cast, meaning how much light the canopy stops, that gives the year below. The gum sits at a flat 45% because it is evergreen and open-crowned.'],
  ['tbl',[
    ['Tree','Jan–Mar','Apr','May','Jun–Aug','Sep','Oct','Nov–Dec'],
    ['2 · ornamental pear','85%','85%','62%','28%','55%','85%','85%'],
    ['3 · ash','85%','85%','69%','28%','28%','51%','85%'],
    ['4 and 5 · street shade trees','85%','85%','44%','28%','28%','66%','85%'],
    ['1 · brittle gum','45%','45%','45%','45%','45%','45%','45%']
  ],[1.6,1,0.7,0.7,1,0.7,0.7,1]],
  ['note','Full shade runs from about November to March, which is the rule of thumb to plant by. It is wrong at both ends, and in opposite directions. April is a full-canopy month here, because autumn colour and leaf drop are a May event in Canberra rather than a March one. So anything counting on autumn sun gets it in May, not before. And the pear is a month early in spring. It is dense from the start of October, over the whole of the ground where the back garden\u2019s spring growth happens.'],

  ['h','What the numbers mean'],
  ['ul',[
    'The rear pocket is the most consistently sunny part of the back garden, at 7.0, 6.7 and 4.0 hours. It sits furthest from the two-storey neighbour. It is the best winter position on the block. Its sun is strongly afternoon-weighted, five hours after noon in summer against two before, which suits the firepit.',
    'The east-north-east side strip is the best summer growing ground at 8.3 hours, still workable at 3.9 in midwinter. It is reasonably even through the day: about four hours either side of noon in summer. It tilts to the afternoon in cooler months, because the two-storey neighbour takes some of the morning. This is where the productive garden belongs.',
    'The paved terrace is a summer space only. 10.9 hours in December, 4.1 at the equinox, effectively none in June.',
    'Under the two trees is genuinely shaded at 1.8 to 3.8 hours, so dry-shade planting belongs there and turf will not hold.',
    'The front garden is the shadier half, because of the liquidambar and the two street ashes in 142 m\u00b2. It averages 4.5 hours in summer against 2.0 in winter. Its seasons run backwards from what a fruit tree wants. The canopies are densest from October to April, which is the whole growing season. They open from May to September, when there is least sun to let through. Sun-loving structural plants need the open gaps between canopies, and anything grown for a crop needs a gap rather than a thinner patch of shade.',
    'The two-storey neighbour and the fences matter. Together they cost between one and three hours a day. That neighbour has an eave 5.6 m and a ridge 7.1 m above the ground beside it. It blocks a good deal of morning sun along that side.'
  ]],
  ['note','Fence height is the main assumption left. The survey does not record it. At 1.8 m the fences cost the side strip about an hour a day, and each additional 300 mm costs roughly another half hour in summer. Worth measuring.'],
  ['note','Tree 3 is recorded as a liquidambar in the survey and is run here on the ash window. In this climate the two are within a week of each other at both ends, so nothing in the table moves either way. The windows are separate rows in the site data, so if the tree turns out to be one or the other, only that row changes.']
]},

/* --------------------------------------------------------------- water --- */
{id:'water', group:'site', nav:'How water moves', title:'How water moves', sub:'Roof, reserve and subsurface flows', blocks:[
  ['p','Three separate flows behave differently and need different handling.'],

  ['h','Roof water'],
  ['p','About 242 m² of roof once the addition and garage are up. Predictable and concentrated, and it does damage when a downpipe discharges at ground level and puts a large volume into a small patch of soil beside a footing. Every downpipe positively connected to the piped system. The piped design covers it with a large margin: the two lines run at 12 and 20 per cent of capacity in the design storm.'],
  ['note','The garage roof is the one to watch. The existing house gutters discharge onto it, so it carries a combined catchment rather than its own 44.9 m\u00b2. That is between 75 and 95 m\u00b2, depending on how much of the house drains that way. At the standard used for sizing gutters, that is 3.0 to 3.7 litres a second. At roughly 47 m\u00b2 per 90 mm downpipe, that needs two downpipes and possibly three. It sits against the courtyard on one side and 123 mm off the boundary on the other. So confirm which way it falls, where the gutter runs, how many downpipes there are, and where they discharge. None into the courtyard, all positively connected. With the house feeding it, a single blocked gutter backs up a large volume, and the overflow has to go somewhere.'],

  ['h','Surface flow from the reserve'],
  ['p','The walking path outside the rear fence runs along a raised, man-made formation. The ground on the uphill side sits lower than the path crest, so the path works as a bank across the slope. Photographed in a February storm, the crest stands above the ground either side and holds water rather than shedding it. The runoff coming off it is orange and heavily silted, which is what arrives in anything that catches it.'],
  ['p','The raised bank does the heavy lifting. Water off the hillside collects on its uphill side and cannot cross, so it ponds and runs along the bank rather than reaching the fence. That is very likely why nobody along this row is being flooded. It also means the ground actually draining onto the fence is only the strip between the bank and the boundary, plus the bank\u2019s downhill face. A small area.'],
  ['tbl',[
    ['Width of the strip between bank and fence','Area','1 in 10 yr','1 in 100 yr'],
    ['5 m','106 m²','1.4 L/s','2.2 L/s'],
    ['10 m','213 m²','2.9 L/s','4.5 L/s'],
    ['15 m','320 m²','4.3 L/s','6.7 L/s'],
    ['25 m','532 m²','7.2 L/s','11.2 L/s']
  ],[2,1,1,1]],
  ['p','Against a corner swale carrying 294 litres a second, those are trivial. In everyday rain the drainage is heavily over-provisioned, which is no bad thing.'],
  ['note','The bank changes the shape of the risk rather than removing it. Almost nothing arrives most of the time. Then a large volume could arrive quickly, if the bank overtops at a low point or a section gives way. What is released is limited by how much water was ponded, not by rainfall. Ponding 50 m long, 15 m wide and 300 mm deep is roughly 110 cubic metres. That is about 170 litres a second over ten minutes, and more than 300 over five.'],
  ['p','This is why the overland flow path along the side boundary must stay open, continuous and unobstructed to the street. It carries 236 litres a second, and it is the thing that would handle a release of that kind. Nothing gets built across it. No shed, no raised bed, no fence, no stack of pavers.'],
  ['p','Two further points. The runoff on the path is orange and heavily silted, so anything catching water here catches sand and fine sediment too. That is the argument for a silt sump you can shovel out. And the bank is almost certainly an ACT asset rather than yours. Report erosion, a dip forming or a rill through it through Fix My Street rather than repairing it yourself, and do not assume it will be maintained forever.'],

  ['h','Water travelling sideways inside the soil'],
  ['p','The back garden is loose gravelly sand from about 0.1 m down over much denser material. In sustained rain, water soaks through the sand, cannot pass the dense layer, and turns sideways downhill inside the soil. The geotechnical report calls this perched seepage, which is the term to use if you are asking the engineer about it.'],
  ['p','Two consequences. A surface diversion alone will not protect the rear addition, because part of the flow passes beneath it, so a subsoil drain is needed as well. And a gravel-backfilled pipe trench running downhill beside the house becomes a drain in its own right. The CSIRO guidance is explicit that trenches containing pipes become watercourses even when backfilled.']
]},

/* --------------------------------------------------------------- trees --- */
{id:'trees', group:'site', nav:'Trees and approvals', title:'Trees and approvals', sub:'What the tree plan permits inside a protection zone', blocks:[
  ['p','Five protected trees were assessed. Hand excavation around the pear is approved and under way with the arborist\u2019s sign-off. So it is worth setting out precisely what a protection zone allows. The general notes on the tree protection drawing read more restrictively than the clauses behind them.'],
  ['tbl',[
    ['Activity','What the plan requires','Clause'],
    ['Excavation generally','Anything deeper than 50 mm counts as excavation. Only excavations shown on the approved plan are permitted, and the method must be hand digging, hydro-excavation or under-boring','6.2.1, 6.2.2, 6.2.4'],
    ['Root limits','No root over 30 mm diameter may be cut. A non-destructive locating trench must be dug along the line of excavation nearest the tree before any site cut','6.2.7, 6.3.3'],
    ['Supervision','All groundwork in trees 1 and 2’s zones under a qualified arborist, AQF Cert V or above','6.3.2'],
    ['Services','Through a zone only by hydro or hand excavation, or bored beneath at a minimum depth of 1,000 mm. No additional services through a zone unless specified in the plan','6.5.1, 6.5.2'],
    ['Landscaping','All landscaping inside a zone under arborist supervision. Paths and garden beds must be built above existing grade with no excavation and no compaction. Planting holes hand-dug','6.6.2, 6.6.3, 6.6.4'],
    ['Trafficable surfaces','Ground protection: rumble boards over 200 mm of 25 mm coarse woodchip, cellular geotextile, or rated protection mats','5.10.3']
  ],[1,2.6,0.7]],
  ['ul',[
    'The apron and subsoil drain at the addition\u2019s uphill wall are achievable now, by the same method, tree and supervision as the footing excavation already approved. They need adding to the approved scope. They belong in the builder\u2019s works rather than the later landscaping, because they are building perimeter drainage. The apron cut of about 410 mm also stays under the 500 mm that would trigger a site reclassification.',
    'The no-dig approach to paving is mandatory, not just prudent. Clause 6.6.3 is explicit: above existing grade, no excavation, no compaction.',
    'A new drainage line through the pear\u2019s zone would need the plan amended. Clause 6.5.2 rules out additional services through a zone unless specified. That is why the sleeves cast into the garage slab are the recommended route out of the back garden. No tree approval, no supervision, and no risk of meeting a root you are not allowed to cut halfway along a trench. A hand-excavated or bored line through the zone is the fallback, with the plan amended first.'
  ]],
  ['note','One inconsistency to raise with the arborist. The general notes on the tree protection drawing give a minimum bored depth of 700 mm for services. Clause 6.5.1 says 1,000 mm. Use the stricter figure unless he confirms otherwise. It matters for the stormwater outlet across the street tree\u2019s zone. Boring at either depth would put the invert below the kerb, so that crossing has to be hand or hydro excavated, which 6.5.1 expressly allows.'],
  ['p','Also worth checking: mature eucalypts stand within a few metres of the rear fence, on reserve land. If they are protected public trees, their protection zones extend across the rear boundary and constrain digging there, including the corner swale.']
]},

/* ------------------------------------------------------------- sources --- */
{id:'docs', group:'site', nav:'Sources', title:'Sources', sub:'The documents everything here is built from', blocks:[
  ['tbl',[
    ['Document','What it gives'],
    ['Brian Milburn & Associates contour and detail survey, job 3891_ZB, 1:200, AHD datum, contour interval 0.25 m, surveyed 11 March 2025','Boundaries, levels, contours, tree canopies, building outlines, ridge and eave levels including the neighbours'],
    ['Enfold Architecture drawings, rev E, 28 July 2026','Proposed footprints, floor levels, elevations, floor plan showing the courtyard, gates and strip drains'],
    ['Tree Department tree management plan, job 251027, 13 March 2026, drawing TPP-01','Protected tree schedule, protection and root zone radii, the clauses governing excavation, services and landscaping'],
    ['Fortify Geotech site classification, C17211 rev 02, 9 March 2026','Class P classification, borehole logs, characteristic ground movement, drainage and foundation maintenance guidance'],
    ['Europa Constructions structural drawings, project 1252.4, sheets S01 to S05, issued for construction rev 1, 9 June 2026, engineer Fredrick Mbogo','Slab and footing design, the retained edge with its subsoil drain, excavation limits near footings, and the owner’s maintenance obligation. Contains no stormwater or hydraulic design'],
    ['Powerhaus Engineering performance solution compliance report, 4 August 2026','Thermal performance compliance under NCC 2022 H6P1. No drainage content; references floor edge insulation provisions, which interact with the apron detail where the slab edge is exposed'],
    ['Bureau of Meteorology 2016 design rainfall, grid cell 35.2625°S 149.1375°E','Design rainfall intensities used for all the drainage calculations'],
    ['CSIRO, Foundation Maintenance and Footing Performance, 2024','The paved apron, garden layout, irrigation and pipe trench guidance the geotechnical report refers to'],
    ['ACT Urban Forest Act 2023 and City Services tree protection guidance','Protected tree thresholds, protection zone definition, approval requirements'],
    ['Site photographs, April 2025, September 2025 and August 2026','The reserve strip, the raised path formation, and runoff behaviour in rain']
  ],[1.5,1.15]],
  ['p','The block’s position, 35.25622°S 149.15585°E, is derived from the borehole coordinates in the geotechnical report, converted from MGA zone 55. It is used for the solar calculations and the design rainfall lookup.'],
  ['note','Levels are the surveyor\u2019s own surface, not a model fitted to it. The CAD file carries their triangulation: 126 measured ground points and the faces between them. That is what the app reads. It is exact at every surveyed point. Between them it is within 5 mm of their surface, which is the cost of storing levels to the centimetre the survey quotes. Past the last measured point an older fitted surface still answers. None of this is set-out. That comes off the survey plan, datum A.H.D., origin SR585 at RL 608.442. The plan records that no underground services have been located.']
]},

/* ---------------------------------------------------------- earthworks --- */
{id:'earthworks', group:'works', nav:'Earthworks', title:'Earthworks and levels', sub:'What can be dug, what cannot, and to what depth', blocks:[
  ['p','This is the first thing the garden needs from anyone with a machine. It is built from whatever is on the plan right now. The same two sheets print from the button at the bottom. Hand those over and keep the rest of the set.'],
  ['earth','']
]},

/* --------------------------------------------------------------- levels --- */
{id:'levels', group:'works', nav:'Levels', title:'Levels', sub:'What the ground finishes at, and what the machine takes to get there', blocks:[
  ['p','This is the sheet to hand a builder who asks for the levels. Earthworks says what may be dug; this says what each surface finishes at, as one string line with a level at each end.'],
  ['note','Most of the block carries no set-out level. That is the answer rather than a gap. Inside a tree protection zone the finished surface is the existing surface. Hand or hydro digging only, in the approved scope, and 100 mm of coarse woodchip at most. Those rows print as found.'],
  ['levels','']
]},

/* ------------------------------------------------------------ drainage --- */
{id:'drainage', group:'works', nav:'Drainage', title:'Drainage design', sub:'The two lines, the numbers, and the route out', blocks:[
  ['p','The block falls 2.08 m from the rear boundary to the street, about 1 in 19, so there is ample fall. The constraint is elsewhere. The back garden is ringed by the protection zones of trees 1 and 2, where no trenching is allowed. The addition, link and garage together enclose the rear pocket. There is no buried route from the back garden to the street that avoids both a protection zone and a building.'],

  ['h','The route out is the garage'],
  ['p','Two DN100 sleeves cast under the garage slab run to the driveway, one from the rear pocket and one from the enclosed courtyard. Both are clear of every protection zone, and neither passes under the link. From there they reach the kerb through the existing crossover at the north-east corner, the only part of the verge outside the street trees\u2019 zones. Invert 610.01 at the boundary against the nearest surveyed kerb at 609.81, a fall of about 1 in 52 across the verge, so it works by gravity. Both cost very little while the slab is being formed, and become a serious problem afterwards.'],
  ['note','The subsoil drain behind the retained edge needs an outlet, and none is shown. The engineer’s 100 mm agricultural pipe collects the water moving sideways through the soil above the addition. If it is not piped away it simply discharges into the ground beside the footings, which is the problem it was meant to solve. It has to be connected, and the sleeve under the garage slab is the only route clear of the tree protection zones. Add it to the same trench.'],

  ['h','The side strip does the rest'],
  ['p','A DN150 spine runs the length of the block 2.5 m off the side boundary, clear of every zone. It picks up the rear half of the house roof, the paving and the paths. It carries 5.3 litres a second in the design storm, against a capacity of 45. Its outlet crosses tree 5\u2019s zone, so the last few metres must be hand or hydro excavated with the arborist present rather than bored. At the depth a bore requires, the invert would land below the kerb and could not discharge. Better still, find out whether the house already has a kerb outlet and reuse it.'],

  ['h','The numbers'],
  ['tbl',[
    ['Item','Value','Basis'],
    ['Design rainfall, 5 min, 1 in 10 yr','122 mm/h','Bureau of Meteorology 2016 design rainfall for this location'],
    ['Design rainfall, 5 min, 1 in 100 yr','189 mm/h','extreme-event check'],
    ['Fall across the block','2.08 m, 1 in 19','612.26 m rear to 610.15 m front'],
    ['North line, effective area','92 m²','rear pocket, addition roof, firepit terrace'],
    ['North line, flow','3.13 L/s','DN100 at 1:21 carries 15.3 L/s, 20% used'],
    ['Spine, effective area','157 m²','rear half of house roof, paving, paths, woodland'],
    ['Spine, flow','5.32 L/s','DN150 at 1:19 carries 45.2 L/s, 12% used'],
    ['Spine, 1 in 100 yr check','8.24 L/s','18% of capacity, passes the extreme event'],
    ['Corner swale','294 L/s','250 mm deep at 1:40, western 4 m of the rear boundary'],
    ['Overland path, side strip','236 L/s','200 mm swale at 1:19. Must stay clear: the route if the reserve bank fails'],
    ['Courtyard runoff','0.66 L/s','1 in 100 yr, its own area only'],
    ['North outlet invert at boundary','610.01','nearest surveyed kerb 609.81, verge fall 1:52, gravity OK'],
    ['Spine outlet invert at boundary','609.73','nearest surveyed kerb 609.49, verge fall 1:29, gravity OK']
  ],[1.4,1,1.8]],
  ['p','Pipe capacities by Manning, n = 0.010, running full. Flows by the rational method at the AS/NZS 3500.3 standard of a 5 minute duration and a 1 in 10 year storm for dwelling site drainage.'],

  ['h','What never reaches a pipe'],
  ['p','The pipes are sized for the storm. Most rain is not the storm. The second half of the water design is what happens to ordinary rain. On this block that should soak into the ground it falls on, rather than being collected and taken to the kerb. Four surfaces do that work: the troughs on the contour, the gravel paths, the mulch blanket and the mounds. They are drawn on the plan like anything else, so the figures below are for the layout as it stands and move when it does.'],
  ['water',''],
  ['note','Two things this does not change. Roof water stays positively connected to the piped system, every downpipe, with nothing discharging at ground level. A roof concentrates too much volume into too small a patch of soil for infiltration to be sensible near a footing. And the overland flow path along the side boundary stays clear and continuous to the street. The case it exists for is the reserve bank letting go, which is far past anything a swale holds.']
]},

/* --------------------------------------------------------------- earth --- */
{id:'earth', group:'works', nav:'Earth shaping', title:'Earth shaping', sub:'Getting water into the ground, and past the house', blocks:[
  ['p','Two jobs, and they pull in opposite directions. Water arriving off the reserve has to be got past the addition without pooling against it, which is the boundary work below. Rain falling on the garden itself should go into the ground where it lands, rather than run the length of the block. That is the contour work: the swales and mounds, and the paths that double as both.'],

  ['h','Swales and mounds, and why none of them are trenches'],
  ['p','A swale is a level trough on the contour, with the spoil laid along its downhill side as a mound. Water spreads along it instead of running down the slope, sits, and soaks in. The mound is dry, aerated, raised ground to plant into. On a block that is sand over a dense layer, that is the only way to give a shrub good drainage without cutting anything. The pair is the whole technique. It is a good fit here: 1 in 19 of fall, erodible sand, and a fall line that runs straight at the house.'],
  ['note','On this block a swale is not dug. Tree protection zones cover 52% of the open back garden and nearly all of the front. Clause 6.6.3 is explicit that paths and beds inside a zone are built above existing grade, with no excavation and no compaction. So the trough is formed by raising its two shoulders in coarse woodchip, rather than by taking a shovel to the middle. The section that matters is the difference between the invert and the mound crest, not the depth below natural ground. Where a line falls clear of every zone, and the plan says so item by item, it can be cut instead. The corner swale below is the one that is.'],
  ['p','The contours run across the block, not down it, because the fall is 1 in 19 along the block and 1 in 132 across it. Every trough and mound therefore runs the short way, side boundary toward side boundary. The Checks screen tests each one and says how much it falls end to end. More than 100 mm of that, falling more along its length than across its width, and it is a drain pointed downhill rather than a store. Set them out with a water level on the day. The levels here are the surveyor\u2019s own surface: exact where they measured, and interpolated in flat planes between points that can be metres apart. That gives you the shape, not a height to build to.'],
  ['kv',[
    ['Trough section','1.0 to 1.4 m wide, 250 mm from invert to crest, batters around 1 in 4'],
    ['Mound section','1.0 to 1.6 m wide, laid along the downhill side, rounded not peaked'],
    ['Inside a protection zone','100 mm of added material maximum, coarse woodchip, hand placed, arborist supervising'],
    ['Clear of every zone','soil, up to the project’s 400 mm fill limit. Only the rear pocket qualifies'],
    ['Off any wall','3 m minimum for anything that concentrates water into the ground'],
    ['Ends','a level spill at the low end, rock at the inlet, and never into the overland flow corridor']
  ]],
  ['p','Six lines are drawn. Two run through the back woodland either side of the gravel path. One is on the sunny east-north-east mound, one in the rear pocket, and two across the front garden. All but the rear pocket sit inside a protection zone, so all but the rear pocket are 100 mm of chip. The rear pocket mound is the only one that gets soil, and the only one carrying a small tree.'],

  ['h','The gravel paths are part of the drainage'],
  ['p','A gravel path laid level on the contour holds about 50 litres a square metre in the voids under your feet. The base is 150 mm of clean 20 mm aggregate over coarse chip, and it lets that water go slowly into the sand beneath. It is the cheapest storage on the block, because you were going to build the path anyway. It is also why the paths run across the slope rather than down it. A path down the fall line is a channel with a gravel bed, which is the opposite of what is wanted.'],
  ['note','Which is also why the back path now stops 3 m short of the addition. As drawn it ran to within 1.2 m of the addition\u2019s uphill corner. That is the exact wall risk 1 is about, above a subsoil drain put there to keep water out of that ground. A path holding water in its base is the one thing that must not go there. So it ends at the last contour, and the mulch blanket carries the surface across the rest. Every infiltrating surface on the plan is checked against that 3 m, and the Checks screen stops anything inside it.'],

  ['h','The bike route, and why it is not a gravel path'],
  ['p','Bikes live at the back of the garage and go out the back gate, which sits on the rear fence just east of the gum. That is one run of about 26 m: west along the back of the garage, down the side of the addition, then across to the gate. It is the one path on the block that has to be firm, continuous and rideable. It is also the one path that must not hold water. For half its length it runs within a metre of the addition\u2019s uphill wall, which is the wall risk 1 is about. So it is a firm surface shedding to the swale beside it, not gravel over a soakage base. The Checks screen treats the two differently for that reason.'],
  ['note','The gate cannot go where it looks most natural. The gum\u2019s trunk stands 1.97 m from the rear boundary and its structural root zone has a radius of 2.8 m. So the fence directly behind the tree is inside the circle where nothing may be excavated by any method, including a post hole. Set out this far east, the nearest post is 3.0 m from the trunk. That is outside the structural root zone and still inside the protection zone. So the holes are hand or hydro dug with the arborist present, and the gate goes on the approved scope. Check it is not the low point of the fenceline before it is hung, or it becomes the place concentrated flow enters the block.'],

  ['h','Keeping reserve water off the addition'],
  ['p','Three further pieces do that, and they are not interchangeable.'],

  ['h','The corner swale: the only part that can be dug'],
  ['p','The rear boundary falls 133 mm from the southern corner toward the west-south-west corner, about 1 in 164. So water running along the reserve path tends to arrive at that western corner by itself. That corner is also the only stretch of the rear boundary far enough from the gum to sit outside its protection zone. So it is the only part you can excavate.'],
  ['p','The gum\u2019s trunk stands only 1.97 m from the rear boundary. Its structural root zone is the inner circle, where nothing may be excavated even by hand. It has a radius of 2.8 m, so it crosses the boundary by 830 mm. A channel following that boundary would pass within about 1.2 m of the trunk. That is why the swale is confined to the corner.'],
  ['kv',[
    ['Position','western 4 m of the rear boundary, 0.8 to 1.2 m inside the fence'],
    ['Distance from the gum','7.1 m, clear of the 6.5 m protection zone'],
    ['Cross-section','about 2 m wide, 250 mm deep, batters around 1 in 6'],
    ['Grade','around 1 in 40, by cutting deeper toward the pit'],
    ['Capacity','294 L/s at 0.78 m/s'],
    ['Outfall','pit, then the sleeve under the garage slab to the street']
  ]],
  ['p','294 litres a second is far more than this corner sees in ordinary rain, where the numbers are single digits. It is generous because the case worth designing for is the reserve bank overtopping. At 0.78 m/s it sits below the roughly 1.2 m/s at which grassed sandy soil begins to move. So it will not cut deeper once grass and sedges establish.'],
  ['note','Two details matter more than the dimensions. Line the upstream end with rock, generously, because concentrated flow off the path arrives there with energy. And put a silt trap in the pit, a sump below the outlet with a removable grate. A channel collecting hillside runoff brings sand and leaf litter. Shovelling that from a sump once a year is far easier than clearing it from the pipe under the garage.'],

  ['h','The mulch blanket: what works across the middle'],
  ['p','For the twelve or so metres of boundary in front of the gum there is no channel, and cannot be one. Water crosses there and spreads as a thin sheet, as it does now. What handles it is the 100 mm layer of coarse woodchip the tree plan already requires. Coarse chip over sandy soil absorbs a surprising volume. More importantly it spreads flow and slows it, rather than letting it collect into rivulets. Use coarse grade, around 25 mm, not fine or shredded, because fine mulch floats. Lay logs or rock across the slope in the steeper pockets, as the reserve revegetation has done on the other side of the fence.'],

  ['h','The diversion bund above the addition'],
  ['p','A low ridge a few metres uphill of the addition\u2019s rear wall. It is angled so sheet flow crossing the woodland floor is turned aside into the side strip rather than continuing into the wall. It sits inside both trees\u2019 protection zones, so it is built up rather than dug: 100 mm of added material maximum, hand placed, arborist supervising. Build it from coarse woodchip rather than soil. 100 mm of clay or topsoil over a mature gum\u2019s root plate reduces the air reaching the roots, which is the reason the 100 mm cap exists. Make it wide and rounded rather than a sharp berm, so it overtops evenly along its length instead of breaching at one point. It is a Diversion berm in the element library, so it sits on the plan as a curved run you can move. The Checks screen asks it two questions. Does the ground fall along it, so water leaves past an end? And does it run past both corners of the wall it stands in front of?'],

  ['h','How it all works together'],
  ['p','In ordinary rain the contour lines take it. Rain landing on the back garden meets the first trough within a few metres of where it fell, spreads along it and soaks in. What runs on meets the next. The mulch absorbs most of what crosses the boundary, and the corner swale takes whatever concentrates at the western end. In heavier rain the troughs fill and spill at their level sills. Sheet flow crosses the woodland floor, meets the bund, and is turned into the side strip, where the overland path carries it to the street. In an extreme event the corner swale overtops as well and joins the same route. The contour work slows and stores. The boundary work moves water past the building. Neither substitutes for the other, and neither touches the overland flow corridor, which stays empty.'],
  ['note','Sequence. Shape the corner swale, then build the bund, then set out the contour lines and raise their shoulders, then mulch the whole surface. Then let a full wet season pass before planting anything but the sedges, so the shaping can be corrected while it is still easy. Watch where water actually stands in the first heavy rain, and move the lines to suit. This is the one part of the garden where being wrong is cheap to fix in year one and expensive in year five. Afterwards: clear the silt sump annually before winter, and top up mulch every second or third year. After any severe storm, check that no trough has scoured at its spill and that the bund has not been breached at a point.']
]},

/* ------------------------------------------------------------ planting --- */
{id:'planting', group:'works', nav:'Planting', title:'Planting', sub:'Zone by zone, working outward from the house', blocks:[
  ['p','Two rules organise most of it.'],
  ['note','The closer to the house, the less water a plant should need. Lawn or dry-tolerant groundcover beside the paving, then progressively thirstier plants, shrubs and finally trees as you move away. The reason is the clay beside the house, which swells and shrinks with moisture. Keeping it at a steady moisture level protects the footings, and the way to do that is not to put anything demanding near them.'],
  ['note','Inside a tree protection zone, build up rather than dig down. Beds sit on the existing ground, planting holes are dug by hand, and nothing is excavated or compacted.'],

  ['h','The zones'],
  ['p','Turn on the Planting zones layer on the plan to see these in position.'],
  ['tbl',[
    ['Zone','Approach'],
    ['No planting: paved apron','0.9 m of paving right around the house, falling away at 1:60. No beds, no irrigation, no taps.'],
    ['Dry groundcover band','From the apron out to about 3 m. Scleranthus, Dichondra, Poa, Lomandra. Drip you can switch off. Nothing thirsty, no aggressive roots.'],
    ['Sunny edible strip','Best summer growing ground: 8.3 h summer, 6.5 h equinox, 3.9 h midwinter. Veg beds, espaliered fruit on the fence, citrus. Water freely.'],
    ['Dry-shade woodland','1.8 to 3.8 h sun. Tubestock hand-dug through 100 mm coarse mulch, beds built up not cut in. Bursaria, Correa, Rhagodia, Poa, Dianella, Lomandra.'],
    ['Rainforest pots','Shaded, sheltered. Stag horn, elk horn, burawang, tree fern, bromeliads. In pots and mounted, so soil moisture near the house stays put.'],
    ['Swales and rear screen','Wettest, most erodible ground, and the same answer in every trough on the block. Sedges and tussocks to bind it: Poa labillardierei, Ficinia nodosa, Carex. Acacia and hakea screen behind.'],
    ['Sunny natives, rear pocket','The sunniest part of the back garden all year: 7.0 h summer, 4.0 h midwinter, strongly afternoon. Sun-loving natives, structural plants, and the winter sitting spot.'],
    ['Front: structural and screening','Shadiest half of the block, 4.5 h summer down to 2.0 h in winter. Sun-lovers in the canopy gaps, shade-tolerant natives beneath. Screening at 1.5 to 2.5 m. Plant through mulch, never excavate.'],
    ['Mounds','Raised, sharply drained, dry on top. One large shrub or small tree each, chosen by how much summer sun the mound gets, with the wet-tolerant things at the toe rather than the crown.']
  ],[1,2.2]],

  ['h','What goes on the mounds'],
  ['p','A mound gives one thing no other part of this block can: sharp drainage and aerated root run, above the dense layer, without cutting anything. That suits the whole banksia-hakea-grevillea half of the native palette, which fails in wet feet and does not much mind poor soil. So each mound carries one large shrub or small tree at its crown. Low things around its shoulders, and the wet-tolerant species at its toe, where the trough spills.'],
  ['p','What decides the species is summer sun, and in the front garden that is the awkward part. The deciduous canopies are densest from October to April. So a front mound in the open reads as a sunny position on the day you plant it in winter. Then it is in shade for the whole growing season. The hours below are the mound centres as drawn, on 21 December.'],
  ['tbl',[
    ['Mound','Summer sun','What to put on it','Why'],
    ['Rear pocket, west-south-west corner','5.7 h','Banksia marginata, or a dwarf Eucalyptus mannifera ‘Little Spotty’ if you want height','The only mound clear of every protection zone, so the only one that can be soil rather than chip, and the only one with real winter sun: 5.7 hours in December and 5.0 in June, the most even light anywhere on the block. It is where a small tree earns its place. Silver banksia takes the frost, feeds birds through winter and wants exactly this drainage.'],
    ['East-north-east strip, beside the kitchen','11.0 h','Grevillea iaspicula, or Callistemon ‘Kings Park Special’ for a thicker screen','The sunniest ground on the block. Grevillea iaspicula is the local endangered one, flowers through winter and stays under 2.5 m, so it does not shade the vegetable beds behind it.'],
    ['Back woodland berms, either side of the path','4.4 h south, 8.1 h north','Bursaria spinosa on the south berm, Leptospermum obovatum on the north','Two different positions despite being 8 m apart. The south berm is dry shade under the gum and the pear, with root competition from both, and bursaria is local, thorny enough to be a screen and copes with 4 hours. The north berm sits in the gap between the two canopies and takes 8.1 hours in December, and nothing at all in June, because the addition stands between it and the low winter sun. Put something there that does not depend on winter light.'],
    ['Front, between the house and the ash','5.7 h','Dodonaea viscosa','Evergreen, tough, dry-shade tolerant, 2 by 3 m, and it holds its screen through winter when the deciduous canopies have gone and the front windows are most exposed.'],
    ['Front, at the boundary','5.3 h','Hakea salicifolia, with Olearia phlogopappa beneath','The privacy layer, at the 1.5 to 2.5 m the front needs. Willow-leaf hakea screens fast and evergreen, and takes the dry shade under the street trees better than anything on the list.'],
    ['Front pocket, east wing side','4.7 and 5.7 h','Acacia pravissima uphill, pomegranate on the sunnier downhill mound','The warmest corner of the front garden, with a trough between the two mounds. The pomegranate is one of the two fruit trees the front is getting and it wants every hour it can find, so it takes the downhill mound rather than the shaded one.']
  ],[1.3,0.7,1.6,2.6]],
  ['note','Both fruit trees have moved, and one of the moves costs something. The quince had 5.7 hours in December where it was drawn. On the mound in front of the lounge it has 7.3, the sunniest ground in the front garden, and about what a quince needs to ripen. The pomegranate had 6.3 hours, but it was standing in the overland flow corridor, which has to stay clear. Moved onto the mound just outside it, it has 5.7. That is the trade, and it is the right way round: the corridor is the route water takes if the reserve bank lets go. Both trees are in canopy gaps rather than under a canopy, which for a deciduous front garden is the only place they work. Both stay 3 m off the wall.'],
  ['ul',[
    'Plant the crown, not the ring. One shrub per mound, at the top, with groundcover and tussocks over the rest of it. A mound planted all over dries out unevenly and the crown is the only part with the drainage the shrub is there for.',
    'Wet feet at the toe. Callistemon sieberi and Leptospermum obovatum take both a flooded week and a dry summer. So they go at the bottom of a mound or the shoulder of a trough. Nothing from the banksia and grevillea side goes there.',
    'Everything on a mound is hand watered for two summers and then left. The mound is the reason it survives being left. It is also the reason it will die if it is never watered at the start. Raised ground dries faster than flat ground while roots are still in the potting mix.',
    'Silver Princess is on the list and flagged frost tender for a reason. It will take a Canberra winter on a well-drained mound, and not in a wet hollow. It is the one choice here that is a gamble rather than a safe bet.',
    'Nothing new goes closer than 3 m to a wall, on a mound or off one. The mounds inside a protection zone are 100 mm of coarse woodchip, planted through by hand, which is what clause 6.6.4 asks for.'
  ]],

  ['h','When it flowers'],
  ['p','Every plant on the plan, by mature height and flowering month. The bar’s thickness is the plant’s mature spread and its colour is the flower’s own. It updates as you plant.'],
  ['bloom',''],

  ['h','The paved apron, and the first three metres'],
  ['p','A 900 mm band of paving right around the house, sloping away at 1 in 60 or better. No beds, no plants, no irrigation, no taps inside it. This is the buffer that keeps building moisture stable and stops splash and soil contact with the walls.'],
  ['p','From the apron out to about three metres you are still in the ground that affects the footings. Dry-tolerant groundcovers and low grasses here: Scleranthus, Dichondra, Poa, Lomandra, which take a dry summer without help. If you run drip, run it on a tap you turn off, not a timer. Avoid aggressive root systems, and anything you will feel obliged to water twice a week.'],

  ['h','The sunny strip along the east-north-east boundary'],
  ['p','The best summer growing ground on the property at 8.3 hours, and 3.9 at the winter solstice, spread fairly evenly across the day. Sandy and free draining, and four metres or more clear of the house, so you can water it properly without consequence for the footings.'],
  ['p','Raised vegetable beds, fruit espaliered flat against the fence to use the vertical space and reflected warmth, and citrus in the sunniest section. The fence itself costs about an hour a day, so anything low and light-hungry does better a metre or two out from it than hard against it.'],

  ['h','Under the two big trees'],
  ['p','One to four hours of sun, dry soil, and constant root competition from a mature gum and the pear. The hardest planting on the site and the least forgiving of impatience. Turf will not hold, and neither will anything wanting regular water.'],
  ['p','Spread 100 mm of coarse woodchip, which the tree plan requires anyway. Plant small tubestock through it into hand-dug holes, with beds built up on the surface rather than cut in. Bursaria, Correa, Rhagodia, Poa, Dianella and Lomandra all cope. Expect slow establishment, and hand water through the first two summers, after which they look after themselves. This becomes the low-maintenance part of the garden once away.'],

  ['h','The patch of lawn'],
  ['p','Turf will fail under the trees and is not worth fighting. Dichondra repens is already on your must-have list, is shade tolerant, needs no soil build-up and is soft underfoot. That is the lawn, in the lighter pocket between the paving and the woodland.'],

  ['h','The rear boundary and the swale'],
  ['p','The wettest and most erodible ground on the block, and periodically running water. Planting here does structural work as much as visual: roots hold the soil and slow the flow. Sedges and tussocks through the swale: Poa labillardierei, Ficinia nodosa, Carex. Behind them the acacia and hakea screen from your local provenance list. That gives the filtered privacy from the walking track, and matches the revegetation on the reserve side of the fence. Plant this before the first winter if you can, because bare ground in a channel is what fails.'],
  ['p','The same goes for every contour trough, front and back. A trough is bare ground holding running water for the first year or two, which is exactly the condition that scours. So the sedges go in with the shaping rather than after it. They are the only planting on this whole design that should not wait for a wet season to pass. Poa labillardierei and Ficinia nodosa through the invert, tussocks and Lomandra on the shoulders, and the shrub on the mound behind them once the shaping has proved itself.'],

  ['h','The rear pocket and firepit terrace'],
  ['p','Afternoon and evening sun, free-draining sand, clear of the tree zones. So this is the one part of the back garden where you can dig freely. It is also the sunniest part of the back garden across the whole year, holding 4.0 hours in midwinter. That makes it the sensible place for a winter sitting spot. The paved terrace near the house drops to nothing in June.'],

  ['h','The front garden'],
  ['p','The shadier half of the block, because of the liquidambar and the two street ashes, and the part where you cannot change levels. Proteas, leucadendrons, grass trees and waratah need full sun and sharp drainage. They go in the open gaps between canopies rather than under them, with shade-tolerant natives beneath. Everything planted through mulch, nothing excavated. The screening layer for privacy sits just inside the front boundary at 1.5 to 2.5 metres mature height. It covers the sunken lounge and bedroom windows without blocking their light.'],
  ['p','This is where the mounds do most of their work, because they are the only way to get sharp drainage into a garden nobody is allowed to dig. Four round mounds and one berm, each 100 mm of coarse woodchip over the existing surface. Two of them have room for a trough on the uphill side. That is not much of a hill, but it is enough. 100 mm of chip crown over sand drains far better than the flat ground beside it. That difference is what a hakea or a dodonaea needs to survive here.'],
  ['note','The front garden\u2019s seasons run backwards. Its canopies are deciduous, so the shade is densest from October to April and lifts from May to September. Dense exactly through the growing season, open exactly when there is least sun to be had. Everything structural in the front is therefore chosen for summer shade and winter exposure. That is a real palette rather than a compromise: dodonaea, bursaria, indigofera, olearia and correa all evolved under a eucalypt canopy and behave this way round. What does not work is anything grown for a crop, unless it stands in a gap.'],
  ['note','Two things to avoid. Do not run automatic irrigation inside the apron zone or against the walls. Overwatering on a timer is one of the most common causes of footing damage, and is entirely avoidable. And do not plant a new large tree close to the house. The site is already a problem site because of tree-induced soil drying, and another one compounds the issue the engineer is designing around.']
]},

/* ----------------------------------------------------------- courtyard --- */
{id:'courtyard', group:'works', nav:'The courtyard', title:'The courtyard', sub:'Deep shade, no natural outlet, everything in pots', blocks:[
  ['p','The space between the rear addition, the link, the garage and the existing house needs handling on its own terms. It is a gated side courtyard about 4.06 m by 3.46 m, 14 square metres. It has a covered stepping-stone path along the existing house wall, an existing Japanese maple retained in the middle, and gates at the garage end. Walls are 2.4 to 2.8 m, and the ground sits 139 mm below the floor level of the rooms around it.'],

  ['h','Light depends on the maple, and the maple is not expected to last'],
  ['p','The maple is in poor health and the working assumption is that it will die. That matters, because the courtyard has two very different light regimes.'],
  ['tbl',[
    ['Direct sun, hours per day','Summer','Equinox','Winter'],
    ['With the maple','1.6 h','0.7 h','0 h'],
    ['After it goes','5.7 h','2.9 h','0.1 h'],
    ['Open back garden, for comparison','5.8 h','4.3 h','2.2 h']
  ],[2.2,1,1,1]],
  ['p','Its canopy is 4 m across in a 4 m courtyard, so it covers the whole space. While it lives, the courtyard is deep fern-gully shade. Once it goes, summer sun rises roughly threefold into a still, walled enclosure with a black wall facing the sun. Winter stays dark either way, because the surrounding walls block the low sun regardless.'],
  ['note','Put the plants where the light does not change. The stepping-stone path along the existing house wall is roofed by the awning, so it stays shaded whether or not the maple survives. Anything mounted or standing under that awning is unaffected by the tree\u2019s fate. Everything in the open part of the courtyard will need moving or shading when the canopy goes. Straightforward in a pot, impossible in the ground.'],
  ['p','A Japanese maple was always difficult here. They scorch in hot, dry, reflected-heat positions, and a courtyard with a black north-facing wall in a Canberra summer is exactly that. Do not replace it with another maple, and do not replace it with any tree in the ground. The site is a problem site precisely because trees near the footings dry the soil, and this position is against the house in reactive clay. If you want overhead shade back, take it from a structure, by extending the awning or adding a light sail, or from a large specimen in a pot. Removing the maple needs no approval. At 4 m tall with a 4 m canopy it is well under every protected-tree threshold.'],

  ['h','Why it is the warmest spot on the block'],
  ['p','Frost forms when the ground radiates heat to a clear night sky. A courtyard seeing about half the sky loses heat at roughly half that rate. The canopy reduces it further, the walls give back stored daytime warmth, and the wall on the northern side has heated rooms behind it. This will be the mildest outdoor position on the property on a frosty night, probably by several degrees. That is what makes the rainforest planting realistic in Canberra at all.'],

  ['h','What the materials mean'],
  ['ul',[
    'The existing house wall is blonde brick, and it is the wall the covered path runs along. It is the most reflective surface in the courtyard, faces away from the sun so stays cool, and has heated house behind it. The best wall in the space by every measure, and the one to mount things on.',
    'The addition and link walls are black Axon. The addition’s wall faces north into the sun, so it will be the hottest surface on a summer afternoon, radiating heat even with the ground shaded. Keep pots off it and away from its base. Dark cladding reflects almost nothing, so it contributes no useful light.'
  ]],

  ['h','Planting: everything in pots'],
  ['p','Pots solve three problems at once. The soil here is reactive clay right against the footings. The retained tree already occupies the ground and competes for water. And a rain-shadowed courtyard needs regular watering, which is exactly what you cannot do to soil beside footings. In pots on the paving, water drains onto the paving and into the courtyard drain. So you can water freely, and none of it reaches the ground beside the footings.'],
  ['tbl',[
    ['Position','Conditions','Plants'],
    ['Blonde brick wall, above the stepping stones, under the awning','Brightest, warmest and most sheltered, with overhead protection from frost and rain, and the path gives access at working height','Stag horn and elk horn mounted here. The only position on the property where they have a real chance'],
    ['Ground level, in pots, off the black walls','Deep shade now, more summer sun once the maple goes','Tree fern, bird’s nest fern, hardy ground ferns, burawang. All tolerate low light and Canberra frost once established. Plan to move them under the awning, or add shade, when the maple dies'],
    ['Between the stepping stones','Trafficked, shaded, no soil depth needed','Dichondra or moss in the joints for softness underfoot']
  ],[1.2,1.6,1.6]],
  ['p','Bromeliads are the doubtful ones while the maple is alive, wanting brighter indirect light than this. Expect slow growth and poor colour for now, and better conditions once the canopy goes. Group the pots rather than spreading them out. That raises local humidity and makes hand watering quicker. Keep plants spaced and off the walls, because still humid air in a shaded enclosure encourages fungal problems.'],

  ['h','Drainage: there is no natural way out'],
  ['p','The courtyard is enclosed on all four sides and sits below the floor level around it, so water landing in it cannot run anywhere. The floor plan already shows a 1200 mm strip drain at the ensuite threshold, so the need for an outlet is recognised; the question is where it goes. Its own runoff is small: 0.66 litres a second in a one-in-a-hundred-year burst, about 640 litres over an hour. Capacity is not the issue. Having an outlet is.'],
  ['note','A soakage pit is the wrong answer. Soaking water into reactive clay a metre or two from footings is what both the geotechnical report and the CSIRO guidance warn against. It has to be piped.'],
  ['p','The route is a sleeve under the garage slab. The ground falls toward the existing house wall, so the natural low line is along the base of that wall beside the stepping stones. That is also where a channel grate belongs, to catch wall and path run-off. From the northern end of that channel a short pipe runs under the garage slab to join the line from the rear pocket. Nothing passes under the link. About 2.6 m of sleeve, with the levels working comfortably at roughly 1 in 17.'],
  ['p','There is no downpipe in the courtyard on the current drawings, and it should stay that way. The courtyard holds about 1.9 cubic metres before water reaches the doors, so with no roof water a blocked grate takes about 48 minutes to get there. Add 20 square metres of roof and it is 19 minutes; add 40 and it is 11. That is the difference between a nuisance you notice and water in the bedrooms.'],
  ['p','Even so, the maple drops litter directly onto the drain, so keep the redundancy. A long channel grate along the wall rather than a single square grate, so partial blockage still leaves capacity. A litter sump below the outlet where you can reach it. A second pipe laid in the same sleeve trench while it is open. Clearing the grate is routine rather than optional, particularly each autumn while the maple is still dropping leaves. It is the one piece of maintenance in this garden where skipping a year has consequences inside the house.'],

  ['h','To settle before the slab goes down'],
  ['ul',[
    'Where the ensuite strip drain discharges, and confirmation that no downpipe is added into the courtyard later.',
    'Both sleeves under the garage slab, plus a spare pipe in the courtyard trench.',
    'The garage roof: fall direction, gutter position, and the number and location of downpipes, given it takes the house roof as well.',
    'Paving level against the damp-proof course. The courtyard floor is only 139 mm below the room floors, and paving normally wants at least 150 mm below the damp-proof course. If it has to go lower, that is excavation next to footings in reactive clay and the engineer should specify how.'
  ]],
  ['p','Access is already resolved: the gates at the garage end and the stepping-stone path give a way in, wide enough to carry a potted plant through.']
]},

/* --------------------------------------------------------------- paved --- */
{id:'paved', group:'works', nav:'Terrace and kitchen', title:'Paved terrace and outdoor kitchen', sub:'Where they can go, and why', blocks:[
  ['p','Two constraints shape where the paving and the kitchen can go, even with exact positions unresolved.'],
  ['ul',[
    'Paving inside a tree protection zone has to be built up, not cut in. Clause 6.6.3 requires paths and beds inside a zone to sit above existing grade, with no excavation and no compaction. A conventional excavated base course is not available there. The permitted build-ups are cellular geotextile, rumble boards over 200 mm of coarse woodchip, or rated mats. All three work, and all three are awkward to finish neatly under paving. Simpler to keep the paved area clear of the zone.',
    'The kitchen needs water, waste, power and probably gas. Services through a zone need hand or hydro excavation, or boring at 1,000 mm. Clause 6.5.2 rules out additional services through a zone unless the plan specifies them. Siting the kitchen clear of tree 2\u2019s zone avoids the question.'
  ]],
  ['p','The band from about 16.7 m to 19.9 m off the rear boundary runs alongside the kitchen addition. It is clear of every protection zone and adjoins the existing patio and its awning. A 3.2 by 3.0 m area there takes the kitchen with no tree constraint and the shortest service runs. The paved terrace sits at 17.6 m, so it is also clear. Widening it westward means building up rather than cutting in.'],
  ['note','Sun there is 10.9 hours in December, 4.1 at the equinox and effectively none in June. Treat it as a warm-weather space, and put any winter sitting position in the rear pocket. Grade the paving to fall away from the house at 1:60 minimum. Connect the sink waste properly rather than letting it soak beside a footing.']
]},

/* --------------------------------------------------------------- risks --- */
{id:'risks', group:'risks', nav:'Risks', title:'Risks and what stops them', sub:'Ten items, in plain terms', blocks:[
  ['p','Ten things could cause trouble here. Most are variations on one theme: water arriving somewhere it was not meant to and either sitting there or running where it can carve a channel. Each one below covers what would actually happen, why this site is exposed to it, what you would notice, and what stops it.'],
  ['tbl',[
    ['Risk','Severity'],
    ['Water pooling against the rear addition wall','Highest'],
    ['Water travelling sideways inside the soil','Highest'],
    ['The stormwater trench becoming a drain of its own','Highest'],
    ['Downpipes discharging onto the ground','High, easily solved'],
    ['The reserve bank overtopping or giving way','Rare, largest single event'],
    ['Scour of the overland flow path','Medium'],
    ['Watering the garden causing the house to move','Medium'],
    ['Concentrated flow entering from the reserve path','Medium'],
    ['The firepit holding water','Lower'],
    ['Mulch washing off the slope','Lower']
  ],[2.4,1]],

  ['h','1 \u00b7 Water pooling against the rear addition wall: highest'],
  ['p','What happens. The ground outside the addition\u2019s uphill wall is higher than the floor inside it, by about 260 mm. Rain running down the slope arrives at that wall with nowhere to go, so it sits and soaks in. Soil that stays permanently damp against one wall, while the rest of the house dries out normally, makes the ground move unevenly. That shows up as cracks, doors that stick, and in the worst case damp through the wall.'],
  ['p','Why here. The block tilts one way, about a metre of drop every nineteen metres, and the addition sits across that slope like a low dam. The floor level matches the existing house, which works everywhere except the uphill side.'],
  ['p','What you would notice. A damp or mossy strip along the base of that wall. Water standing for hours after rain rather than minutes. Later, hairline cracks in that corner.'],
  ['p','What stops it. Most of the answer is already in the engineer\u2019s drawings. Section F on sheet 05 details a retained edge: concrete-filled blocks or double brick, reinforced both ways on a 450 by 300 footing. A 100 mm agricultural pipe sits in aggregate at its base. It is called up next to a suspended 120 mm Bondek slab section. That is the correct treatment for a wall with ground above floor level. It means the uphill edge is designed as a retaining wall rather than a plain slab edge.'],
  ['note','Three things still need settling. Where the agricultural pipe discharges is not shown anywhere, and a subsoil drain with no outlet does nothing. It must be piped, and the only route clear of the protection zones is the sleeve under the garage slab. The surface above it still wants to fall away from the wall. Put a grated channel at the outer edge of the paving, so surface water is intercepted before it silts up the ag drain. And confirm which walls section F applies to, since the callout is hard to read on the scanned drawing.'],

  ['h','2 \u00b7 Water travelling sideways inside the soil: highest'],
  ['p','What happens. The back garden is loose gravelly sand for the first half metre, sitting on much denser material. In sustained rain, water soaks straight down through the loose layer, cannot get through the dense one, turns sideways and moves downhill inside the soil. It reappears wherever the ground is cut, which will be at the addition’s footings.'],
  ['p','Why here. The geotechnical report names this directly: temporary seepage sitting on the denser soil after rain. With twenty metres of uphill ground feeding it, there is real volume moving through that layer.'],
  ['p','What you would notice. The wall staying damp for days after rain has stopped, when the surface nearby looks dry. Water seeping from a cut face or trench wall.'],
  ['p','What stops it. The engineer\u2019s 100 mm agricultural pipe behind the retained edge is exactly this, so the pipe already exists in the design. What matters is that it is laid in aggregate wrapped in filter fabric. And that it is connected to the stormwater, rather than left to discharge into the ground. A shaped mound on the surface will not touch this water, because it is below the surface and passes underneath.'],

  ['h','3 \u00b7 The stormwater trench becoming a drain of its own: highest'],
  ['p','What happens. A trench backfilled with gravel is an easier path for water than the soil around it. So it collects water along its whole length and carries it downhill inside the trench, outside the pipe. Beside the house it delivers water along the footing line, and can wash fine soil out from under the footing.'],
  ['p','Why here. The main stormwater line runs 39 metres straight down the slope about a metre off the house. That is close to the worst possible geometry, and it is how a well-intentioned drainage job causes the problem it was meant to solve. The CSIRO guide the geotechnical report cites describes exactly this.'],
  ['p','What you would notice. Nothing, for years. Then settlement cracking along the wall nearest the trench, or a soft spot above it.'],
  ['p','What stops it. Tell whoever digs it: backfill with the soil that came out, compacted to its original density, not gravel or crushed rock. Where the line runs closest to the house, a plug of clay across the full trench every six metres so water cannot run its length. Keep the trench a metre off the wall wherever the layout allows.'],
  ['p','The engineer sets the depth limit for this. Note F6 requires that a service trench near a footing must not extend below a line drawn at 30 degrees from horizontal from the footing edge. In clay it is 45 degrees. With the spine about a metre out and roughly 600 mm deep, against edge beams founded 400 mm below natural ground, the design sits comfortably inside that. Note F8 also requires any permanent excavation around the building deeper than 600 mm to be retained or battered. The apron cut at about 410 mm needs neither.'],

  ['h','4 \u00b7 Downpipes discharging onto the ground: high, easily solved'],
  ['p','What happens. A roof concentrates an enormous volume into a few outlets. One downpipe spilling at ground level can put thousands of litres into a square metre of soil in a single storm. Beside a footing that is the fastest way to soften the ground under it.'],
  ['p','Why here. About 242 m² of roof once the addition and garage are up, and the clay beside the house loses strength when saturated.'],
  ['p','What you would notice. Scoured soil or a splash pit under a downpipe, and mud splashed up the wall.'],
  ['p','What stops it. Every downpipe sealed into the pipe system, with no temporary arrangements left in place after the build. Check after the first heavy rain, and again once the builder has gone.'],

  ['h','5 \u00b7 The reserve bank overtopping or giving way: rare, largest single event'],
  ['p','What happens. The raised path formation behind the fence holds water back on its uphill side in heavy rain. If it overtops at a low point, or a section erodes through, whatever ponded behind it comes down at once. That is a concentrated flow arriving in one place for several minutes, rather than a few litres a second spread along the boundary.'],
  ['p','Why here. The bank is man-made, unlined, built of the same erodible sandy material as everything else, and carries foot traffic that keeps its surface bare. The rain photographs show water sitting on the crest rather than draining off it, which is how a low point begins.'],
  ['p','What you would notice. Beforehand: a dip forming in the path, a rill down its downhill face, or ponding deeper and longer each wet season. Afterwards: a fan of sand inside the fence, a scoured channel, and mulch stripped off a run of the woodland floor.'],
  ['p','What stops it. Nothing you build stops the bank failing, so stay robust to it. Keep the overland flow path along the side boundary clear and continuous to the street, permanently. Keep the diversion bund above the addition intact. Keep the firepit\u2019s uphill lip raised. And watch the bank. If a dip or rill appears, report it through Fix My Street while it is still maintenance rather than repair.'],

  ['h','6 \u00b7 Scour of the overland flow path: medium'],
  ['p','What happens. The strip along the side boundary is the designed escape route in a big storm: a shallow, wide, grassed channel. In a severe event it carries a lot of water quickly. The soil is sandy and starts washing away at roughly half the speed the design flow reaches. Bare when that happens, it deepens into a gully and stops working.'],
  ['p','Why here. Sandy soil plus a fairly steep fall along the block. Calculated flow speed at full design flow is about a metre per second; bare sandy loam begins moving around 0.6.'],
  ['p','What you would notice. The channel deepening and narrowing over a couple of wet seasons, sand deposited at the bottom end, grass undercut along the edges.'],
  ['p','What stops it. Grass or thick coarse mulch over the whole length, established before it ever carries water. Rock at the top where flow enters, at bends, and anywhere the fall steepens. Never bare over winter.'],

  ['h','7 \u00b7 Watering the garden causing the house to move: medium'],
  ['p','What happens. The soil beside the house is clay that swells when wet and shrinks when dry. Keep one part constantly damp, by a watered bed, a leaking tap or a timer running all summer, and it rises relative to the rest. The rest is going through normal cycles. The house is rigid and the ground is not.'],
  ['p','Why here. The borehole beside the house found medium to high plasticity clay from 400 mm down. That is the soil that does this, and it is why the footings had to be designed by calculation rather than from a standard table.'],
  ['p','What you would notice. Cracks that open and close with the seasons. Doors binding in one part of the year and not another. A dished or domed feel to the floor.'],
  ['p','What stops it. Nothing planted and nothing irrigated inside the paved apron. Beyond it, plants that cope with natural rainfall, on drip you can switch off rather than a timer. Keep the thirsty, frequently watered things well away from the walls. The productive strip is four metres or more clear, which is the right distance.'],

  ['h','8 \u00b7 Concentrated flow entering from the reserve path: medium'],
  ['p','What happens. The walking path outside the fence is worn to bare earth and slightly incised. So it collects sheet flow from upslope and carries it along the boundary until it finds a low point. Then all of it enters in one place, with enough force to cut a groove.'],
  ['p','Why here. The photographs show the path, along with logs laid across the slope and heavy mulching. Those are erosion-control works, so somebody has already concluded this ground moves water.'],
  ['p','What you would notice. A fan of silt or leaf litter just inside the fence at one spot. A scoured line running from it into the garden. Or the gate threshold washing out.'],
  ['p','What stops it. Find the low point in heavy rain, bring the swale across to meet it, and armour that entry with rock so incoming flow spreads instead of cutting in. Make sure the gate is not the low point.'],

  ['h','9 \u00b7 The firepit holding water: lower'],
  ['p','What happens. A 450 mm hole on a sloping site can collect water from uphill and hold it, because its floor is below the surrounding ground. You end up bailing it out before you can use it.'],
  ['p','Why here. Less of a problem than it sounds. It sits in free-draining sandy ground near the top of the block rather than at the bottom of the slope, so water soaks away.'],
  ['p','What you would notice. Water sitting in it for a day or two after heavy rain.'],
  ['p','What stops it. A base of coarse gravel rather than compacted soil or a sealed floor. A raised lip on the uphill side, 50 to 100 mm above the surrounding paving. A small gravel-filled soak pit beside it rather than a pipe connection.'],

  ['h','10 \u00b7 Mulch washing off the slope: lower'],
  ['p','What happens. The tree plan requires 100 mm of woodchip over the root zones and the planting depends on it. On a slope, fine mulch floats and moves in the first heavy rain, banking up at the bottom and leaving bare soil where you need cover.'],
  ['p','Why here. A one-in-nineteen fall across the whole area that needs mulching, over erodible sandy soil.'],
  ['p','What you would notice. Mulch piled against the lower fence or paving edge, bare patches uphill, and mulch in the swale where it blocks things.'],
  ['p','What stops it. Coarse grade chip, around 25 mm, not fine or shredded, because coarse chip knits together and stays put. Lines of logs or rock across the slope in the steeper pockets, the same technique already used in the reserve.']
]}

];
